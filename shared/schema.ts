import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['visitor', 'buyer', 'seller', 'admin']);

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'fulfilled', 'refunded', 'disputed']);

// Listing state enum
export const listingStateEnum = pgEnum('listing_state', ['draft', 'published', 'suspended']);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('buyer').notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Seller profiles
export const sellers = pgTable("sellers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  shopName: varchar("shop_name").notNull(),
  bio: text("bio"),
  banner: varchar("banner"),
  avatar: varchar("avatar"),
  location: varchar("location"),
  policies: text("policies"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  icon: varchar("icon"),
  parentId: varchar("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Listings
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  sku: varchar("sku"),
  provenance: text("provenance"),
  speciesOrMaterial: varchar("species_or_material"),
  categoryId: varchar("category_id").references(() => categories.id),
  state: listingStateEnum("state").default('draft'),
  tags: text("tags").array(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Listing images
export const listingImages = pgTable("listing_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  url: varchar("url").notNull(),
  alt: varchar("alt"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Carts
export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cartId: varchar("cart_id").references(() => carts.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default('pending'),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  title: varchar("title").notNull(), // Snapshot at time of purchase
});

// Message threads
export const messageThreads = pgTable("message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  orderId: varchar("order_id").references(() => orders.id),
  listingId: varchar("listing_id").references(() => listings.id),
  subject: varchar("subject"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").references(() => messageThreads.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  content: text("content"),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shop follows
export const shopFollows = pgTable("shop_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Flags for moderation
export const flags = pgTable("flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").references(() => users.id).notNull(),
  targetType: varchar("target_type").notNull(), // 'listing', 'user', 'review'
  targetId: varchar("target_id").notNull(),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status").default('pending'), // 'pending', 'resolved', 'dismissed'
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  seller: one(sellers, { fields: [users.id], references: [sellers.userId] }),
  orders: many(orders),
  favorites: many(favorites),
  shopFollows: many(shopFollows),
  messagesSent: many(messages, { relationName: "sender" }),
  reviews: many(reviews, { relationName: "buyer" }),
  flags: many(flags, { relationName: "reporter" }),
}));

export const sellersRelations = relations(sellers, ({ one, many }) => ({
  user: one(users, { fields: [sellers.userId], references: [users.id] }),
  listings: many(listings),
  orders: many(orders),
  followers: many(shopFollows),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories, { relationName: "parent" }),
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(sellers, { fields: [listings.sellerId], references: [sellers.id] }),
  category: one(categories, { fields: [listings.categoryId], references: [categories.id] }),
  images: many(listingImages),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  seller: one(sellers, { fields: [orders.sellerId], references: [sellers.id] }),
  items: many(orderItems),
  reviews: many(reviews),
  messageThreads: many(messageThreads),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSellerSchema = createInsertSchema(sellers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type Seller = typeof sellers.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type ListingImage = typeof listingImages.$inferSelect;
export type MessageThread = typeof messageThreads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Flag = typeof flags.$inferSelect;
