import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

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
      // Check if slug is already taken
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
        return store;
      } catch (err: any) {
        throw new Error("Failed to create store. Please try again.");
      }
    }),

  // Get the merchant's store
  getMyStore: protectedProcedure.query(async ({ ctx }) => {
    const store = await db.getStoreByMerchantId(ctx.user.id);
    return store;
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
      
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== storeId) {
        throw new Error("Unauthorized");
      }

      return db.updateStore(storeId, updateData);
    }),
});
