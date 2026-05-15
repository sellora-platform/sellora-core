import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { db } from "../db";
import { marketingCampaigns, abandonedCarts, marketingAutomations, customers } from "../../db/schema";
import { eq, and, desc, sql, gte, lte, lt, count } from "drizzle-orm";

export const marketingRouter = router({
  // ─── CAMPAIGNS ──────────────────────────────────────────────

  // List all campaigns
  listCampaigns: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.marketingCampaigns.findMany({
        where: eq(marketingCampaigns.storeId, input.storeId),
        orderBy: [desc(marketingCampaigns.createdAt)],
      });
    }),

  // Get single campaign
  getCampaign: protectedProcedure
    .input(z.object({ id: z.number(), storeId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.marketingCampaigns.findFirst({
        where: and(
          eq(marketingCampaigns.id, input.id),
          eq(marketingCampaigns.storeId, input.storeId)
        ),
      });
    }),

  // Create campaign
  createCampaign: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      name: z.string().min(1),
      channel: z.enum(["email", "whatsapp"]),
      subject: z.string().optional(),
      body: z.string().min(1),
      previewText: z.string().optional(),
      segment: z.string().default("all"),
      segmentRules: z.object({
        minOrders: z.number().optional(),
        maxOrders: z.number().optional(),
        minSpent: z.number().optional(),
        maxSpent: z.number().optional(),
        inactiveDays: z.number().optional(),
        acceptsMarketing: z.boolean().optional(),
      }).optional(),
      scheduledAt: z.string().optional(),
      discountId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const [campaign] = await db.insert(marketingCampaigns).values({
        storeId: input.storeId,
        name: input.name,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
        previewText: input.previewText,
        segment: input.segment || "all",
        segmentRules: input.segmentRules || {},
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        status: input.scheduledAt ? "scheduled" : "draft",
        discountId: input.discountId,
      }).returning();
      return campaign;
    }),

  // Update campaign
  updateCampaign: protectedProcedure
    .input(z.object({
      id: z.number(),
      storeId: z.number(),
      name: z.string().optional(),
      channel: z.enum(["email", "whatsapp"]).optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      previewText: z.string().optional(),
      segment: z.string().optional(),
      segmentRules: z.object({
        minOrders: z.number().optional(),
        maxOrders: z.number().optional(),
        minSpent: z.number().optional(),
        maxSpent: z.number().optional(),
        inactiveDays: z.number().optional(),
        acceptsMarketing: z.boolean().optional(),
      }).optional(),
      scheduledAt: z.string().nullable().optional(),
      status: z.enum(["draft", "scheduled", "paused"]).optional(),
      discountId: z.number().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, storeId, ...data } = input;
      const updatePayload: any = { ...data, updatedAt: new Date() };
      if (data.scheduledAt) updatePayload.scheduledAt = new Date(data.scheduledAt);
      if (data.scheduledAt === null) updatePayload.scheduledAt = null;

      const [updated] = await db.update(marketingCampaigns)
        .set(updatePayload)
        .where(and(eq(marketingCampaigns.id, id), eq(marketingCampaigns.storeId, storeId)))
        .returning();
      return updated;
    }),

  // Delete campaign
  deleteCampaign: protectedProcedure
    .input(z.object({ id: z.number(), storeId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(marketingCampaigns)
        .where(and(eq(marketingCampaigns.id, input.id), eq(marketingCampaigns.storeId, input.storeId)));
      return { success: true };
    }),

  // Send campaign (mark as sending — actual delivery would be handled by a background job)
  sendCampaign: protectedProcedure
    .input(z.object({ id: z.number(), storeId: z.number() }))
    .mutation(async ({ input }) => {
      // Count recipients based on segment
      const campaign = await db.query.marketingCampaigns.findFirst({
        where: and(eq(marketingCampaigns.id, input.id), eq(marketingCampaigns.storeId, input.storeId)),
      });
      if (!campaign) throw new Error("Campaign not found");

      // Get subscriber count
      const allCustomers = await db.query.customers.findMany({
        where: eq(customers.storeId, input.storeId),
      });

      let recipients = allCustomers;
      if (campaign.segment === "subscribers") {
        recipients = allCustomers.filter(c => c.acceptsMarketing);
      } else if (campaign.segment === "buyers") {
        recipients = allCustomers.filter(c => (c.totalOrders || 0) > 0);
      } else if (campaign.segment === "vip") {
        recipients = allCustomers.filter(c => (c.totalOrders || 0) >= 5);
      } else if (campaign.segment === "inactive") {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        recipients = allCustomers.filter(c => !c.lastOrderAt || new Date(c.lastOrderAt) < thirtyDaysAgo);
      }

      const [updated] = await db.update(marketingCampaigns)
        .set({
          status: "sent",
          sentAt: new Date(),
          recipientCount: recipients.length,
          deliveredCount: recipients.length, // Simplified — real system would track actual delivery
          updatedAt: new Date(),
        })
        .where(eq(marketingCampaigns.id, input.id))
        .returning();

      return updated;
    }),

  // ─── AUTOMATIONS ────────────────────────────────────────────

  listAutomations: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.marketingAutomations.findMany({
        where: eq(marketingAutomations.storeId, input.storeId),
        orderBy: [desc(marketingAutomations.createdAt)],
      });
    }),

  createAutomation: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      name: z.string().min(1),
      trigger: z.enum(["abandoned_cart", "welcome", "post_purchase", "winback", "birthday"]),
      channel: z.enum(["email", "whatsapp"]),
      subject: z.string().optional(),
      body: z.string().min(1),
      delayMinutes: z.number().default(60),
      includeDiscount: z.boolean().default(false),
      discountType: z.enum(["percentage", "fixed_amount"]).optional(),
      discountValue: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [automation] = await db.insert(marketingAutomations).values({
        storeId: input.storeId,
        name: input.name,
        trigger: input.trigger,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
        delayMinutes: input.delayMinutes,
        includeDiscount: input.includeDiscount,
        discountType: input.discountType,
        discountValue: input.discountValue,
        isActive: false,
      }).returning();
      return automation;
    }),

  updateAutomation: protectedProcedure
    .input(z.object({
      id: z.number(),
      storeId: z.number(),
      name: z.string().optional(),
      trigger: z.enum(["abandoned_cart", "welcome", "post_purchase", "winback", "birthday"]).optional(),
      channel: z.enum(["email", "whatsapp"]).optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      delayMinutes: z.number().optional(),
      includeDiscount: z.boolean().optional(),
      discountType: z.enum(["percentage", "fixed_amount"]).optional(),
      discountValue: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, storeId, ...data } = input;
      const [updated] = await db.update(marketingAutomations)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(and(eq(marketingAutomations.id, id), eq(marketingAutomations.storeId, storeId)))
        .returning();
      return updated;
    }),

  toggleAutomation: protectedProcedure
    .input(z.object({ id: z.number(), storeId: z.number() }))
    .mutation(async ({ input }) => {
      const existing = await db.query.marketingAutomations.findFirst({
        where: and(eq(marketingAutomations.id, input.id), eq(marketingAutomations.storeId, input.storeId)),
      });
      if (!existing) throw new Error("Automation not found");
      
      const [updated] = await db.update(marketingAutomations)
        .set({ isActive: !existing.isActive, updatedAt: new Date() })
        .where(eq(marketingAutomations.id, input.id))
        .returning();
      return updated;
    }),

  deleteAutomation: protectedProcedure
    .input(z.object({ id: z.number(), storeId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(marketingAutomations)
        .where(and(eq(marketingAutomations.id, input.id), eq(marketingAutomations.storeId, input.storeId)));
      return { success: true };
    }),

  // ─── ABANDONED CARTS ───────────────────────────────────────

  listAbandonedCarts: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.abandonedCarts.findMany({
        where: eq(abandonedCarts.storeId, input.storeId),
        orderBy: [desc(abandonedCarts.abandonedAt)],
      });
    }),

  // PUBLIC — Track abandoned cart from storefront
  trackAbandonedCart: publicProcedure
    .input(z.object({
      storeId: z.number(),
      customerEmail: z.string().email().optional(),
      customerPhone: z.string().optional(),
      customerName: z.string().optional(),
      cartItems: z.array(z.object({
        productId: z.number(),
        variantId: z.number().optional(),
        title: z.string(),
        price: z.string(),
        quantity: z.number(),
        image: z.string().optional(),
      })),
      cartTotal: z.string(),
    }))
    .mutation(async ({ input }) => {
      if (!input.customerEmail && !input.customerPhone) {
        return { success: false, error: "Need email or phone" };
      }

      const [cart] = await db.insert(abandonedCarts).values({
        storeId: input.storeId,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        customerName: input.customerName,
        cartItems: input.cartItems,
        cartTotal: input.cartTotal,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }).returning();

      return { success: true, id: cart.id };
    }),

  // Mark abandoned cart as recovered
  recoverCart: protectedProcedure
    .input(z.object({ id: z.number(), storeId: z.number(), orderId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const [updated] = await db.update(abandonedCarts)
        .set({
          status: "recovered",
          recoveredAt: new Date(),
          recoveryOrderId: input.orderId,
        })
        .where(and(eq(abandonedCarts.id, input.id), eq(abandonedCarts.storeId, input.storeId)))
        .returning();
      return updated;
    }),

  // ─── ANALYTICS OVERVIEW ─────────────────────────────────────

  getOverview: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      const [campaigns, automations, carts, subscriberList] = await Promise.all([
        db.query.marketingCampaigns.findMany({
          where: eq(marketingCampaigns.storeId, input.storeId),
        }),
        db.query.marketingAutomations.findMany({
          where: eq(marketingAutomations.storeId, input.storeId),
        }),
        db.query.abandonedCarts.findMany({
          where: eq(abandonedCarts.storeId, input.storeId),
        }),
        db.query.customers.findMany({
          where: and(eq(customers.storeId, input.storeId), eq(customers.acceptsMarketing, true)),
        }),
      ]);

      const sentCampaigns = campaigns.filter(c => c.status === "sent");
      const totalDelivered = sentCampaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
      const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.openedCount || 0), 0);
      const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.clickedCount || 0), 0);

      const activeCarts = carts.filter(c => c.status === "active");
      const recoveredCarts = carts.filter(c => c.status === "recovered");
      const totalCartValue = activeCarts.reduce((sum, c) => sum + parseFloat(c.cartTotal || "0"), 0);
      const recoveredValue = recoveredCarts.reduce((sum, c) => sum + parseFloat(c.cartTotal || "0"), 0);

      const activeAutomations = automations.filter(a => a.isActive);
      const automationRevenue = automations.reduce((sum, a) => sum + parseFloat(a.revenue?.toString() || "0"), 0);

      return {
        subscribers: subscriberList.length,
        campaigns: {
          total: campaigns.length,
          sent: sentCampaigns.length,
          draft: campaigns.filter(c => c.status === "draft").length,
          scheduled: campaigns.filter(c => c.status === "scheduled").length,
          totalDelivered,
          totalOpened,
          totalClicked,
          openRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
          clickRate: totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 100) : 0,
        },
        abandonedCarts: {
          total: carts.length,
          active: activeCarts.length,
          recovered: recoveredCarts.length,
          recoveryRate: carts.length > 0 ? Math.round((recoveredCarts.length / carts.length) * 100) : 0,
          totalCartValue,
          recoveredValue,
        },
        automations: {
          total: automations.length,
          active: activeAutomations.length,
          totalSent: automations.reduce((sum, a) => sum + (a.sentCount || 0), 0),
          totalConverted: automations.reduce((sum, a) => sum + (a.convertedCount || 0), 0),
          revenue: automationRevenue,
        },
      };
    }),
});
