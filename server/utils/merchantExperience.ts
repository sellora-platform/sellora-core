import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { AuditEngine } from "./audit";

/**
 * Merchant Experience Engine: Manages onboarding, activation, and lifecycle.
 * Ensures merchants are guided through the platform and activation events are tracked.
 */
export const MerchantExperienceEngine = {
  /**
   * Tracks an activation event (e.g., 'store_created') and updates onboarding state.
   */
  async trackActivation(userId: number, event: "hasCreatedStore" | "hasAddedProduct" | "hasPublishedTheme") {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) return;

      const currentActivation = user.activationStatus || { hasCreatedStore: false, hasAddedProduct: false, hasPublishedTheme: false, activatedAt: null };
      const currentOnboarding = user.onboardingStatus || { step: "account_setup", completedSteps: [] };

      // 1. Update Activation Flags
      const nextActivation = { ...currentActivation, [event]: true };
      
      // If all critical events are done, mark as activated
      if (nextActivation.hasCreatedStore && nextActivation.hasPublishedTheme && !nextActivation.activatedAt) {
        nextActivation.activatedAt = new Date().toISOString();
      }

      // 2. Map Event to Onboarding Step
      let nextStep = currentOnboarding.step;
      const completedSteps = new Set(currentOnboarding.completedSteps);
      
      if (event === "hasCreatedStore") {
        nextStep = "theme_selected";
        completedSteps.add("store_created");
      } else if (event === "hasPublishedTheme") {
        nextStep = "completed";
        completedSteps.add("first_publish");
      }

      // 3. Update User Record
      await db
        .update(users)
        .set({
          activationStatus: nextActivation,
          onboardingStatus: { step: nextStep, completedSteps: Array.from(completedSteps) as any },
          lifecycleStatus: nextActivation.activatedAt ? "active" : "trialing"
        })
        .where(eq(users.id, userId));

      // 4. Log to Audit Log for Analytics
      await AuditEngine.log({
        userId,
        actionType: "ACTIVATION_EVENT",
        metadata: { event, nextStep }
      });
    } catch (error) {
      console.error("FAILED TO TRACK ACTIVATION:", error);
    }
  },

  /**
   * Evaluates if a merchant is at risk of churn or needs an upgrade prompt.
   */
  async getMerchantPulse(userId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return null;

    const trialDaysLeft = user.trialEndsAt 
      ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      lifecycle: user.lifecycleStatus,
      trialDaysLeft: Math.max(0, trialDaysLeft),
      onboardingStep: user.onboardingStatus?.step,
      isActivated: !!user.activationStatus?.activatedAt,
      needsUpgrade: trialDaysLeft <= 2 || user.tier === "free"
    };
  }
};
