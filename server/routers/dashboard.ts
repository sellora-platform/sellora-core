import { protectedProcedure, router } from "../_core/trpc";
import * as dbOperations from "../db";
import { orders, customers, products } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // 1. Ensure user has a store
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

    // 5. Fetch total products (just as an extra metric)
    const productsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.storeId, store.id));
    const totalProducts = Number(productsResult[0]?.count || 0);

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      customers: totalCustomers,
      products: totalProducts,
    };
  }),
});
