import { db } from "../db";
import { users, subscriptionRequests } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { SubscriptionTier } from "./featureRegistry";

/**
 * Billing Synchronization Engine: Authoritative source for plan state.
 * Ensures the user's tier and status always match their actual billing status.
 */
export const BillingSyncEngine = {
  /**
   * Synchronizes a merchant's plan based on their latest approved billing records.
   */
  async syncUserPlanFromBilling(userId: number) {
    try {
      // 1. Fetch latest approved subscription request
      const [latestApproved] = await db
        .select()
        .from(subscriptionRequests)
        .where(
          and(
            eq(subscriptionRequests.merchantId, userId),
            eq(subscriptionRequests.status, "approved")
          )
        )
        .orderBy(desc(subscriptionRequests.updatedAt))
        .limit(1);

      if (latestApproved) {
        // 2. Update user record to match billing state
        await db
          .update(users)
          .set({
            tier: latestApproved.tier as SubscriptionTier,
            subscriptionStatus: "active",
            trialEndsAt: null, // Once paid, trial ends
          })
          .where(eq(users.id, userId));
        
        return { tier: latestApproved.tier, status: "active" };
      }

      // 3. Fallback: Check if user is still in trial
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user?.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
        return { tier: user.tier, status: "trialing" };
      }

      // 4. Fallback: Plan expired / unpaid
      if (user && user.tier !== "free") {
        await db.update(users)
          .set({ subscriptionStatus: "past_due" }) // Or "expired"
          .where(eq(users.id, userId));
      }

      return { tier: user?.tier || "free", status: user?.subscriptionStatus || "inactive" };
    } catch (error) {
      console.error("FAILED TO SYNC PLAN FROM BILLING:", error);
      throw error;
    }
  }
};
