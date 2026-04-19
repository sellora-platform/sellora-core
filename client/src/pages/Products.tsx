import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Products() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const productsQuery = trpc.products.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const products = productsQuery.data || [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-primary" />
              Products
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage your store's product catalog
            </p>
          </div>
          <Button
            onClick={() => setLocation("/products/new")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 border-border/50">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-border/50 focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/5 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-foreground/60">No products found</p>
                      <Button
                        onClick={() => setLocation("/products/new")}
                        variant="ghost"
                        className="mt-4 text-primary hover:bg-primary/5"
                      >
                        Create your first product
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-sm text-foreground/60">
                          {product.shortDescription}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/60">
                        {product.sku || "-"}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        ${parseFloat(product.price.toString()).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            (product.quantity || 0) > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {product.quantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            product.isActive
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setLocation(`/products/${product.id}/edit`)
                            }
                            className="text-primary hover:bg-primary/5"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
