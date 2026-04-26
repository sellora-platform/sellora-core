import { protectedProcedure, router } from "../_core/trpc";
import * as dbOperations from "../db";
import { orders, customers, products, orderItems } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { canAccess } from "../utils/capabilities";
import { SubscriptionTier } from "../utils/featureRegistry";

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // 1. Feature Enforcement
    canAccess.feature(ctx.user.tier as SubscriptionTier, "advancedAnalytics");

    // 2. Ensure user has a store
    const store = await dbOperations.getStoreByMerchantId(ctx.user.id);
    if (!store) {
      throw new Error("Store not found");
    }

    const db = dbOperations.db;

    // 2. Fetch total orders
    const ordersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.storeId, store.id));
    const totalOrders = Number(ordersResult[0]?.count || 0);

    // 3. Fetch total revenue
    const revenueResult = await db
      .select({ total: sql<number>`sum(${orders.total})` })
      .from(orders)
      .where(eq(orders.storeId, store.id));
    const totalRevenue = Number(revenueResult[0]?.total || 0);

    // 4. Fetch total customers
    const customersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(eq(customers.storeId, store.id));
    const totalCustomers = Number(customersResult[0]?.count || 0);

    // 5. Fetch total products
    const productsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.storeId, store.id));
    const totalProducts = Number(productsResult[0]?.count || 0);

    // 6. Calculate total profit
    // Join orderItems and products to get costPrice
    const profitResult = await db
      .select({
        profit: sql<number>`sum((${orderItems.price} - ${products.costPrice}) * ${orderItems.quantity})`
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.storeId, store.id));
    
    const totalProfit = Number(profitResult[0]?.profit || 0);

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      customers: totalCustomers,
      products: totalProducts,
      profit: totalProfit,
    };
  }),
});
