import { eq, and, desc, asc, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, stores, InsertStore, products, InsertProduct, categories, InsertCategory, productVariants, InsertProductVariant, customers, InsertCustomer, orders, InsertOrder, orderItems, InsertOrderItem, discounts, InsertDiscount, aiInteractions, InsertAIInteraction, storeThemes, InsertStoreTheme } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Store queries
export async function createStore(data: InsertStore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stores).values(data);
  return result;
}

export async function getStoreByMerchantId(merchantId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.merchantId, merchantId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getStoreBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateStore(storeId: number, data: Partial<InsertStore>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(stores).set(data).where(eq(stores.id, storeId));
}

// Product queries
export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}

export async function getProductsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.storeId, storeId));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateProduct(productId: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, productId));
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, productId));
}

// Category queries
export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(data);
}

export async function getCategoriesByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.storeId, storeId)).orderBy(asc(categories.displayOrder));
}

// Product Variant queries
export async function createProductVariant(data: InsertProductVariant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(productVariants).values(data);
}

export async function getVariantsByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

// Customer queries
export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customers).values(data);
}

export async function getCustomersByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.storeId, storeId));
}

export async function getCustomerById(customerId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Order queries
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(data);
}

export async function getOrdersByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.storeId, storeId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateOrder(orderId: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(data).where(eq(orders.id, orderId));
}

// Order Item queries
export async function createOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(data);
}

export async function getOrderItemsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// Discount queries
export async function createDiscount(data: InsertDiscount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(discounts).values(data);
}

export async function getDiscountsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discounts).where(eq(discounts.storeId, storeId));
}

export async function getDiscountByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(discounts).where(eq(discounts.code, code)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateDiscount(discountId: number, data: Partial<InsertDiscount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(discounts).set(data).where(eq(discounts.id, discountId));
}

// AI Interaction queries
export async function createAIInteraction(data: InsertAIInteraction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(aiInteractions).values(data);
}

export async function getAIInteractionsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiInteractions).where(eq(aiInteractions.storeId, storeId)).orderBy(desc(aiInteractions.createdAt));
}

export async function updateAIInteraction(interactionId: number, data: Partial<InsertAIInteraction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(aiInteractions).set(data).where(eq(aiInteractions.id, interactionId));
}

// Store Theme queries
export async function createStoreTheme(data: InsertStoreTheme) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(storeThemes).values(data);
}

export async function getThemesByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeThemes).where(eq(storeThemes.storeId, storeId));
}

export async function updateStoreTheme(themeId: number, data: Partial<InsertStoreTheme>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(storeThemes).set(data).where(eq(storeThemes.id, themeId));
}
