import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Eye, Check, Loader2, Sparkles, Layout, Zap, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const themes = [
  {
    id: "lumina",
    name: "Lumina Fashion",
    description: "A sleek, minimalist design perfect for luxury fashion and boutique stores. Clean lines and elegant typography.",
    image: "/themes/lumina.png",
    category: "Fashion",
    price: "Premium",
    isFree: false,
    settings: {
      colors: {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#C5A059",
        background: "#ffffff",
        text: "#1a1a1a"
      },
      typography: {
        heading: "Playfair Display",
        body: "Inter"
      },
      sections: [
        { type: "hero", settings: { heading: "New Collection 2026", subheading: "Discover the essence of elegance", alignment: "center", buttonText: "Shop Now" } },
        { type: "featured_collection", settings: { title: "Editor's Pick", columns: 3, productLimit: 6 } },
        { type: "banner", settings: { text: "Free shipping on orders over $200", backgroundColor: "#000000", textColor: "#ffffff" } }
      ]
    }
  },
  {
    id: "organic",
    name: "Organic Fresh",
    description: "Vibrant and eco-friendly layout designed for organic grocery stores and healthy lifestyle brands.",
    image: "/themes/organic.png",
    category: "Grocery",
    price: "Free",
    isFree: true,
    settings: {
      colors: {
        primary: "#2D5A27",
        secondary: "#F4F9F2",
        accent: "#FBBF24",
        background: "#ffffff",
        text: "#2D3748"
      },
      typography: {
        heading: "Outfit",
        body: "Inter"
      },
      sections: [
        { type: "hero", settings: { heading: "Fresh From Farm to Table", subheading: "100% Organic & Pesticide Free", alignment: "left", buttonText: "View Products" } },
        { type: "categories_grid", settings: { title: "Shop by Category" } },
        { type: "featured_collection", settings: { title: "Today's Fresh Deals", columns: 4, productLimit: 8 } }
      ]
    }
  },
  {
    id: "titan",
    name: "Titan Tech",
    description: "Powerful dark-themed interface for electronics, gaming gear, and cutting-edge technology products.",
    image: "/themes/titan.png",
    category: "Electronics",
    price: "Premium",
    isFree: false,
    settings: {
      colors: {
        primary: "#3B82F6",
        secondary: "#111827",
        accent: "#06B6D4",
        background: "#0F172A",
        text: "#F8FAFC"
      },
      typography: {
        heading: "Rajdhani",
        body: "Inter"
      },
      sections: [
        { type: "hero", settings: { heading: "Level Up Your Setup", subheading: "Unleash the power of Titan performance", alignment: "center", buttonText: "Explore Tech" } },
        { type: "featured_collection", settings: { title: "Bestselling Gear", columns: 4, productLimit: 4 } },
        { type: "newsletter", settings: { title: "Join the Resistance", description: "Get exclusive updates on new drops." } }
      ]
    }
  }
];

export default function ThemeMarketplace() {
  const { isAuthenticated, user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [installingId, setInstallingId] = useState<string | null>(null);
  
  const { data: store } = trpc.stores.getMyStore.useQuery();
  const utils = trpc.useUtils();

  const installMutation = trpc.themes.update.useMutation({
    onSuccess: () => {
      toast.success("Theme applied successfully!");
      utils.themes.getByStoreId.invalidate();
      setInstallingId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to install theme");
      setInstallingId(null);
    }
  });

  const getMyThemeQuery = trpc.themes.getMyTheme.useQuery(
    { storeId: store?.id ?? 0 },
    { enabled: !!store?.id }
  );

  if (!isAuthenticated) return null;

  const handleInstall = async (theme: typeof themes[0]) => {
    if (!store?.id || !getMyThemeQuery.data?.id) {
      toast.error("Store not initialized");
      return;
    }

    setInstallingId(theme.id);
    
    // Simulate a bit of loading for better UX
    setTimeout(async () => {
      try {
        await installMutation.mutateAsync({
          themeId: getMyThemeQuery.data.id,
          name: theme.name,
          sections: theme.settings.sections,
          colors: theme.settings.colors,
          typography: theme.settings.typography,
        });
      } catch (e) {
        console.error(e);
      }
    }, 1500);
  };

  const activeThemeName = getMyThemeQuery.data?.name;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-medium px-3 py-1 bg-primary/10 rounded-full w-fit">
              <Sparkles className="w-4 h-4" />
              <span>Sellora Design Studio</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Theme Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Transform your store with our professionally crafted, high-performance themes. 
              Designed to convert, built for speed.
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

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All Themes", "Fashion", "Electronics", "Grocery", "Beauty", "Home Decor"].map((cat) => (
            <button
              key={cat}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                cat === "All Themes" 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "bg-card border hover:border-primary/50 text-foreground/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme) => {
            const isInstalled = false; // We use update mutation for now, so it replaces current
            const isInstalling = installingId === theme.id;
            
            return (
              <Card key={theme.id} className="group relative overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-500 rounded-3xl flex flex-col">
                {/* Image Preview */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={theme.image} 
                    alt={theme.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="flex gap-2 w-full">
                      <Button variant="secondary" className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-white/20 gap-2">
                        <Eye className="w-4 h-4" />
                        Live Preview
                      </Button>
                    </div>
                  </div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${
                      theme.isFree 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-primary/20 text-primary-foreground border-primary/30"
                    }`}>
                      {theme.price}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{theme.category}</p>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{theme.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground bg-accent/10 px-2 py-1 rounded-md">
                       <Sparkles className="w-3 h-3 text-yellow-500" />
                       <span>4.9</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2">
                    {theme.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-primary" />
                        <span>High Speed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-primary" />
                        <span>Ready to Sell</span>
                      </div>
                    </div>
                    
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
                          <Palette className="w-5 h-5 mr-2" />
                          Apply This Theme
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/80 to-accent p-12 text-white">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Want something unique?</h2>
              <p className="text-white/80 text-lg">
                Our AI-powered designer can create a custom theme tailored exactly to your brand voice and target audience in seconds.
              </p>
            </div>
            <Button 
              onClick={() => setLocation("/ai-assistant")}
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 px-8 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-black/10"
            >
              Generate with AI
            </Button>
          </div>
          
          {/* Abstract blobs */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}
