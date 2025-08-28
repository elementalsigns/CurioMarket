import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSellerSchema, insertListingSchema } from "@shared/schema";
import { verificationService } from "./verificationService";
import { emailService } from "./emailService";
import { ObjectStorageService } from "./objectStorage";
import * as XLSX from 'xlsx';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
}) : null;

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || "2.6");

// Helper function to create seller subscription price if it doesn't exist
async function createSellerSubscriptionPrice(stripe: Stripe): Promise<string> {
  try {
    // First, create the product
    const product = await stripe.products.create({
      name: 'Curio Market Seller Subscription',
      description: 'Monthly subscription for sellers on Curio Market platform',
      metadata: {
        type: 'seller_subscription'
      }
    });

    // Then create the recurring price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // $10.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        type: 'seller_subscription'
      }
    });

    console.log(`Created Stripe price: ${price.id} for product: ${product.id}`);
    return price.id;
  } catch (error) {
    console.error('Error creating Stripe product/price:', error);
    throw new Error('Failed to create subscription pricing');
  }
}

// Webhook handler functions
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  try {
    const user = await storage.getUser(userId);
    if (user) {
      await storage.updateUserStripeInfo(userId, {
        customerId: subscription.customer as string,
        subscriptionId: subscription.id
      });
      
      // If subscription is active, ensure user has seller role
      if (subscription.status === 'active') {
        await storage.upsertUser({
          ...user,
          role: 'seller' as const
        });
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  try {
    const user = await storage.getUser(userId);
    if (user) {
      await storage.updateUserStripeInfo(userId, {
        customerId: subscription.customer as string,
        subscriptionId: ""
      });
      
      // Downgrade user role back to buyer
      await storage.upsertUser({
        ...user,
        role: 'buyer' as const
      });
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !stripe) return;

  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription.toString());
    const userId = subscription.metadata.userId;
    
    if (userId) {
      const user = await storage.getUser(userId);
      if (user?.email) {
        // Send success email notification - implement this in emailService if needed
        console.log(`Payment succeeded for user ${userId}, amount: $${(invoice.amount_paid || 0) / 100}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !stripe) return;

  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription.toString());
    const userId = subscription.metadata.userId;
    
    if (userId) {
      const user = await storage.getUser(userId);
      if (user?.email) {
        // Send payment failure notification - implement this in emailService if needed
        console.log(`Payment failed for user ${userId}, amount: $${(invoice.amount_due || 0) / 100}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Static file serving for assets
  app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets')));

  // Auth middleware
  await setupAuth(app);

  // Serve Stripe publishable key to frontend
  app.get('/api/config/stripe', (req, res) => {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
    });
  });

  // Object storage routes
  app.post('/api/objects/upload', isAuthenticated, async (req: any, res) => {
    try {
      console.log('Upload URL requested by user:', req.user?.claims?.sub);
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log('Generated upload URL:', uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

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
            clientSecret: null,
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

      // Create or get the seller subscription price - validate existing price ID
      let SELLER_SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SELLER_PRICE_ID;
      
      if (SELLER_SUBSCRIPTION_PRICE_ID) {
        try {
          await stripe.prices.retrieve(SELLER_SUBSCRIPTION_PRICE_ID);
        } catch (error: any) {
          console.log(`Price ID ${SELLER_SUBSCRIPTION_PRICE_ID} not found, creating new price...`);
          SELLER_SUBSCRIPTION_PRICE_ID = await createSellerSubscriptionPrice(stripe);
        }
      } else {
        SELLER_SUBSCRIPTION_PRICE_ID = await createSellerSubscriptionPrice(stripe);
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: SELLER_SUBSCRIPTION_PRICE_ID,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId,
          type: 'seller_subscription'
        }
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, {
        customerId,
        subscriptionId: subscription.id
      });

      const latestInvoice = subscription.latest_invoice as any;
      let clientSecret = null;
      if (latestInvoice?.payment_intent?.client_secret) {
        clientSecret = latestInvoice.payment_intent.client_secret;
      }
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret,
        status: subscription.status
      });
    } catch (error: any) {
      console.error("Error creating seller subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check subscription status endpoint
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.json({ hasActiveSubscription: false });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.json({ hasActiveSubscription: false });
      }

      // Check if subscription is actually active
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const isActive = subscription.status === 'active';
      
      res.json({ 
        hasActiveSubscription: isActive,
        subscriptionStatus: subscription.status 
      });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.json({ hasActiveSubscription: false });
    }
  });

  // Create subscription endpoint
  app.post('/api/subscription/create', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      console.log(`[SUBSCRIPTION] Processing create request, req.user:`, req.user);
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        console.error(`[SUBSCRIPTION] No user ID found in request`);
        return res.status(401).json({ error: "User authentication required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error(`[SUBSCRIPTION] User ${userId} not found in database`);
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`[SUBSCRIPTION] Create request for user ${userId}, email: ${user.email}`);

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        try {
          const existingSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          if (existingSubscription.status === 'active') {
            console.log(`[SUBSCRIPTION] User ${userId} already has active subscription: ${user.stripeSubscriptionId}`);
            return res.json({
              subscriptionId: user.stripeSubscriptionId,
              clientSecret: null,
              status: 'active',
              success: true
            });
          }
        } catch (error) {
          console.log(`[SUBSCRIPTION] Existing subscription ${user.stripeSubscriptionId} not found, creating new one`);
        }
      }

      let customerId = user.stripeCustomerId;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: userId,
            },
          });
          customerId = customer.id;
          console.log(`[SUBSCRIPTION] Created new Stripe customer: ${customerId} for user ${userId}`);

          // Update user with customer ID
          await storage.upsertUser({
            id: userId,
            email: user.email || '',
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            stripeCustomerId: customerId,
            stripeSubscriptionId: user.stripeSubscriptionId
          });
        } catch (customerError: any) {
          console.error(`[SUBSCRIPTION] Failed to create Stripe customer for user ${userId}:`, customerError);
          return res.status(500).json({ error: "Failed to create customer account" });
        }
      }

      // Create subscription with proper price
      try {
        let priceId = process.env.STRIPE_SELLER_PRICE_ID;
        
        // If price ID doesn't exist or is invalid, create a new one
        if (!priceId || priceId.startsWith('prod_')) {
          console.log(`[SUBSCRIPTION] Creating new price for $10/month subscription`);
          
          // First, ensure we have a product
          let productId = process.env.STRIPE_SELLER_PRICE_ID;
          if (!productId || !productId.startsWith('prod_')) {
            const product = await stripe.products.create({
              name: 'Curio Market Seller Subscription',
              description: 'Monthly subscription for sellers on Curio Market',
            });
            productId = product.id;
            console.log(`[SUBSCRIPTION] Created product: ${productId}`);
          }
          
          // Create the recurring price
          const price = await stripe.prices.create({
            product: productId,
            unit_amount: 1000, // $10.00 in cents
            currency: 'usd',
            recurring: {
              interval: 'month',
            },
            metadata: {
              type: 'seller_subscription',
            },
          });
          priceId = price.id;
          console.log(`[SUBSCRIPTION] Created price: ${priceId} for $10/month`);
        }

        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
        });

        console.log(`[SUBSCRIPTION] Created subscription ${subscription.id} for user ${userId}`);

        // Update user with subscription ID
        await storage.upsertUser({
          id: userId,
          email: user.email || '',
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id
        });

        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent;
        
        console.log(`[SUBSCRIPTION] Subscription created:`, {
          subscriptionId: subscription.id,
          status: subscription.status,
          invoiceId: invoice?.id,
          paymentIntentId: paymentIntent?.id,
          clientSecret: paymentIntent?.client_secret ? 'present' : 'missing'
        });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
          status: subscription.status,
          success: true
        });
      } catch (subscriptionError: any) {
        console.error(`[SUBSCRIPTION] Failed to create subscription for user ${userId}:`, subscriptionError);
        return res.status(500).json({ error: "Failed to create subscription" });
      }
    } catch (error: any) {
      console.error(`[SUBSCRIPTION] Error in subscription endpoint for user:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Seller onboarding route
  app.post('/api/sellers/onboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`[ONBOARD] User ${userId} attempting onboard, role: ${user?.role}, subscriptionId: ${user?.stripeSubscriptionId}`);
      
      // Verify user has active subscription
      if (!user.stripeSubscriptionId) {
        return res.status(403).json({ error: "Active subscription required" });
      }

      if (stripe) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          console.log(`[ONBOARD] Subscription status for user ${userId}:`, {
            id: subscription.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end
          });
          
          if (subscription.status !== 'active') {
            console.log(`[ONBOARD] Subscription not active for user ${userId}, status: ${subscription.status}`);
            return res.status(403).json({ error: `Active subscription required. Current status: ${subscription.status}` });
          }
          console.log(`[ONBOARD] User ${userId} has active subscription, proceeding with onboard`);
        } catch (error) {
          console.error(`[ONBOARD] Error verifying subscription for user ${userId}:`, error);
          return res.status(403).json({ error: "Unable to verify subscription - Stripe API error" });
        }
      } else {
        console.log(`[ONBOARD] Stripe not configured, skipping subscription verification for user ${userId}`);
      }

      const sellerData = insertSellerSchema.parse({
        userId,
        ...req.body
      });

      const seller = await storage.createSeller(sellerData);
      
      // Update user role to seller
      await storage.upsertUser({ 
        id: userId, 
        role: 'seller' as const,
        email: user.email || '',
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      });

      console.log(`[ONBOARD] Successfully created seller profile for user ${userId}`);
      res.json(seller);
    } catch (error: any) {
      console.error("Error creating seller profile:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create seller profile" });
    }
  });

  // Create seller profile
  app.post('/api/seller/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Verify user has active subscription
      if (!user.stripeSubscriptionId) {
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
        role: 'seller' as const,
        email: user.email || '',
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

  // Cancel seller subscription
  app.post('/api/seller/subscription/cancel', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ error: "No active subscription found" });
      }

      // Cancel the subscription at period end
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      res.json({ 
        message: "Subscription will be canceled at the end of the current billing period",
        cancelAt: new Date(subscription.cancel_at! * 1000)
      });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== STRIPE WEBHOOKS ====================
  
  // Stripe webhook endpoint
  app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      return res.status(400).send('Stripe not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(subscription);
          break;
        
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCancellation(deletedSubscription);
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentSucceeded(invoice);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(failedInvoice);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({received: true});
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({error: 'Webhook processing failed'});
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

  // Create order after successful payment
  app.post('/api/orders/create', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId, cartItems, shippingAddress } = req.body;
      const userId = req.user.claims.sub;
      
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }
      
      // Verify payment intent is successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment not completed" });
      }
      
      // Group items by seller to create separate orders
      const ordersBySeller: { [sellerId: string]: any[] } = {};
      let totalAmount = 0;
      
      for (const item of cartItems) {
        const listing = await storage.getListing(item.listingId);
        if (!listing) continue;
        
        const sellerId = listing.sellerId;
        if (!ordersBySeller[sellerId]) {
          ordersBySeller[sellerId] = [];
        }
        
        const itemTotal = parseFloat(listing.price) * (item.quantity || 1);
        totalAmount += itemTotal;
        
        ordersBySeller[sellerId].push({
          listing,
          quantity: item.quantity || 1,
          price: listing.price,
          itemTotal
        });
      }
      
      const createdOrders = [];
      
      // Create orders for each seller
      for (const [sellerId, items] of Object.entries(ordersBySeller)) {
        const orderTotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
        const orderShippingCost = items.reduce((sum, item) => sum + parseFloat(item.listing.shippingCost || '0'), 0);
        
        // Create order
        const order = await storage.createOrder({
          buyerId: userId,
          sellerId,
          total: (orderTotal + orderShippingCost).toString(),
          subtotal: orderTotal.toString(),
          shippingCost: orderShippingCost.toString(),
          platformFee: (orderTotal * (PLATFORM_FEE_PERCENT / 100)).toString(),
          status: 'paid',
          stripePaymentIntentId: paymentIntentId,
          shippingAddress
        });
        
        // Create order items
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            listingId: item.listing.id,
            quantity: item.quantity,
            price: item.price,
            title: item.listing.title
          });
        }
        
        createdOrders.push(order);
        
        // Send order confirmation email
        try {
          const orderDetails = await storage.getOrderWithDetails(order.id);
          if (orderDetails && orderDetails.buyerEmail) {
            const emailData = {
              customerEmail: orderDetails.buyerEmail,
              customerName: `${orderDetails.buyerFirstName} ${orderDetails.buyerLastName}`,
              orderId: orderDetails.id,
              orderNumber: `#${orderDetails.id.slice(-8).toUpperCase()}`,
              orderTotal: orderDetails.total,
              orderItems: orderDetails.items,
              shippingAddress: orderDetails.shippingAddress,
              shopName: orderDetails.sellerShopName,
              sellerEmail: orderDetails.sellerEmail
            };
            
            await emailService.sendOrderConfirmation(emailData);
          }
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
          // Continue processing even if email fails
        }
      }
      
      // Clear the cart after successful order creation
      await storage.clearCart(userId);
      
      res.json({ orders: createdOrders, success: true });
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: error.message || "Failed to create order" });
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

  // =================== ENHANCED PRODUCT MANAGEMENT ===================

  // Listing variations
  app.get('/api/listings/:id/variations', async (req, res) => {
    try {
      const variations = await storage.getListingVariations(req.params.id);
      res.json(variations);
    } catch (error) {
      console.error("Error fetching variations:", error);
      res.status(500).json({ error: "Failed to fetch variations" });
    }
  });

  app.post('/api/listings/:id/variations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(403).json({ error: "Seller access required" });
      }

      const variation = await storage.createListingVariation({
        listingId: req.params.id,
        ...req.body
      });
      res.json(variation);
    } catch (error) {
      console.error("Error creating variation:", error);
      res.status(500).json({ error: "Failed to create variation" });
    }
  });

  app.put('/api/variations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const variation = await storage.updateListingVariation(req.params.id, req.body);
      res.json(variation);
    } catch (error) {
      console.error("Error updating variation:", error);
      res.status(500).json({ error: "Failed to update variation" });
    }
  });

  app.delete('/api/variations/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteListingVariation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting variation:", error);
      res.status(500).json({ error: "Failed to delete variation" });
    }
  });

  // Stock management
  app.put('/api/listings/:id/stock', isAuthenticated, async (req: any, res) => {
    try {
      const { quantity } = req.body;
      const listing = await storage.updateListingStock(req.params.id, quantity);
      res.json(listing);
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ error: "Failed to update stock" });
    }
  });

  app.get('/api/seller/low-stock', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }
      
      const listings = await storage.getLowStockListings(seller.id);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching low stock listings:", error);
      res.status(500).json({ error: "Failed to fetch low stock listings" });
    }
  });

  // Bulk operations
  app.put('/api/seller/listings/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }
      
      const { updates } = req.body;
      const listings = await storage.bulkUpdateListings(seller.id, updates);
      res.json(listings);
    } catch (error) {
      console.error("Error bulk updating listings:", error);
      res.status(500).json({ error: "Failed to bulk update listings" });
    }
  });

  // =================== ADVANCED SEARCH & DISCOVERY ===================

  // Saved searches
  app.get('/api/saved-searches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const searches = await storage.getUserSavedSearches(userId);
      res.json(searches);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
      res.status(500).json({ error: "Failed to fetch saved searches" });
    }
  });

  app.post('/api/saved-searches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const search = await storage.createSavedSearch({
        userId,
        ...req.body
      });
      res.json(search);
    } catch (error) {
      console.error("Error creating saved search:", error);
      res.status(500).json({ error: "Failed to create saved search" });
    }
  });

  app.delete('/api/saved-searches/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteSavedSearch(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting saved search:", error);
      res.status(500).json({ error: "Failed to delete saved search" });
    }
  });

  // Wishlists
  app.get('/api/wishlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlists = await storage.getUserWishlists(userId);
      res.json(wishlists);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      res.status(500).json({ error: "Failed to fetch wishlists" });
    }
  });

  app.post('/api/wishlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlist = await storage.createWishlist({
        userId,
        ...req.body
      });
      res.json(wishlist);
    } catch (error) {
      console.error("Error creating wishlist:", error);
      res.status(500).json({ error: "Failed to create wishlist" });
    }
  });

  app.get('/api/wishlists/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getWishlistItems(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      res.status(500).json({ error: "Failed to fetch wishlist items" });
    }
  });

  app.post('/api/wishlists/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const { listingId, notes } = req.body;
      const item = await storage.addToWishlist(req.params.id, listingId, notes);
      res.json(item);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlists/:id/items/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      await storage.removeFromWishlist(req.params.id, req.params.listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });

  // Recommendations
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const recommendations = await storage.getRecommendations(userId, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Search analytics
  app.post('/api/search/track', async (req, res) => {
    try {
      const { query, resultsCount, userId, sessionId } = req.body;
      await storage.trackSearch(query, resultsCount, userId, sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking search:", error);
      res.status(500).json({ error: "Failed to track search" });
    }
  });

  app.get('/api/search/popular', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const searches = await storage.getPopularSearches(limit);
      res.json(searches);
    } catch (error) {
      console.error("Error fetching popular searches:", error);
      res.status(500).json({ error: "Failed to fetch popular searches" });
    }
  });

  // =================== ORDER MANAGEMENT & COMMUNICATION ===================

  // Order tracking
  app.put('/api/orders/:id/tracking', isAuthenticated, async (req: any, res) => {
    try {
      const { trackingInfo } = req.body;
      const order = await storage.updateOrderTracking(req.params.id, trackingInfo);
      res.json(order);
    } catch (error) {
      console.error("Error updating order tracking:", error);
      res.status(500).json({ error: "Failed to update order tracking" });
    }
  });

  // Messages
  app.get('/api/orders/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getOrderMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching order messages:", error);
      res.status(500).json({ error: "Failed to fetch order messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { threadId, content, attachments } = req.body;
      const message = await storage.sendMessage(threadId, userId, content, attachments);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.put('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  app.get('/api/messages/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ error: "Failed to fetch unread message count" });
    }
  });

  // =================== SOCIAL SHARING ANALYTICS ===================

  app.post('/api/analytics/share', async (req, res) => {
    try {
      const { listingId, platform, timestamp } = req.body;
      
      // Track the share event
      await storage.trackShareEvent({
        listingId,
        platform,
        timestamp: new Date(timestamp)
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking share:", error);
      res.status(500).json({ error: "Failed to track share" });
    }
  });

  app.get('/api/analytics/shares/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const shares = await storage.getListingShares(req.params.listingId);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching share analytics:", error);
      res.status(500).json({ error: "Failed to fetch share analytics" });
    }
  });

  // =================== NOTIFICATIONS ===================

  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ error: "Failed to fetch unread notification count" });
    }
  });

  // =================== REVIEWS ===================

  // Get reviews for seller
  app.get("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { filter = 'all', sortBy = 'newest' } = req.query;
      
      const reviews = await storage.getReviewsForSeller(userId, {
        filter: filter as string,
        sortBy: sortBy as string,
      });
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get review statistics
  app.get("/api/reviews/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const stats = await storage.getReviewStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching review stats:", error);
      res.status(500).json({ message: "Failed to fetch review statistics" });
    }
  });

  // Create a review
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const buyerId = req.user?.claims?.sub;
      const { productId, orderId, rating, title, content, photos } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const review = await storage.createReview({
        orderId,
        buyerId,
        listingId: productId,
        rating,
        title,
        content,
        photos: photos || [],
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get upload URL for review photos
  app.post("/api/reviews/photos/upload", isAuthenticated, async (req: any, res) => {
    try {
      const ObjectStorageService = (await import('./objectStorage')).ObjectStorageService;
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getReviewPhotoUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting review photo upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Serve review photos
  app.get("/objects/review-photos/:photoId(*)", async (req: any, res) => {
    try {
      const ObjectStorageService = (await import('./objectStorage')).ObjectStorageService;
      const objectStorageService = new ObjectStorageService();
      const photoFile = await objectStorageService.getReviewPhotoFile(req.path);
      objectStorageService.downloadObject(photoFile, res);
    } catch (error: any) {
      console.error("Error serving review photo:", error);
      if (error?.name === 'ObjectNotFoundError') {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Respond to a review
  app.post("/api/reviews/:reviewId/respond", isAuthenticated, async (req: any, res) => {
    try {
      const { reviewId } = req.params;
      const { response } = req.body;
      const userId = req.user?.claims?.sub;

      const updatedReview = await storage.respondToReview(reviewId, userId, response);
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found or unauthorized" });
      }

      res.json(updatedReview);
    } catch (error) {
      console.error("Error responding to review:", error);
      res.status(500).json({ message: "Failed to respond to review" });
    }
  });

  // Get reviews for a specific product
  app.get("/api/products/:productId/reviews", async (req: any, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
      
      const reviews = await storage.getProductReviews(productId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
      });
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      res.status(500).json({ message: "Failed to fetch product reviews" });
    }
  });

  // =================== SELLER DASHBOARD ENHANCEMENT ===================

  // Analytics
  app.get('/api/seller/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }

      const { startDate, endDate } = req.query;
      const analytics = await storage.getSellerAnalytics(
        seller.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching seller analytics:", error);
      res.status(500).json({ error: "Failed to fetch seller analytics" });
    }
  });

  // Promotions
  app.get('/api/seller/promotions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }

      const promotions = await storage.getSellerPromotions(seller.id);
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.post('/api/seller/promotions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }

      const promotion = await storage.createPromotion({
        sellerId: seller.id,
        ...req.body
      });
      res.json(promotion);
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(500).json({ error: "Failed to create promotion" });
    }
  });

  app.put('/api/promotions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const promotion = await storage.updatePromotion(req.params.id, req.body);
      res.json(promotion);
    } catch (error) {
      console.error("Error updating promotion:", error);
      res.status(500).json({ error: "Failed to update promotion" });
    }
  });

  // Earnings and payouts
  app.get('/api/seller/earnings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }

      const period = req.query.period as 'week' | 'month' | 'year' || 'month';
      const earnings = await storage.getSellerEarnings(seller.id, period);
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching seller earnings:", error);
      res.status(500).json({ error: "Failed to fetch seller earnings" });
    }
  });

  app.get('/api/seller/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }

      const payouts = await storage.getSellerPayouts(seller.id);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // =================== ENHANCED LISTING OPERATIONS ===================

  // Listing analytics and promotion
  app.get('/api/listings/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const analytics = await storage.getListingAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching listing analytics:", error);
      res.status(500).json({ error: "Failed to fetch listing analytics" });
    }
  });

  app.post('/api/listings/:id/view', async (req, res) => {
    try {
      await storage.incrementListingViews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing listing views:", error);
      res.status(500).json({ error: "Failed to increment views" });
    }
  });

  app.post('/api/seller/promote-listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      if (!seller) {
        return res.status(404).json({ error: "Seller profile not found" });
      }

      const { listingIds, duration } = req.body;
      await storage.promoteListings(seller.id, listingIds, duration);
      res.json({ success: true });
    } catch (error) {
      console.error("Error promoting listings:", error);
      res.status(500).json({ error: "Failed to promote listings" });
    }
  });

  // =================== VERIFICATION SYSTEM ===================

  // Get user verification status
  app.get('/api/verification/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = await verificationService.getUserVerificationStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error fetching verification status:", error);
      res.status(500).json({ error: "Failed to fetch verification status" });
    }
  });

  // Email verification
  app.post('/api/verification/email/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await verificationService.initiateEmailVerification(userId);
      
      // In a real app, send email with verification code here
      console.log(`Email verification code for user ${userId}: ${result.code}`);
      
      res.json({ 
        message: "Verification code sent to your email",
        expiresAt: result.expiresAt 
      });
    } catch (error) {
      console.error("Error initiating email verification:", error);
      res.status(500).json({ error: "Failed to initiate email verification" });
    }
  });

  app.post('/api/verification/email/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Verification code is required" });
      }

      const verified = await verificationService.verifyEmailCode(userId, code);
      
      if (verified) {
        res.json({ success: true, message: "Email verified successfully" });
      } else {
        res.status(400).json({ error: "Invalid or expired verification code" });
      }
    } catch (error) {
      console.error("Error verifying email code:", error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  // Phone verification
  app.post('/api/verification/phone/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const result = await verificationService.initiatePhoneVerification(userId, phoneNumber);
      
      // In a real app, send SMS with verification code here
      console.log(`SMS verification code for ${phoneNumber}: ${result.code}`);
      
      res.json({ 
        message: "Verification code sent to your phone",
        expiresAt: result.expiresAt 
      });
    } catch (error) {
      console.error("Error initiating phone verification:", error);
      res.status(500).json({ error: "Failed to initiate phone verification" });
    }
  });

  app.post('/api/verification/phone/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Verification code is required" });
      }

      const verified = await verificationService.verifyPhoneCode(userId, code);
      
      if (verified) {
        res.json({ success: true, message: "Phone number verified successfully" });
      } else {
        res.status(400).json({ error: "Invalid or expired verification code" });
      }
    } catch (error) {
      console.error("Error verifying phone code:", error);
      res.status(500).json({ error: "Failed to verify phone number" });
    }
  });

  // Identity verification
  app.post('/api/verification/identity/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await verificationService.initiateIdentityVerification(userId);
      
      res.json({
        sessionId: result.sessionId,
        sessionUrl: result.sessionUrl,
        message: "Identity verification session created"
      });
    } catch (error) {
      console.error("Error initiating identity verification:", error);
      res.status(500).json({ error: "Failed to initiate identity verification" });
    }
  });

  // Address verification
  app.post('/api/verification/address', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { address, city, state, zipCode, country } = req.body;
      
      if (!address || !city || !state || !zipCode) {
        return res.status(400).json({ error: "Address, city, state, and zip code are required" });
      }

      const result = await verificationService.initiateAddressVerification(userId, {
        address,
        city,
        state,
        zipCode,
        country: country || 'US'
      });
      
      res.json({
        requestId: result.requestId,
        message: "Address verification submitted for review"
      });
    } catch (error) {
      console.error("Error submitting address verification:", error);
      res.status(500).json({ error: "Failed to submit address verification" });
    }
  });

  // Seller business verification
  app.post('/api/verification/seller', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const {
        businessName,
        businessType,
        taxId,
        businessLicense,
        businessAddress,
        businessPhone,
        businessEmail,
        documents
      } = req.body;
      
      if (!businessName || !businessType) {
        return res.status(400).json({ error: "Business name and type are required" });
      }

      const result = await verificationService.initiateSellerVerification(req.body.sellerId || userId, {
        userId,
        businessName,
        businessType,
        taxId,
        businessLicense,
        businessAddress,
        businessPhone,
        businessEmail,
        documents: documents || []
      });
      
      res.json({
        queueId: result.queueId,
        message: "Seller verification submitted for review"
      });
    } catch (error) {
      console.error("Error submitting seller verification:", error);
      res.status(500).json({ error: "Failed to submit seller verification" });
    }
  });

  // Admin verification management (restricted to admins)
  app.get('/api/admin/verification/queue', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { status = 'pending', priority } = req.query;
      const queue = await verificationService.getVerificationQueue(
        status as string, 
        priority ? parseInt(priority as string) : undefined
      );
      
      res.json(queue);
    } catch (error) {
      console.error("Error fetching verification queue:", error);
      res.status(500).json({ error: "Failed to fetch verification queue" });
    }
  });

  app.post('/api/admin/verification/approve/:queueId', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { queueId } = req.params;
      const { notes } = req.body;
      
      await verificationService.approveSellerVerification(queueId, user.id, notes);
      
      res.json({ success: true, message: "Seller verification approved" });
    } catch (error) {
      console.error("Error approving seller verification:", error);
      res.status(500).json({ error: "Failed to approve seller verification" });
    }
  });

  app.post('/api/admin/verification/reject/:queueId', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { queueId } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }
      
      await verificationService.rejectSellerVerification(queueId, user.id, reason);
      
      res.json({ success: true, message: "Seller verification rejected" });
    } catch (error) {
      console.error("Error rejecting seller verification:", error);
      res.status(500).json({ error: "Failed to reject seller verification" });
    }
  });

  // =================== ADMIN DASHBOARD ===================

  // Admin middleware to check for admin role
  const requireAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ error: "Failed to verify admin status" });
    }
  };

  // Admin dashboard statistics
  app.get('/api/admin/stats', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
  });

  // Get all users for admin management
  app.get('/api/admin/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, search = '' } = req.query;
      const users = await storage.getUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get all listings for admin management
  app.get('/api/admin/listings', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, search = '', status = 'all' } = req.query;
      const listings = await storage.getAllListingsForAdmin({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string
      });
      res.json(listings);
    } catch (error) {
      console.error("Error fetching admin listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Ban a user
  app.post('/api/admin/users/:userId/ban', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.claims.sub;

      if (!reason) {
        return res.status(400).json({ error: "Ban reason is required" });
      }

      await storage.banUser(userId, adminId, reason);
      res.json({ success: true, message: "User banned successfully" });
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ error: "Failed to ban user" });
    }
  });

  // Unban a user
  app.post('/api/admin/users/:userId/unban', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const adminId = req.user.claims.sub;

      await storage.unbanUser(userId, adminId);
      res.json({ success: true, message: "User unbanned successfully" });
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ error: "Failed to unban user" });
    }
  });

  // Get all shops for admin management
  app.get('/api/admin/shops', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, status = 'all' } = req.query;
      const shops = await storage.getShopsForAdmin({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      });
      res.json(shops);
    } catch (error) {
      console.error("Error fetching shops:", error);
      res.status(500).json({ error: "Failed to fetch shops" });
    }
  });

  // Suspend a shop
  app.post('/api/admin/shops/:shopId/suspend', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.claims.sub;

      if (!reason) {
        return res.status(400).json({ error: "Suspension reason is required" });
      }

      await storage.suspendShop(shopId, adminId, reason);
      res.json({ success: true, message: "Shop suspended successfully" });
    } catch (error) {
      console.error("Error suspending shop:", error);
      res.status(500).json({ error: "Failed to suspend shop" });
    }
  });

  // Reactivate a shop
  app.post('/api/admin/shops/:shopId/reactivate', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const adminId = req.user.claims.sub;

      await storage.reactivateShop(shopId, adminId);
      res.json({ success: true, message: "Shop reactivated successfully" });
    } catch (error) {
      console.error("Error reactivating shop:", error);
      res.status(500).json({ error: "Failed to reactivate shop" });
    }
  });

  // Get flagged content for moderation
  app.get('/api/admin/flags', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, status = 'pending' } = req.query;
      const flags = await storage.getFlaggedContent({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      });
      res.json(flags);
    } catch (error) {
      console.error("Error fetching flagged content:", error);
      res.status(500).json({ error: "Failed to fetch flagged content" });
    }
  });

  // Moderate flagged content
  app.post('/api/admin/flags/:flagId/moderate', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { flagId } = req.params;
      const { action, notes } = req.body;
      const adminId = req.user.claims.sub;

      if (!action) {
        return res.status(400).json({ error: "Moderation action is required" });
      }

      await storage.moderateContent(flagId, adminId, action, notes);
      res.json({ success: true, message: "Content moderated successfully" });
    } catch (error) {
      console.error("Error moderating content:", error);
      res.status(500).json({ error: "Failed to moderate content" });
    }
  });

  // Get disputed orders
  app.get('/api/admin/disputes', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, status = 'open' } = req.query;
      const disputes = await storage.getDisputes({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      });
      res.json(disputes);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ error: "Failed to fetch disputes" });
    }
  });

  // Resolve a dispute
  app.post('/api/admin/disputes/:disputeId/resolve', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { disputeId } = req.params;
      const { resolution, notes } = req.body;
      const adminId = req.user.claims.sub;

      if (!resolution) {
        return res.status(400).json({ error: "Resolution is required" });
      }

      await storage.resolveDispute(disputeId, adminId, resolution, notes);
      res.json({ success: true, message: "Dispute resolved successfully" });
    } catch (error) {
      console.error("Error resolving dispute:", error);
      res.status(500).json({ error: "Failed to resolve dispute" });
    }
  });

  // Process refund
  app.post('/api/admin/orders/:orderId/refund', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { amount, reason } = req.body;
      const adminId = req.user.claims.sub;

      if (!amount || !reason) {
        return res.status(400).json({ error: "Amount and reason are required" });
      }

      // In a real implementation, process the refund through Stripe
      await storage.processRefund(orderId, adminId, amount, reason);
      res.json({ success: true, message: "Refund processed successfully" });
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ error: "Failed to process refund" });
    }
  });

  // Get admin activity log
  app.get('/api/admin/activity', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 100 } = req.query;
      const activities = await storage.getAdminActivityLog({
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activity:", error);
      res.status(500).json({ error: "Failed to fetch admin activity" });
    }
  });

  // Platform settings management
  app.get('/api/admin/settings', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      res.status(500).json({ error: "Failed to fetch platform settings" });
    }
  });

  app.put('/api/admin/settings', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const updatedSettings = await storage.updatePlatformSettings(req.body, adminId);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating platform settings:", error);
      res.status(500).json({ error: "Failed to update platform settings" });
    }
  });

  // Export product data for advertising platforms
  app.get('/api/admin/export/products', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { format = 'csv' } = req.query;
      const listings = await storage.getListingsForExport();
      
      if (format === 'csv') {
        let csvContent = "title,price,sku,mpn,category,condition,url,image_url,description\n";
        
        listings.forEach((listing: any) => {
          const url = `${process.env.REPLIT_DEV_DOMAIN || 'https://curio-market.replit.app'}/listing/${listing.slug}`;
          const imageUrl = listing.images?.[0] || '';
          const escapedTitle = `"${(listing.title || '').replace(/"/g, '""')}"`;
          const escapedDescription = `"${(listing.description || '').replace(/"/g, '""').substring(0, 100)}..."`;
          
          csvContent += `${escapedTitle},${listing.price || 0},${listing.sku || ''},${listing.mpn || ''},${listing.categoryName || ''},${listing.condition || 'used'},${url},${imageUrl},${escapedDescription}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="curio-market-products-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
      } else if (format === 'facebook') {
        let fbContent = "id,title,description,availability,condition,price,link,image_link,brand,mpn,sku,product_type\n";
        
        listings.forEach((listing: any) => {
          const url = `${process.env.REPLIT_DEV_DOMAIN || 'https://curio-market.replit.app'}/listing/${listing.slug}`;
          const imageUrl = listing.images?.[0] || '';
          const escapedTitle = `"${(listing.title || '').replace(/"/g, '""')}"`;
          const escapedDescription = `"${(listing.description || '').replace(/"/g, '""').substring(0, 100)}..."`;
          
          fbContent += `${listing.id},${escapedTitle},${escapedDescription},in stock,${listing.condition || 'used'},${listing.price || 0} USD,${url},${imageUrl},"Curio Market",${listing.mpn || ''},${listing.sku || ''},${listing.categoryName || 'Collectibles'}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="curio-market-facebook-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(fbContent);
      } else if (format === 'google-sheets') {
        // Google Sheets friendly format
        let gsContent = 'Product ID,Title,Description,Price,Category,SKU,MPN,Quantity,Condition,Images,Status,Created Date\n';
        
        listings.forEach((listing: any) => {
          const escapedTitle = `"${(listing.title || '').replace(/"/g, '""')}"`;
          const escapedDescription = `"${(listing.description || '').replace(/"/g, '""')}"`;
          const imageUrl = listing.images?.[0] || '';
          const createdDate = new Date(listing.createdAt).toLocaleDateString();
          
          gsContent += `${listing.id},${escapedTitle},${escapedDescription},${listing.price || 0},${listing.categoryName || ''},${listing.sku || ''},${listing.mpn || ''},${listing.quantity || 0},${listing.condition || 'used'},"${imageUrl}",${listing.state || 'draft'},${createdDate}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="curio-market-google-sheets-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(gsContent);
      } else if (format === 'excel') {
        // Create Excel workbook
        const workbook = XLSX.utils.book_new();
        
        // Prepare data for Excel
        const excelData = listings.map((listing: any) => ({
          'Product ID': listing.id,
          'Title': listing.title || '',
          'Description': listing.description || '',
          'Price ($)': parseFloat(listing.price) || 0,
          'Category': listing.categoryName || '',
          'SKU': listing.sku || '',
          'MPN': listing.mpn || '',
          'Quantity': listing.quantity || 0,
          'Condition': listing.condition || 'used',
          'Status': listing.state || 'draft',
          'Images': listing.images?.[0] || '',
          'Species/Material': listing.speciesOrMaterial || '',
          'Provenance': listing.provenance || '',
          'Shipping Cost': parseFloat(listing.shippingCost) || 0,
          'Views': listing.views || 0,
          'Created Date': new Date(listing.createdAt).toLocaleDateString(),
          'Updated Date': new Date(listing.updatedAt).toLocaleDateString()
        }));
        
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Auto-size columns
        const colWidths = Object.keys(excelData[0] || {}).map(key => ({
          wch: Math.max(key.length, 15)
        }));
        worksheet['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        
        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="curio-market-excel-${new Date().toISOString().split('T')[0]}.xlsx"`);
        res.send(excelBuffer);
      } else {
        res.json(listings);
      }
    } catch (error) {
      console.error("Error exporting product data:", error);
      res.status(500).json({ error: "Failed to export product data" });
    }
  });

  // Get export statistics
  app.get('/api/admin/export/stats', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getExportStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching export stats:", error);
      res.status(500).json({ error: "Failed to fetch export statistics" });
    }
  });

  // Demo route for testing admin export functionality (development only)
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/demo/admin/export/stats', async (req: any, res) => {
      try {
        const stats = await storage.getExportStats();
        res.json(stats);
      } catch (error) {
        console.error("Error fetching export stats:", error);
        res.status(500).json({ error: "Failed to fetch export statistics" });
      }
    });

    app.get('/api/demo/admin/export/products', async (req, res) => {
      try {
        const { format } = req.query;
        const listings = await storage.getAllListingsForAdmin({
          page: 1,
          limit: 1000,
          search: '',
          status: 'all'
        });

        if (format === 'google-shopping') {
          // Google Shopping CSV format
          let csvContent = 'title,price,sku,mpn,category,condition,link,image_link,description\n';
          
          listings.forEach((listing: any) => {
            const url = `${process.env.REPLIT_DEV_DOMAIN || 'https://curio-market.replit.app'}/listing/${listing.slug}`;
            const imageUrl = listing.images?.[0] || '';
            const escapedTitle = `"${(listing.title || '').replace(/"/g, '""')}"`;
            const escapedDescription = `"${(listing.description || '').replace(/"/g, '""').substring(0, 100)}..."`;
            
            csvContent += `${escapedTitle},${listing.price || 0},${listing.sku || ''},${listing.mpn || ''},${listing.categoryName || ''},${listing.condition || 'used'},${url},${imageUrl},${escapedDescription}\n`;
          });
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="curio-market-products-${new Date().toISOString().split('T')[0]}.csv"`);
          res.send(csvContent);
        } else if (format === 'excel') {
          // Excel format
          const workbook = XLSX.utils.book_new();
          const excelData = listings.map((listing: any) => ({
            'Product ID': listing.id,
            'Title': listing.title || '',
            'Description': listing.description || '',
            'Price ($)': parseFloat(listing.price) || 0,
            'Category': listing.categoryName || '',
            'SKU': listing.sku || '',
            'MPN': listing.mpn || '',
            'Quantity': listing.quantity || 0,
            'Condition': listing.condition || 'used',
            'Status': listing.state || 'draft',
            'Images': listing.images?.[0] || '',
            'Created Date': new Date(listing.createdAt).toLocaleDateString()
          }));
          
          const worksheet = XLSX.utils.json_to_sheet(excelData);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
          const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="curio-market-demo-${new Date().toISOString().split('T')[0]}.xlsx"`);
          res.send(excelBuffer);
        } else {
          res.json(listings);
        }
      } catch (error) {
        console.error("Error in demo export:", error);
        res.status(500).json({ error: "Failed to export data" });
      }
    });
  }

  // =================== EVENTS MANAGEMENT ===================

  // Get all events (public endpoint)
  app.get('/api/events', async (req, res) => {
    try {
      const { search, status, page = 1, limit = 100 } = req.query;
      const events = await storage.getEvents({
        search: search as string,
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get single event (public endpoint)
  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Create new event (requires authentication)
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = {
        userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Update event (requires authentication and ownership)
  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      // Check if user owns the event
      const existingEvent = await storage.getEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (existingEvent.userId !== userId) {
        return res.status(403).json({ error: "You can only edit your own events" });
      }
      
      const updatedData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const event = await storage.updateEvent(eventId, updatedData);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // Delete event (requires authentication and ownership)
  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      // Check if user owns the event
      const existingEvent = await storage.getEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (existingEvent.userId !== userId) {
        return res.status(403).json({ error: "You can only delete your own events" });
      }
      
      await storage.deleteEvent(eventId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Get user's events (requires authentication)
  app.get('/api/user/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ error: "Failed to fetch user events" });
    }
  });

  // Register for event (requires authentication)
  app.post('/api/events/:id/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      const { attendeeEmail, attendeeName } = req.body;
      
      if (!attendeeEmail || !attendeeName) {
        return res.status(400).json({ error: "Attendee email and name are required" });
      }
      
      const registration = await storage.registerForEvent(eventId, userId, {
        attendeeEmail,
        attendeeName
      });
      
      res.status(201).json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ error: "Failed to register for event" });
    }
  });

  // Get event attendees (requires authentication and ownership)
  app.get('/api/events/:id/attendees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      // Check if user owns the event
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.userId !== userId) {
        return res.status(403).json({ error: "You can only view attendees for your own events" });
      }
      
      const attendees = await storage.getEventAttendees(eventId);
      res.json(attendees);
    } catch (error) {
      console.error("Error fetching event attendees:", error);
      res.status(500).json({ error: "Failed to fetch event attendees" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
