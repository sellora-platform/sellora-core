import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { orders, orderItems } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const ordersRouter = router({

  // PUBLIC — Customer places order
  create: publicProcedure
    .input(z.object({
      storeId: z.number(),
      customerName: z.string().min(1),
      customerEmail: z.string().email(),
      customerPhone: z.string().min(1),
      shippingAddress: z.object({
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().default("Pakistan"),
      }),
      paymentMethod: z.enum(["cod", "bank_transfer", "jazzcash", "easypaisa"]),
      paymentScreenshot: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        variantId: z.number().optional(),
        title: z.string(),
        sku: z.string().optional(),
        price: z.number(),
        quantity: z.number().min(1),
        variant: z.string().optional(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Validate screenshot required for non-COD
      if (
        input.paymentMethod !== "cod" && 
        !input.paymentScreenshot
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment screenshot is required for this payment method."
        });
      }

      // Calculate totals
      const subtotal = input.items.reduce(
        (acc, item) => acc + item.price * item.quantity, 0
      );
      const total = subtotal; // shipping calculated later

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${nanoid(4).toUpperCase()}`;

      // Create order
      const [order] = await db.insert(orders).values({
        storeId: input.storeId,
        orderNumber,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentScreenshot ? "screenshot_uploaded" : "pending",
        paymentScreenshot: input.paymentScreenshot || null,
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        notes: input.notes || null,
        status: "pending",
      }).returning();

      // Create order items
      await db.insert(orderItems).values(
        input.items.map(item => ({
          orderId: order.id,
          productId: item.productId || null,
          variantId: item.variantId || null,
          title: item.variant 
            ? `${item.title} — ${item.variant}` 
            : item.title,
          sku: item.sku || null,
          price: item.price.toFixed(2),
          quantity: item.quantity,
          total: (item.price * item.quantity).toFixed(2),
        }))
      );

      return { 
        success: true, 
        orderId: order.id,
        orderNumber: order.orderNumber 
      };
    }),

  // PROTECTED — Merchant lists orders
  listByStore: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const conditions = [eq(orders.storeId, input.storeId)];
      if (input.status) {
        conditions.push(eq(orders.status, input.status as any));
      }
      return await db
        .select()
        .from(orders)
        .where(and(...conditions))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // PROTECTED — Get single order with items
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, input.id));

      return { ...order[0], items };
    }),

  // PROTECTED — Update order status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending","processing","shipped","delivered","cancelled","refunded"]),
    }))
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(orders)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(orders.id, input.id))
        .returning();
      return updated;
    }),

  // PROTECTED — Confirm payment
  confirmPayment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(orders)
        .set({ 
          paymentStatus: "confirmed",
          status: "processing",
          updatedAt: new Date() 
        })
        .where(eq(orders.id, input.id))
        .returning();
      return updated;
    }),
});
