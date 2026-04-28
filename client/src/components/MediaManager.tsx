import React, { useState, useCallback } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Plus, 
  Trash2, 
  Star, 
  Upload as UploadIcon, 
  Loader2, 
  X, 
  ImageIcon,
  Grid
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Shopify-Style Media Manager
 * 
 * Features:
 * - Drag & drop reordering
 * - Multiple file upload with individual progress
 * - Cover image selection
 * - Cloudinary deletion integration
 */

interface MediaItem {
  url: string;
  publicId: string;
  id: string; // Required for dnd-kit (can be publicId)
}

interface MediaManagerProps {
  storeId: string;
  productId?: string;
  initialImages?: { url: string; publicId: string }[];
  onChange: (images: { url: string; publicId: string }[]) => void;
}

// --- Sortable Item Component ---
function SortableMediaItem({ 
  item, 
  isCover, 
  onDelete, 
  onSetCover 
}: { 
  item: MediaItem; 
  isCover: boolean; 
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square rounded-xl overflow-hidden border group bg-muted select-none touch-none",
        isDragging ? "opacity-50 scale-95 shadow-2xl ring-2 ring-primary" : "hover:border-primary/50"
      )}
    >
      <img 
        src={item.url} 
        alt="Product" 
        className="w-full h-full object-cover pointer-events-none" 
      />

      {/* Reorder Handle / Drag area */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* Badges */}
      {isCover && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-md">
          <Star className="w-3 h-3 fill-current" />
          COVER
        </div>
      )}

      {/* Hover Actions */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-active:opacity-0">
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 rounded-full shadow-lg pointer-events-auto"
          title="Set as Cover"
          onClick={() => onSetCover(item.id)}
        >
          <Star className={cn("w-4 h-4", isCover && "fill-primary text-primary")} />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-9 w-9 rounded-full shadow-lg pointer-events-auto"
          title="Delete"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// --- Main Component ---
export function MediaManager({ storeId, productId = "temp", initialImages = [], onChange }: MediaManagerProps) {
  const [images, setImages] = useState<MediaItem[]>(
    initialImages.map(img => ({ ...img, id: img.publicId }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ name: string; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // DnD Configuration
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        onChange(newArray.map(({ url, publicId }) => ({ url, publicId })));
        return newArray;
      });
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setIsUploading(true);
    const newUploadQueue = filesToUpload.map(f => ({ name: f.name, progress: 0 }));
    setUploadQueue(newUploadQueue);

    const uploadedItems: MediaItem[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("storeId", storeId);
        formData.append("productId", productId);

        const xhr = new XMLHttpRequest();
        const promise = new Promise<MediaItem>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const p = Math.round((e.loaded / e.total) * 100);
              setUploadQueue(prev => {
                const updated = [...prev];
                updated[i] = { ...updated[i], progress: p };
                return updated;
              });
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const res = JSON.parse(xhr.responseText);
              resolve({ url: res.url, publicId: res.publicId, id: res.publicId });
            } else reject(new Error("Upload failed"));
          });
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });

        const result = await promise;
        uploadedItems.push(result);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    const finalImages = [...images, ...uploadedItems];
    setImages(finalImages);
    onChange(finalImages.map(({ url, publicId }) => ({ url, publicId })));
    setIsUploading(false);
    setUploadQueue([]);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const item = images.find(img => img.id === id);
    if (!item) return;

    // Local update
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    onChange(updated.map(({ url, publicId }) => ({ url, publicId })));

    // Remote deletion (fire and forget for UI snappiness)
    try {
      fetch(`/api/upload?publicId=${encodeURIComponent(item.publicId)}`, { method: "DELETE" });
      toast.success("Image removed");
    } catch (err) {
      console.error("Cloudinary delete failed:", err);
    }
  };

  const handleSetCover = (id: string) => {
    const index = images.findIndex(img => img.id === id);
    if (index === -1) return;
    const newArray = arrayMove(images, index, 0);
    setImages(newArray);
    onChange(newArray.map(({ url, publicId }) => ({ url, publicId })));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Add Button (Shopify style - first cell) */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button 
              disabled={images.length >= 5}
              className={cn(
                "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group overflow-hidden relative",
                images.length >= 5 
                  ? "opacity-50 cursor-not-allowed bg-muted/50 border-muted" 
                  : "hover:border-primary/50 hover:bg-primary/5 border-muted-foreground/20"
              )}
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                Add
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-primary" />
                Add Media
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="w-full justify-start rounded-none bg-muted/50 px-6 h-12 border-b">
                <TabsTrigger value="upload" className="data-[state=active]:bg-background">Upload New</TabsTrigger>
                <TabsTrigger value="uploaded" className="data-[state=active]:bg-background">Recently Uploaded</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="p-8 mt-0">
                <div className="space-y-6">
                  {/* Dropzone */}
                  <div 
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all",
                      isUploading ? "bg-muted cursor-not-allowed" : "hover:bg-primary/5 hover:border-primary/50"
                    )}
                  >
                    <UploadIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-bold text-foreground mb-1">Drag and drop images here</p>
                    <p className="text-xs text-muted-foreground mb-6">Support for PNG, JPG, WEBP (Max 10MB per file)</p>
                    <Button variant="outline" className="relative font-bold">
                      Browse Files
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => handleUpload(e.target.files)}
                        disabled={isUploading}
                      />
                    </Button>
                  </div>

                  {/* Progress Items */}
                  {uploadQueue.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Uploading...</p>
                      {uploadQueue.map((file, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <span>{file.progress}%</span>
                          </div>
                          <Progress value={file.progress} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="uploaded" className="p-8 mt-0">
                <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Grid className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Store library coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Sortable Grid */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={images.map(i => i.id)}
            strategy={rectSortingStrategy}
          >
            {images.map((img, idx) => (
              <SortableMediaItem 
                key={img.id} 
                item={img} 
                isCover={idx === 0} 
                onDelete={handleDelete}
                onSetCover={handleSetCover}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {images.length} of 5 images used
        </p>
        <div className="flex gap-2">
          {["JPG", "PNG", "WEBP"].map(fmt => (
            <span key={fmt} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
