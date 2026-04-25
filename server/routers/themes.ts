import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db, getStoreByMerchantId } from "../db";
import { storeThemes } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const themesRouter = router({
  // Get active theme for a store
  getByStoreId: publicProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(and(eq(storeThemes.storeId, input.storeId), eq(storeThemes.isActive, true)))
        .limit(1);
      return theme;
    }),

  // List all themes for the current user's store
  listByStore: protectedProcedure
    .query(async ({ ctx }) => {
      const store = await getStoreByMerchantId(ctx.user.id);
      if (!store) return [];

      return db.select()
        .from(storeThemes)
        .where(eq(storeThemes.storeId, store.id));
    }),

  // List all marketplace themes
  listMarketplace: publicProcedure
    .query(async () => {
      return db.select()
        .from(storeThemes)
        .where(eq(storeThemes.isPublic, true));
    }),

  // Get a specific theme by ID
  getById: protectedProcedure
    .input(z.object({ themeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.id, input.themeId))
        .limit(1);

      if (!theme) throw new Error("Theme not found");

      // Verify store ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== theme.storeId) {
        throw new Error("Unauthorized");
      }

      return theme;
    }),

  // Create a new theme (Add to Library)
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      colors: z.record(z.string(), z.any()).optional(),
      typography: z.record(z.string(), z.any()).optional(),
      sections: z.record(z.string(), z.any()).optional(),
      isPublic: z.boolean().optional(),
      price: z.string().optional(),
      category: z.string().optional(),
      previewImage: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await getStoreByMerchantId(ctx.user.id);
      if (!store) throw new Error("Store not found");

      const [newTheme] = await db.insert(storeThemes).values({
        storeId: store.id,
        name: input.name,
        description: input.description,
        colors: input.colors || {},
        typography: input.typography || {},
        sections: (input.sections as any) || { index: [], product: [], cart: [], checkout: [] },
        isPublic: input.isPublic || false,
        price: input.price || "0.00",
        category: input.category || "General",
        previewImage: input.previewImage,
        isActive: false, 
      }).returning();

      return newTheme;
    }),

  // Publish a theme (Make it Live)
  publish: protectedProcedure
    .input(z.object({ themeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.id, input.themeId))
        .limit(1);

      if (!theme) throw new Error("Theme not found");

      // Verify store ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== theme.storeId) {
        throw new Error("Unauthorized");
      }

      // 1. Set all store themes to inactive
      await db.update(storeThemes)
        .set({ isActive: false })
        .where(eq(storeThemes.storeId, store.id));

      // 2. Set this theme to active
      const [updatedTheme] = await db.update(storeThemes)
        .set({ isActive: true })
        .where(eq(storeThemes.id, input.themeId))
        .returning();

      return updatedTheme;
    }),

  // Delete a theme
  delete: protectedProcedure
    .input(z.object({ themeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.id, input.themeId))
        .limit(1);

      if (!theme) throw new Error("Theme not found");
      if (theme.isActive) throw new Error("Cannot delete active theme");

      // Verify store ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== theme.storeId) {
        throw new Error("Unauthorized");
      }

      await db.delete(storeThemes).where(eq(storeThemes.id, input.themeId));
      return { success: true };
    }),

  // Duplicate a theme
  duplicate: protectedProcedure
    .input(z.object({ themeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.id, input.themeId))
        .limit(1);

      if (!theme) throw new Error("Theme not found");

      const [newTheme] = await db.insert(storeThemes).values({
        storeId: theme.storeId,
        name: `${theme.name} (Copy)`,
        description: theme.description,
        colors: theme.colors,
        typography: theme.typography,
        layout: theme.layout,
        sections: theme.sections,
        isActive: false,
      }).returning();

      return newTheme;
    }),

  // Update theme settings
  update: protectedProcedure
    .input(z.object({
      themeId: z.number(),
      sections: z.record(z.string(), z.array(z.object({
        id: z.string(),
        type: z.string(),
        settings: z.record(z.string(), z.any()),
      }))).optional(),
      colors: z.record(z.string(), z.any()).optional(),
      typography: z.record(z.string(), z.any()).optional(),
      name: z.string().optional(),
      isPublic: z.boolean().optional(),
      price: z.string().optional(),
      category: z.string().optional(),
      previewImage: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.id, input.themeId))
        .limit(1);

      if (!theme) throw new Error("Theme not found");

      // Verify store ownership
      const store = await getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== theme.storeId) {
        throw new Error("Unauthorized");
      }

      const [updatedTheme] = await db.update(storeThemes)
        .set({
          name: input.name,
          sections: input.sections as any,
          colors: input.colors as any,
          typography: input.typography as any,
          isPublic: input.isPublic,
          price: input.price,
          category: input.category,
          previewImage: input.previewImage,
          updatedAt: new Date(),
        })
        .where(eq(storeThemes.id, input.themeId))
        .returning();

      return updatedTheme;
    }),

  // Toggle Marketplace Status
  toggleMarketplace: protectedProcedure
    .input(z.object({ 
      themeId: z.number(), 
      isPublic: z.boolean(),
      price: z.string().optional(),
      category: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.id, input.themeId))
        .limit(1);

      if (!theme) throw new Error("Theme not found");

      // Verify store ownership (only store owner or admin can publish)
      const store = await getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== theme.storeId) {
        throw new Error("Unauthorized");
      }

      const [updatedTheme] = await db.update(storeThemes)
        .set({
          isPublic: input.isPublic,
          price: input.price,
          category: input.category,
          updatedAt: new Date(),
        })
        .where(eq(storeThemes.id, input.themeId))
        .returning();

      return updatedTheme;
    }),
});
