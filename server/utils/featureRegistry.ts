/**
 * Feature Registry: Source of truth for Plan-based capabilities.
 * Defines limits and features for each subscription tier.
 */

export type SubscriptionTier = "free" | "starter" | "growth" | "scale" | "empire";

export interface PlanDefinition {
  id: SubscriptionTier;
  name: string;
  limits: {
    maxStores: number;
    maxStaff: number;
    maxThemes: number;
  };
  features: {
    aiAssistant: boolean;
    advancedAnalytics: boolean;
    customDomains: boolean;
    themeMarketplace: boolean;
    profitIntelligence: "basic" | "standard" | "advanced" | "predictive";
  };
}

export const FEATURE_REGISTRY: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free Trial",
    limits: {
      maxStores: 1,
      maxStaff: 1,
      maxThemes: 1,
    },
    features: {
      aiAssistant: true,
      advancedAnalytics: false,
      customDomains: false,
      themeMarketplace: false,
      profitIntelligence: "basic",
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    limits: {
      maxStores: 1,
      maxStaff: 2,
      maxThemes: 3,
    },
    features: {
      aiAssistant: true,
      advancedAnalytics: false,
      customDomains: true,
      themeMarketplace: true,
      profitIntelligence: "basic",
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    limits: {
      maxStores: 3,
      maxStaff: 10,
      maxThemes: 10,
    },
    features: {
      aiAssistant: true,
      advancedAnalytics: true,
      customDomains: true,
      themeMarketplace: true,
      profitIntelligence: "standard",
    },
  },
  scale: {
    id: "scale",
    name: "Scale",
    limits: {
      maxStores: 10,
      maxStaff: 50,
      maxThemes: 50,
    },
    features: {
      aiAssistant: true,
      advancedAnalytics: true,
      customDomains: true,
      themeMarketplace: true,
      profitIntelligence: "advanced",
    },
  },
  empire: {
    id: "empire",
    name: "Empire",
    limits: {
      maxStores: 100,
      maxStaff: -1, // Unlimited
      maxThemes: -1, // Unlimited
    },
    features: {
      aiAssistant: true,
      advancedAnalytics: true,
      customDomains: true,
      themeMarketplace: true,
      profitIntelligence: "predictive",
    },
  },
};
