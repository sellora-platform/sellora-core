import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { customers } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

export const customersRouter = router({
  list: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.customers.findMany({
        where: eq(customers.storeId, input.storeId),
        orderBy: [desc(customers.createdAt)],
      });
    }),
});
