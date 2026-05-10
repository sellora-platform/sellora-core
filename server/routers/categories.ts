import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const categoriesRouter = router({
  // ─── Create a category ─────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      // Generate a basic slug
      const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      return db.createCategory({
        storeId: input.storeId,
        name: input.name,
        slug,
        description: input.description,
        image: input.image,
      });
    }),

  // ─── List categories for a store ─────────────────────────────
  listByStore: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.getCategoriesByStoreId(input.storeId);
    }),

  // ─── Update a category ─────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        categoryId: z.number(),
        storeId: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }
      
      const category = await db.getCategoryById(input.categoryId);
      if (!category || category.storeId !== input.storeId) {
         throw new Error("Category not found");
      }

      let slug = category.slug;
      if (input.name) {
         slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }

      return db.updateCategory(input.categoryId, {
        name: input.name,
        slug,
        description: input.description,
        image: input.image,
        updatedAt: new Date(),
      });
    }),

  // ─── Delete a category ─────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ categoryId: z.number(), storeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }
      
      const category = await db.getCategoryById(input.categoryId);
      if (!category || category.storeId !== input.storeId) {
         throw new Error("Category not found");
      }

      await db.deleteCategory(input.categoryId);
      return { success: true };
    }),
});
