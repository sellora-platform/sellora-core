import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { reviews } from "../drizzle/schema";
import { eq, and, desc, avg, count, sql } from "drizzle-orm";

export const reviewsRouter = router({

  // PUBLIC — Get published reviews for a product
  getByProduct: publicProcedure
    .input(z.object({
      productId: z.number(),
      storeId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
      rating: z.number().optional(), // filter by star rating
      sort: z.enum(['latest', 'highest', 'lowest', 'helpful']).default('latest'),
    }))
    .query(async ({ input }) => {
      const conditions = [
        eq(reviews.productId, input.productId),
        eq(reviews.storeId, input.storeId),
        eq(reviews.published, true),
      ];

      if (input.rating) {
        conditions.push(eq(reviews.rating, input.rating));
      }

      const orderBy = {
        latest: desc(reviews.createdAt),
        highest: desc(reviews.rating),
        lowest: reviews.rating,
        helpful: desc(reviews.helpfulCount),
      }[input.sort];

      const items = await db
        .select()
        .from(reviews)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      // Get rating summary
      const summary = await db
        .select({
          avgRating: avg(reviews.rating),
          totalCount: count(reviews.id),
          five: sql<number>`count(*) filter (where ${reviews.rating} = 5)`,
          four: sql<number>`count(*) filter (where ${reviews.rating} = 4)`,
          three: sql<number>`count(*) filter (where ${reviews.rating} = 3)`,
          two: sql<number>`count(*) filter (where ${reviews.rating} = 2)`,
          one: sql<number>`count(*) filter (where ${reviews.rating} = 1)`,
        })
        .from(reviews)
        .where(and(
          eq(reviews.productId, input.productId),
          eq(reviews.storeId, input.storeId),
          eq(reviews.published, true),
        ));

      return {
        reviews: items,
        summary: summary[0],
      };
    }),

  // PUBLIC — Customer submits a review
  submit: publicProcedure
    .input(z.object({
      productId: z.number(),
      storeId: z.number(),
      authorName: z.string().min(1).max(255),
      authorEmail: z.string().email().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().max(255).optional(),
      body: z.string().max(2000).optional(),
      images: z.array(z.object({ url: z.string() })).max(5).default([]),
    }))
    .mutation(async ({ input }) => {
      const [review] = await db
        .insert(reviews)
        .values({
          ...input,
          source: "customer",
          published: false, // needs merchant approval
          verified: false,
        })
        .returning();

      return { success: true, id: review.id };
    }),

  // PROTECTED — Merchant adds a review manually
  create: protectedProcedure
    .input(z.object({
      productId: z.number(),
      storeId: z.number(),
      authorName: z.string().min(1).max(255),
      authorEmail: z.string().email().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().max(255).optional(),
      body: z.string().max(2000).optional(),
      images: z.array(z.object({ url: z.string() })).max(5).default([]),
      verified: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const [review] = await db
        .insert(reviews)
        .values({
          ...input,
          source: "merchant",
          published: true, // merchant reviews auto-published
        })
        .returning();

      return review;
    }),

  // PROTECTED — Merchant lists all reviews for their store
  list: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      productId: z.number().optional(),
      published: z.boolean().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const conditions = [eq(reviews.storeId, input.storeId)];

      if (input.productId) {
        conditions.push(eq(reviews.productId, input.productId));
      }
      if (input.published !== undefined) {
        conditions.push(eq(reviews.published, input.published));
      }

      const items = await db
        .select()
        .from(reviews)
        .where(and(...conditions))
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return items;
    }),

  // PROTECTED — Merchant approves/rejects a review
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      published: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(reviews)
        .set({ published: input.published, updatedAt: new Date() })
        .where(eq(reviews.id, input.id))
        .returning();

      return updated;
    }),

  // PROTECTED — Merchant deletes a review
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(reviews).where(eq(reviews.id, input.id));
      return { success: true };
    }),

  // PROTECTED — Update any review field
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      authorName: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
      title: z.string().optional(),
      body: z.string().optional(),
      images: z.array(z.object({ url: z.string() })).optional(),
      verified: z.boolean().optional(),
      published: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [updated] = await db
        .update(reviews)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(reviews.id, id))
        .returning();
      return updated;
    }),

  // PUBLIC — Mark review as helpful
  markHelpful: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
        .where(eq(reviews.id, input.id));
      return { success: true };
    }),
});
