/**
 * Sellora Upload & Media Management Service
 *
 * Handles file uploads and deletions for Cloudinary.
 * Supports Shopify-style folder scoping and metadata retrieval.
 */
import type { Express } from "express";
import multer from "multer";
import { authenticateRequest } from "./auth";
import { uploadToCloudinary, cloudinary } from "../utils/cloudinary";

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 4.5 * 1024 * 1024, // Vercel Serverless Function limit is 4.5MB
  }
});

export function registerUploadRoutes(app: Express) {
  /**
   * POST /api/upload
   * Authenticated endpoint to upload an image to Cloudinary.
   * Scopes to: sellora/{storeId}/products/{productId || 'temp'}
   */
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      // 1. Authenticate user
      const { user } = await authenticateRequest(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // 2. Check if file exists
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // 3. Determine Folder Scope
      const storeId = req.body.storeId || req.query.storeId || "shared";
      const productId = req.body.productId || req.query.productId || "temp";
      const folder = `sellora/${storeId}/products/${productId}`;
      
      try {
        // 4. Upload to Cloudinary using stream
        const result = await uploadToCloudinary(req.file.buffer, { 
          folder 
        }) as any;

        // 5. Return formatted response as requested
        return res.json({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          createdAt: result.created_at
        });
      } catch (cloudinaryError) {
        console.error("[Media] Cloudinary failure:", cloudinaryError);
        return res.status(502).json({ 
          error: "Cloudinary upload failed", 
          details: cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)
        });
      }
    } catch (error) {
      console.error("[Media] Server error:", error);
      return res.status(500).json({ 
        error: "Internal server error during upload"
      });
    }
  });

  /**
   * DELETE /api/upload
   * Deletes an image from Cloudinary by publicId.
   */
  app.delete("/api/upload", async (req, res) => {
    try {
      const { user } = await authenticateRequest(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const publicId = req.query.publicId as string || req.body.publicId as string;
      if (!publicId) {
        return res.status(400).json({ error: "publicId is required" });
      }

      // Verify the user is trying to delete their own store's assets
      // (Simplified check: publicId should start with 'sellora/')
      if (!publicId.startsWith("sellora/")) {
        return res.status(403).json({ error: "Forbidden: Invalid asset scope" });
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === "ok") {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: "Asset not found or already deleted", details: result });
      }
    } catch (error) {
      console.error("[Media] Delete error:", error);
      return res.status(500).json({ error: "Internal server error during deletion" });
    }
  });
}
