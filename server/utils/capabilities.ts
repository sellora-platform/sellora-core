import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { stores, users } from "../../drizzle/schema";
import { eq, count } from "drizzle-orm";
import { FEATURE_REGISTRY, SubscriptionTier } from "./featureRegistry";

/**
 * Capabilities Layer: Enforces plan limits and feature access.
 * This is the final authority before any mutation is allowed.
 */
export const canAccess = {
  /**
   * Checks if a user can create another store based on their plan.
   */
  async createStore(userId: number, currentTier: SubscriptionTier) {
    const plan = FEATURE_REGISTRY[currentTier];
    
    // Count existing stores for this merchant
    const [result] = await db
      .select({ value: count() })
      .from(stores)
      .where(eq(stores.merchantId, userId));
    
    const storeCount = result?.value || 0;

    if (plan.limits.maxStores !== -1 && storeCount >= plan.limits.maxStores) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Plan limit reached: Your ${plan.name} plan allows a maximum of ${plan.limits.maxStores} stores.`,
      });
    }

    return true;
  },

  /**
   * Checks if a user can invite another staff member.
   */
  async inviteStaff(userId: number, currentTier: SubscriptionTier) {
    const plan = FEATURE_REGISTRY[currentTier];

    const [result] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.parentMerchantId, userId));
    
    const staffCount = result?.value || 0;

    if (plan.limits.maxStaff !== -1 && staffCount >= plan.limits.maxStaff) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Plan limit reached: Your ${plan.name} plan allows a maximum of ${plan.limits.maxStaff} staff accounts.`,
      });
    }

    return true;
  },

  /**
   * Checks if a user can create another theme for a store.
   */
  async createTheme(storeId: number, currentTier: SubscriptionTier) {
    const plan = FEATURE_REGISTRY[currentTier];

    const [result] = await db
      .select({ value: count() })
      .from(storeThemes)
      .where(eq(storeThemes.storeId, storeId));
    
    const themeCount = result?.value || 0;

    if (plan.limits.maxThemes !== -1 && themeCount >= plan.limits.maxThemes) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Plan limit reached: Your ${plan.name} plan allows a maximum of ${plan.limits.maxThemes} themes per store.`,
      });
    }

    return true;
  },

  /**
   * Checks boolean feature access.
   */
  feature(tier: SubscriptionTier, featureName: keyof typeof FEATURE_REGISTRY["free"]["features"]) {
    const plan = FEATURE_REGISTRY[tier];
    const allowed = plan.features[featureName];

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Feature locked: The ${featureName} feature is not available on your current plan.`,
      });
    }

    return true;
  }
};
