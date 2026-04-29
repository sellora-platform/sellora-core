import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function deepFixUsersTable() {
  console.log("🚀 Starting deep fix for 'users' table...");

  const commands = [
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_signed_in" timestamp DEFAULT now() NOT NULL;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tier" text DEFAULT 'free' NOT NULL;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'trialing';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lifecycle_status" varchar(20) DEFAULT 'trialing' NOT NULL;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_status" jsonb DEFAULT '{"step":"account_setup","completedSteps":[]}';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activation_status" jsonb DEFAULT '{"hasCreatedStore":false,"hasAddedProduct":false,"hasPublishedTheme":false,"activatedAt":null}';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp DEFAULT (CURRENT_TIMESTAMP + interval '7 days');`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" varchar(255);`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" varchar(255);`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "parent_merchant_id" integer;`,
  ];

  for (const cmd of commands) {
    try {
      console.log(`Executing: ${cmd.substring(0, 50)}...`);
      await db.execute(sql.raw(cmd));
    } catch (err: any) {
      console.warn(`⚠️ Note: ${err.message}`);
    }
  }

  console.log("✅ Users table is now synchronized with the latest schema!");
}

deepFixUsersTable().catch(console.error);
