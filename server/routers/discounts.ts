import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const discountsRouter = router({
  // ─── Create a discount ─────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        title: z.string().min(1),
        code: z.string().min(1).toUpperCase(),
        description: z.string().optional(),
        method: z.enum(["code", "automatic"]),
        type: z.enum(["percentage", "fixed_amount"]),
        scope: z.enum(["order", "products", "shipping"]),
        value: z.string(),
        maxDiscount: z.string().optional(),
        appliesTo: z.enum(["all", "specific_products", "specific_collections"]).default("all"),
        productIds: z.array(z.number()).optional(),
        collectionIds: z.array(z.number()).optional(),
        minPurchase: z.string().optional(),
        minQuantity: z.number().optional(),
        maxUses: z.number().optional(),
        maxUsesPerCustomer: z.number().optional(),
        combinesWith: z.object({
          productDiscounts: z.boolean(),
          orderDiscounts: z.boolean(),
          shippingDiscounts: z.boolean(),
        }).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      // Check for duplicate code
      const existing = await db.getDiscountByCode(input.code);
      if (existing) {
        throw new Error("A discount with this code already exists");
      }

      return db.createDiscount({
        storeId: input.storeId,
        title: input.title,
        code: input.code,
        description: input.description,
        method: input.method,
        type: input.type,
        scope: input.scope,
        value: parseFloat(input.value) as any,
        maxDiscount: input.maxDiscount ? (parseFloat(input.maxDiscount) as any) : undefined,
        appliesTo: input.appliesTo,
        productIds: input.productIds || [],
        collectionIds: input.collectionIds || [],
        minPurchase: input.minPurchase ? (parseFloat(input.minPurchase) as any) : undefined,
        minQuantity: input.minQuantity,
        maxUses: input.maxUses,
        maxUsesPerCustomer: input.maxUsesPerCustomer,
        combinesWith: input.combinesWith || { productDiscounts: false, orderDiscounts: false, shippingDiscounts: false },
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        isActive: true,
      });
    }),

  // ─── List discounts for a store ─────────────────────────────
  listByStore: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.getDiscountsByStoreId(input.storeId);
    }),

  // ─── Get analytics for discounts ────────────────────────────
  getAnalytics: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const discounts = await db.getDiscountsByStoreId(input.storeId);
      
      let active = 0;
      let scheduled = 0;
      let expired = 0;
      let totalUsed = 0;

      const now = new Date();

      for (const d of discounts) {
        if (d.usedCount) totalUsed += d.usedCount;
        
        if (!d.isActive) continue;
        
        if (d.endDate && new Date(d.endDate) < now) {
          expired++;
        } else if (d.startDate && new Date(d.startDate) > now) {
          scheduled++;
        } else {
          active++;
        }
      }

      return {
        total: discounts.length,
        active,
        scheduled,
        expired,
        totalUsed,
      };
    }),

  // ─── Get single discount by ID ──────────────────────────────
  getById: protectedProcedure
    .input(z.object({ discountId: z.number(), storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }
      return db.getDiscountById(input.discountId);
    }),

  // ─── Update a discount ─────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        discountId: z.number(),
        storeId: z.number(),
        title: z.string().optional(),
        code: z.string().optional(),
        description: z.string().optional(),
        method: z.enum(["code", "automatic"]).optional(),
        type: z.enum(["percentage", "fixed_amount"]).optional(),
        scope: z.enum(["order", "products", "shipping"]).optional(),
        value: z.string().optional(),
        maxDiscount: z.string().nullable().optional(),
        appliesTo: z.enum(["all", "specific_products", "specific_collections"]).optional(),
        productIds: z.array(z.number()).optional(),
        collectionIds: z.array(z.number()).optional(),
        minPurchase: z.string().nullable().optional(),
        minQuantity: z.number().nullable().optional(),
        maxUses: z.number().nullable().optional(),
        maxUsesPerCustomer: z.number().nullable().optional(),
        combinesWith: z.object({
          productDiscounts: z.boolean(),
          orderDiscounts: z.boolean(),
          shippingDiscounts: z.boolean(),
        }).optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const { discountId, storeId, ...updateData } = input;
      const cleanData: any = {};

      if (updateData.title !== undefined) cleanData.title = updateData.title;
      if (updateData.code !== undefined) cleanData.code = updateData.code.toUpperCase();
      if (updateData.description !== undefined) cleanData.description = updateData.description;
      if (updateData.method !== undefined) cleanData.method = updateData.method;
      if (updateData.type !== undefined) cleanData.type = updateData.type;
      if (updateData.scope !== undefined) cleanData.scope = updateData.scope;
      if (updateData.value !== undefined) cleanData.value = parseFloat(updateData.value);
      if (updateData.maxDiscount !== undefined) cleanData.maxDiscount = updateData.maxDiscount ? parseFloat(updateData.maxDiscount) : null;
      if (updateData.appliesTo !== undefined) cleanData.appliesTo = updateData.appliesTo;
      if (updateData.productIds !== undefined) cleanData.productIds = updateData.productIds;
      if (updateData.collectionIds !== undefined) cleanData.collectionIds = updateData.collectionIds;
      if (updateData.minPurchase !== undefined) cleanData.minPurchase = updateData.minPurchase ? parseFloat(updateData.minPurchase) : null;
      if (updateData.minQuantity !== undefined) cleanData.minQuantity = updateData.minQuantity;
      if (updateData.maxUses !== undefined) cleanData.maxUses = updateData.maxUses;
      if (updateData.maxUsesPerCustomer !== undefined) cleanData.maxUsesPerCustomer = updateData.maxUsesPerCustomer;
      if (updateData.combinesWith !== undefined) cleanData.combinesWith = updateData.combinesWith;
      if (updateData.startDate !== undefined) cleanData.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
      if (updateData.endDate !== undefined) cleanData.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
      if (updateData.isActive !== undefined) cleanData.isActive = updateData.isActive;

      return db.updateDiscount(discountId, cleanData);
    }),

  // ─── Delete a discount ─────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ discountId: z.number(), storeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }
      await db.deleteDiscount(input.discountId);
      return { success: true };
    }),

  // ─── Duplicate a discount ──────────────────────────────────
  duplicate: protectedProcedure
    .input(z.object({ discountId: z.number(), storeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }
      const original = await db.getDiscountById(input.discountId);
      if (!original) throw new Error("Discount not found");

      const newCode = `${original.code}-COPY-${Date.now().toString(36).slice(-4).toUpperCase()}`;

      return db.createDiscount({
        storeId: original.storeId,
        title: `${original.title} (Copy)`,
        code: newCode,
        description: original.description,
        method: original.method,
        type: original.type,
        scope: original.scope,
        value: original.value,
        maxDiscount: original.maxDiscount,
        appliesTo: original.appliesTo,
        productIds: original.productIds as number[],
        collectionIds: original.collectionIds as number[],
        minPurchase: original.minPurchase,
        minQuantity: original.minQuantity,
        maxUses: original.maxUses,
        maxUsesPerCustomer: original.maxUsesPerCustomer,
        combinesWith: original.combinesWith as any,
        startDate: original.startDate,
        endDate: original.endDate,
        isActive: false, // Duplicates start inactive
      });
    }),

  // ─── Toggle active status ──────────────────────────────────
  toggleActive: protectedProcedure
    .input(z.object({ discountId: z.number(), storeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }
      const discount = await db.getDiscountById(input.discountId);
      if (!discount) throw new Error("Discount not found");

      return db.updateDiscount(input.discountId, { isActive: !discount.isActive });
    }),

  // ─── Validate & apply a discount code (Storefront) ─────────
  validate: publicProcedure
    .input(
      z.object({
        code: z.string(),
        storeId: z.number(),
        cartTotal: z.string(),
        cartItemCount: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const discount = await db.getDiscountByCode(input.code.toUpperCase());

      if (!discount) {
        return { valid: false, error: "Discount code not found" };
      }

      // Must belong to the same store
      if (discount.storeId !== input.storeId) {
        return { valid: false, error: "Discount code not found" };
      }

      if (!discount.isActive) {
        return { valid: false, error: "This discount is no longer active" };
      }

      // Must be a coupon code type (not automatic)
      if (discount.method === "automatic") {
        return { valid: false, error: "This discount is applied automatically" };
      }

      const now = new Date();
      if (discount.startDate && discount.startDate > now) {
        return { valid: false, error: "This discount is not yet active" };
      }

      if (discount.endDate && discount.endDate < now) {
        return { valid: false, error: "This discount has expired" };
      }

      if (discount.maxUses && (discount.usedCount || 0) >= discount.maxUses) {
        return { valid: false, error: "This discount has reached its usage limit" };
      }

      const cartTotalNum = parseFloat(input.cartTotal);
      if (discount.minPurchase && cartTotalNum < parseFloat(discount.minPurchase.toString())) {
        return { valid: false, error: `Minimum purchase of $${parseFloat(discount.minPurchase.toString()).toFixed(2)} required` };
      }

      if (discount.minQuantity && input.cartItemCount && input.cartItemCount < discount.minQuantity) {
        return { valid: false, error: `Minimum ${discount.minQuantity} items required` };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (discount.scope === "shipping") {
        // Free shipping - return a flag
        return {
          valid: true,
          discount: {
            id: discount.id,
            code: discount.code,
            title: discount.title,
            type: "free_shipping" as const,
            scope: discount.scope,
            value: "0",
            discountAmount: "0",
            freeShipping: true,
          },
        };
      } else if (discount.type === "percentage") {
        discountAmount = (cartTotalNum * parseFloat(discount.value.toString())) / 100;
        // Apply max discount cap if set
        if (discount.maxDiscount) {
          discountAmount = Math.min(discountAmount, parseFloat(discount.maxDiscount.toString()));
        }
      } else {
        discountAmount = parseFloat(discount.value.toString());
      }

      // Never discount more than cart total
      discountAmount = Math.min(discountAmount, cartTotalNum);

      return {
        valid: true,
        discount: {
          id: discount.id,
          code: discount.code,
          title: discount.title,
          type: discount.type,
          scope: discount.scope,
          value: discount.value.toString(),
          discountAmount: discountAmount.toFixed(2),
          freeShipping: false,
        },
      };
    }),

  // ─── Increment usage after successful order ─────────────────
  incrementUsage: publicProcedure
    .input(z.object({ discountId: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementDiscountUsage(input.discountId);
      return { success: true };
    }),

  // ─── Get analytics summary ──────────────────────────────────
  getAnalytics: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const allDiscounts = await db.getDiscountsByStoreId(input.storeId);
      const now = new Date();

      const active = allDiscounts.filter((d: any) => d.isActive && (!d.endDate || new Date(d.endDate) >= now));
      const expired = allDiscounts.filter((d: any) => d.endDate && new Date(d.endDate) < now);
      const scheduled = allDiscounts.filter((d: any) => d.startDate && new Date(d.startDate) > now);
      const totalUsed = allDiscounts.reduce((sum: number, d: any) => sum + (d.usedCount || 0), 0);

      return {
        total: allDiscounts.length,
        active: active.length,
        expired: expired.length,
        scheduled: scheduled.length,
        totalUsed,
        topDiscounts: allDiscounts
          .filter((d: any) => (d.usedCount || 0) > 0)
          .sort((a: any, b: any) => (b.usedCount || 0) - (a.usedCount || 0))
          .slice(0, 5)
          .map((d: any) => ({
            code: d.code,
            title: d.title,
            usedCount: d.usedCount,
            type: d.type,
            value: d.value,
          })),
      };
    }),
});
