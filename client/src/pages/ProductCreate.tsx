import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ProductCreate() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      setLocation("/products");
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    sku: "",
    price: "",
    quantity: "",
    categoryId: "",
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !storeQuery.data) return;

    await createMutation.mutateAsync({
      storeId: storeQuery.data.id,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      shortDescription: formData.shortDescription,
      description: formData.description,
      sku: formData.sku,
      price: formData.price,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create Product
            </h1>
            <p className="text-foreground/60 mt-1">
              Add a new product to your store
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6 border-border/50">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Product Name *
                  </label>
                  <Input
                    placeholder="e.g., Premium Wireless Headphones"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Short Description
                  </label>
                  <Input
                    placeholder="Brief product summary"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value,
                      })
                    }
                    className="border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Description
                  </label>
                  <Textarea
                    placeholder="Detailed product description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border-border/50 focus:border-primary resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* Pricing & Inventory */}
            <Card className="p-6 border-border/50">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Pricing & Inventory
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      SKU
                    </label>
                    <Input
                      placeholder="e.g., WH-001"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price *
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="border-border/50 focus:border-primary"
                  />
                </div>
              </div>
            </Card>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.price || createMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
            >
              <Save className="w-4 h-4" />
              Create Product
            </Button>
          </div>

          {/* Preview */}
          <div>
            <Card className="p-6 border-border/50 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Preview
              </h2>
              <div className="space-y-4">
                <div className="w-full h-32 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg flex items-center justify-center">
                  <span className="text-foreground/30 text-sm">Product Image</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {formData.name || "Product Name"}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-3">
                    {formData.shortDescription || "Short description"}
                  </p>
                  <p className="text-2xl font-bold text-primary mb-4">
                    ${formData.price || "0.00"}
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
