import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Sellora Image Uploader Component
 * 
 * A reusable drag-and-drop uploader that sends images to Cloudinary via
 * our /api/upload endpoint. Supports progress tracking and previews.
 */

interface ImageUploaderProps {
  /** Callback when upload completes with the secure URL */
  onUpload: (url: string) => void;
  /** Unique store identifier for folder structure */
  storeId?: string;
  /** Additional CSS classes */
  className?: string;
  /** Main title text */
  label?: string;
  /** Subtitle/instruction text */
  description?: string;
  /** Initial image URL if editing */
  initialUrl?: string;
}

export function ImageUploader({ 
  onUpload, 
  storeId = "shared", 
  className,
  label = "Upload Image",
  description = "Drag and drop or click to select",
  initialUrl
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;

    // 1. Basic Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // 2. Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("storeId", storeId);

      // 3. Upload with XMLHttpRequest for Progress Tracking
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<{ url: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error("Invalid server response"));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || "Upload failed"));
            } catch (e) {
              reject(new Error(`Server error (${xhr.status})`));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      const result = await uploadPromise;
      
      // 4. Handle Success
      onUpload(result.url);
      setPreview(result.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("[ImageUploader] Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong during upload");
      setPreview(initialUrl || null); // Revert to initial
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [onUpload, storeId, initialUrl]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-4 text-center group overflow-hidden",
          isUploading 
            ? "border-primary/50 bg-primary/5 ring-4 ring-primary/10" 
            : "border-muted-foreground/20 hover:border-primary/40 hover:bg-accent/30 hover:shadow-xl",
          preview && !isUploading ? "p-3" : "p-12 min-h-[220px]"
        )}
      >
        {preview ? (
          <div className="relative w-full aspect-video md:aspect-[16/9] rounded-xl overflow-hidden border bg-black/5 flex items-center justify-center">
            <img 
              src={preview} 
              alt="Preview" 
              className={cn(
                "w-full h-full object-contain transition-opacity duration-500",
                isUploading ? "opacity-30 grayscale" : "opacity-100"
              )} 
            />
            
            {/* Action Buttons */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full shadow-lg"
                  onClick={() => document.getElementById(`uploader-${label}`)?.click()}
                >
                  Change
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-9 w-9 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    onUpload("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Uploading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-5 p-6">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {progress}%
                  </span>
                </div>
                <div className="w-full max-w-[200px] space-y-3">
                  <Progress value={progress} className="h-2.5 shadow-sm" />
                  <p className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">
                    Uploading...
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-5 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Upload className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground/90">{label}</p>
              <p className="text-sm text-muted-foreground/80">{description}</p>
            </div>
            <div className="mt-2">
               <span className="text-xs font-medium px-2 py-1 bg-muted rounded text-muted-foreground">
                  Max 10MB
               </span>
            </div>
            <input
              id={`uploader-${label}`}
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={onFileSelect}
              disabled={isUploading}
            />
          </>
        )}
      </div>
    </div>
  );
}
