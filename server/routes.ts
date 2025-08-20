import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSellerSchema, insertListingSchema } from "@shared/schema";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
}) : null;

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || "3");

export async function registerRoutes(app: Express): Promise<Server> {
  // Static file serving for assets
  app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets')));

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get seller profile
  app.get('/api/seller/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
      res.json(seller);
    } catch (error) {
      console.error("Error fetching seller profile:", error);
      res.status(500).json({ message: "Failed to fetch seller profile" });
    }
  });

  // Get seller listings
  app.get('/api/seller/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
      const result = await storage.getListings({ sellerId: seller.id });
      const listings = result.listings;
      res.json(listings);
    } catch (error) {
      console.error("Error fetching seller listings:", error);
      res.status(500).json({ message: "Failed to fetch seller listings" });
    }
  });

  // Get seller stats
  app.get('/api/seller/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
      const stats = await storage.getSellerStats(seller.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching seller stats:", error);
      res.status(500).json({ message: "Failed to fetch seller stats" });
    }
  });

  // ==================== SELLER ONBOARDING ====================
  
  // Create seller subscription
  app.post('/api/seller/subscribe', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ error: "User email required" });
      }

      // Check if user already has a subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.status === 'active') {
          return res.json({ 
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
            status: 'active'
          });
        }
      }

      // Create Stripe customer if needed
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
        customerId = customer.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            unit_amount: 1000, // $10.00
            product_data: {
              name: 'Curio Market Seller Subscription',
              description: 'Monthly seller access to Curio Market platform'
            }
          }
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, {
        customerId,
        subscriptionId: subscription.id
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        status: subscription.status
      });
    } catch (error: any) {
      console.error("Error creating seller subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create seller profile
  app.post('/api/seller/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Verify user has active subscription
      if (!user?.stripeSubscriptionId) {
        return res.status(403).json({ error: "Active seller subscription required" });
      }

      if (stripe) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.status !== 'active') {
          return res.status(403).json({ error: "Active seller subscription required" });
        }
      }

      const sellerData = insertSellerSchema.parse({
        userId,
        ...req.body
      });

      const seller = await storage.createSeller(sellerData);
      
      // Update user role to seller
      await storage.upsertUser({ 
        id: userId, 
        role: 'seller',
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      });

      res.json(seller);
    } catch (error: any) {
      console.error("Error creating seller profile:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create seller profile" });
    }
  });

  // ==================== LISTING MANAGEMENT ====================
  
  // Create listing
  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ error: "Seller profile required" });
      }

      const listingData = insertListingSchema.parse({
        sellerId: seller.id,
        ...req.body
      });

      const listing = await storage.createListing(listingData);
      res.json(listing);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  // Get all listings (public)
  app.get('/api/listings', async (req, res) => {
    try {
      const { 
        search, 
        category, 
        limit = 20, 
        offset = 0 
      } = req.query;

      const result = await storage.getListings({
        search: search as string,
        categoryId: category as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        state: 'published'
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Get featured listings - MUST be before /:id route
  app.get('/api/listings/featured', async (req, res) => {
    try {
      const { limit = 8 } = req.query;
      const listings = await storage.getFeaturedListings(parseInt(limit as string));
      res.json(listings);
    } catch (error) {
      console.error("Error fetching featured listings:", error);
      res.status(500).json({ error: "Failed to fetch featured listings" });
    }
  });

  // Get single listing (public)
  app.get('/api/listings/:id', async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      const images = await storage.getListingImages(listing.id);
      res.json({ ...listing, images });
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Update listing
  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ error: "Seller profile required" });
      }

      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.sellerId !== seller.id) {
        return res.status(404).json({ error: "Listing not found" });
      }

      const updatedListing = await storage.updateListing(req.params.id, req.body);
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  // ==================== CATEGORIES ====================
  
  // Get categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get category counts
  app.get('/api/categories/counts', async (req, res) => {
    try {
      const counts = await storage.getCategoryCounts();
      res.json(counts);
    } catch (error) {
      console.error("Error fetching category counts:", error);
      res.status(500).json({ error: "Failed to fetch category counts" });
    }
  });

  // ==================== CART MANAGEMENT ====================
  
  // Get cart
  app.get('/api/cart', async (req: any, res) => {
    try {
      const userId = req.isAuthenticated() ? req.user?.claims?.sub : null;
      const sessionId = req.sessionID;
      
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const items = await storage.getCartItems(cart.id);
      
      res.json({ cart, items });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  // Add to cart
  app.post('/api/cart/add', async (req: any, res) => {
    try {
      const userId = req.isAuthenticated() ? req.user?.claims?.sub : null;
      const sessionId = req.sessionID;
      const { listingId, quantity = 1 } = req.body;
      
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const cartItem = await storage.addToCart(cart.id, listingId, quantity);
      
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  // Update cart item
  app.put('/api/cart/items/:id', async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  // Remove from cart
  app.delete('/api/cart/items/:id', async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  // ==================== SEARCH & DISCOVERY ====================
  
  // Search listings
  app.get('/api/search', async (req, res) => {
    try {
      const { q, category, limit = 20, offset = 0 } = req.query;
      
      const result = await storage.searchListings(q as string, {
        categoryId: category as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error searching listings:", error);
      res.status(500).json({ error: "Failed to search listings" });
    }
  });

  // ==================== PAYMENT PROCESSING ====================
  
  // Create payment intent for purchase
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const { cartItems, shippingAddress } = req.body;
      const userId = req.user.claims.sub;
      
      // Calculate totals
      let subtotal = 0;
      let shippingCost = 0;
      
      for (const item of cartItems) {
        const listing = await storage.getListing(item.listingId);
        if (listing) {
          subtotal += parseFloat(listing.price) * (item.quantity || 1);
          shippingCost += parseFloat(listing.shippingCost || '0');
        }
      }
      
      const platformFee = subtotal * (PLATFORM_FEE_PERCENT / 100);
      const total = subtotal + shippingCost;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId,
          subtotal: subtotal.toString(),
          shippingCost: shippingCost.toString(),
          platformFee: platformFee.toString(),
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        total,
        subtotal,
        shippingCost,
        platformFee
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ORDER MANAGEMENT ====================
  
  // Get user orders
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get seller orders
  app.get('/api/seller/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ error: "Seller profile required" });
      }
      
      const orders = await storage.getSellerOrders(seller.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ error: "Failed to fetch seller orders" });
    }
  });

  // ==================== FAVORITES ====================
  
  // Get user favorites
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteIds = await storage.getUserFavorites(userId);
      res.json(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.body;
      
      await storage.addFavorite(userId, listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete('/api/favorites/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.params;
      
      await storage.removeFavorite(userId, listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
