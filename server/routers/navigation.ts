import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const navigationRouter = router({
  // ─── Create a menu ──────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const handle = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      return db.createNavigationMenu({
        storeId: input.storeId,
        name: input.name,
        handle,
      });
    }),

  // ─── List menus for a store ──────────────────────────────────
  list: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.getNavigationMenusByStoreId(input.storeId);
    }),

  // ─── Public query for storefront ───────────────────────────
  getItems: router({
    byId: publicProcedure
      .input(z.object({ menuId: z.number() }))
      .query(async ({ input }) => {
        return db.getNavigationItemsByMenuId(input.menuId);
      }),
    byHandle: publicProcedure
      .input(z.object({ storeId: z.number(), handle: z.string() }))
      .query(async ({ input }) => {
        const menus = await db.getNavigationMenusByStoreId(input.storeId);
        const menu = menus.find(m => m.handle === input.handle);
        if (!menu) return [];
        return db.getNavigationItemsByMenuId(menu.id);
      }),
  }),

  // ─── Get a menu with its items (Protected) ───────────────────
  get: protectedProcedure
    .input(z.object({ menuId: z.number(), storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const menu = await db.getNavigationMenuById(input.menuId);
      if (!menu || menu.storeId !== input.storeId) {
        throw new Error("Menu not found");
      }

      const items = await db.getNavigationItemsByMenuId(input.menuId);
      return { ...menu, items };
    }),

  // ─── Update a menu and its items ──────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        menuId: z.number(),
        storeId: z.number(),
        name: z.string().optional(),
        items: z.array(z.object({
          label: z.string().min(1),
          url: z.string().min(1),
          parentId: z.number().nullable().optional(),
          displayOrder: z.number().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const menu = await db.getNavigationMenuById(input.menuId);
      if (!menu || menu.storeId !== input.storeId) {
        throw new Error("Menu not found");
      }

      // Update menu name/handle if provided
      if (input.name) {
        const handle = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await db.updateNavigationMenu(input.menuId, { name: input.name, handle, updatedAt: new Date() });
      }

      // Update items if provided
      if (input.items) {
        const itemsToInsert = input.items.map((item, idx) => ({
          menuId: input.menuId,
          label: item.label,
          url: item.url,
          parentId: item.parentId || null,
          displayOrder: item.displayOrder ?? idx,
        }));
        await db.upsertNavigationItems(input.menuId, itemsToInsert);
      }

      return { success: true };
    }),

  // ─── Delete a menu ──────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ menuId: z.number(), storeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const menu = await db.getNavigationMenuById(input.menuId);
      if (!menu || menu.storeId !== input.storeId) {
        throw new Error("Menu not found");
      }

      await db.deleteNavigationMenu(input.menuId);
      return { success: true };
    }),
});
