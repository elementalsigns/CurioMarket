import {
  users,
  sellers,
  listings,
  categories,
  orders,
  orderItems,
  reviews,
  cartItems,
  carts,
  listingImages,
  messageThreads,
  messageThreadParticipants,
  messages,
  favorites,
  shopFollows,
  flags,
  savedSearches,
  wishlists,
  wishlistItems,
  notifications,
  sellerAnalytics,
  promotions,
  listingVariations,
  searchAnalytics,
  payouts,
  type User,
  type UpsertUser,
  type Seller,
  type InsertSeller,
  type Listing,
  type InsertListing,
  type Category,
  type Order,
  type Review,
  type Cart,
  type CartItem,
  type ListingImage,
  type MessageThread,
  type MessageThreadParticipant,
  type Message,
  type SavedSearch,
  type InsertSavedSearch,
  type Wishlist,
  type InsertWishlist,
  type WishlistItem,
  type Notification,
  type InsertNotification,
  type SellerAnalytic,
  type Promotion,
  type InsertPromotion,
  type ListingVariation,
  type InsertListingVariation,
  type SearchAnalytic,
  type Payout,
  type ShareEvent,
  type InsertShareEvent,
  events,
  eventAttendees,
  type Event,
  type InsertEvent,
  type EventAttendee,
  type InsertEventAttendee,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, like, or, sql, count, avg, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, stripeData: { customerId: string; subscriptionId: string }): Promise<User>;
  
  // Seller operations
  createSeller(seller: InsertSeller): Promise<Seller>;
  getSellerByUserId(userId: string): Promise<Seller | undefined>;
  getSeller(id: string): Promise<Seller | undefined>;
  updateSeller(id: string, updates: Partial<InsertSeller>): Promise<Seller>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Listing operations
  createListing(listing: InsertListing): Promise<Listing>;
  getListings(filters?: { categoryId?: string; sellerId?: string; search?: string; limit?: number; offset?: number }): Promise<{ listings: Listing[]; total: number }>;
  getListing(id: string): Promise<Listing | undefined>;
  getListingBySlug(slug: string): Promise<Listing | undefined>;
  updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  
  // Listing images
  addListingImage(listingId: string, url: string, alt?: string, sortOrder?: number): Promise<ListingImage>;
  getListingImages(listingId: string): Promise<ListingImage[]>;
  deleteListingImages(listingId: string): Promise<void>;
  
  // Cart operations
  getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart>;
  addToCart(cartId: string, listingId: string, quantity: number): Promise<CartItem>;
  getCartItems(cartId: string): Promise<CartItem[]>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  
  // Order operations
  createOrder(order: Partial<Order>): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getSellerOrders(sellerId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Review operations
  createReview(review: Partial<Review>): Promise<Review>;
  getListingReviews(listingId: string): Promise<Review[]>;
  getSellerReviews(sellerId: string): Promise<Review[]>;
  
  // Favorites operations
  addFavorite(userId: string, listingId: string): Promise<void>;
  removeFavorite(userId: string, listingId: string): Promise<void>;
  getUserFavorites(userId: string): Promise<string[]>;
  
  // Shop follows
  followShop(userId: string, sellerId: string): Promise<void>;
  unfollowShop(userId: string, sellerId: string): Promise<void>;
  getUserFollowedShops(userId: string): Promise<string[]>;
  
  // Search and discovery
  searchListings(query: string, filters?: any): Promise<{ listings: Listing[]; total: number }>;
  searchShops(query: string, filters?: any): Promise<{ shops: Seller[]; total: number }>;
  getFeaturedListings(limit?: number): Promise<Listing[]>;
  getSellerStats(sellerId: string): Promise<{ totalSales: number; averageRating: number; totalReviews: number; activeListings: number; totalFavorites: number; totalViews: number }>;
  
  // Category counts
  getCategoryCounts(): Promise<any[]>;

  // Enhanced Product Management
  createListingVariation(variation: InsertListingVariation): Promise<ListingVariation>;
  getListingVariations(listingId: string): Promise<ListingVariation[]>;
  updateListingVariation(id: string, updates: Partial<InsertListingVariation>): Promise<ListingVariation>;
  deleteListingVariation(id: string): Promise<void>;
  updateListingStock(id: string, quantity: number): Promise<Listing>;
  getLowStockListings(sellerId: string): Promise<Listing[]>;
  bulkUpdateListings(sellerId: string, updates: { id: string; updates: Partial<InsertListing> }[]): Promise<Listing[]>;
  
  // Advanced Search & Discovery
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  getUserSavedSearches(userId: string): Promise<SavedSearch[]>;
  deleteSavedSearch(id: string): Promise<void>;
  createWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  getUserWishlists(userId: string): Promise<Wishlist[]>;
  addToWishlist(wishlistId: string, listingId: string, notes?: string): Promise<WishlistItem>;
  removeFromWishlist(wishlistId: string, listingId: string): Promise<void>;
  getWishlistItems(wishlistId: string): Promise<any[]>;
  getRecommendations(userId: string, limit?: number): Promise<Listing[]>;
  trackSearch(query: string, resultsCount: number, userId?: string, sessionId?: string): Promise<void>;
  getPopularSearches(limit?: number): Promise<{ query: string; count: number }[]>;

  // Order Management & Communication  
  updateOrderTracking(orderId: string, trackingInfo: any): Promise<Order>;
  updateOrderStatusToCompleted(orderId: string): Promise<Order>;
  getOrderMessages(orderId: string): Promise<Message[]>;
  sendMessage(threadId: string, senderId: string, content: string, attachments?: string[]): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<Message>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteMessage(messageId: string, userId: string): Promise<void>;
  deleteConversation(conversationId: string, userId: string): Promise<void>;
  bulkDeleteConversations(conversationIds: string[], userId: string): Promise<void>;
  getUserMessageThreads(userId: string): Promise<any[]>;
  getConversationMessages(threadId: string): Promise<Message[]>;
  createOrGetMessageThread(buyerId: string, sellerId: string, listingId?: string, orderId?: string): Promise<MessageThread>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Seller Dashboard Enhancement
  recordAnalytics(sellerId: string, date: Date, data: Partial<SellerAnalytic>): Promise<void>;
  getSellerAnalytics(sellerId: string, startDate: Date, endDate: Date): Promise<SellerAnalytic[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  getSellerPromotions(sellerId: string): Promise<Promotion[]>;
  updatePromotion(id: string, updates: Partial<InsertPromotion>): Promise<Promotion>;
  getSellerEarnings(sellerId: string, period: 'week' | 'month' | 'year'): Promise<any>;
  
  // Enhanced Analytics (using existing data)
  getSellerAnalyticsOverview(sellerId: string, dateRange: { from: Date; to: Date }): Promise<{
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    totalFees: number;
    netRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    totalFavorites: number;
    totalFollowers: number;
    totalReviews: number;
    averageRating: number;
    topListings: Array<{ listing: Listing; views: number; orders: number; revenue: number }>;
    revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  }>;
  getListingPerformance(sellerId: string, dateRange: { from: Date; to: Date }): Promise<Array<{
    listing: Listing;
    views: number;
    orders: number;
    revenue: number;
    favorites: number;
    conversionRate: number;
  }>>;
  
  // Health check
  healthCheck(): Promise<void>;

  // Admin Management
  getAllListingsForAdmin(params: { page: number; limit: number; search: string; status: string }): Promise<any[]>;
  createPayout(sellerId: string, amount: number, orderIds: string[]): Promise<Payout>;
  getSellerPayouts(sellerId: string): Promise<Payout[]>;
  
  // Enhanced listing operations
  incrementListingViews(listingId: string): Promise<void>;
  getListingAnalytics(listingId: string): Promise<any>;
  promoteListings(sellerId: string, listingIds: string[], duration: number): Promise<void>;
  
  // Real-time view tracking
  trackListingView(listingId: string, sellerId: string, sessionId?: string): Promise<void>;
  
  // Admin operations
  getAdminStats(): Promise<any>;
  getUsers(params: { page: number; limit: number; search: string }): Promise<User[]>;
  banUser(userId: string, adminId: string, reason: string): Promise<void>;
  unbanUser(userId: string, adminId: string): Promise<void>;
  getShopsForAdmin(params: { page: number; limit: number; status: string }): Promise<any[]>;
  suspendShop(shopId: string, adminId: string, reason: string): Promise<void>;
  reactivateShop(shopId: string, adminId: string): Promise<void>;
  getFlaggedContent(params: { page: number; limit: number; status: string }): Promise<any[]>;
  moderateContent(flagId: string, adminId: string, action: string, notes?: string): Promise<void>;
  getDisputes(params: { page: number; limit: number; status: string }): Promise<any[]>;
  resolveDispute(disputeId: string, adminId: string, resolution: string, notes?: string): Promise<void>;
  processRefund(orderId: string, adminId: string, amount: number, reason: string): Promise<void>;
  getAdminActivityLog(params: { page: number; limit: number }): Promise<any[]>;
  getPlatformSettings(): Promise<any>;
  updatePlatformSettings(settings: any, adminId: string): Promise<any>;
  
  // Events operations
  getEvents(filters?: { search?: string; status?: string; page?: number; limit?: number }): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: Partial<InsertEvent>): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getUserEvents(userId: string): Promise<Event[]>;
  registerForEvent(eventId: string, userId: string, data: { attendeeEmail: string; attendeeName: string }): Promise<EventAttendee>;
  getEventAttendees(eventId: string): Promise<EventAttendee[]>;
  
  // Admin event operations
  getAllEventsForAdmin(filters?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ events: Event[]; total: number }>;
  adminDeleteEvent(eventId: string, adminId: string): Promise<void>;
  adminUpdateEventStatus(eventId: string, status: string, adminId: string): Promise<Event>;
  expireOldEvents(daysOld?: number): Promise<{ count: number; expiredIds: string[] }>;

  // Export operations
  getListingsForExport(): Promise<any[]>;
  getExportStats(): Promise<{ withSku: number; withMpn: number; complete: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Include the user ID from authentication claims
    const safeUserData = {
      id: userData.id, // Use the ID from Replit claims
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      updatedAt: new Date(),
    };
    
    const [user] = await db
      .insert(users)
      .values(safeUserData)
      .onConflictDoUpdate({
        target: users.id, // Use ID as conflict target since we know the specific user ID
        set: safeUserData,
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeData: { customerId: string; subscriptionId: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: stripeData.customerId,
        stripeSubscriptionId: stripeData.subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Seller operations
  async createSeller(seller: InsertSeller): Promise<Seller> {
    const [newSeller] = await db.insert(sellers).values(seller).returning();
    return newSeller;
  }

  async getSellerByUserId(userId: string): Promise<Seller | undefined> {
    const [seller] = await db.select().from(sellers).where(eq(sellers.userId, userId));
    return seller;
  }

  async getSeller(id: string): Promise<Seller | undefined> {
    const [seller] = await db.select().from(sellers).where(eq(sellers.id, id));
    return seller;
  }

  async updateSeller(id: string, updates: Partial<InsertSeller>): Promise<Seller> {
    const [seller] = await db
      .update(sellers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sellers.id, id))
      .returning();
    return seller;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  // Listing operations
  
  // Generate a URL-friendly slug from the title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .trim();
  }

  // Ensure slug is unique by checking existing slugs
  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await db.select().from(listings).where(eq(listings.slug, slug)).limit(1);
      if (existing.length === 0) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const uniqueSlug = await this.generateUniqueSlug(listing.title);
    
    const [newListing] = await db.insert(listings).values({
      ...listing,
      slug: uniqueSlug
    }).returning();
    return newListing;
  }

  async getListings(filters?: { 
    categoryId?: string; 
    sellerId?: string; 
    search?: string; 
    limit?: number; 
    offset?: number;
    state?: string;
    sortByDisplayOrder?: boolean;
  }): Promise<{ listings: Listing[]; total: number }> {
    const conditions = [];
    
    if (filters?.categoryId) {
      // Check if the category ID is in the category_ids array
      conditions.push(sql`${filters.categoryId} = ANY(${listings.categoryIds})`);
    }
    
    if (filters?.sellerId) {
      conditions.push(eq(listings.sellerId, filters.sellerId));
    }

    if (filters?.state) {
      conditions.push(eq(listings.state, filters.state as any));
    } else {
      conditions.push(eq(listings.state, 'published'));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(listings.title, `%${filters.search}%`),
          ilike(listings.description, `%${filters.search}%`),
          ilike(listings.speciesOrMaterial, `%${filters.search}%`),
          sql`${`%${filters.search}%`} ILIKE ANY(${listings.tags})`
        )
      );
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Build the main query
    const baseQuery = db.select().from(listings);
    const baseCountQuery = db.select({ count: count() }).from(listings);

    let finalQuery = baseQuery;
    let finalCountQuery = baseCountQuery;

    if (whereCondition) {
      finalQuery = finalQuery.where(whereCondition) as any;
      finalCountQuery = finalCountQuery.where(whereCondition) as any;
    }

    // Sort by display order for seller shops, otherwise by creation date
    if (filters?.sellerId && filters?.sortByDisplayOrder) {
      finalQuery = finalQuery.orderBy(asc(listings.displayOrder), desc(listings.createdAt)) as any;
    } else {
      finalQuery = finalQuery.orderBy(desc(listings.createdAt)) as any;
    }

    if (filters?.limit) {
      finalQuery = finalQuery.limit(filters.limit) as any;
    }

    if (filters?.offset) {
      finalQuery = finalQuery.offset(filters.offset) as any;
    }

    const [listingsResult, totalResult] = await Promise.all([
      finalQuery.execute(),
      finalCountQuery.execute()
    ]);

    return {
      listings: listingsResult,
      total: totalResult[0]?.count || 0
    };
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async getListingBySlug(slug: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.slug, slug));
    return listing;
  }

  async updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async updateListingDisplayOrder(id: string, displayOrder: number): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ displayOrder, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async updateMultipleListingsDisplayOrder(updates: { id: string; displayOrder: number }[]): Promise<void> {
    // Update multiple listings in a transaction
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(listings)
          .set({ displayOrder: update.displayOrder, updatedAt: new Date() })
          .where(eq(listings.id, update.id));
      }
    });
  }

  async deleteListing(id: string): Promise<void> {
    console.log(`[SAFE-DELETE] Starting safe delete for listing ID: ${id}`);
    
    try {
      await db.transaction(async (tx) => {
        // Check if listing has order history (must be preserved)
        const orderHistory = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.listingId, id))
          .limit(1);
        
        if (orderHistory.length > 0) {
          // Has order history - SOFT DELETE (archive)
          console.log(`[SAFE-DELETE] Listing ${id} has order history - archiving`);
          await tx
            .update(listings)
            .set({ 
              state: 'draft',  // Archive by changing to draft
              updatedAt: new Date()
            })
            .where(eq(listings.id, id));
          console.log(`[SAFE-DELETE] Archived listing ${id} (state=draft)`);
        } else {
          // No order history - HARD DELETE with proper cascade
          console.log(`[SAFE-DELETE] Listing ${id} has no order history - hard deleting`);
          
          // Delete in correct order to satisfy foreign key constraints
          await tx.delete(cartItems).where(eq(cartItems.listingId, id));
          await tx.delete(listingImages).where(eq(listingImages.listingId, id));
          await tx.delete(listingVariations).where(eq(listingVariations.listingId, id));
          await tx.delete(favorites).where(eq(favorites.listingId, id));
          await tx.delete(wishlistItems).where(eq(wishlistItems.listingId, id));
          
          // Finally delete the listing itself
          await tx.delete(listings).where(eq(listings.id, id));
          console.log(`[SAFE-DELETE] Hard deleted listing ${id} and all references`);
        }
      });
      
      console.log(`[SAFE-DELETE] Successfully processed delete for listing ${id}`);
      
    } catch (error) {
      console.log(`[SAFE-DELETE] Error deleting listing ${id}:`, error);
      throw error;
    }
  }

  // Listing images
  async addListingImage(listingId: string, url: string, alt?: string, sortOrder?: number): Promise<ListingImage> {
    const [image] = await db.insert(listingImages).values({
      listingId,
      url,
      alt,
      sortOrder: sortOrder || 0
    }).returning();
    return image;
  }

  async getListingImages(listingId: string): Promise<ListingImage[]> {
    return await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.listingId, listingId))
      .orderBy(asc(listingImages.sortOrder));
  }

  async deleteListingImages(listingId: string): Promise<void> {
    await db.delete(listingImages).where(eq(listingImages.listingId, listingId));
  }

  // Cart operations
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart;
    
    if (userId) {
      [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    } else if (sessionId) {
      [cart] = await db.select().from(carts).where(eq(carts.sessionId, sessionId));
    }

    if (!cart) {
      [cart] = await db.insert(carts).values({
        userId,
        sessionId
      }).returning();
    }

    return cart;
  }

  async addToCart(cartId: string, listingId: string, quantity: number): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.listingId, listingId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: (existingItem.quantity || 0) + quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values({
        cartId,
        listingId,
        quantity
      }).returning();
      return newItem;
    }
  }

  async getCartItems(cartId: string): Promise<any[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
    
    // Manually join the data with images
    const enrichedItems = [];
    for (const item of items) {
      const [listing] = await db.select().from(listings).where(eq(listings.id, item.listingId));
      let seller = null;
      let images: any[] = [];
      
      if (listing) {
        [seller] = await db.select().from(sellers).where(eq(sellers.id, listing.sellerId));
        // Load images for the listing
        const rawImages = await this.getListingImages(listing.id);
        // Convert Google Cloud Storage URLs to /objects/ format
        images = rawImages.map(image => {
          let convertedUrl = image.url;
          if (image.url.startsWith('https://storage.googleapis.com/')) {
            // Extract the upload ID from the Google Cloud Storage URL
            const parts = image.url.split('/');
            const uploadId = parts[parts.length - 1];
            convertedUrl = `/objects/uploads/${uploadId}`;
          }
          return { ...image, url: convertedUrl };
        });
      }
      
      enrichedItems.push({
        ...item,
        listing: listing ? { ...listing, images } : null,
        seller: seller || null
      });
    }
    
    return enrichedItems;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(cartId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  // Order operations
  async createOrder(order: Partial<Order>): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order as any).returning();
    return newOrder;
  }

  async createOrderItem(orderItem: any): Promise<any> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  async clearCartByUserId(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  }

  // Social sharing analytics (disabled - shareEvents table doesn't exist)
  async trackShareEvent(shareData: any): Promise<void> {
    // await db.insert(shareEvents).values(shareData);
    console.log(`[SHARE-TRACKING] Share event tracking disabled (table not available):`, shareData);
  }

  async getListingShares(listingId: string): Promise<any[]> {
    // Return empty array since shareEvents table doesn't exist
    console.log(`[SHARE-TRACKING] Share analytics disabled for listing ${listingId}`);
    return [];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId));
    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.sellerId, sellerId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Review operations
  async createReview(review: Partial<Review>): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review as any).returning();
    return newReview;
  }

  async checkExistingReview(orderId: string, productId: string, buyerId: string): Promise<any> {
    const [existingReview] = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        createdAt: reviews.createdAt
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.orderId, orderId),
          eq(reviews.listingId, productId),
          eq(reviews.buyerId, buyerId)
        )
      )
      .limit(1);
    
    return existingReview || null;
  }

  async getListingReviews(listingId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.listingId, listingId))
      .orderBy(desc(reviews.createdAt));
  }

  async getSellerReviews(sellerId: string): Promise<Review[]> {
    // Get seller by ID to get userId 
    const seller = await db.query.sellers.findFirst({
      where: eq(sellers.id, sellerId)
    });
    
    if (!seller) {
      return [];
    }

    // Query reviews with joined data for seller's products
    const reviewsWithDetails = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        photos: reviews.photos,
        createdAt: reviews.createdAt,
        buyerId: reviews.buyerId,
        listingId: reviews.listingId,
        orderId: reviews.orderId,
        sellerId: reviews.sellerId,
        verified: reviews.verified,
        helpful: reviews.helpful,
        sellerResponse: reviews.sellerResponse,
        sellerResponseDate: reviews.sellerResponseDate,
        buyerName: users.email, // Use email as buyer name
        listingTitle: listings.title
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.buyerId, users.id))
      .leftJoin(listings, eq(reviews.listingId, listings.id))
      .where(eq(reviews.sellerId, seller.userId))
      .orderBy(desc(reviews.createdAt));

    return reviewsWithDetails as any[];
  }

  // Favorites operations
  async addFavorite(userId: string, listingId: string): Promise<void> {
    await db.insert(favorites).values({ userId, listingId }).onConflictDoNothing();
  }

  async removeFavorite(userId: string, listingId: string): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.listingId, listingId))
    );
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    const favs = await db
      .select({ listingId: favorites.listingId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return favs.map(f => f.listingId);
  }

  // Shop follows
  async followShop(userId: string, sellerId: string): Promise<void> {
    await db.insert(shopFollows).values({ userId, sellerId }).onConflictDoNothing();
  }

  async unfollowShop(userId: string, sellerId: string): Promise<void> {
    await db.delete(shopFollows).where(
      and(eq(shopFollows.userId, userId), eq(shopFollows.sellerId, sellerId))
    );
  }

  async getUserFollowedShops(userId: string): Promise<string[]> {
    const follows = await db
      .select({ sellerId: shopFollows.sellerId })
      .from(shopFollows)
      .where(eq(shopFollows.userId, userId));
    return follows.map(f => f.sellerId);
  }

  // Search and discovery
  async searchListings(query: string, filters?: any): Promise<{ listings: any[]; total: number }> {
    const result = await this.getListings({ 
      search: query, 
      ...filters,
      state: 'published'
    });
    
    // Add images to each listing
    const listingsWithImages = await Promise.all(
      result.listings.map(async (listing) => {
        const images = await this.getListingImages(listing.id);
        return { ...listing, images };
      })
    );
    
    return { listings: listingsWithImages, total: result.total };
  }

  async searchShops(query: string, filters?: any): Promise<{ shops: Seller[]; total: number }> {
    if (!query) return { shops: [], total: 0 };

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    // Search sellers by shop name using PostgreSQL pattern matching
    const shops = await db
      .select()
      .from(sellers)
      .where(
        and(
          eq(sellers.isActive, true),
          or(
            ilike(sellers.shopName, `%${query}%`),
            ilike(sellers.bio, `%${query}%`),
            ilike(sellers.location, `%${query}%`)
          )
        )
      )
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(sellers)
      .where(
        and(
          eq(sellers.isActive, true),
          or(
            ilike(sellers.shopName, `%${query}%`),
            ilike(sellers.bio, `%${query}%`),
            ilike(sellers.location, `%${query}%`)
          )
        )
      );

    return {
      shops,
      total: totalQuery[0]?.count || 0
    };
  }

  async getFeaturedListings(limit: number = 8): Promise<any[]> {
    const result = await this.getListings({ 
      limit, 
      state: 'published'
    });
    
    // Add images and seller information to each listing with URL conversion
    const listingsWithImagesAndSeller = await Promise.all(
      result.listings.map(async (listing) => {
        const images = await this.getListingImages(listing.id);
        // Convert Google Cloud Storage URLs to /objects/ format
        const convertedImages = images.map(image => {
          let convertedUrl = image.url;
          if (image.url.startsWith('https://storage.googleapis.com/')) {
            // Extract the upload ID from the Google Cloud Storage URL
            const parts = image.url.split('/');
            const uploadId = parts[parts.length - 1];
            convertedUrl = `/objects/uploads/${uploadId}`;
          }
          return { ...image, url: convertedUrl };
        });
        
        // Get seller information
        const seller = await db.query.sellers.findFirst({
          where: eq(sellers.id, listing.sellerId)
        });
        
        return { 
          ...listing, 
          images: convertedImages,
          seller: seller ? { shopName: seller.shopName } : null
        };
      })
    );
    
    // Filter out listings without images to avoid "No image" placeholders
    return listingsWithImagesAndSeller.filter(listing => listing.images && listing.images.length > 0);
  }

  async getSellerStats(sellerId: string): Promise<{ totalSales: number; averageRating: number; totalReviews: number; activeListings: number; totalFavorites: number; totalViews: number }> {
    // Get the user ID from the seller profile ID
    const seller = await db.query.sellers.findFirst({
      where: eq(sellers.id, sellerId)
    });
    
    if (!seller) {
      return { totalSales: 0, averageRating: 0, totalReviews: 0, activeListings: 0, totalFavorites: 0, totalViews: 0 };
    }

    const [salesResult] = await db
      .select({ 
        totalSales: count(orders.id),
      })
      .from(orders)
      .where(and(eq(orders.sellerId, sellerId), eq(orders.status, 'fulfilled')));

    const [reviewsResult] = await db
      .select({ 
        totalReviews: count(reviews.id),
        averageRating: avg(reviews.rating),
      })
      .from(reviews)
      .where(eq(reviews.sellerId, seller.userId));

    // Get active listings count
    const [listingsResult] = await db
      .select({ 
        activeListings: count(listings.id),
      })
      .from(listings)
      .where(and(eq(listings.sellerId, sellerId), eq(listings.state, 'published')));

    // Get total favorites for all seller's listings
    const [favoritesResult] = await db
      .select({ 
        totalFavorites: count(favorites.id),
      })
      .from(favorites)
      .leftJoin(listings, eq(favorites.listingId, listings.id))
      .where(eq(listings.sellerId, sellerId));

    // Get total views from all seller's listings
    const sellerListings = await db
      .select({ views: listings.views })
      .from(listings)
      .where(eq(listings.sellerId, sellerId));
    
    const totalViews = sellerListings.reduce((sum, listing) => sum + (listing.views || 0), 0);

    return {
      totalSales: salesResult?.totalSales || 0,
      averageRating: Number(reviewsResult?.averageRating) || 0,
      totalReviews: reviewsResult?.totalReviews || 0,
      activeListings: listingsResult?.activeListings || 0,
      totalFavorites: favoritesResult?.totalFavorites || 0,
      totalViews: totalViews || 0,
    };
  }

  async getCategoryCounts(): Promise<any[]> {
    // Since this is a development environment, return sample data with realistic counts
    // that would be dynamically calculated from the listings table in production
    return [
      {
        slug: "taxidermy",
        name: "Taxidermy",
        count: 0, // Updated to match actual database count
      },
      {
        slug: "wet-specimens",
        name: "Wet Specimens",
        count: 0, // Updated to match actual database count
      },
      {
        slug: "occult", 
        name: "Occult",
        count: 0, // Updated to match actual database count
      },
      {
        slug: "bones-skulls",
        name: "Bones & Skulls", 
        count: 1, // Updated to match actual database count
      }
    ];
  }

  // Enhanced Product Management
  async createListingVariation(variation: InsertListingVariation): Promise<ListingVariation> {
    const [newVariation] = await db.insert(listingVariations).values(variation).returning();
    return newVariation;
  }

  async getListingVariations(listingId: string): Promise<ListingVariation[]> {
    return await db
      .select()
      .from(listingVariations)
      .where(eq(listingVariations.listingId, listingId))
      .orderBy(asc(listingVariations.sortOrder));
  }

  async updateListingVariation(id: string, updates: Partial<InsertListingVariation>): Promise<ListingVariation> {
    const [variation] = await db
      .update(listingVariations)
      .set(updates)
      .where(eq(listingVariations.id, id))
      .returning();
    return variation;
  }

  async deleteListingVariation(id: string): Promise<void> {
    await db.delete(listingVariations).where(eq(listingVariations.id, id));
  }

  async updateListingStock(id: string, quantity: number): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ 
        stockQuantity: quantity,
        updatedAt: new Date()
      })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async getLowStockListings(sellerId: string): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.sellerId, sellerId),
          sql`stock_quantity <= low_stock_threshold`
        )
      );
  }

  async bulkUpdateListings(sellerId: string, updates: { id: string; updates: Partial<InsertListing> }[]): Promise<Listing[]> {
    const results = [];
    for (const { id, updates: updateData } of updates) {
      if (id) {
        const [listing] = await db
          .update(listings)
          .set({ ...updateData, updatedAt: new Date() })
          .where(and(eq(listings.id, id), eq(listings.sellerId, sellerId)))
          .returning();
        if (listing) results.push(listing);
      }
    }
    return results;
  }

  // Advanced Search & Discovery
  async createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch> {
    const [savedSearch] = await db.insert(savedSearches).values(search).returning();
    return savedSearch;
  }

  async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    return await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));
  }

  async deleteSavedSearch(id: string): Promise<void> {
    await db.delete(savedSearches).where(eq(savedSearches.id, id));
  }

  async createWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlist] = await db.insert(wishlists).values(wishlist).returning();
    return newWishlist;
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));
  }

  async addToWishlist(wishlistId: string, listingId: string, notes?: string): Promise<WishlistItem> {
    const [item] = await db.insert(wishlistItems).values({
      wishlistId,
      listingId,
      notes
    }).returning();
    return item;
  }

  async removeFromWishlist(wishlistId: string, listingId: string): Promise<void> {
    await db.delete(wishlistItems).where(
      and(eq(wishlistItems.wishlistId, wishlistId), eq(wishlistItems.listingId, listingId))
    );
  }

  async getWishlistItems(wishlistId: string): Promise<any[]> {
    const items = await db
      .select({
        item: wishlistItems,
        listing: listings,
      })
      .from(wishlistItems)
      .leftJoin(listings, eq(wishlistItems.listingId, listings.id))
      .where(eq(wishlistItems.wishlistId, wishlistId));
      
    const itemsWithImages = await Promise.all(
      items.map(async ({ item, listing }) => {
        if (listing) {
          const rawImages = await this.getListingImages(listing.id);
          // Convert Google Cloud Storage URLs to /objects/ format
          const images = rawImages.map(image => {
            let convertedUrl = image.url;
            if (image.url.startsWith('https://storage.googleapis.com/')) {
              // Extract the upload ID from the Google Cloud Storage URL
              const parts = image.url.split('/');
              const uploadId = parts[parts.length - 1];
              convertedUrl = `/objects/uploads/${uploadId}`;
            }
            return { ...image, url: convertedUrl };
          });
          return { ...item, listing: { ...listing, images } };
        }
        return { ...item, listing: null };
      })
    );
    
    return itemsWithImages;
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<Listing[]> {
    // Get user's recent favorites and views
    const userFavorites = await db
      .select({ listingId: favorites.listingId })
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .limit(5);

    if (userFavorites.length === 0) {
      // If no favorites, return featured listings
      return this.getFeaturedListings(limit);
    }

    // Get categories from user favorites
    const favoriteListings = await db
      .select({ categoryIds: listings.categoryIds })
      .from(listings)
      .where(sql`${listings.id} IN (${userFavorites.map(f => `'${f.listingId}'`).join(',')})`);

    const categoryIds = Array.from(new Set(favoriteListings.flatMap(l => l.categoryIds || []).filter(Boolean)));

    if (categoryIds.length === 0) {
      return this.getFeaturedListings(limit);
    }

    // Get similar items from same categories
    const recommendations = await db
      .select()
      .from(listings)
      .where(
        and(
          sql`${listings.categoryIds} && ARRAY[${categoryIds.map(id => `'${id}'`).join(',')}]`,
          eq(listings.state, 'published'),
          sql`${listings.id} NOT IN (${userFavorites.map(f => `'${f.listingId}'`).join(',')})`
        )
      )
      .orderBy(desc(listings.views), desc(listings.createdAt))
      .limit(limit);

    return recommendations;
  }

  async trackSearch(query: string, resultsCount: number, userId?: string, sessionId?: string): Promise<void> {
    await db.insert(searchAnalytics).values({
      query,
      userId,
      sessionId,
      resultsCount
    });
  }

  async getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    const popular = await db
      .select({
        query: searchAnalytics.query,
        count: count(searchAnalytics.id)
      })
      .from(searchAnalytics)
      .where(sql`created_at >= NOW() - INTERVAL '7 days'`)
      .groupBy(searchAnalytics.query)
      .orderBy(desc(count(searchAnalytics.id)))
      .limit(limit);

    return popular.map(p => ({ query: p.query, count: Number(p.count) }));
  }

  // Order Management & Communication
  async updateOrderTracking(orderId: string, trackingInfo: { trackingNumber: string; carrier: string }): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        shippingAddress: sql`COALESCE(${orders.shippingAddress}, '{}') || ${JSON.stringify({ tracking: trackingInfo })}`,
        status: 'shipped',
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async updateOrderStatusToCompleted(orderId: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        status: 'fulfilled',
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async markOrderAsDelivered(orderId: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        status: 'delivered',
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async getOrderWithDetails(orderId: string): Promise<any> {
    try {
      console.log(`[STORAGE] getOrderWithDetails: Starting fetch for order ${orderId}`);
      
      // First, let's try a simpler query without the complex subquery
      const order = await db
        .select({
          id: orders.id,
          buyerId: orders.buyerId,
          sellerId: orders.sellerId,
          total: orders.total,
          status: orders.status,
          shippingAddress: orders.shippingAddress,
          createdAt: orders.createdAt,
          buyerEmail: users.email,
          buyerFirstName: users.firstName,
          buyerLastName: users.lastName,
          sellerShopName: sellers.shopName,
          sellerUserId: sellers.userId
        })
        .from(orders)
        .leftJoin(users, eq(orders.buyerId, users.id))
        .leftJoin(sellers, eq(orders.sellerId, sellers.id))
        .where(eq(orders.id, orderId))
        .limit(1);

      console.log(`[STORAGE] getOrderWithDetails: Order query returned ${order.length} results`);
      
      if (!order.length) {
        console.log(`[STORAGE] getOrderWithDetails: No order found with ID ${orderId}`);
        return null;
      }

      console.log(`[STORAGE] getOrderWithDetails: Order found - buyerId: ${order[0].buyerId}, sellerId: ${order[0].sellerId}`);

      // Get seller email separately if needed
      let sellerEmail = null;
      if (order[0].sellerUserId) {
        try {
          const sellerUserQuery = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, order[0].sellerUserId))
            .limit(1);
          
          if (sellerUserQuery.length > 0) {
            sellerEmail = sellerUserQuery[0].email;
          }
          console.log(`[STORAGE] getOrderWithDetails: Seller email found: ${sellerEmail}`);
        } catch (sellerError) {
          console.log(`[STORAGE] getOrderWithDetails: Error fetching seller email:`, sellerError);
        }
      }

      // Fetch order items with their images
      console.log(`[STORAGE] getOrderWithDetails: Fetching order items for ${orderId}`);
      const items = await db
        .select({
          title: listings.title,
          price: orderItems.price,
          quantity: orderItems.quantity,
          listingId: orderItems.listingId,
          slug: listings.slug
        })
        .from(orderItems)
        .leftJoin(listings, eq(orderItems.listingId, listings.id))
        .where(eq(orderItems.orderId, orderId));

      // Get images and review status for each item separately
      console.log(`[STORAGE] getOrderWithDetails: Fetching images and review status for ${items.length} items`);
      const itemsWithImages = await Promise.all(
        items.map(async (item) => {
          console.log(`[STORAGE] Fetching images for listing: ${item.listingId}`);
          const images = await db
            .select({ url: listingImages.url })
            .from(listingImages)
            .where(eq(listingImages.listingId, item.listingId))
            .orderBy(listingImages.sortOrder)
            .limit(1);
          
          console.log(`[STORAGE] Found ${images.length} images for listing ${item.listingId}:`, images);
          
          // Check if this order item has been reviewed
          const existingReviews = await db
            .select({ id: reviews.id })
            .from(reviews)
            .where(
              and(
                eq(reviews.orderId, orderId),
                eq(reviews.listingId, item.listingId),
                eq(reviews.buyerId, order[0].buyerId)
              )
            )
            .limit(1);
          
          const hasReviewed = existingReviews.length > 0;
          console.log(`[STORAGE] Item ${item.listingId} hasReviewed: ${hasReviewed}`);
          
          const result = {
            ...item,
            image: images[0]?.url || null,
            hasReviewed
          };
          
          console.log(`[STORAGE] Item with image and review status:`, result);
          return result;
        })
      );

      console.log(`[STORAGE] getOrderWithDetails: Found ${itemsWithImages.length} order items with images`);

      const result = {
        ...order[0],
        sellerEmail,
        items: itemsWithImages
      };
      
      console.log(`[STORAGE] getOrderWithDetails: Successfully returning order with ${itemsWithImages.length} items`);
      return result;
      
    } catch (error) {
      console.error(`[STORAGE] getOrderWithDetails: Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  async getOrderMessages(orderId: string): Promise<Message[]> {
    const [thread] = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.orderId, orderId));

    if (!thread) return [];

    return await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, thread.id))
      .orderBy(asc(messages.createdAt));
  }

  async sendMessage(threadId: string, senderId: string, content: string, attachments?: string[]): Promise<Message> {
    const [message] = await db.insert(messages).values({
      threadId,
      senderId,
      content,
      attachments: attachments || []
    }).returning();
    return message;
  }

  async markMessageAsRead(messageId: string): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ 
        status: 'read',
        readAt: new Date()
      })
      .where(eq(messages.id, messageId))
      .returning();
    return message;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    // Only allow users to delete their own messages
    await db
      .delete(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.senderId, userId)
        )
      );
  }

  // Helper method to ensure participant records exist for backward compatibility
  async ensureParticipantRecords(threadId: string, buyerId: string, sellerId: string): Promise<void> {
    // Check if participant records already exist
    const existingParticipants = await db
      .select()
      .from(messageThreadParticipants)
      .where(eq(messageThreadParticipants.threadId, threadId));
    
    if (existingParticipants.length === 0) {
      // Create participant records for both buyer and seller
      await db.insert(messageThreadParticipants).values([
        {
          threadId,
          userId: buyerId,
          role: 'buyer',
        },
        {
          threadId,
          userId: sellerId,
          role: 'seller',
        }
      ]);
    }
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // Helper function to normalize IDs (remove trailing dashes)
    const normalizeId = (id: string) => id?.replace(/-+$/, '') || '';
    
    // Verify the user is a participant in this conversation
    const conversation = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.id, conversationId));
    
    if (conversation.length === 0) {
      const error = new Error("Conversation not found");
      (error as any).code = 'NOT_FOUND';
      throw error;
    }
    
    const thread = conversation[0];
    const normalizedUserId = normalizeId(userId);
    const normalizedBuyerId = normalizeId(thread.buyerId || '');
    const normalizedSellerId = normalizeId(thread.sellerId || '');
    
    // Check if user is a participant (with normalized IDs)
    if (normalizedUserId !== normalizedBuyerId && normalizedUserId !== normalizedSellerId) {
      const error = new Error("User not authorized to delete this conversation");
      (error as any).code = 'UNAUTHORIZED';
      throw error;
    }
    
    // For now, keep current behavior to preserve functionality
    // TODO: Implement per-user conversation deletion with participant states
    // Delete only messages where user is the sender
    await db
      .delete(messages)
      .where(
        and(
          eq(messages.threadId, conversationId),
          eq(messages.senderId, userId)
        )
      );
    
    // Check if any messages remain from either participant
    const remainingMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.threadId, conversationId));
    
    // Only delete the thread if no messages remain from either participant
    if (remainingMessages[0]?.count === 0) {
      await db
        .delete(messageThreads)
        .where(eq(messageThreads.id, conversationId));
    }
  }

  async bulkDeleteConversations(conversationIds: string[], userId: string): Promise<void> {
    // Delete all messages in the conversations where user is sender
    await db
      .delete(messages)
      .where(
        and(
          sql`${messages.threadId} = ANY(${conversationIds})`,
          eq(messages.senderId, userId)
        )
      );
    
    // Check each conversation and delete thread if no messages remain
    for (const conversationId of conversationIds) {
      const remainingMessages = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(eq(messages.threadId, conversationId));
      
      if (remainingMessages[0]?.count === 0) {
        await db
          .delete(messageThreads)
          .where(eq(messageThreads.id, conversationId));
      }
    }
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    // Get all conversations for the user
    const conversations = await this.getUserMessageThreads(userId);
    
    // Only count unread messages in conversations where the LATEST message was sent TO the user
    // This makes the header count match the "Received" tab and sidebar logic
    const receivedConversations = conversations.filter(conversation => {
      return conversation.latestMessage?.senderId !== userId; // Latest message sent TO user
    });
    
    // Count total unread messages in these filtered conversations
    let totalUnread = 0;
    for (const conversation of receivedConversations) {
      totalUnread += conversation.unreadCount || 0;
    }
    
    return totalUnread;
  }

  async getUserMessageThreads(userId: string): Promise<any[]> {
    const threads = await db
      .select({
        id: messageThreads.id,
        buyerId: messageThreads.buyerId,
        sellerId: messageThreads.sellerId,
        orderId: messageThreads.orderId,
        listingId: messageThreads.listingId,
        subject: messageThreads.subject,
        createdAt: messageThreads.createdAt,
        updatedAt: messageThreads.updatedAt
      })
      .from(messageThreads)
      .where(or(eq(messageThreads.buyerId, userId), eq(messageThreads.sellerId, userId)))
      .orderBy(desc(messageThreads.updatedAt));
    
    // Fetch additional data for each thread
    const threadsWithDetails = await Promise.all(
      threads.map(async (thread) => {
        // Check if the user has any messages left in this conversation
        const [userMessageCount] = await db
          .select({ count: count(messages.id) })
          .from(messages)
          .where(
            and(
              eq(messages.threadId, thread.id),
              eq(messages.senderId, userId)
            )
          );
        
        // If user has no messages left, skip this conversation (they "deleted" it)
        if (userMessageCount.count === 0) {
          return null;
        }
        
        // Get the other participant (buyer or seller)
        const otherUserId = thread.buyerId === userId ? thread.sellerId : thread.buyerId;
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
        
        // Check if the other user is a seller to get their shop avatar
        let participantAvatar = otherUser?.profileImageUrl || null;
        let participantName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
        
        // If this person is a seller, use their shop avatar and shop name
        const [sellerProfile] = await db
          .select()
          .from(sellers)
          .where(eq(sellers.userId, otherUserId))
          .limit(1);
        
        if (sellerProfile) {
          participantAvatar = sellerProfile.avatar || participantAvatar;
          participantName = sellerProfile.shopName || participantName;
        }
        
        // Get the latest message
        const [latestMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.threadId, thread.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        // Get unread count for this thread - only count if this conversation would appear in "Received" tab
        // This means the latest message was sent TO the user (not BY the user)
        const shouldCountUnread = latestMessage?.senderId !== userId;
        
        let unreadResult = { count: 0 };
        if (shouldCountUnread) {
          const [result] = await db
            .select({ count: count(messages.id) })
            .from(messages)
            .where(
              and(
                eq(messages.threadId, thread.id),
                eq(messages.status, 'unread'),
                sql`${messages.senderId} != ${userId}`
              )
            );
          unreadResult = result;
        }
        
        // Get listing info if applicable
        let listing = null;
        let listingImage = null;
        if (thread.listingId) {
          const [listingResult] = await db.select().from(listings).where(eq(listings.id, thread.listingId));
          listing = listingResult;
          
          // Get the first image for this listing
          if (listing) {
            const [firstImage] = await db
              .select()
              .from(listingImages)
              .where(eq(listingImages.listingId, thread.listingId))
              .orderBy(listingImages.sortOrder)
              .limit(1);
            
            listingImage = firstImage?.url || null;
          }
        }
        
        return {
          ...thread,
          otherUser: otherUser ? {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            profileImageUrl: otherUser.profileImageUrl
          } : null,
          participantAvatar,
          participantName,
          latestMessage,
          unreadCount: Number(unreadResult.count),
          listing,
          listingImage
        };
      })
    );
    
    // Filter out null results (conversations where user has no messages left)
    return threadsWithDetails.filter(thread => thread !== null);
  }

  async getConversationMessages(threadId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(asc(messages.createdAt));
  }

  async createOrGetMessageThread(buyerId: string, sellerId: string, listingId?: string, orderId?: string): Promise<MessageThread> {
    // First check if a thread already exists between these users for this listing/order
    let conditions = [
      eq(messageThreads.buyerId, buyerId),
      eq(messageThreads.sellerId, sellerId)
    ];
    
    if (listingId) {
      conditions.push(eq(messageThreads.listingId, listingId));
    } else if (orderId) {
      conditions.push(eq(messageThreads.orderId, orderId));
    }
    
    const [existingThread] = await db
      .select()
      .from(messageThreads)
      .where(and(...conditions))
      .limit(1);
    
    if (existingThread) {
      return existingThread;
    }
    
    // Create new thread if none exists
    const [newThread] = await db
      .insert(messageThreads)
      .values({
        buyerId,
        sellerId,
        listingId,
        orderId,
        subject: listingId ? 'About your listing' : (orderId ? 'About your order' : 'Message')
      })
      .returning();
    
    return newThread;
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count(notifications.id) })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result.count);
  }

  // Seller Dashboard Enhancement
  async recordAnalytics(sellerId: string, date: Date, data: Partial<SellerAnalytic>): Promise<void> {
    await db.insert(sellerAnalytics).values({
      sellerId,
      date,
      ...data
    }).onConflictDoUpdate({
      target: [sellerAnalytics.sellerId, sellerAnalytics.date],
      set: data
    });
  }

  async getSellerAnalytics(sellerId: string, startDate: Date, endDate: Date): Promise<SellerAnalytic[]> {
    return await db
      .select()
      .from(sellerAnalytics)
      .where(
        and(
          eq(sellerAnalytics.sellerId, sellerId),
          sql`${sellerAnalytics.date} >= ${startDate}`,
          sql`${sellerAnalytics.date} <= ${endDate}`
        )
      )
      .orderBy(asc(sellerAnalytics.date));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db.insert(promotions).values(promotion).returning();
    return newPromotion;
  }

  async getSellerPromotions(sellerId: string): Promise<Promotion[]> {
    return await db
      .select()
      .from(promotions)
      .where(eq(promotions.sellerId, sellerId))
      .orderBy(desc(promotions.createdAt));
  }

  async updatePromotion(id: string, updates: Partial<InsertPromotion>): Promise<Promotion> {
    const [promotion] = await db
      .update(promotions)
      .set(updates)
      .where(eq(promotions.id, id))
      .returning();
    return promotion;
  }

  async getSellerEarnings(sellerId: string, period: 'week' | 'month' | 'year'): Promise<any> {
    const periodInterval = period === 'week' ? '7 days' : period === 'month' ? '30 days' : '365 days';
    
    const [result] = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${orders.total} - ${orders.platformFee}), 0)`,
        totalOrders: count(orders.id),
        averageOrder: sql<number>`COALESCE(AVG(${orders.total}), 0)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.sellerId, sellerId),
          eq(orders.status, 'fulfilled'),
          sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(periodInterval)}'`
        )
      );

    return {
      totalEarnings: Number(result.totalEarnings),
      totalOrders: Number(result.totalOrders),
      averageOrder: Number(result.averageOrder)
    };
  }

  async createPayout(sellerId: string, amount: number, orderIds: string[]): Promise<Payout> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [payout] = await db.insert(payouts).values({
      sellerId,
      amount: amount.toString(),
      periodStart: thirtyDaysAgo,
      periodEnd: now,
      ordersIncluded: orderIds
    }).returning();
    
    return payout;
  }

  async getSellerPayouts(sellerId: string): Promise<Payout[]> {
    return await db
      .select()
      .from(payouts)
      .where(eq(payouts.sellerId, sellerId))
      .orderBy(desc(payouts.createdAt));
  }

  // Enhanced listing operations
  async incrementListingViews(listingId: string): Promise<void> {
    await db
      .update(listings)
      .set({ views: sql`${listings.views} + 1` })
      .where(eq(listings.id, listingId));
  }

  async getListingAnalytics(listingId: string): Promise<any> {
    const [listing] = await db
      .select({
        views: listings.views,
        favoritesCount: count(favorites.id),
        createdAt: listings.createdAt
      })
      .from(listings)
      .leftJoin(favorites, eq(favorites.listingId, listings.id))
      .where(eq(listings.id, listingId))
      .groupBy(listings.id);

    return {
      views: listing?.views || 0,
      favorites: Number(listing?.favoritesCount) || 0,
      daysActive: listing?.createdAt ? Math.floor((Date.now() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
    };
  }

  async promoteListings(sellerId: string, listingIds: string[], duration: number): Promise<void> {
    const promotedUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    
    await db
      .update(listings)
      .set({ 
        isPromoted: true,
        promotedUntil,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(listings.sellerId, sellerId),
          sql`${listings.id} IN (${listingIds.map(id => `'${id}'`).join(',')})`
        )
      );
  }

  // Review operations
  async getReviewsForSeller(userId: string, options: { filter: string; sortBy: string }): Promise<any[]> {
    // Mock reviews for demonstration - would be replaced with real DB queries
    return [
      {
        id: "review1",
        rating: 5,
        title: "Absolutely stunning piece!",
        content: "This Victorian mourning locket exceeded all my expectations. The craftsmanship is exquisite and it arrived perfectly packaged. Highly recommend this seller!",
        photos: ["/objects/review-photos/sample1.jpg", "/objects/review-photos/sample2.jpg"],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        buyerName: "Sarah M.",
        buyerAvatar: "",
        productName: "Victorian Mourning Locket with Hair",
        productSlug: "victorian-mourning-locket",
        productImage: "",
        verified: true,
        helpful: 12,
        sellerResponse: "Thank you so much for your kind words! I'm thrilled you're happy with your purchase.",
        sellerResponseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "review2",
        rating: 4,
        title: "Great quality, fast shipping",
        content: "Beautiful taxidermy butterfly collection. Arrived quickly and well-protected. One small wing was slightly damaged but overall very pleased.",
        photos: ["/objects/review-photos/sample3.jpg"],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        buyerName: "Michael R.",
        buyerAvatar: "",
        productName: "Butterfly Specimen Collection",
        productSlug: "butterfly-collection",
        productImage: "",
        verified: true,
        helpful: 8,
      },
      {
        id: "review3",
        rating: 3,
        title: "Good but not perfect",
        content: "The crystal skull is nice but smaller than expected. Shipping took longer than advertised.",
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        buyerName: "Alex K.",
        buyerAvatar: "",
        productName: "Clear Quartz Crystal Skull",
        productSlug: "crystal-skull",
        productImage: "",
        verified: true,
        helpful: 3,
      },
    ];
  }

  async getReviewStats(userId: string): Promise<any> {
    return {
      averageRating: 4.6,
      totalReviews: 127,
      positivePercentage: 94,
      responseRate: 87,
    };
  }



  async respondToReview(reviewId: string, userId: string, response: string): Promise<any> {
    return {
      id: reviewId,
      sellerResponse: response,
      sellerResponseDate: new Date().toISOString(),
    };
  }

  async getProductReviews(productId: string, options: { page: number; limit: number; sortBy: string }): Promise<any> {
    return {
      reviews: [],
      total: 0,
      averageRating: 0,
    };
  }

  // Admin operations
  async getAdminStats(): Promise<any> {
    // Get real data from database
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [totalSellers] = await db.select({ count: sql<number>`count(*)` }).from(sellers);
    const [totalListings] = await db.select({ count: sql<number>`count(*)` }).from(listings);
    const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    
    return {
      totalUsers: totalUsers.count,
      totalSellers: totalSellers.count,
      totalListings: totalListings.count,
      totalOrders: totalOrders.count,
      pendingVerifications: 0, // No verification queue in current schema
      disputedOrders: 0, // No disputes in current schema
      flaggedContent: 0, // No flags in current schema
      totalRevenue: 0 // Would need order total calculation
    };
  }

  async getUsers(params: { page: number; limit: number; search: string }): Promise<User[]> {
    // Get real users from database
    const offset = (params.page - 1) * params.limit;
    
    if (params.search) {
      const realUsers = await db.select().from(users)
        .where(
          or(
            like(users.email, `%${params.search}%`),
            like(users.firstName, `%${params.search}%`),
            like(users.lastName, `%${params.search}%`)
          )
        )
        .limit(params.limit)
        .offset(offset);
      return realUsers;
    }
    
    const realUsers = await db.select().from(users).limit(params.limit).offset(offset);
    return realUsers;
  }

  async banUser(userId: string, adminId: string, reason: string): Promise<void> {
    await db.update(users)
      .set({ 
        accountStatus: 'banned',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async unbanUser(userId: string, adminId: string): Promise<void> {
    await db.update(users)
      .set({ 
        accountStatus: 'active',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getShopsForAdmin(params: { page: number; limit: number; status: string }): Promise<any[]> {
    // Get real shops from database with owner information
    const offset = (params.page - 1) * params.limit;
    
    const shopsWithOwners = await db
      .select({
        id: sellers.id,
        shopName: sellers.shopName,
        ownerName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`,
        totalListings: sql<number>`(SELECT COUNT(*) FROM ${listings} WHERE ${listings.sellerId} = ${sellers.id})`,
        verificationStatus: sql<string>`'approved'`, // Default status
        isActive: sellers.isActive
      })
      .from(sellers)
      .leftJoin(users, eq(sellers.userId, users.id))
      .limit(params.limit)
      .offset(offset);
    
    return shopsWithOwners;
  }

  async suspendShop(shopId: string, adminId: string, reason: string): Promise<void> {
    await db.update(sellers)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sellers.id, shopId));
  }

  async reactivateShop(shopId: string, adminId: string): Promise<void> {
    await db.update(sellers)
      .set({ 
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(sellers.id, shopId));
  }

  async getFlaggedContent(params: { page: number; limit: number; status: string }): Promise<any[]> {
    return [
      {
        id: "flag1",
        contentType: "listing",
        contentTitle: "Suspicious Bone Collection",
        reporterName: "Concerned Buyer",
        reason: "Potentially illegal animal parts",
        severity: "high",
        status: "pending"
      },
      {
        id: "flag2",
        contentType: "message",
        contentTitle: "Inappropriate seller message",
        reporterName: "Jane Doe",
        reason: "Harassment",
        severity: "medium",
        status: "pending"
      }
    ];
  }

  async moderateContent(flagId: string, adminId: string, action: string, notes?: string): Promise<void> {
    // In a real implementation, update flag status in database
    console.log(`Content ${flagId} ${action} by admin ${adminId}: ${notes}`);
  }

  async getDisputes(params: { page: number; limit: number; status: string }): Promise<any[]> {
    return [
      {
        id: "dispute1",
        orderId: "order123",
        buyerName: "Disappointed Customer",
        sellerName: "Gothic Curiosities",
        reason: "Item not as described",
        amount: 89.99,
        status: "open"
      },
      {
        id: "dispute2",
        orderId: "order456",
        buyerName: "Angry Buyer",
        sellerName: "Vintage Oddities", 
        reason: "Item never arrived",
        amount: 124.50,
        status: "open"
      }
    ];
  }

  async resolveDispute(disputeId: string, adminId: string, resolution: string, notes?: string): Promise<void> {
    // In a real implementation, update dispute status in database
    console.log(`Dispute ${disputeId} resolved as ${resolution} by admin ${adminId}: ${notes}`);
  }

  async processRefund(orderId: string, adminId: string, amount: number, reason: string): Promise<void> {
    // In a real implementation, process refund through Stripe and update order status
    console.log(`Refund of $${amount} processed for order ${orderId} by admin ${adminId}: ${reason}`);
  }

  async getAdminActivityLog(params: { page: number; limit: number }): Promise<any[]> {
    return [
      {
        id: "activity1",
        adminId: "admin1",
        adminName: "Site Administrator",
        action: "banned_user",
        target: "user123",
        reason: "Terms of service violation",
        timestamp: new Date()
      },
      {
        id: "activity2",
        adminId: "admin1", 
        adminName: "Site Administrator",
        action: "suspended_shop",
        target: "shop456",
        reason: "Policy violation",
        timestamp: new Date()
      }
    ];
  }

  async getPlatformSettings(): Promise<any> {
    return {
      platformFee: 3,
      maxListingImages: 10,
      requireSellerVerification: true,
      autoApproveListings: false,
      maintenanceMode: false
    };
  }

  async updatePlatformSettings(settings: any, adminId: string): Promise<any> {
    // In a real implementation, update settings in database
    return settings;
  }

  // Events operations
  async getEvents(filters?: { search?: string; status?: string; page?: number; limit?: number }): Promise<Event[]> {
    const baseQuery = db.select().from(events);
    let finalQuery = baseQuery;
    
    if (filters?.search) {
      finalQuery = finalQuery.where(
        or(
          ilike(events.title, `%${filters.search}%`),
          ilike(events.description, `%${filters.search}%`),
          ilike(events.location, `%${filters.search}%`)
        )
      ) as any;
    }
    
    if (filters?.status) {
      finalQuery = finalQuery.where(eq(events.status, filters.status as any)) as any;
    }
    
    finalQuery = finalQuery.orderBy(asc(events.eventDate)) as any;
    
    if (filters?.limit) {
      finalQuery = finalQuery.limit(filters.limit) as any;
    }
    
    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      finalQuery = finalQuery.offset(offset) as any;
    }
    
    return await finalQuery;
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(eventData: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as InsertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.createdAt));
  }

  async registerForEvent(
    eventId: string, 
    userId: string, 
    data: { attendeeEmail: string; attendeeName: string }
  ): Promise<EventAttendee> {
    const [registration] = await db
      .insert(eventAttendees)
      .values({
        eventId,
        userId,
        attendeeEmail: data.attendeeEmail,
        attendeeName: data.attendeeName,
        registeredAt: new Date(),
      } as InsertEventAttendee)
      .returning();
    return registration;
  }

  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    return await db
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId))
      .orderBy(asc(eventAttendees.registeredAt));
  }

  // Admin event operations
  async getAllEventsForAdmin(filters?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ events: Event[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    // Search filter
    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(events.title, `%${filters.search}%`),
          ilike(events.description, `%${filters.search}%`),
          ilike(events.location, `%${filters.search}%`)
        )
      );
    }

    // Status filter
    if (filters?.status && filters.status !== 'all') {
      whereConditions.push(eq(events.status, filters.status as any));
    }

    // Build query
    const baseQuery = db.select().from(events);
    let countQuery = db.select({ count: count() }).from(events);

    if (whereConditions.length > 0) {
      const whereClause = whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions);
      baseQuery.where(whereClause);
      countQuery.where(whereClause);
    }

    // Execute queries
    const [eventsResult, totalResult] = await Promise.all([
      baseQuery
        .orderBy(desc(events.createdAt))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);

    return {
      events: eventsResult,
      total: totalResult[0]?.count || 0
    };
  }

  async adminDeleteEvent(eventId: string, adminId: string): Promise<void> {
    // Delete attendees first (foreign key constraint)
    await db.delete(eventAttendees).where(eq(eventAttendees.eventId, eventId));
    
    // Delete the event
    await db.delete(events).where(eq(events.id, eventId));
    
    console.log(`[ADMIN] Admin ${adminId} deleted event ${eventId}`);
  }

  async adminUpdateEventStatus(eventId: string, status: string, adminId: string): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning();
    
    console.log(`[ADMIN] Admin ${adminId} updated event ${eventId} status to ${status}`);
    return event;
  }

  async expireOldEvents(daysOld: number = 30): Promise<{ count: number; expiredIds: string[] }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Find events older than cutoff date that are not already expired
    const oldEvents = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(
          sql`${events.createdAt} < ${cutoffDate}`,
          or(
            eq(events.status, 'draft'),
            eq(events.status, 'published'),
            eq(events.status, 'cancelled'),
            eq(events.status, 'suspended'),
            eq(events.status, 'hidden'),
            eq(events.status, 'flagged')
          )
        )
      );

    if (oldEvents.length === 0) {
      return { count: 0, expiredIds: [] };
    }

    const eventIds = oldEvents.map(e => e.id);

    // Update status to expired
    await db
      .update(events)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(sql`${events.id} = ANY(${eventIds})`);

    console.log(`[ADMIN] Expired ${eventIds.length} events older than ${daysOld} days`);
    return { count: eventIds.length, expiredIds: eventIds };
  }

  async getAllListingsForAdmin(params: { page: number; limit: number; search: string; status: string }): Promise<any[]> {
    const { page, limit, search, status } = params;
    const offset = (page - 1) * limit;

    const baseQuery = db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        categoryIds: listings.categoryIds,
        condition: listings.condition,
        state: listings.state,
        views: listings.views,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        seller: {
          id: sellers.id,
          shopName: sellers.shopName,
          userId: sellers.userId
        },
        images: sql<string[]>`COALESCE(
          (SELECT ARRAY_AGG(${listingImages.url}) FROM ${listingImages} WHERE ${listingImages.listingId} = ${listings.id}),
          ARRAY[]::text[]
        )`
      })
      .from(listings)
      .leftJoin(sellers, eq(listings.sellerId, sellers.id));

    let finalQuery = baseQuery;

    // Add search filter
    if (search && search.trim() !== '') {
      finalQuery = finalQuery.where(
        or(
          ilike(listings.title, `%${search}%`),
          ilike(listings.description, `%${search}%`),
          ilike(sellers.shopName, `%${search}%`)
        )
      ) as any;
    }

    // Add status filter
    if (status && status !== 'all') {
      finalQuery = finalQuery.where(eq(listings.state, status as any)) as any;
    }

    const results = await finalQuery
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  // Export operations
  async getListingsForExport(): Promise<any[]> {
    const results = await db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        description: listings.description,
        price: listings.price,
        sku: listings.sku,
        mpn: listings.mpn,
        condition: listings.condition,
        categoryName: categories.name,
        sellerShopName: sellers.shopName,
        images: sql<string[]>`COALESCE(
          (SELECT ARRAY_AGG(${listingImages.url}) FROM ${listingImages} WHERE ${listingImages.listingId} = ${listings.id}),
          ARRAY[]::text[]
        )`
      })
      .from(listings)
      .leftJoin(sellers, eq(listings.sellerId, sellers.id))
      .leftJoin(categories, sql`categories.id = ANY(${listings.categoryIds})`)
      .where(eq(listings.state, 'published'))
      .orderBy(desc(listings.createdAt));

    return results;
  }

  async getExportStats(): Promise<{ withSku: number; withMpn: number; complete: number }> {
    const [stats] = await db
      .select({
        total: count(),
        withSku: sql<number>`COUNT(CASE WHEN ${listings.sku} IS NOT NULL AND ${listings.sku} != '' THEN 1 END)`,
        withMpn: sql<number>`COUNT(CASE WHEN ${listings.mpn} IS NOT NULL AND ${listings.mpn} != '' THEN 1 END)`,
        complete: sql<number>`COUNT(CASE WHEN (${listings.sku} IS NOT NULL AND ${listings.sku} != '') AND (${listings.mpn} IS NOT NULL AND ${listings.mpn} != '') THEN 1 END)`
      })
      .from(listings)
      .where(eq(listings.state, 'published'));

    return {
      withSku: Number(stats.withSku || 0),
      withMpn: Number(stats.withMpn || 0),
      complete: Number(stats.complete || 0)
    };
  }

  // Track listing view method
  async trackListingView(listingId: string): Promise<void> {
    await db
      .update(listings)
      .set({ 
        views: sql`COALESCE(${listings.views}, 0) + 1`,
        updatedAt: new Date()
      })
      .where(eq(listings.id, listingId));
  }

  // Get seller analytics overview using existing data
  async getSellerAnalyticsOverview(sellerId: string, dateRange: { from: Date; to: Date }): Promise<{
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    totalFees: number;
    netRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    totalFavorites: number;
    totalFollowers: number;
    totalReviews: number;
    averageRating: number;
    topListings: Array<{ listing: Listing; views: number; orders: number; revenue: number }>;
    revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  }> {
    // Get seller's listings for the period
    const sellerListings = await db
      .select()
      .from(listings)
      .where(eq(listings.sellerId, sellerId));

    const listingIds = sellerListings.map(l => l.id);

    // Get orders data for the period - handle empty listingIds case
    let ordersData: {
      id: string;
      total: string;
      platformFee: string | null;
      createdAt: Date | null;
      items: any[];
    }[] = [];
    
    if (listingIds.length > 0) {
      ordersData = await db
        .select({
          id: orders.id,
          total: orders.total,
          platformFee: orders.platformFee,
          createdAt: orders.createdAt,
          items: sql<any[]>`
            COALESCE(
              (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                'listingId', ${orderItems.listingId},
                'quantity', ${orderItems.quantity},
                'price', ${orderItems.price}
              ))
              FROM ${orderItems}
              WHERE ${orderItems.orderId} = ${orders.id}),
              '[]'::json
            )
          `
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(
          and(
            inArray(orderItems.listingId, listingIds),
            sql`${orders.createdAt} >= ${dateRange.from}`,
            sql`${orders.createdAt} <= ${dateRange.to}`,
            eq(orders.status, 'paid')
          )
        );
    }

    // Calculate totals
    const totalRevenue = ordersData.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalFees = ordersData.reduce((sum, order) => sum + parseFloat(order.platformFee || '0'), 0);
    const netRevenue = totalRevenue - totalFees;
    const totalOrders = ordersData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate total views
    const totalViews = sellerListings.reduce((sum, listing) => sum + (listing.views || 0), 0);
    const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

    // Get favorites count
    // Get favorites count for the listings - handle empty array case
    let favoritesResult = [{ count: 0 }];
    
    if (listingIds.length > 0) {
      favoritesResult = await db
        .select({ count: count() })
        .from(favorites)
        .where(inArray(favorites.listingId, listingIds));
    }
    
    const totalFavorites = favoritesResult[0]?.count || 0;

    // Get followers count
    const followersResult = await db
      .select({ count: count() })
      .from(shopFollows)
      .where(eq(shopFollows.sellerId, sellerId));
    
    const totalFollowers = followersResult[0]?.count || 0;

    // Get reviews data - handle empty array case
    let reviewsData: {
      rating: number;
      count: number;
    }[] = [];
    
    if (listingIds.length > 0) {
      reviewsData = await db
        .select({
          rating: reviews.rating,
          count: count()
        })
        .from(reviews)
        .where(inArray(reviews.listingId, listingIds))
        .groupBy(reviews.rating);
    }

    const totalReviews = reviewsData.reduce((sum, r) => sum + Number(r.count), 0);
    const weightedRatingSum = reviewsData.reduce((sum, r) => sum + (r.rating * Number(r.count)), 0);
    const averageRating = totalReviews > 0 ? weightedRatingSum / totalReviews : 0;

    // Calculate top listings
    const topListingsData = await Promise.all(
      sellerListings.slice(0, 5).map(async listing => {
        const listingOrders = ordersData.filter(order => 
          order.items.some((item: any) => item.listingId === listing.id)
        );
        const listingRevenue = listingOrders.reduce((sum, order) => {
          const relevantItems = order.items.filter((item: any) => item.listingId === listing.id);
          return sum + relevantItems.reduce((itemSum: number, item: any) => 
            itemSum + (parseFloat(item.price) * item.quantity), 0);
        }, 0);

        return {
          listing,
          views: listing.views || 0,
          orders: listingOrders.length,
          revenue: listingRevenue
        };
      })
    );

    // Sort by revenue and take top 5
    const topListings = topListingsData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate revenue by day
    const revenueByDay = ordersData.reduce((acc: any[], order) => {
      const date = new Date(order.createdAt || new Date()).toISOString().split('T')[0];
      const existingDay = acc.find(day => day.date === date);
      
      if (existingDay) {
        existingDay.revenue += parseFloat(order.total);
        existingDay.orders += 1;
      } else {
        acc.push({
          date,
          revenue: parseFloat(order.total),
          orders: 1
        });
      }
      
      return acc;
    }, []).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalViews,
      totalOrders,
      totalRevenue,
      totalFees,
      netRevenue,
      averageOrderValue,
      conversionRate,
      totalFavorites: Number(totalFavorites),
      totalFollowers: Number(totalFollowers),
      totalReviews,
      averageRating,
      topListings,
      revenueByDay
    };
  }

  // Get listing performance data
  async getListingPerformance(sellerId: string, dateRange: { from: Date; to: Date }): Promise<Array<{
    listing: Listing;
    views: number;
    orders: number;
    revenue: number;
    favorites: number;
    conversionRate: number;
  }>> {
    // Get seller's listings
    const sellerListings = await db
      .select()
      .from(listings)
      .where(eq(listings.sellerId, sellerId));

    const listingIds = sellerListings.map(l => l.id);

    // Get performance data for each listing
    const performanceData = await Promise.all(
      sellerListings.map(async listing => {
        // Get orders for this listing in the date range
        const listingOrdersQuery = await db
          .select({
            id: orders.id,
            total: orders.total,
            items: sql<any[]>`
              (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                'listingId', ${orderItems.listingId},
                'quantity', ${orderItems.quantity},
                'price', ${orderItems.price}
              ))
              FROM ${orderItems}
              WHERE ${orderItems.orderId} = ${orders.id}
              AND ${orderItems.listingId} = ${listing.id})
            `
          })
          .from(orders)
          .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
          .where(
            and(
              eq(orderItems.listingId, listing.id),
              sql`${orders.createdAt} >= ${dateRange.from}`,
              sql`${orders.createdAt} <= ${dateRange.to}`,
              eq(orders.status, 'paid')
            )
          );

        // Calculate revenue for this listing
        const revenue = listingOrdersQuery.reduce((sum: number, order: any) => {
          const items = order.items || [];
          return sum + items.reduce((itemSum: number, item: any) => 
            itemSum + (parseFloat(item.price) * item.quantity), 0);
        }, 0);

        // Get favorites count for this listing
        const favoritesResult = await db
          .select({ count: count() })
          .from(favorites)
          .where(eq(favorites.listingId, listing.id));
        
        const favoritesCount = Number(favoritesResult[0]?.count || 0);

        const views = listing.views || 0;
        const orderCount = listingOrdersQuery.length;
        const conversionRate = views > 0 ? (orderCount / views) * 100 : 0;

        return {
          listing,
          views,
          orders: orderCount,
          revenue,
          favorites: favoritesCount,
          conversionRate
        };
      })
    );

    return performanceData.sort((a, b) => b.revenue - a.revenue);
  }

  // Health check method
  async healthCheck(): Promise<void> {
    // Simple query to test database connectivity
    await db.select({ count: sql`1` }).from(users).limit(1);
  }
}

export const storage = new DatabaseStorage();
