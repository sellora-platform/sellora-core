import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ProductEdit() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const productId = parseInt(id || "0");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const productQuery = trpc.products.getById.useQuery({ productId }, { enabled: !!productId });
  
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      setLocation("/products");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update product");
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    quantity: 0,
  });

  useEffect(() => {
    if (productQuery.data) {
      setFormData({
        name: productQuery.data.name,
        description: productQuery.data.description || "",
        price: productQuery.data.price.toString(),
        costPrice: (productQuery.data as any).costPrice?.toString() || "0.00",
        quantity: productQuery.data.quantity || 0,
      });
    }
  }, [productQuery.data]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !storeQuery.data) return;

    await updateMutation.mutateAsync({
      productId,
      storeId: storeQuery.data.id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      costPrice: formData.costPrice,
      quantity: formData.quantity,
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit Product
            </h1>
            <p className="text-foreground/60 mt-1">
              Update your product details and margins
            </p>
          </div>
          <Button
            onClick={() => setLocation("/products")}
            variant="outline"
            className="border-border/50 hover:bg-accent/5 gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>

        <div className="max-w-4xl space-y-6">
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-border/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-border/50 resize-none"
                  rows={4}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Pricing & Profit Intelligence
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selling Price
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-border/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cost per item
                </label>
                <Input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="border-border/50"
                />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Calculated Profit</p>
                <p className="text-2xl font-bold text-foreground">
                  ${(parseFloat(formData.price || "0") - parseFloat(formData.costPrice || "0")).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">Margin</p>
                <p className="text-2xl font-bold text-foreground">
                  {formData.price && parseFloat(formData.price) > 0
                    ? ((parseFloat(formData.price) - parseFloat(formData.costPrice || "0")) / parseFloat(formData.price) * 100).toFixed(1)
                    : "0"}%
                </p>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
