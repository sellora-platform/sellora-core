import { z } from "zod";
import { protectedStoreProcedure, router } from "../_core/trpc";
import * as dbOperations from "../db";
import { orders, customers, products, orderItems } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const dashboardRouter = router({
  getStats: protectedStoreProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ ctx }) => {
      // Manual verification and feature restriction removed for basic stats
      const storeId = ctx.storeId;
      const db = dbOperations.db;

      // 2. Fetch total orders
      const ordersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.storeId, storeId));
      const totalOrders = Number(ordersResult[0]?.count || 0);
  
      // 3. Fetch total revenue
      const revenueResult = await db
        .select({ total: sql<number>`sum(${orders.total})` })
        .from(orders)
        .where(eq(orders.storeId, storeId));
      const totalRevenue = Number(revenueResult[0]?.total || 0);
  
      // 4. Fetch total customers
      const customersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(eq(customers.storeId, storeId));
      const totalCustomers = Number(customersResult[0]?.count || 0);
  
      // 5. Fetch total products
      const productsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.storeId, storeId));
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
        .where(eq(orders.storeId, storeId));
      
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
