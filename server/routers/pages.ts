import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../db";
import { pages } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const pagesRouter = router({
  // PUBLIC — Get page by slug for storefront
  getBySlug: publicProcedure
    .input(z.object({ 
      storeId: z.number(), 
      slug: z.string() 
    }))
    .query(async ({ input }) => {
      const page = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.storeId, input.storeId),
            eq(pages.slug, input.slug),
            eq(pages.isPublished, true)
          )
        )
        .limit(1);

      if (!page[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found"
        });
      }

      return page[0];
    }),

  // PROTECTED — List all pages for merchant
  list: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(pages)
        .where(eq(pages.storeId, input.storeId));
    }),

  // PROTECTED — Get single page by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const page = await db
        .select()
        .from(pages)
        .where(eq(pages.id, input.id))
        .limit(1);
      
      if (!page[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return page[0];
    }),

  // PROTECTED — Create page
  create: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string(),
      isPublished: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(pages).values({
        storeId: input.storeId,
        title: input.title,
        slug: input.slug,
        content: input.content,
        isPublished: input.isPublished,
      }).returning();
      
      return result[0];
    }),

  // PROTECTED — Update page
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      content: z.string().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await db.update(pages)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(pages.id, id))
        .returning();
      
      return result[0];
    }),

  // PROTECTED — Delete page
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(pages).where(eq(pages.id, input.id));
      return { success: true };
    }),
});
