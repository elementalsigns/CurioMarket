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
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped', 'delivered', 'fulfilled', 'refunded', 'disputed']);

// Listing state enum
export const listingStateEnum = pgEnum('listing_state', ['draft', 'published', 'suspended']);

// Listing condition enum
export const conditionEnum = pgEnum('condition', ['excellent', 'very-good', 'good', 'fair', 'poor']);

// Message status enum  
export const messageStatusEnum = pgEnum('message_status', ['unread', 'read']);

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', ['order', 'message', 'review', 'listing', 'system']);

// Payout status enum
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'processing', 'completed', 'failed']);

// Verification status enum
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected', 'expired']);

// Verification type enum
export const verificationTypeEnum = pgEnum('verification_type', ['email', 'phone', 'identity', 'address', 'business', 'tax_id']);

// Review status enum
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

// Event status enum
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'cancelled', 'suspended', 'hidden', 'flagged', 'expired']);

// Analytics event type enum
export const analyticsEventTypeEnum = pgEnum('analytics_event_type', [
  'view_listing',
  'view_shop', 
  'add_to_cart',
  'favorite_listing',
  'follow_shop',
  'message_sent',
  'order_paid',
  'review_posted',
  'share_click',
  'search_impression',
  'search_click'
]);

// Traffic source enum
export const trafficSourceEnum = pgEnum('traffic_source', [
  'direct',
  'search',
  'social',
  'referral',
  'email',
  'ads',
  'internal'
]);

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
  // Verification fields
  emailVerified: boolean("email_verified").default(false),
  phoneNumber: varchar("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  identityVerified: boolean("identity_verified").default(false),
  addressVerified: boolean("address_verified").default(false),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default('US'),
  dateOfBirth: timestamp("date_of_birth"),
  // Account status
  accountStatus: varchar("account_status").default('active'), // active, suspended, banned
  verificationLevel: integer("verification_level").default(0), // 0-5, higher = more verified
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Seller profiles
export const sellers = pgTable("sellers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  shopName: varchar("shop_name").notNull(),
  shopSlug: varchar("shop_slug").unique(), // Optional custom shop URL slug
  bio: text("bio"),
  announcement: text("announcement"), // Shop announcement for front page
  banner: varchar("banner"),
  avatar: varchar("avatar"),
  location: varchar("location"),
  policies: text("policies"),
  isActive: boolean("is_active").default(true),
  // Enhanced verification fields
  businessVerified: boolean("business_verified").default(false),
  taxIdVerified: boolean("tax_id_verified").default(false),
  businessName: varchar("business_name"),
  businessType: varchar("business_type"), // sole_proprietor, llc, corporation, etc
  taxId: varchar("tax_id"), // EIN or SSN (encrypted)
  businessLicense: varchar("business_license"),
  businessAddress: text("business_address"),
  businessPhone: varchar("business_phone"),
  businessEmail: varchar("business_email"),
  // Verification status
  verificationStatus: reviewStatusEnum("verification_status").default('pending'),
  verificationNotes: text("verification_notes"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"), // Admin who verified
  rejectionReason: text("rejection_reason"),
  // Risk assessment
  riskScore: integer("risk_score").default(0), // 0-100, higher = riskier
  flaggedReasons: text("flagged_reasons").array(),
  // Stripe Connect integration
  stripeConnectAccountId: varchar("stripe_connect_account_id"),
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



// Listings - Enhanced with inventory tracking and variations
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  stockQuantity: integer("stock_quantity").default(1), // Current inventory
  lowStockThreshold: integer("low_stock_threshold").default(1), // Auto alert threshold
  sku: varchar("sku"),
  mpn: varchar("mpn"),
  provenance: text("provenance"),
  speciesOrMaterial: varchar("species_or_material"),
  condition: conditionEnum("condition"),
  age: varchar("age"), // e.g., "Victorian Era", "Modern", "1920s"
  dimensions: varchar("dimensions"), // e.g., "12 x 8 x 6 inches"
  weight: decimal("weight", { precision: 6, scale: 2 }), // in lbs
  origin: varchar("origin"), // Geographic origin
  categoryIds: text("category_ids").array().default(sql`'{}'`),
  state: listingStateEnum("state").default('draft'),
  tags: text("tags").array(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default('0'),
  isPromoted: boolean("is_promoted").default(false), // Featured/promoted listing
  promotedUntil: timestamp("promoted_until"), // When promotion expires
  views: integer("views").default(0), // View counter
  displayOrder: integer("display_order").default(0), // Custom order for seller's shop display
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
  variationId: varchar("variation_id").references(() => listingVariations.id), // Selected variation (optional)
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
  variationId: varchar("variation_id").references(() => listingVariations.id), // Selected variation (optional)
  variationName: varchar("variation_name"), // Snapshot: "Large" or "Blue"
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

// Message thread participants - tracks per-user conversation states
export const messageThreadParticipants = pgTable("message_thread_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").references(() => messageThreads.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role").notNull(), // 'buyer' or 'seller'
  archivedAt: timestamp("archived_at"), // Archive timestamp
  mutedUntil: timestamp("muted_until"), // Mute until timestamp
  pinned: boolean("pinned").default(false), // Pinned conversation
  lastReadAt: timestamp("last_read_at"), // Last read timestamp
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages - Enhanced with status tracking
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").references(() => messageThreads.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  status: messageStatusEnum("status").default('unread'),
  attachments: text("attachments").array(), // File URLs
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Reviews - Enhanced with photo upload support
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title"),
  content: text("content"),
  photos: text("photos").array(), // Array of photo URLs from object storage
  verified: boolean("verified").default(false), // Verified purchase
  helpful: integer("helpful").default(0), // Helpful votes count
  sellerResponse: text("seller_response"),
  sellerResponseDate: timestamp("seller_response_date"),
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

// Saved searches for users
export const savedSearches = pgTable("saved_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(), // User-given name for the search
  searchQuery: varchar("search_query"),
  categoryFilter: varchar("category_filter"),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }),
  conditionFilter: conditionEnum("condition_filter"),
  otherFilters: jsonb("other_filters"), // Additional filter parameters
  notifyOnNew: boolean("notify_on_new").default(false), // Send notifications for new matches
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlists
export const wishlists = pgTable("wishlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  isPublic: boolean("is_public").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wishlist items
export const wishlistItems = pgTable("wishlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wishlistId: varchar("wishlist_id").references(() => wishlists.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  notes: text("notes"), // Personal notes about the item
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url"), // URL to take action
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Analytics events for real-time tracking
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id),
  listingId: varchar("listing_id").references(() => listings.id),
  buyerId: varchar("buyer_id").references(() => users.id),
  sessionId: varchar("session_id"),
  eventType: analyticsEventTypeEnum("event_type").notNull(),
  source: trafficSourceEnum("source").default('direct'),
  utm: jsonb("utm"), // UTM parameters
  valueCents: integer("value_cents"), // Monetary value in cents
  occurredAt: timestamp("occurred_at").defaultNow(),
  userAgent: text("user_agent"),
  ipHash: varchar("ip_hash"), // Hashed IP for privacy
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_analytics_events_seller_date").on(table.sellerId, table.occurredAt),
  index("idx_analytics_events_listing_date").on(table.listingId, table.occurredAt),
  index("idx_analytics_events_type").on(table.eventType),
]);

// Enhanced seller daily metrics
export const sellerMetricsDaily = pgTable("seller_metrics_daily", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  date: timestamp("date").notNull(),
  // Traffic metrics
  views: integer("views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  visits: integer("visits").default(0),
  // Conversion funnel
  addToCarts: integer("add_to_carts").default(0),
  orders: integer("orders").default(0),
  unitsSold: integer("units_sold").default(0),
  // Financial metrics
  grossCents: integer("gross_cents").default(0),
  netCents: integer("net_cents").default(0),
  feesCents: integer("fees_cents").default(0),
  refundsCents: integer("refunds_cents").default(0),
  // Calculated metrics
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).default('0'), // Views to orders
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default('0'),
  // Engagement metrics
  favorites: integer("favorites").default(0),
  follows: integer("follows").default(0),
  messages: integer("messages").default(0),
  reviews: integer("reviews").default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default('0'),
  // Traffic sources
  directTraffic: integer("direct_traffic").default(0),
  searchTraffic: integer("search_traffic").default(0),
  socialTraffic: integer("social_traffic").default(0),
  referralTraffic: integer("referral_traffic").default(0),
  adTraffic: integer("ad_traffic").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_seller_metrics_daily_seller_date").on(table.sellerId, table.date),
]);

// Listing-level daily metrics
export const listingMetricsDaily = pgTable("listing_metrics_daily", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  date: timestamp("date").notNull(),
  // Performance metrics
  views: integer("views").default(0),
  uniqueViews: integer("unique_views").default(0),
  addToCarts: integer("add_to_carts").default(0),
  orders: integer("orders").default(0),
  unitsSold: integer("units_sold").default(0),
  grossCents: integer("gross_cents").default(0),
  favorites: integer("favorites").default(0),
  // Search metrics
  searchImpressions: integer("search_impressions").default(0),
  searchClicks: integer("search_clicks").default(0),
  searchClickRate: decimal("search_click_rate", { precision: 5, scale: 4 }).default('0'),
  // Conversion metrics
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).default('0'),
  cartConversionRate: decimal("cart_conversion_rate", { precision: 5, scale: 4 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_listing_metrics_daily_listing_date").on(table.listingId, table.date),
  index("idx_listing_metrics_daily_seller_date").on(table.sellerId, table.date),
]);

// Legacy seller analytics (keep for compatibility)
export const sellerAnalytics = pgTable("seller_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  date: timestamp("date").notNull(),
  views: integer("views").default(0),
  sales: integer("sales").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default('0'),
  newFavorites: integer("new_favorites").default(0),
  newFollowers: integer("new_followers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Promotions and discounts
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  discountType: varchar("discount_type").notNull(), // 'percentage', 'fixed_amount', 'free_shipping'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Listing variations (for items with different sizes, colors, etc.)
export const listingVariations = pgTable("listing_variations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  name: varchar("name").notNull(), // e.g., "Small", "Large", "Blue", etc.
  sku: varchar("sku"),
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).default('0'),
  stockQuantity: integer("stock_quantity").default(0),
  image: varchar("image"), // Optional variation-specific image
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

// Search analytics for improving discovery
export const searchAnalytics = pgTable("search_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: varchar("query").notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  resultsCount: integer("results_count").default(0),
  clickedResults: integer("clicked_results").array(), // IDs of listings clicked
  createdAt: timestamp("created_at").defaultNow(),
});

// Stripe payout records
export const payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  stripePayoutId: varchar("stripe_payout_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default('usd'),
  status: payoutStatusEnum("status").default('pending'),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  ordersIncluded: text("orders_included").array(), // Order IDs included in this payout
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// User verification requests
export const verificationRequests = pgTable("verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: verificationTypeEnum("type").notNull(),
  status: verificationStatusEnum("status").default('pending'),
  // Data provided by user
  data: jsonb("data"), // Flexible JSON field for different verification types
  documents: text("documents").array(), // URLs to uploaded documents
  // Admin review
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"), // Admin notes
  rejectionReason: text("rejection_reason"),
  // Verification codes/tokens
  verificationCode: varchar("verification_code"), // For SMS/email verification
  codeExpiresAt: timestamp("code_expires_at"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification templates for different types
export const verificationTemplates = pgTable("verification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: verificationTypeEnum("type").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  requiredFields: text("required_fields").array(), // JSON field names required
  requiredDocuments: text("required_documents").array(), // Document types required
  autoApprove: boolean("auto_approve").default(false), // Can be auto-approved
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seller review queue for manual verification
export const sellerReviewQueue = pgTable("seller_review_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  queueType: varchar("queue_type").notNull(), // 'initial', 'appeal', 'routine_check'
  priority: integer("priority").default(5), // 1-10, lower = higher priority
  assignedTo: varchar("assigned_to").references(() => users.id),
  status: varchar("status").default('pending'), // pending, in_review, completed
  riskFactors: text("risk_factors").array(), // Automatic risk flags
  submittedDocuments: text("submitted_documents").array(),
  reviewNotes: text("review_notes"),
  decision: varchar("decision"), // approved, rejected, needs_more_info
  decisionReason: text("decision_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification audit log
export const verificationAuditLog = pgTable("verification_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sellerId: varchar("seller_id").references(() => sellers.id),
  verificationRequestId: varchar("verification_request_id").references(() => verificationRequests.id),
  action: varchar("action").notNull(), // submitted, approved, rejected, expired, etc.
  actionBy: varchar("action_by").references(() => users.id),
  details: jsonb("details"), // Additional context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Identity verification sessions (for Stripe Identity or similar)
export const identityVerificationSessions = pgTable("identity_verification_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stripeSessionId: varchar("stripe_session_id").unique(),
  status: varchar("status").default('processing'), // processing, verified, requires_input, canceled
  type: varchar("type").default('document'), // document, selfie
  lastError: jsonb("last_error"),
  verifiedData: jsonb("verified_data"), // Name, DOB, address from document
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
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
  savedSearches: many(savedSearches),
  wishlists: many(wishlists),
  notifications: many(notifications),
}));

export const sellersRelations = relations(sellers, ({ one, many }) => ({
  user: one(users, { fields: [sellers.userId], references: [users.id] }),
  listings: many(listings),
  orders: many(orders),
  followers: many(shopFollows),
  analytics: many(sellerAnalytics),
  promotions: many(promotions),
  payouts: many(payouts),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories, { relationName: "parent" }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(sellers, { fields: [listings.sellerId], references: [sellers.id] }),
  images: many(listingImages),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
  favorites: many(favorites),
  variations: many(listingVariations),
  wishlistItems: many(wishlistItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  seller: one(sellers, { fields: [orders.sellerId], references: [sellers.id] }),
  items: many(orderItems),
  reviews: many(reviews),
  messageThreads: many(messageThreads),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, { fields: [savedSearches.userId], references: [users.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, { fields: [wishlistItems.wishlistId], references: [wishlists.id] }),
  listing: one(listings, { fields: [wishlistItems.listingId], references: [listings.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  seller: one(sellers, { fields: [analyticsEvents.sellerId], references: [sellers.id] }),
  listing: one(listings, { fields: [analyticsEvents.listingId], references: [listings.id] }),
  buyer: one(users, { fields: [analyticsEvents.buyerId], references: [users.id] }),
}));

export const sellerMetricsDailyRelations = relations(sellerMetricsDaily, ({ one }) => ({
  seller: one(sellers, { fields: [sellerMetricsDaily.sellerId], references: [sellers.id] }),
}));

export const listingMetricsDailyRelations = relations(listingMetricsDaily, ({ one }) => ({
  listing: one(listings, { fields: [listingMetricsDaily.listingId], references: [listings.id] }),
  seller: one(sellers, { fields: [listingMetricsDaily.sellerId], references: [sellers.id] }),
}));

export const sellerAnalyticsRelations = relations(sellerAnalytics, ({ one }) => ({
  seller: one(sellers, { fields: [sellerAnalytics.sellerId], references: [sellers.id] }),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  seller: one(sellers, { fields: [promotions.sellerId], references: [sellers.id] }),
}));

export const listingVariationsRelations = relations(listingVariations, ({ one }) => ({
  listing: one(listings, { fields: [listingVariations.listingId], references: [listings.id] }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  seller: one(sellers, { fields: [payouts.sellerId], references: [sellers.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
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
  slug: true,
  views: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryIds: z.array(z.string()).min(1, "Please select at least one category"),
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

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  createdAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
});

export const insertListingVariationSchema = createInsertSchema(listingVariations).omit({
  id: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSellerReviewQueueSchema = createInsertSchema(sellerReviewQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIdentityVerificationSessionSchema = createInsertSchema(identityVerificationSessions).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
  occurredAt: true,
});

export const insertSellerMetricsDailySchema = createInsertSchema(sellerMetricsDaily).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertListingMetricsDailySchema = createInsertSchema(listingMetricsDaily).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type MessageThreadParticipant = typeof messageThreadParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Flag = typeof flags.$inferSelect;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SellerAnalytic = typeof sellerAnalytics.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type ListingVariation = typeof listingVariations.$inferSelect;
export type InsertListingVariation = z.infer<typeof insertListingVariationSchema>;
export type SearchAnalytic = typeof searchAnalytics.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationTemplate = typeof verificationTemplates.$inferSelect;
export type SellerReviewQueueItem = typeof sellerReviewQueue.$inferSelect;
export type InsertSellerReviewQueueItem = z.infer<typeof insertSellerReviewQueueSchema>;
export type VerificationAuditLog = typeof verificationAuditLog.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type SellerMetricsDaily = typeof sellerMetricsDaily.$inferSelect;
export type InsertSellerMetricsDaily = z.infer<typeof insertSellerMetricsDailySchema>;
export type ListingMetricsDaily = typeof listingMetricsDaily.$inferSelect;
export type InsertListingMetricsDaily = z.infer<typeof insertListingMetricsDailySchema>;
export type IdentityVerificationSession = typeof identityVerificationSessions.$inferSelect;
export type InsertIdentityVerificationSession = z.infer<typeof insertIdentityVerificationSessionSchema>;

// Social sharing analytics
export const shareEvents = pgTable("share_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  platform: varchar("platform").notNull(), // facebook, twitter, pinterest, etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ShareEvent = typeof shareEvents.$inferSelect;
export type InsertShareEvent = typeof shareEvents.$inferInsert;

// Events table for oddities events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: varchar("image_url"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  price: decimal("price", { precision: 10, scale: 2 }),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  website: varchar("website"),
  tags: text("tags").array(),
  status: eventStatusEnum("status").default('draft').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event attendees table
export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  attendeeEmail: varchar("attendee_email").notNull(),
  attendeeName: varchar("attendee_name").notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Event relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

// Event schemas
export const insertEventSchema = createInsertSchema(events);
export const insertEventAttendeeSchema = createInsertSchema(eventAttendees);

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;

// Featured Listings table (Admin-curated)
export const featuredListings = pgTable("featured_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  addedAt: timestamp("added_at").defaultNow(),
});

// Featured Listings relations
export const featuredListingsRelations = relations(featuredListings, ({ one }) => ({
  listing: one(listings, {
    fields: [featuredListings.listingId],
    references: [listings.id],
  }),
}));

// Featured Listings schemas
export const insertFeaturedListingSchema = createInsertSchema(featuredListings).omit({ id: true, addedAt: true });
export type FeaturedListing = typeof featuredListings.$inferSelect;
export type InsertFeaturedListing = z.infer<typeof insertFeaturedListingSchema>;
