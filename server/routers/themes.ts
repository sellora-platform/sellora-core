import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { storeThemes, editorEvents, themeSnapshots } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
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
   * Append granular events to the store's event log with Idempotency
   */
  appendEvents: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      themeId: z.string(),
      clientId: z.string(),
      events: z.array(z.object({
        eventId: z.string(), // Client-side UUID
        type: z.string(),
        payload: z.any().optional(),
        sectionId: z.string().optional(),
        blockId: z.string().optional(),
        timestamp: z.number()
      })),
      baseVersion: z.number()
    }))
    .mutation(async ({ input }) => {
      const themeId = input.themeId;

      // 1. Idempotency Check: Filter out already processed eventIds
      const eventIds = input.events.map(e => e.eventId);
      const existingEvents = await db.select({ eventId: editorEvents.eventId })
        .from(editorEvents)
        .where(inArray(editorEvents.eventId, eventIds));
      
      const existingIds = new Set(existingEvents.map(e => e.eventId));
      const newEvents = input.events.filter(e => !existingIds.has(e.eventId));

      if (newEvents.length === 0) {
        return { status: "success", message: "All events already processed" };
      }

      // 2. Batch insert new events
      const eventValues = newEvents.map((e, i) => ({
        id: nanoid(),
        eventId: e.eventId,
        themeId: themeId,
        clientId: input.clientId,
        type: e.type,
        payload: e.payload,
        version: input.baseVersion + i + 1,
        createdAt: new Date(e.timestamp)
      }));

      await db.insert(editorEvents).values(eventValues);

      // 3. Update theme version
      const newVersion = input.baseVersion + newEvents.length;
      await db.update(storeThemes)
        .set({ 
          version: newVersion,
          updatedAt: new Date()
        })
        .where(eq(storeThemes.storeId, input.storeId));

      // 4. Snapshot Optimization (Every 100 events)
      if (newVersion % 100 === 0) {
        // Fetch current full theme state to create snapshot
        // In a real system, we'd rebuild it or use the draftConfig
        const [theme] = await db.select().from(storeThemes).where(eq(storeThemes.storeId, input.storeId)).limit(1);
        if (theme) {
          await db.insert(themeSnapshots).values({
            id: nanoid(),
            themeId: themeId,
            state: theme.draftConfig,
            lastEventId: eventValues[eventValues.length - 1].eventId,
            version: newVersion,
          });
        }
      }

      return { status: "success", newVersion };
    }),
});
