import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Image as ImageIcon, 
  Search, 
  Loader2, 
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const result = await uploadMutation.mutateAsync({
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64,
      });

      if (result.success && result.url) {
        onChange(result.url);
        setIsOpen(false);
        toast.success("Image uploaded successfully!");
      }
    } catch (e: any) {
      const msg = e.message || 'Upload failed. Please try again.';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div 
          className="aspect-video rounded-xl border-2 border-dashed border-[#d1d1d1] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#008060] hover:bg-[#008060]/5 transition-all group overflow-hidden relative"
        >
          {value ? (
            <>
              <img src={value} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" className="font-bold">Change Image</Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-muted rounded-full group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#616161]" />
              </div>
              <span className="text-[10px] font-bold text-[#616161] uppercase tracking-widest">Upload or Select Image</span>
            </>
          )}
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b bg-[#f9f9f9]">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#008060]" />
            Select Image
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* Upload Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#d1d1d1] rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-[#008060] hover:bg-[#008060]/5 cursor-pointer transition-all relative overflow-hidden"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <Loader2 className="w-12 h-12 text-[#008060] animate-spin" />
                <p className="font-bold text-[#008060]">Optimizing & Uploading...</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#008060]/10 rounded-full">
                  <Upload className="w-8 h-8 text-[#008060]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">Support: JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm font-bold">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}

          {/* Library Grid (Mocked out) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#616161]">Your Library</h4>
            </div>
            
            <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dotted border-muted">
              <div className="p-4 bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ImageIcon className="w-8 h-8 text-muted" />
              </div>
              <p className="font-bold text-[#616161]">No images in library yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload an image using the uploader above.</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-[#f9f9f9] border-t flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold">Cancel</Button>
          <Button className="rounded-xl bg-[#008060] hover:bg-[#006e52] font-bold px-8" onClick={() => setIsOpen(false)}>Confirm Selection</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
