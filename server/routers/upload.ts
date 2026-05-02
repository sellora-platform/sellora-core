import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadRouter = router({
  image: protectedProcedure
    .input(z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
      data: z.string(), // base64 string
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate file size (max 5MB)
      if (input.size > 5 * 1024 * 1024) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File size must be under 5MB'
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(input.type)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only JPEG, PNG, WebP and GIF allowed'
        });
      }

      try {
        const result = await cloudinary.uploader.upload(input.data, {
          folder: `sellora/${ctx.user.id}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          success: true
        };
      } catch (e: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: e.message || 'Upload failed'
        });
      }
    }),
});
