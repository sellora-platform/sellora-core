import { db } from "../db";
import { users, stores, storeThemes, tenantUsage, auditLogs } from "../../drizzle/schema";
import { eq, count, and } from "drizzle-orm";
import { BillingSyncEngine } from "./billing";
import { UsageEngine } from "./usage";
import { AuditEngine } from "./audit";

/**
 * Global Reconciliation Engine: The "Self-Healing" layer for Sellora.
 * Responsibilities: Drift detection, automated correction, and system consistency.
 */
export const ReconciliationEngine = {
  /**
   * Performs a full consistency check for a specific merchant.
   */
  async reconcileMerchant(merchantId: number) {
    const correlationId = `reconcile-${Date.now()}-${merchantId}`;
    console.log(`[Recon] Starting reconciliation for merchant ${merchantId} (Correlation: ${correlationId})`);

    try {
      // 1. Billing & Plan Consistency (Source of Truth: Billing Records)
      const billingState = await BillingSyncEngine.syncUserPlanFromBilling(merchantId);
      
      // 2. Usage Consistency (Source of Truth: Actual DB Resource Counts)
      await this.reconcileUsage(merchantId, correlationId);

      // 3. Audit Log Completion (Optional: Check if critical events are missing)
      
      await AuditEngine.log({
        userId: merchantId,
        actionType: "RECONCILIATION_COMPLETED",
        metadata: { correlationId, billingState }
      });

      return { success: true, correlationId };
    } catch (error) {
      console.error(`[Recon] FAILED for merchant ${merchantId}:`, error);
      await AuditEngine.log({
        userId: merchantId,
        actionType: "RECONCILIATION_FAILED",
        success: false,
        metadata: { correlationId, error: (error as Error).message }
      });
      throw error;
    }
  },

  /**
   * Recalculates and updates usage counters from ground-truth database state.
   */
  async reconcileUsage(merchantId: number, correlationId: string) {
    // A. Reconcile Store Count
    const [storeResult] = await db
      .select({ value: count() })
      .from(stores)
      .where(eq(stores.merchantId, merchantId));
    
    const actualStoreCount = storeResult?.value || 0;
    const trackedStoreCount = await UsageEngine.get(merchantId, "stores_count");

    if (actualStoreCount !== trackedStoreCount) {
      console.warn(`[Recon] Usage drift detected (stores): Expected ${actualStoreCount}, Found ${trackedStoreCount}`);
      await UsageEngine.set(merchantId, "stores_count", actualStoreCount);
      await AuditEngine.log({
        userId: merchantId,
        actionType: "USAGE_RECONCILED",
        resourceType: "STORE",
        metadata: { correlationId, metric: "stores_count", old: trackedStoreCount, new: actualStoreCount }
      });
    }

    // B. Reconcile Staff Count
    const [staffResult] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.parentMerchantId, merchantId));
    
    const actualStaffCount = staffResult?.value || 0;
    const trackedStaffCount = await UsageEngine.get(merchantId, "staff_count");

    if (actualStaffCount !== trackedStaffCount) {
      console.warn(`[Recon] Usage drift detected (staff): Expected ${actualStaffCount}, Found ${trackedStaffCount}`);
      await UsageEngine.set(merchantId, "staff_count", actualStaffCount);
      await AuditEngine.log({
        userId: merchantId,
        actionType: "USAGE_RECONCILED",
        resourceType: "STAFF",
        metadata: { correlationId, metric: "staff_count", old: trackedStaffCount, new: actualStaffCount }
      });
    }

    // C. Reconcile Theme Count (Per Store)
    const merchantStores = await db.select().from(stores).where(eq(stores.merchantId, merchantId));
    for (const store of merchantStores) {
      const [themeResult] = await db
        .select({ value: count() })
        .from(storeThemes)
        .where(eq(storeThemes.storeId, store.id));
      
      const actualThemeCount = themeResult?.value || 0;
      const trackedThemeCount = await UsageEngine.get(store.id, "themes_count");

      if (actualThemeCount !== trackedThemeCount) {
        await UsageEngine.set(store.id, "themes_count", actualThemeCount);
        await AuditEngine.log({
          userId: merchantId,
          actionType: "USAGE_RECONCILED",
          resourceType: "THEME",
          metadata: { correlationId, storeId: store.id, metric: "themes_count", old: trackedThemeCount, new: actualThemeCount }
        });
      }
    }
  }
};
