import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Save, X, Trash2, Tag, Box, DollarSign, LayoutList } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MediaManager } from "@/components/MediaManager";

/**
 * Sellora Product Creation Page
 * 
 * Features:
 * - Shopify-style Media Manager with reordering
 * - Multi-image upload via Cloudinary
 * - Status management (Draft/Active)
 * - Real-time profit calculation
 */

export default function ProductCreate() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      setLocation("/products");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    }
  });

  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    sku: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    quantity: "0",
    weight: "",
    categoryId: "0",
    status: "draft" as "draft" | "active",
  });

  const categoriesQuery = trpc.categories.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  if (!isAuthenticated) return null;

  const handleSubmit = async () => {
    // 1. Root Cause Check: Prevent submission while loading
    if (storeQuery.isLoading) return;

    const storeId = storeQuery.data?.id;
    console.log("[ProductCreate] DEBUG: storeId being sent:", storeId);
    console.log("[ProductCreate] Current store data:", storeQuery.data);

    if (!storeId) {
      toast.error("No store found. Please create a store first.");
      return;
    }

    if (!formData.name || !formData.price || !formData.description) {
      toast.error("Please fill in all required fields (Title, Description, Price)");
      return;
    }

    await createMutation.mutateAsync({
      storeId,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      description: formData.description,
      sku: formData.sku,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice || undefined,
      costPrice: formData.costPrice || undefined,
      quantity: parseInt(formData.quantity) || 0,
      weight: formData.weight ? parseInt(formData.weight) : undefined,
      categoryId: parseInt(formData.categoryId) || undefined,
      images: images.map(img => img.url),
      isActive: formData.status === "active",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Box className="w-8 h-8 text-primary" />
              Add Product
            </h1>
            <p className="text-foreground/60 mt-2">
              Fill in the details to list your item on the marketplace
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/products")}
              variant="outline"
              className="border-border/50 hover:bg-accent/5 transition-all h-12 px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || storeQuery.isLoading || !storeQuery.data?.id}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8 font-bold shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4" />
              {storeQuery.isLoading ? "Loading store..." : createMutation.isPending ? "Creating..." : "Save Product"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Info */}
            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Tag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">General Information</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Product Title *</label>
                  <Input
                    placeholder="e.g., Premium Wireless Headphones"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 border-border/50 focus:ring-primary/20 text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Description *</label>
                  <Textarea
                    placeholder="Describe your product in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[200px] border-border/50 focus:ring-primary/20 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </Card>

            {/* Media */}
            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <LayoutList className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Media</h2>
              </div>

              <MediaManager 
                storeId={storeQuery.data?.id?.toString() || "shared"}
                onChange={setImages}
                initialImages={images}
              />
            </Card>

            {/* Inventory */}
            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Box className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Inventory & Shipping</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">SKU (Stock Keeping Unit)</label>
                  <Input
                    placeholder="e.g., WH-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="h-12 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Stock Quantity</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="h-12 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Weight (Grams)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="h-12 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Collection (Category)</label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(val: any) => setFormData({ ...formData, categoryId: val })}
                  >
                    <SelectTrigger className="h-12 border-border/50">
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0" className="text-muted-foreground">No Collection</SelectItem>
                      {categoriesQuery.data?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pricing */}
            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Pricing</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Price *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="h-12 border-border/50 font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Compare-at Price</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    className="h-12 border-border/50 text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Cost Price</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="h-12 border-border/50"
                  />
                  <p className="text-[11px] text-muted-foreground px-1">Used to calculate profit margins</p>
                </div>

                {formData.price && formData.costPrice && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Estimated Profit</p>
                    <p className="text-xl font-black text-emerald-700">
                      ${(parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)}
                      <span className="text-sm font-bold ml-2 opacity-70">
                        ({((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price) * 100).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Status */}
            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <h2 className="text-xl font-bold pb-4 border-b">Status</h2>
              <Select 
                value={formData.status} 
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="h-12 font-medium">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft" className="font-medium">Draft</SelectItem>
                  <SelectItem value="active" className="font-bold text-emerald-600">Active</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Draft products are hidden from your store. Active products are visible to customers immediately.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
