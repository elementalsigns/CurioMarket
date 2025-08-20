import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import { z } from "zod";
import { insertListingSchema, insertSellerSchema } from "@shared/schema";
import express from "express";
import path from "path";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
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

  // Seller onboarding and subscription
  app.post('/api/sellers/onboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has a seller profile
      const existingSeller = await storage.getSellerByUserId(userId);
      if (existingSeller) {
        return res.status(400).json({ message: "User already has a seller profile" });
      }

      const sellerData = insertSellerSchema.parse({
        userId,
        shopName: req.body.shopName,
        bio: req.body.bio,
        location: req.body.location,
        policies: req.body.policies,
      });

      const seller = await storage.createSeller(sellerData);
      
      // Update user role to seller
      await storage.upsertUser({
        ...user,
        role: 'seller',
      });

      res.json(seller);
    } catch (error) {
      console.error("Error creating seller:", error);
      res.status(500).json({ message: "Failed to create seller profile" });
    }
  });

  // Subscription management
  app.post('/api/subscription/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.email) {
        return res.status(400).json({ message: "User email required" });
      }

      // Check if user already has active subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.status === 'active') {
          return res.json({
            subscriptionId: subscription.id,
            status: subscription.status,
          });
        }
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        });
        customerId = customer.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Curio Market Seller Plan',
              description: 'Monthly seller subscription with 3% platform fee',
            },
            unit_amount: 1000, // $10.00
            recurring: {
              interval: 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, {
        customerId,
        subscriptionId: subscription.id,
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Listings
  app.get('/api/listings', async (req, res) => {
    try {
      const { category, seller, search, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const result = await storage.getListings({
        categoryId: category as string,
        sellerId: seller as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Search functionality
  app.get('/api/search', async (req, res) => {
    try {
      const { q: query, category, minPrice, maxPrice, sortBy } = req.query;
      
      // Use the same sample data as featured listings but apply filters
      const allListings = [
        {
          id: "1",
          slug: "victorian-bird-skeleton-display",
          title: "Victorian Bird Skeleton Display",
          description: "Authentic 19th century songbird skeleton mounted in glass dome. Perfect condition with original Victorian presentation.",
          price: "285.00",
          category: "bones-skulls",
          status: "active",
          sellerId: "seller1",
          images: [{
            id: "img1",
            listingId: "1",
            url: "/assets/generated_images/Victorian_bird_skeleton_display_3a3e29e9.png",
            alt: "Victorian bird skeleton in glass dome",
            sortOrder: 0
          }],
          seller: { 
            id: "seller1", 
            shopName: "Victorian Specimens Co."
          }
        },
        {
          id: "2",
          slug: "antique-medical-amputation-kit",
          title: "Antique Medical Amputation Kit", 
          description: "Complete Civil War era surgical amputation set with original leather case. Historical medical curiosity.",
          price: "1250.00",
          category: "vintage-medical",
          status: "active",
          sellerId: "seller2",
          images: [{
            id: "img2",
            listingId: "2",
            url: "/assets/generated_images/Vintage_medical_laboratory_setup_8123eab0.png",
            alt: "Vintage medical surgical tools",
            sortOrder: 0
          }],
          seller: {
            id: "seller2",
            shopName: "Historic Medical"
          }
        }
      ];

      let filteredListings = allListings;

      // Apply filters
      if (query) {
        filteredListings = filteredListings.filter(listing =>
          listing.title.toLowerCase().includes((query as string).toLowerCase()) ||
          listing.description.toLowerCase().includes((query as string).toLowerCase())
        );
      }

      if (category && category !== 'all') {
        filteredListings = filteredListings.filter(listing =>
          listing.category === category
        );
      }

      if (minPrice) {
        filteredListings = filteredListings.filter(listing =>
          parseFloat(listing.price) >= parseFloat(minPrice as string)
        );
      }

      if (maxPrice) {
        filteredListings = filteredListings.filter(listing =>
          parseFloat(listing.price) <= parseFloat(maxPrice as string)
        );
      }

      // Apply sorting
      if (sortBy === 'price_low') {
        filteredListings.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sortBy === 'price_high') {
        filteredListings.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      }

      res.json({
        listings: filteredListings,
        totalCount: filteredListings.length,
        page: 1,
        totalPages: 1
      });
    } catch (error) {
      console.error("Error searching listings:", error);
      res.status(500).json({ message: "Failed to search listings" });
    }
  });

  // Get category counts for popular categories
  app.get('/api/categories/counts', async (req, res) => {
    try {
      const categoryCounts = await storage.getCategoryCounts();
      res.json(categoryCounts);
    } catch (error) {
      console.error("Error fetching category counts:", error);
      res.status(500).json({ message: "Failed to fetch category counts" });
    }
  });

  app.get('/api/listings/featured', async (req, res) => {
    try {
      // For development, return sample listings with authentic specimen images
      const sampleListings = [
        {
          id: "1",
          slug: "victorian-bird-skeleton-display",
          title: "Victorian Bird Skeleton Display",
          description: "Authentic 19th century songbird skeleton mounted in glass dome. Perfect condition with original Victorian presentation.",
          price: "285.00",
          category: "taxidermy",
          status: "active",
          sellerId: "seller1",
          images: [{
            id: "img1",
            listingId: "1",
            url: "/assets/generated_images/Victorian_bird_skeleton_display_3a3e29e9.png",
            alt: "Victorian bird skeleton in glass dome",
            sortOrder: 0
          }],
          seller: { 
            id: "seller1", 
            shopName: "Victorian Specimens Co."
          },
          reviews: [{ rating: 5 }, { rating: 5 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "2",
          slug: "antique-medical-amputation-kit",
          title: "Antique Medical Amputation Kit", 
          description: "Complete Civil War era surgical amputation set with original leather case. Historical medical curiosity.",
          price: "1250.00",
          category: "vintage-medical",
          status: "active",
          sellerId: "seller2",
          images: [{
            id: "img2",
            listingId: "2",
            url: "/assets/generated_images/Vintage_medical_laboratory_setup_8123eab0.png",
            alt: "Vintage medical surgical tools",
            sortOrder: 0
          }],
          seller: {
            id: "seller2",
            shopName: "Historic Medical"
          },
          reviews: [{ rating: 5 }, { rating: 4 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "3",
          slug: "human-skull-replica",
          title: "Human Skull Replica",
          description: "Museum quality anatomical skull replica. Perfect for collectors of medical oddities and educational purposes.",
          price: "165.00",
          category: "bones-skulls",
          status: "active",
          sellerId: "seller3",
          images: [{
            id: "img3",
            listingId: "3", 
            url: "/assets/generated_images/Annotated_Victorian_medical_skull_83d06452.png",
            alt: "Anatomical skull specimen",
            sortOrder: 0
          }],
          seller: {
            id: "seller3",
            shopName: "Anatomical Arts"
          },
          reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "4",
          slug: "preserved-wet-specimen-jar",
          title: "Preserved Frog Specimen",
          description: "Victorian era frog specimen preserved in original formaldehyde solution. Authentic scientific curiosity from antique laboratory collection.",
          price: "95.00",
          category: "wet-specimens",
          status: "active",
          sellerId: "seller4",
          images: [{
            id: "img4",
            listingId: "4",
            url: "/assets/generated_images/Victorian_preserved_frog_specimen_9698e184.png",
            alt: "Preserved frog specimen in laboratory jar",
            sortOrder: 0
          }],
          seller: {
            id: "seller4",
            shopName: "Lab Specimens Ltd"
          },
          reviews: [{ rating: 4 }, { rating: 5 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "5",
          slug: "gothic-raven-taxidermy",
          title: "Victorian Bat Wing Specimen",
          description: "Preserved bat wings mounted in antique wooden frame with glass front. Victorian taxidermy craftsmanship in excellent condition.",
          price: "350.00",
          category: "taxidermy",
          status: "active",
          sellerId: "seller5",
          images: [{
            id: "img5",
            listingId: "5",
            url: "/assets/generated_images/Victorian_bat_wing_specimen_a0f07aa9.png",
            alt: "Victorian bat wing specimen display",
            sortOrder: 0
          }],
          seller: {
            id: "seller5",
            shopName: "Gothic Taxidermy Studio"
          },
          reviews: [{ rating: 5 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "6",
          slug: "vintage-apothecary-bottles",
          title: "Victorian Crystal Collection",
          description: "Rare collection of Victorian era mineral specimens and crystals in original wooden display case with brass labels.",
          price: "175.00",
          category: "vintage-medical",
          status: "active",
          sellerId: "seller6",
          images: [{
            id: "img6",
            listingId: "6",
            url: "/assets/generated_images/Victorian_crystal_mineral_collection_9d28ba7d.png",
            alt: "Victorian crystal mineral collection",
            sortOrder: 0
          }],
          seller: {
            id: "seller6",
            shopName: "Apothecary Antiquities"
          },
          reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      res.json(sampleListings.slice(0, 8));
    } catch (error) {
      console.error("Error fetching featured listings:", error);
      res.status(500).json({ message: "Failed to fetch featured listings" });
    }
  });

  app.get('/api/listings/:id', async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const images = await storage.getListingImages(listing.id);
      const reviews = await storage.getListingReviews(listing.id);

      res.json({
        ...listing,
        images,
        reviews,
      });
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ message: "Must be a seller to create listings" });
      }

      // Generate slug from title
      const slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-') + '-' + Date.now();

      const listingData = insertListingSchema.parse({
        ...req.body,
        sellerId: seller.id,
        slug,
      });

      const listing = await storage.createListing(listingData);
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listing = await storage.getListing(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const seller = await storage.getSeller(listing.sellerId);
      if (!seller || seller.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this listing" });
      }

      const updates = insertListingSchema.partial().parse(req.body);
      const updatedListing = await storage.updateListing(req.params.id, updates);
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  // Cart operations
  app.get('/api/cart', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.sessionID;
      
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const items = await storage.getCartItems(cart.id);
      
      res.json({ cart, items });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart/add', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.sessionID;
      const { listingId, quantity = 1 } = req.body;
      
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const item = await storage.addToCart(cart.id, listingId, quantity);
      
      res.json(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.delete('/api/cart/items/:id', async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Checkout and payments
  app.post('/api/checkout/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { cartId, shippingAddress } = req.body;

      const cartItems = await storage.getCartItems(cartId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals
      let subtotal = 0;
      let shippingCost = 0;
      const ordersBySellerMap = new Map();

      for (const item of cartItems) {
        const listing = await storage.getListing(item.listingId);
        if (!listing) continue;

        const itemTotal = parseFloat(listing.price) * item.quantity;
        subtotal += itemTotal;
        shippingCost += parseFloat(listing.shippingCost || '0');

        // Group by seller for order creation
        const sellerId = listing.sellerId;
        if (!ordersBySellerMap.has(sellerId)) {
          ordersBySellerMap.set(sellerId, []);
        }
        ordersBySellerMap.get(sellerId).push({
          listing,
          item,
          itemTotal,
        });
      }

      const platformFee = subtotal * (PLATFORM_FEE_PERCENT / 100);
      const total = subtotal + shippingCost + platformFee;

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId,
          cartId,
          orderCount: ordersBySellerMap.size.toString(),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        total,
        subtotal,
        shippingCost,
        platformFee,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Search
  app.get('/api/search', async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const filters: any = {
        limit: parseInt(limit as string),
        offset,
      };

      if (category) filters.categoryId = category;

      const result = await storage.searchListings(q as string || '', filters);
      res.json(result);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search listings" });
    }
  });

  // Favorites
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.body;
      
      await storage.addFavorite(userId, listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeFavorite(userId, req.params.listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/user/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Seller dashboard
  app.get('/api/seller/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ message: "Not a seller" });
      }

      const { listings } = await storage.getListings({ sellerId: seller.id });
      const orders = await storage.getSellerOrders(seller.id);
      const stats = await storage.getSellerStats(seller.id);

      res.json({
        seller,
        listings,
        orders,
        stats,
      });
    } catch (error) {
      console.error("Error fetching seller dashboard:", error);
      res.status(500).json({ message: "Failed to fetch seller dashboard" });
    }
  });

  // Orders
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Reviews
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId, listingId, sellerId, rating, content } = req.body;

      const review = await storage.createReview({
        orderId,
        buyerId: userId,
        listingId,
        sellerId,
        rating,
        content,
      });

      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
