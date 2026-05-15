import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { platformSettings } from "../../db/schema";
import { eq } from "drizzle-orm";

/**
 * Default platform settings — seeded on first fetch if table is empty.
 * Admin can update these from the CRM settings page.
 */
const DEFAULT_SETTINGS: { key: string; value: string; label: string; group: string }[] = [
  // ── Payment Details (shown to merchants on billing page) ──
  { key: "payment_bank_name", value: "", label: "Bank Name", group: "payment" },
  { key: "payment_account_title", value: "", label: "Account Title", group: "payment" },
  { key: "payment_iban", value: "", label: "IBAN / Account Number", group: "payment" },
  { key: "payment_jazzcash", value: "", label: "JazzCash Number", group: "payment" },
  { key: "payment_easypaisa", value: "", label: "Easypaisa Number", group: "payment" },
  { key: "payment_instructions", value: "Send payment to the account details above, then submit your receipt for verification.", label: "Payment Instructions", group: "payment" },

  // ── Plan Pricing (PKR) ──
  { key: "plan_starter_price", value: "4999", label: "Starter Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_growth_price", value: "12999", label: "Growth Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_scale_price", value: "24999", label: "Scale Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_empire_price", value: "49999", label: "Empire Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_currency", value: "PKR", label: "Currency Symbol", group: "pricing" },

  // ── General ──
  { key: "platform_name", value: "Sellora", label: "Platform Name", group: "general" },
  { key: "support_email", value: "support@sellora.com", label: "Support Email", group: "general" },
  { key: "support_whatsapp", value: "", label: "Support WhatsApp", group: "general" },
];

export const platformSettingsRouter = router({
  /**
   * Get all settings (grouped). Seeds defaults if empty.
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    let rows = await db.select().from(platformSettings);

    // Seed defaults on first ever fetch
    if (rows.length === 0) {
      for (const s of DEFAULT_SETTINGS) {
        await db.insert(platformSettings).values(s).onConflictDoNothing();
      }
      rows = await db.select().from(platformSettings);
    }

    return rows;
  }),

  /**
   * Update a single setting by key.
   */
  update: protectedProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const existing = await db.select().from(platformSettings)
        .where(eq(platformSettings.key, input.key)).limit(1);

      if (existing.length > 0) {
        await db.update(platformSettings)
          .set({ value: input.value.trim(), updatedAt: new Date() })
          .where(eq(platformSettings.key, input.key));
      } else {
        // Auto-create if not exists
        await db.insert(platformSettings).values({
          key: input.key,
          value: input.value.trim(),
          label: input.key,
          group: "general",
        });
      }

      return { success: true };
    }),

  /**
   * Bulk update multiple settings at once.
   */
  bulkUpdate: protectedProcedure
    .input(z.object({ settings: z.record(z.string(), z.string()) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      for (const [key, value] of Object.entries(input.settings)) {
        const existing = await db.select().from(platformSettings)
          .where(eq(platformSettings.key, key)).limit(1);

        if (existing.length > 0) {
          await db.update(platformSettings)
            .set({ value: value.trim(), updatedAt: new Date() })
            .where(eq(platformSettings.key, key));
        } else {
          await db.insert(platformSettings).values({
            key, value: value.trim(), label: key, group: "general",
          });
        }
      }

      return { success: true };
    }),

  /**
   * Public: Get payment & pricing settings (for billing page — no admin required).
   * Only returns payment + pricing groups. No sensitive admin data.
   */
  getPublic: protectedProcedure.query(async () => {
    let rows = await db.select().from(platformSettings);

    // Seed defaults if empty
    if (rows.length === 0) {
      for (const s of DEFAULT_SETTINGS) {
        await db.insert(platformSettings).values(s).onConflictDoNothing();
      }
      rows = await db.select().from(platformSettings);
    }

    // Filter to only payment + pricing
    const publicRows = rows.filter(r => r.group === "payment" || r.group === "pricing");
    const map: Record<string, string> = {};
    publicRows.forEach(r => { map[r.key] = r.value; });
    return map;
  }),
});
