import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Products() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const productsQuery = trpc.products.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );
  const deleteProductMutation = trpc.products.delete.useMutation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const products = productsQuery.data || [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductMutation.mutateAsync({ 
          productId,
          storeId: storeQuery.data?.id || 0
        });
        toast.success("Product deleted successfully");
        productsQuery.refetch();
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Products
            </h1>
            <p className="text-foreground/60 mt-2">
              Manage your product catalog ({products.length} total)
            </p>
          </div>
          <Button
            onClick={() => setLocation("/products/new")}
            className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-primary-foreground gap-2 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <Input
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-3 border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden border-border/50 hover:shadow-lg hover:border-accent/50 transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center overflow-hidden">
                  {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                    <img
                      src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-12 h-12 text-foreground/20" />
                      <span className="text-sm text-foreground/40">No image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-foreground/60 line-clamp-2">
                      {product.description || "No description"}
                    </p>
                  </div>

                  {/* Product Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                      <p className="text-xs text-foreground/60 font-medium mb-1">
                        Price
                      </p>
                      <p className="font-bold text-foreground flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-primary" />
                        ${parseFloat(product.price.toString()).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                      <p className="text-xs text-foreground/60 font-medium mb-1">
                        Stock
                      </p>
                      <p className="font-bold text-foreground flex items-center gap-1">
                        <Package className="w-4 h-4 text-emerald-600" />
                        {product.quantity ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        product.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border/30">
                    <Button
                      onClick={() => setLocation(`/products/${product.id}/edit`)}
                      variant="outline"
                      className="flex-1 gap-2 border-border/50 hover:bg-primary/5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id as number)}
                      variant="outline"
                      className="flex-1 gap-2 border-red-200/50 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 border-border/50 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-accent/10">
                <Package className="w-8 h-8 text-foreground/40" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  No products yet
                </h3>
                <p className="text-foreground/60 mb-6">
                  Start by adding your first product to your store
                </p>
                <Button
                  onClick={() => setLocation("/products/new")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Product
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
