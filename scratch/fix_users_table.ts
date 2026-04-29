import "dotenv/config";
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixUserColumns() {
  console.log("Adding missing columns to 'users' table...");

  try {
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_signed_in" timestamp DEFAULT now() NOT NULL;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_code" varchar(6);`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lifecycle_status" varchar(20) DEFAULT 'trialing' NOT NULL;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activation_status" jsonb DEFAULT '{"hasCreatedStore":false,"hasAddedProduct":false,"hasPublishedTheme":false,"activatedAt":null}';`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp DEFAULT (CURRENT_TIMESTAMP + interval '7 days');`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" varchar(255);`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" varchar(255);`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "parent_merchant_id" integer;`);
    
    console.log("Successfully added missing columns!");
  } catch (err) {
    console.error("Failed to add columns:", err);
  }
}

fixUserColumns().catch(console.error);
