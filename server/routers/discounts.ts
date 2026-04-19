import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const discountsRouter = router({
  // Create a discount code
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        code: z.string().min(1).toUpperCase(),
        type: z.enum(["percentage", "fixed_amount"]),
        value: z.string(),
        minPurchase: z.string().optional(),
        maxUses: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.createDiscount({
        storeId: input.storeId,
        code: input.code,
        type: input.type,
        value: parseFloat(input.value) as any,
        minPurchase: input.minPurchase ? (parseFloat(input.minPurchase) as any) : undefined,
        maxUses: input.maxUses,
        startDate: input.startDate,
        endDate: input.endDate,
        isActive: true,
      });
    }),

  // List discounts for a store
  listByStore: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.getDiscountsByStoreId(input.storeId);
    }),

  // Validate and apply a discount code
  validate: publicProcedure
    .input(
      z.object({
        code: z.string(),
        cartTotal: z.string(),
      })
    )
    .query(async ({ input }) => {
      const discount = await db.getDiscountByCode(input.code.toUpperCase());

      if (!discount) {
        return { valid: false, error: "Discount code not found" };
      }

      if (!discount.isActive) {
        return { valid: false, error: "Discount code is inactive" };
      }

      const now = new Date();
      if (discount.startDate && discount.startDate > now) {
        return { valid: false, error: "Discount code is not yet active" };
      }

      if (discount.endDate && discount.endDate < now) {
        return { valid: false, error: "Discount code has expired" };
      }

      if (discount.maxUses && (discount.usedCount || 0) >= discount.maxUses) {
        return { valid: false, error: "Discount code has reached max uses" };
      }

      const cartTotalNum = parseFloat(input.cartTotal);
      if (discount.minPurchase && cartTotalNum < parseFloat(discount.minPurchase.toString())) {
        return { valid: false, error: `Minimum purchase of $${discount.minPurchase} required` };
      }

      let discountAmount = 0;
      if (discount.type === "percentage") {
        discountAmount = (cartTotalNum * parseFloat(discount.value.toString())) / 100;
      } else {
        discountAmount = parseFloat(discount.value.toString());
      }

      return {
        valid: true,
        discount: {
          id: discount.id,
          code: discount.code,
          type: discount.type,
          value: discount.value.toString(),
          discountAmount: discountAmount.toFixed(2),
        },
      };
    }),

  // Update a discount
  update: protectedProcedure
    .input(
      z.object({
        discountId: z.number(),
        storeId: z.number(),
        isActive: z.boolean().optional(),
        maxUses: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const { discountId, storeId, ...updateData } = input;
      return db.updateDiscount(discountId, updateData);
    }),
});
