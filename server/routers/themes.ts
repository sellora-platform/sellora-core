import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { storeThemes, editorEvents } from "../../drizzle/schema";
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
      themeJson: z.any(),
      expectedVersion: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const validated = ThemeConfigSchema.parse(input.themeJson);

      const [existing] = await db.select()
        .from(storeThemes)
        .where(eq(storeThemes.storeId, input.storeId))
        .limit(1);

      if (existing) {
        // Conflict Detection
        if (input.expectedVersion !== undefined && existing.version > input.expectedVersion) {
          return {
            status: "conflict",
            serverTheme: existing.draftConfig,
            serverVersion: existing.version
          };
        }

        const [updated] = await db.update(storeThemes)
          .set({
            draftConfig: validated,
            schemaVersion: validated.schemaVersion,
            version: existing.version + 1,
            updatedAt: new Date(),
          })
          .where(eq(storeThemes.storeId, input.storeId))
          .returning();
        return { status: "success", theme: updated };
      } else {
        const [created] = await db.insert(storeThemes)
          .values({
            id: nanoid(),
            storeId: input.storeId,
            name: "Default Theme",
            draftConfig: validated,
            schemaVersion: validated.schemaVersion,
            version: 1,
          })
          .returning();
        return { status: "success", theme: created };
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

  /**
   * Append granular events to the store's event log
   */
  appendEvents: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      events: z.array(z.object({
        type: z.string(),
        payload: z.any().optional(),
        sectionId: z.string().optional(),
        blockId: z.string().optional(),
        timestamp: z.number()
      })),
      baseVersion: z.number()
    }))
    .mutation(async ({ input }) => {
      // 1. Batch insert events
      const eventValues = input.events.map((e, i) => ({
        id: nanoid(),
        storeId: input.storeId,
        type: e.type,
        payload: e.payload,
        version: input.baseVersion + i + 1,
        createdAt: new Date(e.timestamp)
      }));

      await db.insert(editorEvents).values(eventValues);

      // 2. Update the theme's current version
      const newVersion = input.baseVersion + input.events.length;
      await db.update(storeThemes)
        .set({ 
          version: newVersion,
          updatedAt: new Date()
        })
        .where(eq(storeThemes.storeId, input.storeId));

      return { status: "success", newVersion };
    }),
});
