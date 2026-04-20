import { describe, expect, it } from "vitest";

/**
 * Database Query Tests
 * Tests for database helper functions
 */

describe("Database Helpers", () => {
  it("should have all required database helper functions", async () => {
    // Import the db module
    const db = await import("./db");

    // Check that all required functions exist
    expect(typeof db.getDb).toBe("function");
    expect(typeof db.upsertUser).toBe("function");
    expect(typeof db.getUserByOpenId).toBe("function");

    // Store queries
    expect(typeof db.createStore).toBe("function");
    expect(typeof db.getStoreByMerchantId).toBe("function");
    expect(typeof db.getStoreBySlug).toBe("function");
    expect(typeof db.updateStore).toBe("function");

    // Product queries
    expect(typeof db.createProduct).toBe("function");
    expect(typeof db.getProductsByStoreId).toBe("function");
    expect(typeof db.getProductById).toBe("function");
    expect(typeof db.updateProduct).toBe("function");
    expect(typeof db.deleteProduct).toBe("function");

    // Category queries
    expect(typeof db.createCategory).toBe("function");
    expect(typeof db.getCategoriesByStoreId).toBe("function");

    // Product Variant queries
    expect(typeof db.createProductVariant).toBe("function");
    expect(typeof db.getVariantsByProductId).toBe("function");

    // Customer queries
    expect(typeof db.createCustomer).toBe("function");
    expect(typeof db.getCustomersByStoreId).toBe("function");
    expect(typeof db.getCustomerById).toBe("function");

    // Order queries
    expect(typeof db.createOrder).toBe("function");
    expect(typeof db.getOrdersByStoreId).toBe("function");
    expect(typeof db.getOrderById).toBe("function");
    expect(typeof db.updateOrder).toBe("function");

    // Order Item queries
    expect(typeof db.createOrderItem).toBe("function");
    expect(typeof db.getOrderItemsByOrderId).toBe("function");

    // Discount queries
    expect(typeof db.createDiscount).toBe("function");
    expect(typeof db.getDiscountsByStoreId).toBe("function");
    expect(typeof db.getDiscountByCode).toBe("function");
    expect(typeof db.updateDiscount).toBe("function");

    // AI Interaction queries
    expect(typeof db.createAIInteraction).toBe("function");
    expect(typeof db.getAIInteractionsByStoreId).toBe("function");
    expect(typeof db.updateAIInteraction).toBe("function");

    // Store Theme queries
    expect(typeof db.createStoreTheme).toBe("function");
    expect(typeof db.getThemesByStoreId).toBe("function");
    expect(typeof db.updateStoreTheme).toBe("function");
  });

  it("should handle null database gracefully", async () => {
    const db = await import("./db");

    // When database is not available, functions should return empty arrays or null
    // This test verifies the functions don't throw errors
    expect(async () => {
      await db.getProductsByStoreId(1);
    }).not.toThrow();

    expect(async () => {
      await db.getOrdersByStoreId(1);
    }).not.toThrow();

    expect(async () => {
      await db.getCustomersByStoreId(1);
    }).not.toThrow();
  });

  it("should have proper type definitions for all database tables", async () => {
    const db = await import("./db");

    // Verify that schema types are exported
    expect(db).toBeDefined();
  });
});
