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
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: discountTypeEnum("type").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: numeric("min_purchase", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index("discounts_store_id_idx").on(table.storeId),
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