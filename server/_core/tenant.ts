import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { stores, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Tenant Isolation Layer: Prevents cross-tenant data leakage.
 * Enforces merchantId/storeId scoping at the query level.
 */
export const TenantGuard = {
  /**
   * Enforces that a merchant can only access their own resources.
   */
  async assertOwnership(merchantId: number, resourceMerchantId: number) {
    if (merchantId !== resourceMerchantId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Security Violation: Cross-tenant access detected.",
      });
    }
  },

  /**
   * Scopes a database query to a specific merchant.
   */
  merchantScope(merchantId: number) {
    return eq(users.id, merchantId);
  },

  /**
   * Scopes a database query to a merchant's stores.
   */
  storeScope(merchantId: number) {
    return eq(stores.merchantId, merchantId);
  }
};
