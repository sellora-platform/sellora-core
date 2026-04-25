import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Copy, 
  ArrowUpRight, 
  Clock, 
  Layout, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeManager() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: store } = trpc.stores.getMyStore.useQuery();
  const { data: themes, isLoading } = trpc.themes.listByStore.useQuery(undefined, {
    enabled: !!store,
  });

  const publishMutation = trpc.themes.publish.useMutation({
    onSuccess: () => {
      toast.success("Theme published successfully!");
      utils.themes.listByStore.invalidate();
      utils.themes.getByStoreId.invalidate();
    },
  });

  const deleteMutation = trpc.themes.delete.useMutation({
    onSuccess: () => {
      toast.success("Theme removed from library");
      utils.themes.listByStore.invalidate();
    },
  });

  const duplicateMutation = trpc.themes.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Theme duplicated");
      utils.themes.listByStore.invalidate();
    },
  });

  const marketplaceMutation = trpc.themes.toggleMarketplace.useMutation({
    onSuccess: (data) => {
      toast.success(data.isPublic ? "Theme published to marketplace!" : "Theme removed from marketplace");
      utils.themes.listByStore.invalidate();
    },
  });

  if (isLoading) return <DashboardLayout>Loading themes...</DashboardLayout>;

  const activeTheme = themes?.find((t) => t.isActive);
  const libraryThemes = themes?.filter((t) => !t.isActive) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Themes</h1>
            <p className="text-muted-foreground mt-1">Manage your store's appearance and design.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.open(store?.customDomain ? `https://${store.customDomain}` : `https://${store?.slug}.raaenai.com`, "_blank")}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              View Store
            </Button>
            <Button 
              onClick={() => setLocation("/themes")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              Visit Theme Store
            </Button>
          </div>
        </div>

        {/* Current Theme Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Current Theme</h2>
          {activeTheme ? (
            <Card className="overflow-hidden border-border/50 bg-card shadow-lg">
              <div className="grid md:grid-cols-2">
                <div className="aspect-[16/10] bg-muted relative group">
                  <div className="absolute inset-0 flex items-center justify-center bg-accent/5">
                     <Palette className="w-16 h-16 text-primary/20" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="secondary" 
                      className="gap-2"
                      onClick={() => setLocation(`/editor?themeId=${activeTheme.id}`)}
                    >
                      <Palette className="w-4 h-4" />
                      Customize
                    </Button>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                        Live
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last saved {new Date(activeTheme.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{activeTheme.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {activeTheme.description || "The current look and feel of your storefront. This is what your customers see."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border/50">
                    <Button 
                      onClick={() => setLocation(`/editor?themeId=${activeTheme.id}`)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-xl font-bold"
                    >
                      Customize
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => duplicateMutation.mutate({ themeId: activeTheme.id })}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/editor")}>
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Preview in Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => marketplaceMutation.mutate({ 
                            themeId: activeTheme.id, 
                            isPublic: !activeTheme.isPublic,
                            category: "Premium",
                            price: "29.00"
                          })}
                          className="text-primary focus:text-primary font-bold"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {activeTheme.isPublic ? "Remove from Marketplace" : "Publish to Marketplace"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center border-dashed border-2">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No active theme found. Please add a theme from the store.</p>
              <Button onClick={() => setLocation("/themes")} className="mt-4">Go to Theme Store</Button>
            </Card>
          )}
        </section>

        {/* Theme Library Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Theme Library</h2>
          <div className="grid grid-cols-1 gap-4">
            {libraryThemes.length > 0 ? (
              libraryThemes.map((theme) => (
                <Card key={theme.id} className="p-4 md:p-6 border-border/50 bg-card hover:border-primary/30 transition-all group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6 min-w-0">
                      <div className="w-24 h-16 bg-muted rounded-lg hidden md:flex items-center justify-center overflow-hidden shrink-0">
                         <Layout className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground truncate">{theme.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          Added on {new Date(theme.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setLocation(`/editor?themeId=${theme.id}`)}
                        className="text-primary hover:bg-primary/10 font-bold"
                      >
                        Customize
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => publishMutation.mutate({ themeId: theme.id })} className="text-green-600 focus:text-green-600 font-bold">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => marketplaceMutation.mutate({ 
                              themeId: theme.id, 
                              isPublic: !theme.isPublic,
                              category: "Modern",
                              price: "0.00"
                            })}
                            className="text-primary focus:text-primary font-bold"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {theme.isPublic ? "Remove from Marketplace" : "Publish to Marketplace"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateMutation.mutate({ themeId: theme.id })}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate({ themeId: theme.id })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center bg-muted/30 border-dashed">
                <p className="text-sm text-muted-foreground">Your theme library is empty. Draft themes will appear here.</p>
              </Card>
            )}
          </div>
        </section>

        {/* AI Theme Generation Suggestion */}
        <Card className="p-8 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-primary/20 rounded-[2rem]">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">Want a custom look?</h3>
              <p className="text-muted-foreground text-sm mt-1">Use Sellora AI to generate a completely unique theme for your brand in seconds.</p>
            </div>
            <Button 
              onClick={() => setLocation("/ai-assistant")}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 h-11 font-bold"
            >
              Generate with AI
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
