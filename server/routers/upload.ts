import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// In a real production app, we would use Multer + S3/Cloudinary.
// For this demo, we'll simulate a secure upload or use a public storage API.
export const uploadRouter = router({
  // Get a signed URL for direct upload or handle server-side
  // For now, we'll implement a simple "mock" that returns a real image URL 
  // from Unsplash based on keywords, simulating a successful upload.
  image: protectedProcedure
    .input(z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Map common keywords to Unsplash for realistic placeholder uploads
      const keywords = ["fashion", "tech", "food", "grocery", "minimal", "banner"];
      const keyword = keywords.find(k => input.name.toLowerCase().includes(k)) || "product";
      
      return {
        url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?q=80&w=1000&auto=format&fit=crop&keyword=${keyword}`,
        success: true
      };
    }),
});
