/**
 * Sellora Upload Service
 *
 * Handles file uploads to Cloudinary via Express REST endpoint.
 */
import type { Express } from "express";
import multer from "multer";
import { authenticateRequest } from "./auth";
import { uploadToCloudinary } from "../utils/cloudinary";

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export function registerUploadRoutes(app: Express) {
  /**
   * POST /api/upload
   * Authenticated endpoint to upload an image to Cloudinary.
   * Expects:
   *   - Multipart form-data with "image" field
   *   - Optional "storeId" in body
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

      // 3. Get storeId (required for folder structure)
      const storeId = req.body.storeId || req.query.storeId || "shared";

      // 4. Upload to Cloudinary
      const folder = `sellora/${storeId}/products`;
      
      try {
        const result = await uploadToCloudinary(req.file.buffer, { 
          folder 
        }) as any;

        // 5. Return formatted response
        return res.json({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          createdAt: result.created_at
        });
      } catch (cloudinaryError) {
        console.error("[Upload] Cloudinary failure:", cloudinaryError);
        return res.status(502).json({ 
          error: "Cloudinary upload failed", 
          details: cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)
        });
      }
    } catch (error) {
      console.error("[Upload] Server error:", error);
      return res.status(500).json({ 
        error: "Internal server error during upload",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
