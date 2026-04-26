import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { addDomainToVercel } from "../_core/vercel-api";
import { ENV } from "../_core/env";
import { canAccess } from "../utils/capabilities";
import { SubscriptionTier } from "../utils/featureRegistry";

export const storesRouter = router({
  // Create a new store for the merchant
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Store name is required"),
        slug: z.string().min(1, "Store slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Centralized Backend Enforcement
      await canAccess.createStore(ctx.user.id, ctx.user.tier as SubscriptionTier);

      // 2. Check if slug is already taken
      const existing = await db.getStoreBySlug(input.slug);
      if (existing) {
        throw new Error("This Store ID is already taken. Please choose another one.");
      }

      try {
        const store = await db.createStore({
          merchantId: ctx.user.id,
          name: input.name,
          slug: input.slug,
          description: input.description,
        });

        // AUTOMATION: Add slug.platformRoot (e.g. wazewear.raaenai.com) to Vercel project
        const fullSubdomain = `${input.slug}.${ENV.platformRoot}`;
        // We MUST await this on Vercel or the function will terminate before the API call finishes
        await addDomainToVercel(fullSubdomain).catch(err => console.error("Vercel automation failed:", err));

        return store;
      } catch (err: any) {
        throw new Error("Failed to create store. Please try again.");
      }
    }),

  // Get the merchant's stores
  getMyStores: protectedProcedure.query(async ({ ctx }) => {
    return db.getStoresByMerchantId(ctx.user.id);
  }),

  // Get the primary store (for compatibility)
  getMyStore: protectedProcedure.query(async ({ ctx }) => {
    return db.getStoreByMerchantId(ctx.user.id);
  }),

  // Get a store by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const store = await db.getStoreBySlug(input.slug);
      return store;
    }),

  // Get a store by custom domain (public)
  getByDomain: publicProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      const store = await db.getStoreByDomain(input.domain);
      return store;
    }),

  // Update store settings
  update: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        favicon: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        fontFamily: z.string().optional(),
        theme: z.enum(["light", "dark", "auto"]).optional(),
        customDomain: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { storeId, ...updateData } = input;
      
      // 1. Verify ownership
      const currentStore = await db.getStoreByMerchantId(ctx.user.id);
      if (!currentStore || currentStore.id !== storeId) {
        throw new Error("Unauthorized");
      }

      // 2. Feature Gating: Custom Domains
      if (input.customDomain && input.customDomain !== currentStore.customDomain) {
        canAccess.feature(ctx.user.tier as SubscriptionTier, "customDomains");
        
        // AUTOMATION: If custom domain is being added/changed, register it on Vercel
        await addDomainToVercel(input.customDomain).catch(err => console.error("Vercel custom domain automation failed:", err));
      }

      return db.updateStore(storeId, updateData);
    }),
});
