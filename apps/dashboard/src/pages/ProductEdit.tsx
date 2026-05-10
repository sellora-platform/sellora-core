import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
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
import { Save, X, Loader2, Tag, Box, DollarSign, LayoutList } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MediaManager } from "@/components/MediaManager";

/**
 * Sellora Product Edit Page
 * 
 * Features:
 * - Shopify-style Media Manager with reordering
 * - Status management (Draft/Active)
 * - Real-time profit calculation
 * - Fully synchronized with database
 */

export default function ProductEdit() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const productId = parseInt(id || "0");

  const utils = trpc.useUtils();
  const storeQuery = trpc.stores.getMyStore.useQuery();
  const productQuery = trpc.products.getById.useQuery({ productId }, { enabled: !!productId });
  
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      utils.products.listByStore.invalidate();
      setLocation("/products");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update product");
    }
  });

  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      setFormData({
        name: p.name,
        description: p.description || "",
        price: p.price.toString(),
        compareAtPrice: p.compareAtPrice?.toString() || "",
        costPrice: (p as any).costPrice?.toString() || "0.00",
        quantity: (p.quantity || 0).toString(),
        weight: p.weight?.toString() || "",
        categoryId: p.categoryId?.toString() || "0",
        status: p.isActive ? "active" : "draft",
      });

      // Map DB images (JSONB objects) to state
      if (p.images && Array.isArray(p.images)) {
        setImages(p.images.map((img: any) => ({
          url: img.url,
          publicId: img.publicId || img.url.split('/').pop()?.split('.')[0] || ""
        })));
      }
    }
  }, [productQuery.data]);

  if (!isAuthenticated) return null;

  const handleSubmit = async () => {
    const storeId = storeQuery.data?.id;
    console.log("[ProductEdit] DEBUG: storeId being sent:", storeId);

    await updateMutation.mutateAsync({
      productId,
      storeId: storeQuery.data.id,
      name: formData.name,
      description: formData.description,
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

  if (productQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Box className="w-8 h-8 text-primary" />
              Edit Product
            </h1>
            <p className="text-foreground/60 mt-2">
              Managing: <span className="font-bold text-foreground">{formData.name}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/products")}
              variant="outline"
              className="border-border/50 h-12 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8 font-bold shadow-lg"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Tag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">General Information</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Product Title *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 border-border/50 text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[200px] border-border/50 resize-none"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <LayoutList className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Media</h2>
              </div>

              <MediaManager 
                storeId={storeQuery.data?.id?.toString() || "shared"}
                productId={productId.toString()}
                onChange={setImages}
                initialImages={images}
              />
            </Card>

            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Box className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Inventory & Shipping</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="h-12 border-border/50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Cost Price</label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="h-12 border-border/50"
                  />
                </div>

                {formData.price && formData.costPrice && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-800 uppercase">Profit Margin</p>
                    <p className="text-xl font-black text-emerald-700">
                      {((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 border-border/50 shadow-sm space-y-6">
              <h2 className="text-xl font-bold pb-4 border-b">Status</h2>
              <Select 
                value={formData.status} 
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="h-12 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active" className="font-bold text-emerald-600">Active</SelectItem>
                </SelectContent>
              </Select>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
