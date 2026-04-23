import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storesRouter } from "./routers/stores";
import { productsRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { discountsRouter } from "./routers/discounts";
import { aiRouter } from "./routers/ai";
import { exportsRouter } from "./routers/exports";

export const appRouter = router({
  system: systemRouter,
  exports: exportsRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  stores: storesRouter,
  products: productsRouter,
  orders: ordersRouter,
  discounts: discountsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
