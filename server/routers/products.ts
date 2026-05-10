import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, auditedProcedure, publicProcedure, router, protectedStoreProcedure, auditedStoreProcedure } from "../_core/trpc";
import * as db from "../db";
import { MerchantExperienceEngine } from "../utils/merchantExperience";

export const productsRouter = router({
  // Create a product
  create: auditedStoreProcedure
    .input(
      z.object({
        storeId: z.number(),
        categoryId: z.number().optional(),
        name: z.string().min(1, "Title is required"),
        slug: z.string().min(1),
        description: z.string().min(1, "Description is required"),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
        compareAtPrice: z.string().optional(),
        costPrice: z.string().optional(),
        sku: z.string().optional(),
        quantity: z.number().default(0),
        weight: z.number().optional(), // In grams
        images: z.array(z.string()).default([]), // Array of URLs
        isActive: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Double check storeId (middleware usually handles this, but being explicit as requested)
      if (!ctx.storeId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "storeId is required" });
      }

      // Map simple string images to the DB JSONB format
      const dbImages = input.images.map((url, index) => ({
        url,
        alt: input.name,
        displayOrder: index,
      }));

      const product = await db.createProduct({
        storeId: ctx.storeId, // Using verified storeId from context
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: parseFloat(input.price) as any,
        compareAtPrice: input.compareAtPrice ? (parseFloat(input.compareAtPrice) as any) : undefined,
        costPrice: input.costPrice ? (parseFloat(input.costPrice) as any) : "0.00",
        sku: input.sku,
        quantity: input.quantity,
        weight: input.weight ? (input.weight.toString() as any) : undefined,
        images: dbImages as any,
        isActive: input.isActive,
      });

      // Activation Tracking
      await MerchantExperienceEngine.trackActivation(ctx.user.id, "hasAddedProduct");

      return product;
    }),

  // Get products by store (Merchant view - protected)
  listByStore: protectedStoreProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ ctx }) => {
      // Verified storeId injected by middleware
      return db.getProductsByStoreId(ctx.storeId);
    }),

  // Public list (e.g. for storefront)
  publicList: publicProcedure
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
  update: auditedStoreProcedure
    .input(
      z.object({
        productId: z.number(),
        storeId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        compareAtPrice: z.string().optional(),
        costPrice: z.string().optional(),
        quantity: z.number().optional(),
        weight: z.number().optional(),
        images: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        categoryId: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verification handled by middleware
      const { productId, storeId, price, compareAtPrice, costPrice, images, ...updateData } = input;
      
      const dbImages = images ? images.map((url, index) => ({
        url,
        alt: input.name || "Product Image",
        displayOrder: index,
      })) : undefined;

      return db.updateProduct(productId, {
        ...updateData,
        price: price ? (parseFloat(price) as any) : undefined,
        compareAtPrice: compareAtPrice ? (parseFloat(compareAtPrice) as any) : undefined,
        costPrice: costPrice ? (parseFloat(costPrice) as any) : undefined,
        weight: input.weight ? (input.weight.toString() as any) : undefined,
        images: dbImages as any,
        categoryId: input.categoryId === 0 ? null : input.categoryId,
      });
    }),

  // Delete a product
  delete: protectedStoreProcedure
    .input(z.object({ productId: z.number(), storeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verification handled by middleware
      return db.deleteProduct(input.productId);
    }),

  // Batch update products (Bulk Edit)
  batchUpdate: auditedStoreProcedure
    .input(z.object({
      storeId: z.number(),
      productIds: z.array(z.number()),
      isActive: z.boolean().optional(),
      categoryId: z.number().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {};
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
      
      if (Object.keys(updateData).length === 0) return { success: true };
      
      await db.batchUpdateProducts(input.productIds, updateData);
      return { success: true };
    }),

  // Batch delete products
  batchDelete: auditedStoreProcedure
    .input(z.object({ storeId: z.number(), productIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      await db.batchDeleteProducts(input.productIds);
      return { success: true };
    }),

  // Batch create products (for CSV Import)
  batchCreate: auditedStoreProcedure
    .input(z.object({
      storeId: z.number(),
      products: z.array(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        compareAtPrice: z.string().optional(),
        costPrice: z.string().optional(),
        sku: z.string().optional(),
        quantity: z.number().optional(),
        isActive: z.boolean().optional(),
        images: z.array(z.string()).optional(),
        categoryId: z.number().optional(),
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      const productsToInsert = input.products.map(p => {
         const dbImages = p.images ? p.images.map((url, index) => ({
          url,
          alt: p.name,
          displayOrder: index,
        })) : [];

        return {
          storeId: ctx.storeId,
          categoryId: p.categoryId,
          name: p.name,
          slug: p.slug,
          description: p.description || "",
          price: parseFloat(p.price) as any,
          compareAtPrice: p.compareAtPrice ? (parseFloat(p.compareAtPrice) as any) : undefined,
          costPrice: p.costPrice ? (parseFloat(p.costPrice) as any) : "0.00",
          sku: p.sku,
          quantity: p.quantity || 0,
          isActive: p.isActive !== false,
          images: dbImages as any,
        }
      });
      
      await db.batchCreateProducts(productsToInsert as any[]);
      await MerchantExperienceEngine.trackActivation(ctx.user.id, "hasAddedProduct");
      
      return { success: true, count: productsToInsert.length };
    }),
});
