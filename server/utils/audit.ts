import { db } from "../db";
import { auditLogs } from "../../drizzle/schema";
import { JobQueue } from "./queue";
import { nanoid } from "nanoid";

/**
 * Audit Logging Engine: Tracks critical security and resource events.
 */
export const AuditEngine = {
  /**
   * Logs a mutation or critical action to the database asynchronously.
   */
  async log(params: {
    userId?: number;
    actionType: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: any;
    success?: boolean;
    ipAddress?: string;
    correlationId?: string;
  }) {
    const jobId = `audit-${nanoid()}`;

    // Dispatch to background queue to prevent blocking the main request
    JobQueue.enqueue(jobId, async () => {
      try {
        const meta = params.metadata || {};
        if (params.correlationId) {
          meta.correlationId = params.correlationId;
        }

        await db.insert(auditLogs).values({
          userId: params.userId,
          actionType: params.actionType,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          metadata: meta,
          success: params.success !== undefined ? params.success : true,
          ipAddress: params.ipAddress,
        });
      } catch (error) {
        console.error("FAILED TO WRITE AUDIT LOG IN BACKGROUND:", error);
      }
    });
  }
};
