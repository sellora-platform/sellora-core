import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Sellora Database Schema — PostgreSQL (Neon)
 *
 * All tables for the Sellora e-commerce platform.
 * Migrated from MySQL to PostgreSQL for Vercel/Neon compatibility.
 */

// ============================================================================
// Enums
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const storeThemeEnum = pgEnum("store_theme", ["light", "dark", "auto"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]);
export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed_amount"]);
export const discountMethodEnum = pgEnum("discount_method", ["code", "automatic"]);
export const discountScopeEnum = pgEnum("discount_scope", ["order", "products", "shipping"]);
export const discountAppliesToEnum = pgEnum("discount_applies_to", ["all", "specific_products", "specific_collections"]);
export const aiInteractionTypeEnum = pgEnum("ai_interaction_type", ["design", "product_description", "banner", "content", "layout", "general"]);
export const aiInteractionStatusEnum = pgEnum("ai_interaction_status", ["pending", "completed", "failed"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "starter", "growth", "scale", "empire"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "trialing", "past_due", "canceled", "incomplete", "unpaid"]);
export const profitIntelligenceLevelEnum = pgEnum("profit_intelligence_level", ["basic", "standard", "advanced", "predictive"]);

// ============================================================================
// Users
// ============================================================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code", { length: 6 }),
  // Subscription Info
  tier: subscriptionTierEnum("tier").default("free").notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("trialing"),
  lifecycleStatus: varchar("lifecycle_status", { length: 20 }).default("trialing").notNull(),
  onboardingStatus: jsonb("onboarding_status").$type<{
    step: "account_setup" | "store_created" | "theme_selected" | "first_publish" | "completed";
    completedSteps: string[];
  }>().default({ step: "account_setup", completedSteps: [] }),
  activationStatus: jsonb("activation_status").$type<{
    hasCreatedStore: boolean;
    hasAddedProduct: boolean;
    hasPublishedTheme: boolean;
    activatedAt: string | null;
  }>().default({ hasCreatedStore: false, hasAddedProduct: false, hasPublishedTheme: false, activatedAt: null }),
  trialEndsAt: timestamp("trial_ends_at").default(sql`CURRENT_TIMESTAMP + interval '7 days'`),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  // Staff/Team Management
  parentMerchantId: integer("parent_merchant_id"), // If set, this user is a staff member of another merchant
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// Stores
// ============================================================================

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  customDomain: varchar("custom_domain", { length: 255 }).unique(),
  description: text("description"),
  logo: varchar("logo", { length: 512 }),
  favicon: varchar("favicon", { length: 512 }),
  primaryColor: varchar("primary_color", { length: 7 }).default("#000000"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#FFFFFF"),
  accentColor: varchar("accent_color", { length: 7 }).default("#3B82F6"),
  fontFamily: varchar("font_family", { length: 100 }).default("Inter"),
  theme: storeThemeEnum("theme").default("light"),
  isActive: boolean("is_active").default(true),
  autoOrderEmail: boolean("auto_order_email").default(true),
  autoContactReply: boolean("auto_contact_reply").default(true),
  // Payment Settings
  paymentCodEnabled: boolean("payment_cod_enabled").default(true),
  paymentBankEnabled: boolean("payment_bank_enabled").default(false),
  paymentBankDetails: jsonb("payment_bank_details").$type<{ bankName: string; accountTitle: string; accountNumber: string }>().default({ bankName: "", accountTitle: "", accountNumber: "" }),
  paymentJazzcashEnabled: boolean("payment_jazzcash_enabled").default(false),
  paymentJazzcashNumber: varchar("payment_jazzcash_number", { length: 20 }),
  paymentJazzcashName: varchar("payment_jazzcash_name", { length: 100 }),
  paymentEasypaisaEnabled: boolean("payment_easypaisa_enabled").default(false),
  paymentEasypaisaNumber: varchar("payment_easypaisa_number", { length: 20 }),
  paymentEasypaisaName: varchar("payment_easypaisa_name", { length: 100 }),
  // Tracking & Analytics Pixels
  trackingPixels: jsonb("tracking_pixels").$type<{
    metaPixelId?: string;
    metaAccessToken?: string;  // For Conversions API (CAPI)
    tiktokPixelId?: string;
    tiktokAccessToken?: string;
    ga4MeasurementId?: string; // G-XXXXXXXXXX
    googleAdsId?: string;     // AW-XXXXXXXXX
    snapchatPixelId?: string;
    pinterestTagId?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  merchantIdIdx: index("stores_merchant_id_idx").on(table.merchantId),
}));

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

// ============================================================================
// Plans
// ============================================================================

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  tier: subscriptionTierEnum("tier").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: numeric("yearly_price", { precision: 10, scale: 2 }).notNull(),
  maxStores: integer("max_stores").notNull(),
  maxStaff: integer("max_staff"), // null = unlimited
  transactionFee: numeric("transaction_fee", { precision: 5, scale: 2 }).notNull(),
  profitIntelligenceLevel: profitIntelligenceLevelEnum("profit_intelligence_level").default("basic").notNull(),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }),
  stripePriceIdYearly: varchar("stripe_price_id_yearly", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

// ============================================================================
// Categories
// ============================================================================

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 512 }),
  parentCategoryId: integer("parent_category_id"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("categories_store_id_idx").on(table.storeId),
}));

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ============================================================================
// Products
// ============================================================================

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  categoryId: integer("category_id"),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).default("0.00").notNull(),
  sku: varchar("sku", { length: 255 }),
  barcode: varchar("barcode", { length: 255 }),
  quantity: integer("quantity").default(0),
  trackQuantity: boolean("track_quantity").default(true),
  weight: numeric("weight", { precision: 8, scale: 2 }),
  weightUnit: varchar("weight_unit", { length: 10 }).default("kg"),
  isActive: boolean("is_active").default(true),
  images: jsonb("images").$type<Array<{ url: string; alt: string; displayOrder: number }>>().default([]),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: varchar("seo_description", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("products_store_id_idx").on(table.storeId),
  categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ============================================================================
// Reviews
// ============================================================================

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  productId: integer("product_id").notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorEmail: varchar("author_email", { length: 255 }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  body: text("body"),
  images: jsonb("images").$type<Array<{ url: string }>>().default([]),
  verified: boolean("verified").default(false),
  published: boolean("published").default(false),
  source: varchar("source", { length: 20 }).default("customer"), // "customer" | "merchant"
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("reviews_store_id_idx").on(table.storeId),
  productIdIdx: index("reviews_product_id_idx").on(table.productId),
  ratingIdx: index("reviews_rating_idx").on(table.rating),
}));

// Rating summary view helper type
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// ============================================================================
// Product Variants
// ============================================================================

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 255 }),
  barcode: varchar("barcode", { length: 255 }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(0),
  weight: numeric("weight", { precision: 8, scale: 2 }),
  image: varchar("image", { length: 512 }),
  attributes: jsonb("attributes").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index("variants_product_id_idx").on(table.productId),
}));

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// ============================================================================
// Customers
// ============================================================================

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  totalSpent: numeric("total_spent", { precision: 10, scale: 2 }).default("0"),
  totalOrders: integer("total_orders").default(0),
  lastOrderAt: timestamp("last_order_at"),
  notes: text("notes"),
  acceptsMarketing: boolean("accepts_marketing").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("customers_store_id_idx").on(table.storeId),
  emailIdx: index("customers_email_idx").on(table.email),
}));

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ============================================================================
// Orders
// ============================================================================

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  customerId: integer("customer_id"),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: orderStatusEnum("status").default("pending"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0"),
  shipping: numeric("shipping", { precision: 10, scale: 2 }).default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  shippingAddress: jsonb("shipping_address").$type<Record<string, unknown>>().default({}),
  billingAddress: jsonb("billing_address").$type<Record<string, unknown>>().default({}),
  notes: text("notes"),
  // Payment fields
  paymentMethod: varchar("payment_method", { length: 50 }).default("cod"),
  // cod | bank_transfer | jazzcash | easypaisa
  paymentStatus: varchar("payment_status", { length: 30 }).default("pending"),
  // pending | screenshot_uploaded | confirmed | failed
  paymentScreenshot: varchar("payment_screenshot", { length: 500 }),
  // Cloudinary URL of payment screenshot
  customerName: varchar("customer_name", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("orders_store_id_idx").on(table.storeId),
  customerIdIdx: index("orders_customer_id_idx").on(table.customerId),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================================================
// Order Items
// ============================================================================

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  variantId: integer("variant_id"),
  title: varchar("title", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 255 }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ============================================================================
// Discounts
// ============================================================================

export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  // Identity
  title: varchar("title", { length: 255 }).notNull().default("Untitled Discount"),
  code: varchar("code", { length: 100 }).notNull().unique(),
  description: text("description"),
  // Method & Scope
  method: discountMethodEnum("method").default("code").notNull(),
  type: discountTypeEnum("type").notNull(),
  scope: discountScopeEnum("scope").default("order").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }),
  // Product/Collection Targeting
  appliesTo: discountAppliesToEnum("applies_to").default("all").notNull(),
  productIds: jsonb("product_ids").$type<number[]>().default([]),
  collectionIds: jsonb("collection_ids").$type<number[]>().default([]),
  // Requirements
  minPurchase: numeric("min_purchase", { precision: 10, scale: 2 }),
  minQuantity: integer("min_quantity"),
  // Usage Limits
  maxUses: integer("max_uses"),
  maxUsesPerCustomer: integer("max_uses_per_customer"),
  usedCount: integer("used_count").default(0),
  // Combinability
  combinesWith: jsonb("combines_with").$type<{
    productDiscounts: boolean;
    orderDiscounts: boolean;
    shippingDiscounts: boolean;
  }>().default({ productDiscounts: false, orderDiscounts: false, shippingDiscounts: false }),
  // Scheduling
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("discounts_store_id_idx").on(table.storeId),
  codeIdx: index("discounts_code_idx").on(table.code),
}));

export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = typeof discounts.$inferInsert;

// ============================================================================
// AI Interactions
// ============================================================================

export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  type: aiInteractionTypeEnum("type").default("general"),
  prompt: text("prompt").notNull(),
  response: text("response"),
  status: aiInteractionStatusEnum("status").default("pending"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("ai_interactions_store_id_idx").on(table.storeId),
  merchantIdIdx: index("ai_interactions_merchant_id_idx").on(table.merchantId),
}));

export type AIInteraction = typeof aiInteractions.$inferSelect;
export type InsertAIInteraction = typeof aiInteractions.$inferInsert;

// ============================================================================
// Store Themes
// ============================================================================

export const storeThemes = pgTable("store_themes", {
  id: varchar("id", { length: 36 }).primaryKey(), // Using varchar for UUID compatibility
  storeId: integer("store_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  draftConfig: jsonb("draft_config").$type<any>().notNull(),
  publishedConfig: jsonb("published_config").$type<any>(),
  description: text("description"),
  isActive: boolean("is_active").default(false).notNull(),
  schemaVersion: integer("schema_version").default(1).notNull(),
  version: integer("version").default(1).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("store_themes_store_id_idx").on(table.storeId),
}));

export type StoreTheme = typeof storeThemes.$inferSelect;
export type InsertStoreTheme = typeof storeThemes.$inferInsert;

export const editorEvents = pgTable("editor_events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  eventId: varchar("event_id", { length: 36 }).unique().notNull(), // Client-generated UUID for idempotency
  themeId: varchar("theme_id", { length: 36 }).notNull(),
  clientId: varchar("client_id", { length: 50 }).notNull(), // Tab/Session identifier
  type: varchar("type", { length: 50 }).notNull(),
  payload: jsonb("payload").$type<any>(),
  version: integer("version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  themeIdIdx: index("editor_events_theme_id_idx").on(table.themeId),
  eventIdIdx: index("editor_events_idempotency_idx").on(table.eventId),
}));

export const themeSnapshots = pgTable("theme_snapshots", {
  id: varchar("id", { length: 36 }).primaryKey(),
  themeId: varchar("theme_id", { length: 36 }).notNull(),
  state: jsonb("state").$type<any>().notNull(),
  lastEventId: varchar("last_event_id", { length: 36 }).notNull(),
  version: integer("version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  themeIdIdx: index("theme_snapshots_theme_id_idx").on(table.themeId),
}));

export type EditorEvent = typeof editorEvents.$inferSelect;
export type InsertEditorEvent = typeof editorEvents.$inferInsert;
export type ThemeSnapshot = typeof themeSnapshots.$inferSelect;
export type InsertThemeSnapshot = typeof themeSnapshots.$inferInsert;

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  actionType: varchar("action_type", { length: 100 }).notNull(), // e.g., "CREATE_STORE", "PLAN_VIOLATION"
  resourceType: varchar("resource_type", { length: 50 }), // e.g., "STORE", "THEME"
  resourceId: varchar("resource_id", { length: 100 }),
  metadata: jsonb("metadata").$type<any>().default({}),
  success: boolean("success").default(true).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  actionTypeIdx: index("audit_logs_action_type_idx").on(table.actionType),
}));

export const tenantUsage = pgTable("tenant_usage", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  metricName: varchar("metric_name", { length: 50 }).notNull(), // e.g., "stores_count", "staff_count"
  currentCount: integer("current_count").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => ({
  merchantMetricIdx: index("tenant_usage_merchant_metric_idx").on(table.merchantId, table.metricName),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type TenantUsage = typeof tenantUsage.$inferSelect;
export type InsertTenantUsage = typeof tenantUsage.$inferInsert;

export const subscriptionRequestStatusEnum = pgEnum("subscription_request_status", ["pending", "approved", "rejected"]);

// ============================================================================
// Subscription Requests (Manual Payments)
// ============================================================================

export const subscriptionRequests = pgTable("subscription_requests", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  tier: subscriptionTierEnum("tier").notNull(),
  status: subscriptionRequestStatusEnum("status").default("pending").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  receiptImage: varchar("receipt_image", { length: 512 }),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  merchantIdIdx: index("sub_req_merchant_id_idx").on(table.merchantId),
}));

export type SubscriptionRequest = typeof subscriptionRequests.$inferSelect;
export type InsertSubscriptionRequest = typeof subscriptionRequests.$inferInsert;

// ============================================================================
// Pages (Static Content)
// ============================================================================

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("pages_store_id_idx").on(table.storeId),
  slugIdx: index("pages_slug_idx").on(table.slug),
}));

// ─── COMMUNICATION & MESSAGING ──────────────────────────────

export const channelTypeEnum = pgEnum("channel_type", ["whatsapp", "instagram", "facebook", "email", "sms"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read", "failed", "pending"]);

export const communicationChannels = pgTable("communication_channels", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  type: channelTypeEnum("type").notNull(),
  providerId: varchar("provider_id", { length: 255 }), // e.g. WhatsApp Business ID
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  status: varchar("status", { length: 50 }).default("active"), // active, disconnected, pending
  settings: jsonb("settings").default({}), // Webhook secrets, custom names
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeChannelIdx: index("store_channel_idx").on(table.storeId, table.type),
}));

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  channelId: integer("channel_id").references(() => communicationChannels.id),
  customerName: varchar("customer_name", { length: 255 }),
  customerIdentifier: varchar("customer_identifier", { length: 255 }).notNull(), // Phone number or Email
  lastMessage: text("last_message"),
  unreadCount: integer("unread_count").default(0),
  metadata: jsonb("metadata").default({}), // Avatar, social profile link
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  storeCustIdx: index("store_cust_conv_idx").on(table.storeId, table.customerIdentifier),
  lastActivityIdx: index("conv_last_activity_idx").on(table.lastActivity),
}));

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // 'customer' or 'merchant'
  senderId: varchar("sender_id", { length: 255 }), // Merchant user ID or customer identifier
  body: text("body").notNull(),
  type: varchar("type", { length: 20 }).default("text"), // text, image, file, template
  status: messageStatusEnum("status").default("sent"),
  metadata: jsonb("metadata").default({}), // Media URLs, message IDs from provider
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  convIdIdx: index("msg_conv_id_idx").on(table.conversationId),
  createdAtIdx: index("msg_created_at_idx").on(table.createdAt),
}));

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

// ============================================================================
// Marketing Campaigns
// ============================================================================

export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "scheduled", "sending", "sent", "paused", "failed"]);
export const campaignChannelEnum = pgEnum("campaign_channel", ["email", "whatsapp"]);

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }), // Email subject line
  channel: campaignChannelEnum("channel").notNull(),
  status: campaignStatusEnum("status").default("draft").notNull(),
  // Content
  body: text("body").notNull(), // HTML for email, plain text for WhatsApp
  previewText: varchar("preview_text", { length: 255 }), // Email preview text
  // Targeting
  segment: varchar("segment", { length: 50 }).default("all"), // all, subscribers, buyers, inactive, vip, custom
  segmentRules: jsonb("segment_rules").$type<{
    minOrders?: number;
    maxOrders?: number;
    minSpent?: number;
    maxSpent?: number;
    inactiveDays?: number;
    acceptsMarketing?: boolean;
  }>().default({}),
  // Scheduling
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  // Analytics
  recipientCount: integer("recipient_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  unsubscribedCount: integer("unsubscribed_count").default(0),
  // Discount attachment
  discountId: integer("discount_id"), // Optionally attach a discount to this campaign
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("campaigns_store_id_idx").on(table.storeId),
  statusIdx: index("campaigns_status_idx").on(table.status),
}));

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;

// ============================================================================
// Abandoned Carts (Recovery Automation)
// ============================================================================

export const abandonedCartStatusEnum = pgEnum("abandoned_cart_status", ["active", "reminded", "recovered", "expired"]);

export const abandonedCarts = pgTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  // Customer info (captured at checkout attempt)
  customerEmail: varchar("customer_email", { length: 320 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  customerName: varchar("customer_name", { length: 255 }),
  customerId: integer("customer_id"),
  // Cart contents
  cartItems: jsonb("cart_items").$type<Array<{
    productId: number;
    variantId?: number;
    title: string;
    price: string;
    quantity: number;
    image?: string;
  }>>().default([]),
  cartTotal: numeric("cart_total", { precision: 10, scale: 2 }).default("0"),
  // Recovery tracking
  status: abandonedCartStatusEnum("status").default("active").notNull(),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  recoveredAt: timestamp("recovered_at"),
  recoveryOrderId: integer("recovery_order_id"),
  // Recovery discount (auto-generated for incentive)
  recoveryDiscountCode: varchar("recovery_discount_code", { length: 100 }),
  recoveryDiscountValue: numeric("recovery_discount_value", { precision: 5, scale: 2 }),
  // Timestamps
  abandonedAt: timestamp("abandoned_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // After this, stop sending reminders
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("abandoned_carts_store_id_idx").on(table.storeId),
  statusIdx: index("abandoned_carts_status_idx").on(table.status),
  emailIdx: index("abandoned_carts_email_idx").on(table.customerEmail),
}));

export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = typeof abandonedCarts.$inferInsert;

// ============================================================================
// Marketing Automations (Flow Triggers)
// ============================================================================

export const automationTriggerEnum = pgEnum("automation_trigger", [
  "abandoned_cart",    // Cart abandoned > X minutes
  "welcome",          // New subscriber
  "post_purchase",    // After order completed
  "winback",          // Inactive customer
  "birthday",         // Customer birthday
]);

export const marketingAutomations = pgTable("marketing_automations", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: automationTriggerEnum("trigger").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  // Configuration
  delayMinutes: integer("delay_minutes").default(60), // Wait before sending
  channel: campaignChannelEnum("channel").default("email").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  // Discount incentive
  includeDiscount: boolean("include_discount").default(false),
  discountType: discountTypeEnum("discount_type"),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }),
  // Analytics
  sentCount: integer("sent_count").default(0),
  convertedCount: integer("converted_count").default(0),
  revenue: numeric("revenue", { precision: 10, scale: 2 }).default("0"),
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("automations_store_id_idx").on(table.storeId),
  triggerIdx: index("automations_trigger_idx").on(table.trigger),
}));

export type MarketingAutomation = typeof marketingAutomations.$inferSelect;
export type InsertMarketingAutomation = typeof marketingAutomations.$inferInsert;

// ============================================================================
// Navigation (Menus & Items)
// ============================================================================

export const navigationMenus = pgTable("navigation_menus", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  handle: varchar("handle", { length: 255 }).notNull(), // e.g. 'main-menu', 'footer-menu'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("nav_menus_store_id_idx").on(table.storeId),
}));

export type NavigationMenu = typeof navigationMenus.$inferSelect;
export type InsertNavigationMenu = typeof navigationMenus.$inferInsert;

export const navigationItems = pgTable("navigation_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id").notNull(),
  parentId: integer("parent_id"), // For nested menus
  label: varchar("label", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  menuIdIdx: index("nav_items_menu_id_idx").on(table.menuId),
}));

export type NavigationItem = typeof navigationItems.$inferSelect;
export type InsertNavigationItem = typeof navigationItems.$inferInsert;

// ============================================================================
// Platform Settings (Admin-configurable global settings)
// ============================================================================

export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  label: varchar("label", { length: 255 }),
  group: varchar("group", { length: 50 }).notNull(), // 'payment', 'pricing', 'general'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;

// ============================================================================
// Shipping Management
// ============================================================================

export const shippingZones = pgTable("shipping_zones", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  countries: jsonb("countries").$type<string[]>().default([]).notNull(), // List of country codes, e.g. ["US", "CA"] or ["PK"]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("shipping_zones_store_id_idx").on(table.storeId),
}));

export type ShippingZone = typeof shippingZones.$inferSelect;
export type InsertShippingZone = typeof shippingZones.$inferInsert;

export const shippingRates = pgTable("shipping_rates", {
  id: serial("id").primaryKey(),
  zoneId: integer("zone_id").notNull().references(() => shippingZones.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Standard", "Express"
  type: varchar("type", { length: 50 }).notNull(), // "flat" | "weight_based" | "price_based"
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  minLimit: numeric("min_limit", { precision: 10, scale: 2 }), // Min weight or min cart price
  maxLimit: numeric("max_limit", { precision: 10, scale: 2 }), // Max weight or max cart price
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  zoneIdIdx: index("shipping_rates_zone_id_idx").on(table.zoneId),
}));

export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = typeof shippingRates.$inferInsert;

export const shippingCarrierSettings = pgTable("shipping_carrier_settings", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  carrier: varchar("carrier", { length: 100 }).notNull(), // "easypost" | "shipstation" | "leopard" | "tcs" | etc.
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  settings: jsonb("settings").$type<any>().default({}).notNull(), // Extra configuration parameters
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeCarrierIdx: index("shipping_carrier_store_carrier_idx").on(table.storeId, table.carrier),
}));

export type ShippingCarrierSetting = typeof shippingCarrierSettings.$inferSelect;
export type InsertShippingCarrierSetting = typeof shippingCarrierSettings.$inferInsert;