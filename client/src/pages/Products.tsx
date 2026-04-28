import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Package,
  MoreVertical,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * Sellora Products List Page
 * 
 * Features:
 * - Tabular view of all products
 * - Search by title
 * - Status indicators (Active/Draft)
 * - Inventory tracking
 * - Quick actions (Edit, Delete, Preview)
 */

export default function Products() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const productsQuery = trpc.products.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );
  
  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      productsQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete product");
    }
  });

  if (!isAuthenticated) return null;

  const products = productsQuery.data || [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (productId: number) => {
    if (confirm("Are you sure you want to permanently delete this product?")) {
      await deleteProductMutation.mutateAsync({ 
        productId,
        storeId: storeQuery.data?.id || 0
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Products</h1>
            <p className="text-foreground/60 mt-1">Manage your inventory and product listings</p>
          </div>
          <Button
            onClick={() => setLocation("/products/new")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 border-border/50 bg-background/50 focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Products Table */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[80px] font-bold text-foreground py-5">Image</TableHead>
                    <TableHead className="font-bold text-foreground py-5">Product Title</TableHead>
                    <TableHead className="font-bold text-foreground py-5">Status</TableHead>
                    <TableHead className="font-bold text-foreground py-5">Inventory</TableHead>
                    <TableHead className="font-bold text-foreground py-5">Price</TableHead>
                    <TableHead className="text-right font-bold text-foreground py-5 px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const mainImage = (product.images as any)?.[0]?.url;
                    
                    return (
                      <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                        <TableCell className="py-4">
                          <div className="w-14 h-14 rounded-xl border bg-muted overflow-hidden shadow-inner flex items-center justify-center">
                            {mainImage ? (
                              <img src={mainImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                              {product.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">SKU: {product.sku || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant="secondary" 
                            className={product.isActive 
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" 
                              : "bg-muted text-muted-foreground border-transparent"
                            }
                          >
                            {product.isActive ? "Active" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Package className={`w-4 h-4 ${product.quantity && product.quantity > 0 ? "text-primary" : "text-destructive"}`} />
                            <span className={`font-bold ${product.quantity && product.quantity > 0 ? "text-foreground" : "text-destructive"}`}>
                              {product.quantity ?? 0} in stock
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 font-black text-foreground">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-4 text-right px-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={() => setLocation(`/products/${product.id}/edit`)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 p-2">
                                <DropdownMenuItem className="gap-2 font-medium cursor-pointer py-2">
                                  <ExternalLink className="w-4 h-4" />
                                  View on Store
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 font-bold text-destructive hover:!text-destructive cursor-pointer py-2"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Product
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-2xl font-bold text-foreground">Add your first product</h3>
                <p className="text-muted-foreground">Everything you need to sell your items online starts here.</p>
              </div>
              <Button
                onClick={() => setLocation("/products/new")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8 font-bold rounded-xl"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
