/**
 * Sellora Database Operations
 *
 * All database queries are centralized here.
 * Uses Drizzle ORM with Neon PostgreSQL serverless driver.
 */
import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  users, type InsertUser,
  stores, type InsertStore,
  products, type InsertProduct,
  categories, type InsertCategory,
  productVariants, type InsertProductVariant,
  customers, type InsertCustomer,
  orders, type InsertOrder,
  orderItems, type InsertOrderItem,
  discounts, type InsertDiscount,
  aiInteractions, type InsertAIInteraction,
  storeThemes, type InsertStoreTheme,
} from "../drizzle/schema";

// ============================================================================
// Database Connection
// ============================================================================

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Export db for use in auth routes
export const db = new Proxy({} as NonNullable<ReturnType<typeof drizzle>>, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) throw new Error("Database not available. Set DATABASE_URL.");
    return (instance as any)[prop];
  },
});

// ============================================================================
// User Queries
// ============================================================================

export async function getUserById(id: number) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Store Queries
// ============================================================================

export async function createStore(data: InsertStore) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stores).values(data).returning();
  return result[0];
}

export async function getStoreByMerchantId(merchantId: number) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.merchantId, merchantId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getStoreBySlug(slug: string) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getStoreByDomain(domain: string) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.customDomain, domain)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateStore(storeId: number, data: Partial<InsertStore>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.update(stores).set(data).where(eq(stores.id, storeId));
}

// ============================================================================
// Product Queries
// ============================================================================

export async function createProduct(data: InsertProduct) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}

export async function getProductsByStoreId(storeId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.storeId, storeId));
}

export async function getProductById(productId: number) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateProduct(productId: number, data: Partial<InsertProduct>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, productId));
}

export async function deleteProduct(productId: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, productId));
}

// ============================================================================
// Category Queries
// ============================================================================

export async function createCategory(data: InsertCategory) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(data);
}

export async function getCategoriesByStoreId(storeId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.storeId, storeId)).orderBy(asc(categories.displayOrder));
}

// ============================================================================
// Product Variant Queries
// ============================================================================

export async function createProductVariant(data: InsertProductVariant) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(productVariants).values(data);
}

export async function getVariantsByProductId(productId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

// ============================================================================
// Customer Queries
// ============================================================================

export async function createCustomer(data: InsertCustomer) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customers).values(data);
}

export async function getCustomersByStoreId(storeId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.storeId, storeId));
}

export async function getCustomerById(customerId: number) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============================================================================
// Order Queries
// ============================================================================

export async function createOrder(data: InsertOrder) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(data);
}

export async function getOrdersByStoreId(storeId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.storeId, storeId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(orderId: number) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateOrder(orderId: number, data: Partial<InsertOrder>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(data).where(eq(orders.id, orderId));
}

// ============================================================================
// Order Item Queries
// ============================================================================

export async function createOrderItem(data: InsertOrderItem) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(data);
}

export async function getOrderItemsByOrderId(orderId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ============================================================================
// Discount Queries
// ============================================================================

export async function createDiscount(data: InsertDiscount) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(discounts).values(data);
}

export async function getDiscountsByStoreId(storeId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(discounts).where(eq(discounts.storeId, storeId));
}

export async function getDiscountByCode(code: string) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(discounts).where(eq(discounts.code, code)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateDiscount(discountId: number, data: Partial<InsertDiscount>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.update(discounts).set(data).where(eq(discounts.id, discountId));
}

// ============================================================================
// AI Interaction Queries
// ============================================================================

export async function createAIInteraction(data: InsertAIInteraction) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(aiInteractions).values(data);
}

export async function getAIInteractionsByStoreId(storeId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(aiInteractions).where(eq(aiInteractions.storeId, storeId)).orderBy(desc(aiInteractions.createdAt));
}

export async function updateAIInteraction(interactionId: number, data: Partial<InsertAIInteraction>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.update(aiInteractions).set(data).where(eq(aiInteractions.id, interactionId));
}

// ============================================================================
// Store Theme Queries
// ============================================================================

export async function createStoreTheme(data: InsertStoreTheme) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(storeThemes).values(data);
}

export async function getThemesByStoreId(storeId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(storeThemes).where(eq(storeThemes.storeId, storeId));
}

export async function updateStoreTheme(themeId: number, data: Partial<InsertStoreTheme>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.update(storeThemes).set(data).where(eq(storeThemes.id, themeId));
}
