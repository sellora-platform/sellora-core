import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, index, foreignKey } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stores table - Each merchant has a store
 */
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  merchantId: int("merchantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: varchar("logo", { length: 512 }),
  favicon: varchar("favicon", { length: 512 }),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#000000"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#FFFFFF"),
  accentColor: varchar("accentColor", { length: 7 }).default("#3B82F6"),
  fontFamily: varchar("fontFamily", { length: 100 }).default("Inter"),
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).default("light"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  merchantIdIdx: index("merchantId_idx").on(table.merchantId),
}));

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Categories table - Product categories
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 512 }),
  parentCategoryId: int("parentCategoryId"),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdIdx: index("storeId_idx").on(table.storeId),
}));

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products table - Store products
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  sku: varchar("sku", { length: 255 }),
  barcode: varchar("barcode", { length: 255 }),
  quantity: int("quantity").default(0),
  trackQuantity: boolean("trackQuantity").default(true),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  weightUnit: varchar("weightUnit", { length: 10 }).default("kg"),
  isActive: boolean("isActive").default(true),
  images: json("images").$type<Array<{ url: string; alt: string; displayOrder: number }>>().default([]),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: varchar("seoDescription", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdIdx: index("storeId_idx").on(table.storeId),
  categoryIdIdx: index("categoryId_idx").on(table.categoryId),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product Variants table - Product variants (size, color, etc.)
 */
export const productVariants = mysqlTable("productVariants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 255 }),
  barcode: varchar("barcode", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  quantity: int("quantity").default(0),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  image: varchar("image", { length: 512 }),
  attributes: json("attributes").$type<Record<string, string>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("productId_idx").on(table.productId),
}));

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

/**
 * Customers table - Store customers
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }),
  country: varchar("country", { length: 100 }),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0"),
  totalOrders: int("totalOrders").default(0),
  lastOrderAt: timestamp("lastOrderAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdIdx: index("storeId_idx").on(table.storeId),
  emailIdx: index("email_idx").on(table.email),
}));

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Orders table - Customer orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  customerId: int("customerId"),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  shippingAddress: json("shippingAddress").$type<Record<string, unknown>>().default({}),
  billingAddress: json("billingAddress").$type<Record<string, unknown>>().default({}),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdIdx: index("storeId_idx").on(table.storeId),
  customerIdIdx: index("customerId_idx").on(table.customerId),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Items table - Items in each order
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  variantId: int("variantId"),
  title: varchar("title", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  orderIdIdx: index("orderId_idx").on(table.orderId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Discounts table - Store discounts and coupon codes
 */
export const discounts = mysqlTable("discounts", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: mysqlEnum("type", ["percentage", "fixed_amount"]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("minPurchase", { precision: 10, scale: 2 }),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdIdx: index("storeId_idx").on(table.storeId),
}));

export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = typeof discounts.$inferInsert;

/**
 * AI Agent Interactions table - Track AI agent conversations and actions
 */
export const aiInteractions = mysqlTable("aiInteractions", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  merchantId: int("merchantId").notNull(),
  type: mysqlEnum("type", ["design", "product_description", "banner", "content", "layout", "general"]).default("general"),
  prompt: text("prompt").notNull(),
  response: text("response"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdIdx: index("storeId_idx").on(table.storeId),
  merchantIdIdx: index("merchantId_idx").on(table.merchantId),
}));

export type AIInteraction = typeof aiInteractions.$inferSelect;
export type InsertAIInteraction = typeof aiInteractions.$inferInsert;

/**
 * Store Themes table - Store design themes and customizations
 */
export const storeThemes = mysqlTable("storeThemes", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  colors: json("colors").$type<Record<string, string>>().default({}),
  typography: json("typography").$type<Record<string, unknown>>().default({}),
  layout: json("layout").$type<Record<string, unknown>>().default({}),
  isActive: boolean("isActive").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdIdx: index("storeId_idx").on(table.storeId),
}));

export type StoreTheme = typeof storeThemes.$inferSelect;
export type InsertStoreTheme = typeof storeThemes.$inferInsert;