import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { storeThemes } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// Validation schema for theme config
const ThemeConfigSchema = z.object({
  schemaVersion: z.number(),
  templates: z.object({
    home: z.object({
      sections: z.record(z.string(), z.any()),
      order: z.array(z.string()),
    }),
  }),
});

export const themesRouter = router({
  /**
   * Get the current draft theme for a store
   */
  getTheme: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // In production, we'd verify merchant ownership of the storeId here
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.storeId, input.storeId))
        .limit(1);

      if (!theme) {
        // Return a default initial theme if none exists
        return null;
      }

      return theme;
    }),

  /**
   * Save a theme as a draft
   */
  saveTheme: protectedProcedure
    .input(z.object({ 
      storeId: z.number(), 
      themeJson: z.any() 
    }))
    .mutation(async ({ input }) => {
      // 1. Validate the theme structure
      const validated = ThemeConfigSchema.parse(input.themeJson);

      // 2. Check if theme record exists
      const [existing] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.storeId, input.storeId))
        .limit(1);

      if (existing) {
        // Update existing draft
        const [updated] = await db.update(storeThemes)
          .set({
            draftConfig: validated,
            schemaVersion: validated.schemaVersion,
            updatedAt: new Date(),
          })
          .where(eq(storeThemes.storeId, input.storeId))
          .returning();
        return updated;
      } else {
        // Create new theme record
        const [created] = await db.insert(storeThemes)
          .values({
            id: nanoid(),
            storeId: input.storeId,
            name: "Default Theme",
            draftConfig: validated,
            schemaVersion: validated.schemaVersion,
          })
          .returning();
        return created;
      }
    }),

  /**
   * Get a specific theme by its UUID
   */
  getById: publicProcedure
    .input(z.object({ themeId: z.string() }))
    .query(async ({ input }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.id, input.themeId))
        .limit(1);
      return theme || null;
    }),

  /**
   * Promote draftConfig to publishedConfig
   */
  publishTheme: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .mutation(async ({ input }) => {
      const [theme] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.storeId, input.storeId))
        .limit(1);

      if (!theme) throw new Error("Theme not found");

      const [published] = await db.update(storeThemes)
        .set({
          publishedConfig: theme.draftConfig,
          updatedAt: new Date(),
        })
        .where(eq(storeThemes.storeId, input.storeId))
        .returning();

      return published;
    }),
});
