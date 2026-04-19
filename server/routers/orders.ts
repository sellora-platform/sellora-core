import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const ordersRouter = router({
  // Create an order (customer-facing)
  create: publicProcedure
    .input(
      z.object({
        storeId: z.number(),
        customerEmail: z.string().email(),
        items: z.array(
          z.object({
            productId: z.number().optional(),
            variantId: z.number().optional(),
            title: z.string(),
            sku: z.string().optional(),
            price: z.string(),
            quantity: z.number(),
          })
        ),
        subtotal: z.string(),
        tax: z.string().default("0"),
        shipping: z.string().default("0"),
        discount: z.string().default("0"),
        total: z.string(),
        shippingAddress: z.record(z.string(), z.any()).optional(),
        billingAddress: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const order = await db.createOrder({
        storeId: input.storeId,
        orderNumber,
        customerEmail: input.customerEmail,
        subtotal: parseFloat(input.subtotal) as any,
        tax: parseFloat(input.tax) as any,
        shipping: parseFloat(input.shipping) as any,
        discount: parseFloat(input.discount) as any,
        total: parseFloat(input.total) as any,
        shippingAddress: input.shippingAddress || {},
        billingAddress: input.billingAddress || {},
        status: "pending",
      });

      // Create order items
      for (const item of input.items) {
        await db.createOrderItem({
          orderId: (order as any).insertId,
          productId: item.productId,
          variantId: item.variantId,
          title: item.title,
          sku: item.sku,
          price: parseFloat(item.price) as any,
          quantity: item.quantity,
          total: (parseFloat(item.price) * item.quantity) as any,
        });
      }

      return order;
    }),

  // Get orders by store (merchant-facing)
  listByStore: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.getOrdersByStoreId(input.storeId);
    }),

  // Get a single order
  getById: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new Error("Order not found");

      const items = await db.getOrderItemsByOrderId(input.orderId);
      return { ...order, items };
    }),

  // Update order status (merchant-facing)
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        storeId: z.number(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.updateOrder(input.orderId, { status: input.status });
    }),
});
