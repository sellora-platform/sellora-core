import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Menu as MenuIcon, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2,
  GripVertical,
  Link as LinkIcon,
  ChevronRight,
  ArrowLeft,
  Save
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type NavItem = {
  label: string;
  url: string;
  parentId?: number | null;
  displayOrder?: number;
};

export default function Navigation() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [search, setSearch] = useState("");
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  
  const [items, setItems] = useState<NavItem[]>([]);

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const menusQuery = trpc.navigation.list.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  const menuDetailsQuery = trpc.navigation.get.useQuery(
    { menuId: selectedMenuId || 0, storeId: storeQuery.data?.id || 0 },
    { enabled: !!selectedMenuId && !!storeQuery.data?.id }
  );

  useEffect(() => {
    if (menuDetailsQuery.data?.items) {
      setItems(menuDetailsQuery.data.items.map(i => ({
        label: i.label,
        url: i.url,
        parentId: i.parentId,
        displayOrder: i.displayOrder
      })));
    }
  }, [menuDetailsQuery.data]);

  const createMutation = trpc.navigation.create.useMutation({
    onSuccess: () => {
      toast.success("Menu created successfully");
      setIsCreateModalOpen(false);
      setNewMenuName("");
      menusQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.navigation.update.useMutation({
    onSuccess: () => {
      toast.success("Menu updated successfully");
      menuDetailsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.navigation.delete.useMutation({
    onSuccess: () => {
      toast.success("Menu deleted successfully");
      setSelectedMenuId(null);
      menusQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) return null;

  const handleAddItem = () => {
    setItems([...items, { label: "New Item", url: "/" }]);
  };

  const handleUpdateItem = (index: number, field: keyof NavItem, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveItems = () => {
    if (!selectedMenuId) return;
    updateMutation.mutate({
      menuId: selectedMenuId,
      storeId: storeQuery.data!.id,
      items: items
    });
  };

  const menus = menusQuery.data || [];
  const filteredMenus = menus.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {!selectedMenuId ? (
          <>
            {/* Index View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Navigation</h1>
                <p className="text-muted-foreground mt-2">Manage your store's menus and navigation links</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Menu
              </Button>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menus..."
                className="w-full pl-10 pr-4 py-3 border rounded-2xl bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {menusQuery.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredMenus.length > 0 ? (
              <div className="grid gap-4">
                {filteredMenus.map((menu) => (
                  <Card 
                    key={menu.id} 
                    className="p-6 hover:shadow-xl transition-all group cursor-pointer border-none bg-white/50 backdrop-blur-sm"
                    onClick={() => setSelectedMenuId(menu.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MenuIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-[#1a1a1a]">{menu.name}</h3>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Handle: {menu.handle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-16 text-center border-dashed bg-transparent">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <MenuIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">No menus found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                      Create your first menu to define how customers navigate your store.
                    </p>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="px-8 rounded-xl h-12">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Menu
                    </Button>
                    <Button 
                      onClick={() => {
                        createMutation.mutate({ 
                          storeId: storeQuery.data!.id, 
                          name: "Main Menu" 
                        }, {
                          onSuccess: (newMenu) => {
                            updateMutation.mutate({
                              menuId: newMenu.id,
                              storeId: storeQuery.data!.id,
                              items: [
                                { label: "Shop", url: "/products" },
                                { label: "Track Order", url: "/track-order" },
                                { label: "Story", url: "/about" },
                                { label: "Contact", url: "/contact" }
                              ]
                            });
                          }
                        });
                      }}
                      className="px-8 rounded-xl h-12 bg-[#008060] hover:bg-[#008060]/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Setup Default Menu
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Editor View */}
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setSelectedMenuId(null)} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Menus
                </Button>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this menu?")) {
                        deleteMutation.mutate({ menuId: selectedMenuId, storeId: storeQuery.data!.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Menu
                  </Button>
                  <Button onClick={handleSaveItems} disabled={updateMutation.isPending} className="bg-[#008060] hover:bg-[#008060]/90">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#f1f1f1]">
                <div className="mb-10">
                  <h2 className="text-3xl font-black tracking-tight">{menuDetailsQuery.data?.name}</h2>
                  <p className="text-muted-foreground font-medium">Add, remove and reorder links in this menu</p>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-4 p-4 bg-[#f9f9f9] rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-[#f1f1f1]"
                    >
                      <GripVertical className="w-5 h-5 text-muted-foreground/30 cursor-grab" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-[#616161]">Label</Label>
                          <Input 
                            value={item.label} 
                            onChange={(e) => handleUpdateItem(idx, "label", e.target.value)}
                            className="h-11 border-none bg-white rounded-xl font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-[#616161]">Link / URL</Label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              value={item.url} 
                              onChange={(e) => handleUpdateItem(idx, "url", e.target.value)}
                              className="h-11 pl-10 border-none bg-white rounded-xl font-medium"
                              placeholder="/collections/all"
                            />
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveItem(idx)}
                        className="h-11 w-11 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button 
                    variant="ghost" 
                    onClick={handleAddItem}
                    className="w-full h-16 border-2 border-dashed border-[#e1e1e1] rounded-2xl text-[#008060] font-black uppercase tracking-widest hover:border-[#008060]/30 hover:bg-[#008060]/5 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Create New Menu</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#616161]">Menu Name</Label>
                <Input 
                  placeholder="e.g. Main Menu, Footer Links" 
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl h-12 px-6">Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate({ storeId: storeQuery.data!.id, name: newMenuName })}
                disabled={!newMenuName || createMutation.isPending}
                className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Menu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
