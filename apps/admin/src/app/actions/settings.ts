'use server';

import { db } from '@/lib/db';
import { platformSettings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DEFAULT_SETTINGS = [
  { key: "payment_bank_name", value: "", label: "Bank Name", group: "payment" },
  { key: "payment_account_title", value: "", label: "Account Title", group: "payment" },
  { key: "payment_iban", value: "", label: "IBAN / Account Number", group: "payment" },
  { key: "payment_jazzcash", value: "", label: "JazzCash Number", group: "payment" },
  { key: "payment_easypaisa", value: "", label: "Easypaisa Number", group: "payment" },
  { key: "payment_instructions", value: "Send payment to the account details above, then submit your receipt for verification.", label: "Payment Instructions", group: "payment" },
  { key: "plan_starter_price", value: "4999", label: "Starter Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_growth_price", value: "12999", label: "Growth Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_scale_price", value: "24999", label: "Scale Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_empire_price", value: "49999", label: "Empire Plan Price (PKR/month)", group: "pricing" },
  { key: "plan_currency", value: "PKR", label: "Currency Symbol", group: "pricing" },
  { key: "platform_name", value: "Sellora", label: "Platform Name", group: "general" },
  { key: "support_email", value: "support@sellora.com", label: "Support Email", group: "general" },
  { key: "support_whatsapp", value: "", label: "Support WhatsApp", group: "general" },
];

export async function getPlatformSettings() {
  try {
    let rows = await db.select().from(platformSettings);

    // Seed defaults on first fetch
    if (rows.length === 0) {
      for (const s of DEFAULT_SETTINGS) {
        await db.insert(platformSettings).values(s).onConflictDoNothing();
      }
      rows = await db.select().from(platformSettings);
    }

    return rows;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
}

export async function updatePlatformSettings(settings: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(settings)) {
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

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
