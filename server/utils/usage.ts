import { db } from "../db";
import { tenantUsage } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Usage Tracking Engine: Authoritative record of merchant resource utilization.
 */
export const UsageEngine = {
  /**
   * Increments a specific usage metric for a merchant.
   */
  async increment(merchantId: number, metricName: string, amount: number = 1) {
    try {
      await db
        .insert(tenantUsage)
        .values({
          merchantId,
          metricName,
          currentCount: amount,
        })
        .onConflictDoUpdate({
          target: [tenantUsage.merchantId, tenantUsage.metricName],
          set: {
            currentCount: sql`${tenantUsage.currentCount} + ${amount}`,
            lastUpdated: new Date(),
          },
        });
    } catch (error) {
      console.error(`FAILED TO INCREMENT USAGE (${metricName}):`, error);
    }
  },

  /**
   * Sets the absolute value of a usage metric.
   */
  async set(merchantId: number, metricName: string, count: number) {
    try {
      await db
        .insert(tenantUsage)
        .values({
          merchantId,
          metricName,
          currentCount: count,
        })
        .onConflictDoUpdate({
          target: [tenantUsage.merchantId, tenantUsage.metricName],
          set: {
            currentCount: count,
            lastUpdated: new Date(),
          },
        });
    } catch (error) {
      console.error(`FAILED TO SET USAGE (${metricName}):`, error);
    }
  },

  /**
   * Retrieves usage for a specific metric.
   */
  async get(merchantId: number, metricName: string) {
    const [usage] = await db
      .select()
      .from(tenantUsage)
      .where(and(eq(tenantUsage.merchantId, merchantId), eq(tenantUsage.metricName, metricName)))
      .limit(1);
    
    return usage?.currentCount || 0;
  }
};
