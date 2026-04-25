import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { subscriptionRequests, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const subscriptionsRouter = router({
  // Submit a manual payment request
  submitManualPayment: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["starter", "growth", "scale", "empire"]),
        amount: z.string(),
        receiptImage: z.string().optional(), // Base64 or URL
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [request] = await db.insert(subscriptionRequests).values({
        merchantId: ctx.user.id,
        tier: input.tier,
        amount: input.amount,
        receiptImage: input.receiptImage,
        notes: input.notes,
        status: "pending",
      }).returning();

      return request;
    }),

  // Get user's pending requests
  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    return db.select()
      .from(subscriptionRequests)
      .where(eq(subscriptionRequests.merchantId, ctx.user.id))
      .orderBy(subscriptionRequests.createdAt);
  }),

  // Admin: Get all pending requests
  getAllPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return db.select()
      .from(subscriptionRequests)
      .where(eq(subscriptionRequests.status, "pending"))
      .orderBy(subscriptionRequests.createdAt);
  }),

  // Admin: Approve a request
  approveRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const [request] = await db.select()
        .from(subscriptionRequests)
        .where(eq(subscriptionRequests.id, input.requestId))
        .limit(1);

      if (!request) {
        throw new Error("Request not found");
      }

      // 1. Update request status
      await db.update(subscriptionRequests)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(subscriptionRequests.id, input.requestId));

      // 2. Update user's tier
      await db.update(users)
        .set({ 
          tier: request.tier,
          subscriptionStatus: "active",
          trialEndsAt: null
        })
        .where(eq(users.id, request.merchantId));

      return { success: true };
    }),

  // Admin: Reject a request
  rejectRequest: protectedProcedure
    .input(z.object({ requestId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db.update(subscriptionRequests)
        .set({ 
          status: "rejected", 
          adminNotes: input.reason,
          updatedAt: new Date() 
        })
        .where(eq(subscriptionRequests.id, input.requestId));

      return { success: true };
    }),
});
