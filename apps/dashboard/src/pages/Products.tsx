import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
  Upload,
  Folder,
  FolderPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Products() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Collections modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const storeId = storeQuery.data?.id || 0;

  const productsQuery = trpc.products.listByStore.useQuery(
    { storeId },
    { enabled: !!storeId }
  );

  const categoriesQuery = trpc.categories.listByStore.useQuery(
    { storeId },
    { enabled: !!storeId }
  );

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      productsQuery.refetch();
    },
  });

  const batchUpdateMutation = trpc.products.batchUpdate.useMutation({
    onSuccess: () => {
      toast.success("Products updated");
      productsQuery.refetch();
      setSelectedIds([]);
    }
  });

  const batchDeleteMutation = trpc.products.batchDelete.useMutation({
    onSuccess: () => {
      toast.success("Products deleted");
      productsQuery.refetch();
      setSelectedIds([]);
    }
  });

  const batchCreateMutation = trpc.products.batchCreate.useMutation();

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Collection created!");
      setIsCategoryModalOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
      categoriesQuery.refetch();
    }
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Collection deleted");
      categoriesQuery.refetch();
    }
  });

  if (!isAuthenticated) return null;

  const products = productsQuery.data || [];
  const categories = categoriesQuery.data || [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  // --- CSV Logic ---
  const handleExportCSV = () => {
    if (!products.length) return toast.error("No products to export");
    const headers = ["name", "slug", "description", "price", "compareAtPrice", "costPrice", "sku", "quantity", "isActive", "categoryId"];
    const rows = products.map(p => headers.map(h => `"${((p as any)[h] ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim() !== "");
        if (lines.length < 2) return toast.error("CSV file is empty or invalid.");
        
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        const productsToCreate = [];
        
        for (let i = 1; i < lines.length; i++) {
          // Simplistic CSV parse (splits by comma, doesn't fully support commas inside quotes yet)
          const currentline = lines[i].split("\",\"").map(v => v.replace(/(^"|"$)/g, ""));
          const obj: any = {};
          
          for (let j = 0; j < headers.length; j++) {
            let val = currentline[j] || lines[i].split(",")[j]?.trim().replace(/(^"|"$)/g, "");
            if (val === "") val = undefined;
            
            if (headers[j] === "quantity") obj[headers[j]] = val ? parseInt(val) : 0;
            else if (headers[j] === "isActive") obj[headers[j]] = val === "true" || val === "1";
            else if (headers[j] === "categoryId") obj[headers[j]] = val ? parseInt(val) : undefined;
            else obj[headers[j]] = val;
          }
          
          if (obj.name && obj.price) {
            if (!obj.slug) obj.slug = obj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            productsToCreate.push(obj);
          }
        }
        
        if (productsToCreate.length === 0) return toast.error("No valid products found in CSV. Make sure headers match: name, slug, description, price, etc.");
        
        const res = await batchCreateMutation.mutateAsync({ 
          storeId,
          products: productsToCreate 
        });
        
        toast.success(`Successfully imported ${res.count} products!`);
        productsQuery.refetch();
      } catch (error) {
        toast.error("Failed to parse CSV file");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const createCategory = async () => {
    if (!newCategoryName) return toast.error("Collection name is required");
    await createCategoryMutation.mutateAsync({
      storeId,
      name: newCategoryName,
      description: newCategoryDesc,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Products</h1>
            <p className="text-foreground/60 mt-1">Manage your inventory, collections, and pricing</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 border-border/50" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
            <Button variant="outline" className="h-11 border-border/50" onClick={() => fileInputRef.current?.click()} disabled={batchCreateMutation.isPending}>
              <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
            <Button
              onClick={() => setLocation("/products/new")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11 px-6 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 h-12 bg-muted/50 p-1">
            <TabsTrigger value="all" className="h-10 px-6 font-medium text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">All Products</TabsTrigger>
            <TabsTrigger value="collections" className="h-10 px-6 font-medium text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Collections</TabsTrigger>
          </TabsList>

          {/* ALL PRODUCTS TAB */}
          <TabsContent value="all" className="space-y-4">
            {/* Filters & Bulk Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by title or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-11 border-border/50 bg-background/50 focus:bg-background transition-all w-full"
                />
              </div>

              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                  <span className="text-sm font-semibold mr-2">{selectedIds.length} selected</span>
                  
                  <Button size="sm" variant="ghost" className="h-8 px-3 text-primary hover:bg-primary/20 hover:text-primary" onClick={() => batchUpdateMutation.mutate({ storeId, productIds: selectedIds, isActive: true })}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Active
                  </Button>
                  
                  <Button size="sm" variant="ghost" className="h-8 px-3 text-primary hover:bg-primary/20 hover:text-primary" onClick={() => batchUpdateMutation.mutate({ storeId, productIds: selectedIds, isActive: false })}>
                    <XCircle className="w-4 h-4 mr-2" /> Mark Draft
                  </Button>

                  <div className="w-px h-4 bg-primary/20 mx-1" />

                  <Button size="sm" variant="ghost" className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                    if (confirm(`Delete ${selectedIds.length} products?`)) {
                      batchDeleteMutation.mutate({ storeId, productIds: selectedIds });
                    }
                  }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Products Table */}
            <Card className="border-border/50 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
              {filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[50px] text-center px-4">
                          <Checkbox 
                            checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                            onCheckedChange={(c) => handleSelectAll(!!c)}
                          />
                        </TableHead>
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
                        const isSelected = selectedIds.includes(product.id);
                        
                        return (
                          <TableRow key={product.id} className={`group hover:bg-muted/30 transition-colors border-border/50 ${isSelected ? "bg-primary/5 hover:bg-primary/5" : ""}`}>
                            <TableCell className="px-4 text-center">
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={(c) => handleSelectOne(product.id, !!c)}
                              />
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="w-12 h-12 rounded-xl border bg-muted overflow-hidden shadow-inner flex items-center justify-center cursor-pointer" onClick={() => setLocation(`/products/${product.id}/edit`)}>
                                {mainImage ? (
                                  <img src={mainImage} className="w-full h-full object-cover hover:scale-110 transition-transform" alt="" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 cursor-pointer" onClick={() => setLocation(`/products/${product.id}/edit`)}>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                                  {product.name}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku || "N/A"}</span>
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
                                <span className={`font-semibold text-sm ${product.quantity && product.quantity > 0 ? "text-foreground" : "text-destructive"}`}>
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
                                    <DropdownMenuItem className="gap-2 font-medium cursor-pointer py-2" onClick={() => window.open(`http://${storeQuery.data?.customDomain || `${storeQuery.data?.slug}.sellora.com`}/product/${product.slug}`, '_blank')}>
                                      <ExternalLink className="w-4 h-4" />
                                      View on Store
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="gap-2 font-bold text-destructive hover:!text-destructive cursor-pointer py-2"
                                      onClick={() => {
                                        if(confirm("Delete this product?")) deleteProductMutation.mutate({ productId: product.id, storeId });
                                      }}
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
                    <h3 className="text-2xl font-bold text-foreground">No products found</h3>
                    <p className="text-muted-foreground text-sm">Add items manually or import a CSV to get started.</p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={() => setLocation("/products/new")} className="gap-2">
                      <Plus className="w-4 h-4" /> Add Product
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload className="w-4 h-4" /> Import CSV
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* COLLECTIONS TAB */}
          <TabsContent value="collections" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsCategoryModalOpen(true)} className="gap-2 bg-primary">
                <FolderPlus className="w-4 h-4" /> Create Collection
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <Card key={cat.id} className="p-6 border-border/50 hover:border-primary/50 transition-colors flex flex-col gap-4 group">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Folder className="w-6 h-6" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive font-medium cursor-pointer" onClick={() => {
                            if(confirm("Delete collection? Products inside will not be deleted.")) {
                              deleteCategoryMutation.mutate({ categoryId: cat.id, storeId });
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{cat.description || "No description provided."}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border/50">
                      <Badge variant="secondary" className="bg-muted">
                        {count} {count === 1 ? 'product' : 'products'}
                      </Badge>
                    </div>
                  </Card>
                );
              })}

              {categories.length === 0 && (
                <div className="col-span-full p-16 text-center border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center bg-muted/20">
                  <Folder className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Collections Yet</h3>
                  <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">Group your products into collections like 'Summer Collection' or 'Bestsellers' to make them easier to find.</p>
                  <Button onClick={() => setIsCategoryModalOpen(true)} className="gap-2">
                    <FolderPlus className="w-4 h-4" /> Create Collection
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Summer Essentials"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Input
                id="desc"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="A short description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={createCategory} disabled={createCategoryMutation.isPending || !newCategoryName}>Save Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
