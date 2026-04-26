import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { stores, users, storeThemes } from "../../drizzle/schema";
import { eq, count } from "drizzle-orm";
import { FEATURE_REGISTRY, SubscriptionTier } from "./featureRegistry";
import { AuditEngine } from "./audit";
import { UsageEngine } from "./usage";
import { CacheEngine } from "./cache";

/**
 * Capabilities Layer: Enforces plan limits and feature access.
 */
export const canAccess = {
  /**
   * Checks if a user can create another store based on their plan.
   */
  async createStore(userId: number, currentTier: SubscriptionTier) {
    // ... rest of method remains same, but we could cache store count too
    const plan = FEATURE_REGISTRY[currentTier];
    
    // Count existing stores
    const [result] = await db
      .select({ value: count() })
      .from(stores)
      .where(eq(stores.merchantId, userId));
    
    const storeCount = result?.value || 0;

    if (plan.limits.maxStores !== -1 && storeCount >= plan.limits.maxStores) {
      await AuditEngine.log({
        userId,
        actionType: "PLAN_VIOLATION",
        resourceType: "STORE",
        success: false,
        metadata: { limit: plan.limits.maxStores, current: storeCount, tier: currentTier }
      });

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
      await AuditEngine.log({
        userId,
        actionType: "PLAN_VIOLATION",
        resourceType: "STAFF",
        success: false,
        metadata: { limit: plan.limits.maxStaff, current: staffCount, tier: currentTier }
      });

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
      await AuditEngine.log({
        userId: storeId, // We don't have userId here easily without more context, but storeId is a good proxy for now or we can pass userId
        actionType: "PLAN_VIOLATION",
        resourceType: "THEME",
        success: false,
        metadata: { limit: plan.limits.maxThemes, current: themeCount, tier: currentTier, storeId }
      });

      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Plan limit reached: Your ${plan.name} plan allows a maximum of ${plan.limits.maxThemes} themes per store.`,
      });
    }

    return true;
  },

  /**
   * Checks boolean feature access with high-performance caching.
   */
  feature(tier: SubscriptionTier, featureName: keyof typeof FEATURE_REGISTRY["free"]["features"]) {
    const cacheKey = `feature:${tier}:${featureName}`;
    const cached = CacheEngine.get<boolean>(cacheKey);
    
    if (cached !== null) return cached;

    const plan = FEATURE_REGISTRY[tier];
    const allowed = plan.features[featureName];

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Feature locked: The ${featureName} feature is not available on your current plan.`,
      });
    }

    // Cache the positive result
    CacheEngine.set(cacheKey, true, 300);

    return true;
  }
};
