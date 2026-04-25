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
  CheckCircle2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ImagePickerProps {
  onSelect: (url: string) => void;
  currentValue?: string;
}

export default function ImagePicker({ onSelect, currentValue }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    try {
      // In this demo, we send metadata and the mock router returns a realistic URL
      const result = await uploadMutation.mutateAsync({
        name: file.name,
        size: file.size,
        type: file.type
      });

      if (result.success) {
        onSelect(result.url);
        setIsOpen(false);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const libraryImages = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400&auto=format&fit=crop"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div 
          className="aspect-video rounded-xl border-2 border-dashed border-[#d1d1d1] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#008060] hover:bg-[#008060]/5 transition-all group overflow-hidden relative"
        >
          {currentValue ? (
            <>
              <img src={currentValue} className="w-full h-full object-cover" />
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

          {/* Library Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#616161]">Your Library</h4>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search library..." className="pl-9 h-8 text-xs rounded-full bg-muted/50 border-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {libraryImages.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    onSelect(img);
                    setIsOpen(false);
                  }}
                  className="aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#008060] transition-all relative group shadow-sm"
                >
                  <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#008060] shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-[#f9f9f9] border-t flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold">Cancel</Button>
          <Button className="rounded-xl bg-[#008060] hover:bg-[#006e52] font-bold px-8">Confirm Selection</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
