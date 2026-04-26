import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq, isNull } from "drizzle-orm";
import { ReconciliationEngine } from "../utils/reconciliationEngine";

/**
 * Background Consistency Job: Periodically audits all tenants.
 */
export const runGlobalReconciliation = async () => {
  console.log("[Job] Starting Global Consistency Check...");
  const startTime = Date.now();

  try {
    // 1. Fetch all primary merchant accounts
    const merchants = await db
      .select()
      .from(users)
      .where(isNull(users.parentMerchantId)); // Only main accounts, not staff

    console.log(`[Job] Found ${merchants.length} merchants to reconcile.`);

    // 2. Reconcile each merchant
    let successCount = 0;
    let failCount = 0;

    for (const merchant of merchants) {
      try {
        await ReconciliationEngine.reconcileMerchant(merchant.id);
        successCount++;
      } catch (err) {
        console.error(`[Job] Error reconciling merchant ${merchant.id}:`, err);
        failCount++;
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`[Job] Global Consistency Check Finished in ${duration}s. Success: ${successCount}, Failed: ${failCount}`);
  } catch (err) {
    console.error("[Job] CRITICAL ERROR IN RECONCILIATION JOB:", err);
  }
};

/**
 * Simple scheduler (In production, use node-cron or a dedicated worker)
 */
export const startReconciliationScheduler = (intervalMinutes: number = 30) => {
  console.log(`[Job] Scheduler started. Running every ${intervalMinutes} minutes.`);
  
  // Run immediately on start
  runGlobalReconciliation();

  // Schedule periodic runs
  setInterval(() => {
    runGlobalReconciliation();
  }, intervalMinutes * 60 * 1000);
};
