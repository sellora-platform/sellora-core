import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { orders, orderItems, stores, conversations, messages, communicationChannels, customers } from "../../db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendEmail } from "../_core/email";

export const ordersRouter = router({

  // PUBLIC — Customer places order
  create: publicProcedure
    .input(z.object({
      storeId: z.coerce.number(),
      customerName: z.string().min(1),
      customerEmail: z.string().email(),
      customerPhone: z.string().min(1),
      shippingAddress: z.object({
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        area: z.string().optional(),
        landmark: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().default("Pakistan"),
      }),
      paymentMethod: z.enum(["cod", "bank_transfer", "jazzcash", "easypaisa"]),
      paymentScreenshot: z.string().optional().nullable(),
      items: z.array(z.object({
        productId: z.coerce.number().optional().nullable(),
        variantId: z.coerce.number().optional().nullable(),
        title: z.string(),
        sku: z.string().optional(),
        price: z.number(),
        quantity: z.number().min(1),
        variant: z.string().optional(),
      })),
      notes: z.string().optional(),
      shippingFee: z.number().optional(),
      discountAmount: z.number().optional(),
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
      const shipping = input.shippingFee || 0;
      const discount = input.discountAmount || 0;
      const total = Math.max(0, subtotal + shipping - discount);

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
        shipping: shipping.toFixed(2),
        discount: discount.toFixed(2),
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

      // --- AUTOMATED NOTIFICATIONS ---
      try {
        // 1. Fetch Store Details for Branding
        const store = await db.query.stores.findFirst({
          where: eq(stores.id, input.storeId),
        });

        if (store) {
          const storeName = store.name;
          const storeUrl = store.customDomain 
            ? `https://${store.customDomain}` 
            : `https://${store.slug}.raaenai.com`;
          
          const trackUrl = `${storeUrl}/track?order=${orderNumber}&email=${input.customerEmail}`;

          // 2. Send Order Confirmation Email to Customer (ONLY IF AUTO-EMAIL IS ENABLED)
          if (store.autoOrderEmail) {
            await sendEmail({
              from: `${storeName} <no-reply@raaenai.com>`,
              to: input.customerEmail,
              subject: `Order Confirmed - #${orderNumber}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; color: #333;">
                  <div style="background: #000; padding: 30px; text-align: center; color: #fff;">
                    <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
                    <p style="opacity: 0.7; margin-top: 10px;">Thank you for shopping with ${storeName}</p>
                  </div>
                  <div style="padding: 40px;">
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${input.customerName}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">We've received your order <strong>#${orderNumber}</strong> and it is now being processed by our team.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
                      <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #999;">Order Details</h3>
                      <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">Total Amount: $${total.toFixed(2)}</p>
                      <p style="font-size: 14px; margin: 5px 0;">Payment Method: ${input.paymentMethod.toUpperCase()}</p>
                    </div>

                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${trackUrl}" style="background: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Your Order</a>
                    </div>

                    <p style="font-size: 14px; color: #666; line-height: 1.5;">
                      You will receive another update as soon as your items are on their way. If you have any questions in the meantime, feel free to reach out to us.
                    </p>

                    <div style="border-top: 1px solid #eee; padding-top: 30px; margin-top: 30px; text-align: center;">
                      <p style="font-size: 14px; color: #666;">Need quick help? Contact us via WhatsApp</p>
                      <a href="https://wa.me/${input.customerPhone.replace(/[^0-9]/g, '')}" style="color: #25D366; font-weight: bold; text-decoration: none; font-size: 16px;">Chat on WhatsApp</a>
                    </div>
                  </div>
                  <div style="background: #fcfcfc; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
                    &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
                  </div>
                </div>
              `
            });
          }

          // 3. Integrate with Inbox (Unified Messaging)
          // Find or create conversation for this order
          let conversation = await db.query.conversations.findFirst({
            where: and(
              eq(conversations.storeId, input.storeId),
              eq(conversations.customerIdentifier, input.customerEmail)
            )
          });

          if (!conversation) {
            const [newConv] = await db.insert(conversations).values({
              storeId: input.storeId,
              customerName: input.customerName,
              customerIdentifier: input.customerEmail,
              lastMessage: `New Order: #${orderNumber}`,
              lastActivity: new Date(),
              unreadCount: 1
            }).returning();
            conversation = newConv;
          } else {
            await db.update(conversations)
              .set({ 
                lastMessage: `New Order: #${orderNumber}`,
                lastActivity: new Date(),
                unreadCount: (conversation.unreadCount || 0) + 1
              })
              .where(eq(conversations.id, conversation.id));
          }

          // Insert order notification message into chat as a merchant confirmation
          await db.insert(messages).values({
            conversationId: conversation.id,
            senderType: 'merchant',
            senderId: 'system',
            body: `📦 **ORDER CONFIRMATION**\nOrder Number: #${orderNumber}\nTotal Amount: $${total.toFixed(2)}\n\nThank you for your order! We have received it and are currently processing it. You will receive an update once it's shipped.`,
            status: 'sent',
            metadata: { type: 'order_notification', orderNumber, orderId: order.id }
          });
        }
      } catch (err) {
        console.error("❌ [Order Notification Error]:", err);
        // We don't throw here to ensure the order creation isn't rolled back due to email failure
      }

      // 4. Update/Create Customer Record
      try {
        const existingCustomer = await db.query.customers.findFirst({
          where: and(
            eq(customers.storeId, input.storeId),
            eq(customers.email, input.customerEmail)
          )
        });

        if (existingCustomer) {
          // Update existing customer
          const newTotalSpent = (parseFloat(existingCustomer.totalSpent || "0") + total).toFixed(2);
          const newTotalOrders = (existingCustomer.totalOrders || 0) + 1;
          
          await db.update(customers)
            .set({
              firstName: input.customerName.split(' ')[0],
              lastName: input.customerName.split(' ').slice(1).join(' ') || null,
              phone: input.customerPhone,
              totalSpent: newTotalSpent,
              totalOrders: newTotalOrders,
              lastOrderAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(customers.id, existingCustomer.id));
        } else {
          // Create new customer
          await db.insert(customers).values({
            storeId: input.storeId,
            email: input.customerEmail,
            firstName: input.customerName.split(' ')[0],
            lastName: input.customerName.split(' ').slice(1).join(' ') || null,
            phone: input.customerPhone,
            totalSpent: total.toFixed(2),
            totalOrders: 1,
            lastOrderAt: new Date(),
            acceptsMarketing: false, // Default to false unless they opted in (could add a checkbox later)
          });
        }
      } catch (custErr) {
        console.error("❌ [Customer Update Error]:", custErr);
        // Don't fail order creation if customer CRM update fails
      }

      return { 
        success: true, 
        orderId: order.id,
        orderNumber: order.orderNumber 
      };
    }),

  // PUBLIC — Customer tracks their order
  track: publicProcedure
    .input(z.object({
      orderNumber: z.string().min(1),
      identifier: z.string().min(1), // Email or Phone
    }))
    .query(async ({ input }) => {
      const order = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.orderNumber, input.orderNumber),
            or(
              eq(orders.customerEmail, input.identifier),
              eq(orders.customerPhone, input.identifier)
            )
          )
        )
        .limit(1);

      if (!order[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No order found with these details. Please check your order number and email/phone."
        });
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order[0].id));

      return { ...order[0], items };
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
  
  // PROTECTED — Manually send confirmation email
  sendManualConfirmationEmail: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      // 1. Fetch Order and Store
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });

      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });

      const store = await db.query.stores.findFirst({
        where: eq(stores.id, order.storeId),
      });

      if (!store) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });

      const storeName = store.name;
      const storeUrl = store.customDomain 
        ? `https://${store.customDomain}` 
        : `https://${store.slug}.raaenai.com`;
      
      const trackUrl = `${storeUrl}/track?order=${order.orderNumber}&email=${order.customerEmail}`;

      // 2. Send Email
      await sendEmail({
        from: `${storeName} <no-reply@raaenai.com>`,
        to: order.customerEmail,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; color: #333;">
            <div style="background: #000; padding: 30px; text-align: center; color: #fff;">
              <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
              <p style="opacity: 0.7; margin-top: 10px;">Thank you for shopping with ${storeName}</p>
            </div>
            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${order.customerName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6;">Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being processed.</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #999;">Order Summary</h3>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">Total Amount: $${order.total}</p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${trackUrl}" style="background: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Your Order</a>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 30px; margin-top: 30px; text-align: center;">
                <p style="font-size: 14px; color: #666;">Need help? Contact us via WhatsApp</p>
                <a href="https://wa.me/${(order.customerPhone || '').replace(/[^0-9]/g, '')}" style="color: #25D366; font-weight: bold; text-decoration: none; font-size: 16px;">Chat on WhatsApp</a>
              </div>
            </div>
            <div style="background: #fcfcfc; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
              &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
            </div>
          </div>
        `
      });

      return { success: true };
    }),
});
