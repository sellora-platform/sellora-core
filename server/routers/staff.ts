import { z } from "zod";
import { protectedProcedure, auditedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { canAccess } from "../utils/capabilities";
import { SubscriptionTier } from "../utils/featureRegistry";
import { TRPCError } from "@trpc/server";
import { UsageEngine } from "../utils/usage";

export const staffRouter = router({
  /**
   * Invite a new staff member (Enforced by Plan Limits)
   */
  invite: auditedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.enum(["user", "admin"]).default("user"),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Backend Enforcement: Check if merchant has staff slots available
      await canAccess.inviteStaff(ctx.user.id, ctx.user.tier as SubscriptionTier);

      // 2. Check if user already exists
      const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists.",
        });
      }

      // 3. Create staff user linked to this merchant
      const [staff] = await db.insert(users).values({
        name: input.name,
        email: input.email,
        role: input.role,
        parentMerchantId: ctx.user.id,
        isVerified: true, // Auto-verify for now in demo
        subscriptionStatus: "active",
        tier: ctx.user.tier as SubscriptionTier, // Staff inherits merchant's tier for feature gating
      }).returning();

      // 4. Usage Tracking
      await UsageEngine.increment(ctx.user.id, "staff_count");

      return staff;
    }),

  /**
   * List all staff members
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.select()
      .from(users)
      .where(eq(users.parentMerchantId, ctx.user.id));
  }),
});
