import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
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

  // Get merchant's theme (for editor)
  getMyTheme: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify store ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.storeId, input.storeId))
        .limit(1);
      
      if (!theme) {
        // Create a default theme if none exists
        const [newTheme] = await db.insert(storeThemes).values({
          storeId: input.storeId,
          name: "Default Theme",
          isActive: true,
          sections: [
            { type: "hero", settings: { heading: "Welcome to Our Store", alignment: "center" } },
            { type: "featured_collection", settings: { title: "Featured Products", columns: 4, productLimit: 8 } }
          ],
        }).returning();
        return newTheme;
      }

      return theme;
    }),

  // Update theme settings (sections, colors, etc.)
  update: protectedProcedure
    .input(z.object({
      themeId: z.number(),
      sections: z.array(z.object({
        type: z.string(),
        settings: z.record(z.any()),
      })).optional(),
      colors: z.record(z.string()).optional(),
      typography: z.record(z.any()).optional(),
      name: z.string().optional(),
    }))
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

      const [updatedTheme] = await db.update(storeThemes)
        .set({
          name: input.name,
          sections: input.sections,
          colors: input.colors,
          typography: input.typography,
          updatedAt: new Date(),
        })
        .where(eq(storeThemes.id, input.themeId))
        .returning();

      return updatedTheme;
    }),
});
