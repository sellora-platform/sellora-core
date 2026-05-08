import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Eye, 
  Check, 
  Loader2, 
  Sparkles, 
  Layout, 
  Zap, 
  ShoppingBag, 
  ArrowLeft, 
  Plus, 
  Search,
  Star,
  X,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const themes = [
  {
    id: "minimal",
    name: "Minimal",
    description: "A serene, high-end design focused on negative space, premium typography, and subtle transitions. Perfect for luxury lifestyle brands and boutique labels.",
    previewImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
    category: "Luxury",
    price: "0",
    isFree: true,
    settings: {
      colors: {
        primary: "#18181b",
        accent: "#10b981",
        background: "#ffffff",
        foreground: "#18181b",
        text: "#18181b",
      },
      typography: {
        family: "Inter",
        headingFamily: "Inter",
        baseSize: "16px",
      },
      sections: [
        { type: "hero", settings: { heading: "Curated Excellence", subheading: "Minimalist design for the discerning shopper.", showButton: true, buttonText: "Explore Collection", buttonLink: "/products", alignment: "center", height: "large", showTrustBadges: false } },
        { type: "featured_collection", settings: { title: "Featured Products", subtitle: "Handpicked for you", columns: 4, limit: 4, showButton: true, buttonText: "View All" } },
        { type: "image_banner", settings: { heading: "Timeless Quality", subheading: "Crafted for the modern minimalist.", height: "medium", showButton: true, buttonText: "Shop Now", buttonLink: "/products", overlay: 0.4 } },
        { type: "newsletter", settings: { title: "Join the Inner Circle", description: "Be the first to hear about new collections.", buttonText: "Subscribe", placeholder: "Your email address" } }
      ]
    }
  },
  {
    id: "bold",
    name: "Bold",
    description: "An aggressive, high-contrast industrial aesthetic using heavy italic typography and vibrant electric accents. Engineered for streetwear and high-energy tech brands.",
    previewImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    category: "Modern",
    price: "0",
    isFree: true,
    settings: {
      colors: {
        primary: "#ffffff",
        accent: "#3b82f6",
        background: "#000000",
        foreground: "#ffffff",
        text: "#ffffff",
      },
      typography: {
        family: "Outfit",
        headingFamily: "Outfit",
        baseSize: "16px",
      },
      sections: [
        { type: "hero", settings: { heading: "UNLEASH POWER", subheading: "ENGINEERED FOR THE BOLD.", showButton: true, buttonText: "GET ACCESS", buttonLink: "/products", alignment: "left", height: "large", showTrustBadges: false } },
        { type: "featured_collection", settings: { title: "THE LINEUP", subtitle: "Drop-exclusive items.", columns: 4, limit: 4, showButton: true, buttonText: "SHOP ALL" } },
        { type: "newsletter", settings: { title: "STAY PLUGGED IN", description: "EXCLUSIVE DROPS. NO SPAM.", buttonText: "SUBSCRIBE", placeholder: "Enter your email" } }
      ]
    }
  }
];

export default function ThemeMarketplace() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Themes");
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  
  const { data: store } = trpc.stores.getMyStore.useQuery();
  const utils = trpc.useUtils();

  const installMutation = trpc.themes.create.useMutation({
    onSuccess: () => {
      toast.success("Theme added to your library!");
      utils.themes.listByStore.invalidate();
      setInstallingId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add theme");
      setInstallingId(null);
    }
  });

  const getMyThemeQuery = trpc.themes.listByStore.useQuery(
    { storeId: store?.id ?? 0 },
    { enabled: !!store?.id }
  );

  if (!isAuthenticated) return null;

  const handleInstall = async (theme: any) => {
    if (!store?.id) {
      toast.error("Store not initialized");
      return;
    }

    setInstallingId(theme.id);
    
    try {
      await installMutation.mutateAsync({
        name: theme.name,
        description: theme.description,
        sections: theme.settings.sections,
        colors: theme.settings.colors,
        typography: theme.settings.typography,
      });
    } catch (e) {
      console.error(e);
      setInstallingId(null);
    }
  };

   const activeThemeName = getMyThemeQuery.data?.find((t: any) => t.isActive)?.name;
  
  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All Themes" || theme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/themes")}
              className="p-0 hover:bg-transparent text-muted-foreground hover:text-primary mb-2 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Themes</span>
            </Button>
            <div className="flex items-center gap-2 text-primary font-medium px-3 py-1 bg-primary/10 rounded-full w-fit">
              <Sparkles className="w-4 h-4" />
              <span>Sellora Design Studio</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Theme Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Transform your store with our professionally crafted, high-performance themes. 
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-card border rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Active</p>
              <p className="font-bold text-foreground truncate max-w-[120px]">{activeThemeName || "Default Theme"}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
            {["All Themes", "Luxury", "Modern", "Classic"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                  : "bg-card border border-border/50 hover:border-primary/50 text-foreground/70 hover:bg-muted/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search themes..." 
              className="pl-10 h-11 bg-card border-border/50 rounded-xl focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredThemes.length === 0 ? (
            <Card className="col-span-full p-20 text-center border-dashed border-border/50 rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
              <div className="inline-flex p-6 bg-muted rounded-full mb-6">
                <Search className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <p className="text-xl font-bold text-foreground">No themes found</p>
            </Card>
          ) : (
            filteredThemes.map((theme) => {
              const isInstalling = installingId === theme.id;
              
              return (
                <Card key={theme.id} className="group relative overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-500 rounded-3xl flex flex-col">
                  {/* Image Preview */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-accent/5">
                    {theme.previewImage ? (
                      <img 
                        src={theme.previewImage} 
                        alt={theme.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Palette className="w-20 h-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div className="flex gap-2 w-full">
                        <Button 
                          onClick={() => setSelectedTheme(theme)}
                          variant="secondary" 
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-white/20 gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
  
                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{theme.category || "General"}</p>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{theme.name}</h3>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2">
                      {theme.description}
                    </p>
  
                    <div className="mt-auto space-y-4">
                      <Button 
                        onClick={() => handleInstall(theme)}
                        disabled={isInstalling}
                        className={`w-full h-12 rounded-xl text-md font-bold transition-all duration-300 ${
                          isInstalling 
                          ? "bg-muted text-muted-foreground" 
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                        }`}
                      >
                        {isInstalling ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Installing...
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 mr-2" />
                            Add to Library
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Theme Details Dialog */}
      <Dialog open={!!selectedTheme} onOpenChange={(open: boolean) => !open && setSelectedTheme(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          {selectedTheme && (
            <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
              <div className="bg-muted relative">
                <img 
                  src={selectedTheme.previewImage} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-12 space-y-8 overflow-y-auto bg-white">
                <div className="space-y-4">
                  <Badge className="bg-primary/10 text-primary border-none font-bold px-3 py-1">{selectedTheme.category}</Badge>
                  <DialogTitle className="text-4xl font-black tracking-tight leading-tight">{selectedTheme.name}</DialogTitle>
                </div>

                <DialogDescription className="text-lg leading-relaxed text-muted-foreground">
                  {selectedTheme.description}
                </DialogDescription>

                <div className="flex gap-4 pt-8">
                  <Button 
                    onClick={() => {
                      handleInstall(selectedTheme);
                      setSelectedTheme(null);
                    }}
                    disabled={installingId === selectedTheme.id}
                    className="flex-1 h-14 font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 gap-2"
                  >
                    {installingId === selectedTheme.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Add to My Library <ArrowRight className="w-5 h-5" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
