import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { plans } from "../drizzle/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Seeding plans...");

  const planData = [
    {
      tier: "starter" as const,
      name: "Starter",
      monthlyPrice: "19.00",
      yearlyPrice: "190.00", // ~2 months free
      maxStores: 1,
      maxStaff: 2,
      transactionFee: "1.50",
      profitIntelligenceLevel: "basic" as const,
    },
    {
      tier: "growth" as const,
      name: "Growth",
      monthlyPrice: "49.00",
      yearlyPrice: "490.00",
      maxStores: 3,
      maxStaff: 10,
      transactionFee: "0.80",
      profitIntelligenceLevel: "standard" as const,
    },
    {
      tier: "scale" as const,
      name: "Scale",
      monthlyPrice: "99.00",
      yearlyPrice: "990.00",
      maxStores: 10,
      maxStaff: 100, // Effectively unlimited for scale
      transactionFee: "0.40",
      profitIntelligenceLevel: "advanced" as const,
    },
    {
      tier: "empire" as const,
      name: "Empire",
      monthlyPrice: "499.00",
      yearlyPrice: "4990.00",
      maxStores: 100, // Effectively unlimited
      maxStaff: null, // Unlimited
      transactionFee: "0.10",
      profitIntelligenceLevel: "predictive" as const,
    },
  ];

  for (const plan of planData) {
    try {
      await db.insert(plans).values(plan).onConflictDoUpdate({
        target: plans.tier,
        set: plan,
      });
      console.log(`✅ Seeded plan: ${plan.name}`);
    } catch (error) {
      console.error(`❌ Error seeding plan ${plan.name}:`, error);
    }
  }

  console.log("✨ Seeding complete!");
}

seed().catch(console.error);
