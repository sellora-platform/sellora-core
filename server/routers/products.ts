import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

const productImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  displayOrder: z.number(),
});

export const productsRouter = router({
  // Create a product
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        categoryId: z.number().optional(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/),
        compareAtPrice: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        quantity: z.number().default(0),
        trackQuantity: z.boolean().default(true),
        weight: z.string().optional(),
        weightUnit: z.string().default("kg"),
        images: z.array(productImageSchema).default([]),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify store ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.createProduct({
        storeId: input.storeId,
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        shortDescription: input.shortDescription,
        price: parseFloat(input.price) as any,
        compareAtPrice: input.compareAtPrice ? parseFloat(input.compareAtPrice) as any : undefined,
        sku: input.sku,
        barcode: input.barcode,
        quantity: input.quantity,
        trackQuantity: input.trackQuantity,
        weight: input.weight ? parseFloat(input.weight) as any : undefined,
        weightUnit: input.weightUnit,
        images: input.images,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
      });
    }),

  // Get products by store
  listByStore: publicProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return db.getProductsByStoreId(input.storeId);
    }),

  // Get a single product
  getById: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const product = await db.getProductById(input.productId);
      if (!product) throw new Error("Product not found");
      return product;
    }),

  // Update a product
  update: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        storeId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        quantity: z.number().optional(),
        images: z.array(productImageSchema).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const { productId, storeId, price, ...updateData } = input;
      return db.updateProduct(productId, {
        ...updateData,
        price: price ? (parseFloat(price) as any) : undefined,
      });
    }),

  // Delete a product
  delete: protectedProcedure
    .input(z.object({ productId: z.number(), storeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.deleteProduct(input.productId);
    }),
});
