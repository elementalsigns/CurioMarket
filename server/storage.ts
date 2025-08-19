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
  messages,
  favorites,
  shopFollows,
  flags,
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
  type Message,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, or, sql, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
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
  getFeaturedListings(limit?: number): Promise<Listing[]>;
  getSellerStats(sellerId: string): Promise<{ totalSales: number; averageRating: number; totalReviews: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
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
  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async getListings(filters?: { 
    categoryId?: string; 
    sellerId?: string; 
    search?: string; 
    limit?: number; 
    offset?: number;
    state?: string;
  }): Promise<{ listings: Listing[]; total: number }> {
    let query = db.select().from(listings);
    let countQuery = db.select({ count: count() }).from(listings);

    const conditions = [];
    
    if (filters?.categoryId) {
      conditions.push(eq(listings.categoryId, filters.categoryId));
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
          ilike(listings.speciesOrMaterial, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    query = query.orderBy(desc(listings.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const [listingsResult, totalResult] = await Promise.all([
      query,
      countQuery
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

  async deleteListing(id: string): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
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
        .set({ quantity: existingItem.quantity + quantity })
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

  async getCartItems(cartId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
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

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
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

  async getListingReviews(listingId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.listingId, listingId))
      .orderBy(desc(reviews.createdAt));
  }

  async getSellerReviews(sellerId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.sellerId, sellerId))
      .orderBy(desc(reviews.createdAt));
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
  async searchListings(query: string, filters?: any): Promise<{ listings: Listing[]; total: number }> {
    return this.getListings({ 
      search: query, 
      ...filters,
      state: 'published'
    });
  }

  async getFeaturedListings(limit: number = 8): Promise<Listing[]> {
    const result = await this.getListings({ 
      limit, 
      state: 'published'
    });
    return result.listings;
  }

  async getSellerStats(sellerId: string): Promise<{ totalSales: number; averageRating: number; totalReviews: number }> {
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
      .where(eq(reviews.sellerId, sellerId));

    return {
      totalSales: salesResult?.totalSales || 0,
      averageRating: Number(reviewsResult?.averageRating) || 0,
      totalReviews: reviewsResult?.totalReviews || 0,
    };
  }
}

export const storage = new DatabaseStorage();
