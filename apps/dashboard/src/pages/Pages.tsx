import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Pages() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const pagesQuery = trpc.pages.merchantList.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  const deleteMutation = trpc.pages.delete.useMutation({
    onSuccess: () => {
      toast.success("Page deleted successfully");
      pagesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) return null;

  const pages = pagesQuery.data || [];
  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Pages</h1>
            <p className="text-muted-foreground mt-2">Manage your store's static content and policies</p>
          </div>
          <Button onClick={() => setLocation("/pages/new")} className="shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {pagesQuery.isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPages.length > 0 ? (
          <div className="grid gap-4">
            {filteredPages.map((page) => (
              <Card key={page.id} className="p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{page.title}</h3>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const url = storeQuery.data?.customDomain 
                          ? `https://${storeQuery.data.customDomain}/p/${page.slug}`
                          : `https://${storeQuery.data?.slug}.raaenai.com/p/${page.slug}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/pages/${page.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this page?")) {
                              deleteMutation.mutate({ id: page.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">No pages found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                  {search ? "Try adjusting your search terms." : "Create your first page to share more about your store."}
                </p>
              </div>
              {!search && (
                <Button onClick={() => setLocation("/pages/new")} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
