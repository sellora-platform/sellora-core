import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  Heart,
  Star,
  Menu,
  X,
  Zap,
  Package,
  Truck,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import SectionRenderer from "@/storefront/SectionRenderer";

export default function Storefront({ params }: { params?: { slug?: string } }) {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  // Fetch store by custom domain if it's not a platform domain, else fallback to something safe
  const hostname = window.location.hostname;
  const isPlatformDomain = 
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    hostname.includes("vercel.app") || 
    hostname === "raaenai.com" ||
    hostname === "www.raaenai.com" ||
    hostname === "sellora.com";

  // If this is a preview URL with a slug: /store/my-slug
  const previewSlug = params?.slug;

  const [previewSections, setPreviewSections] = useState<any[] | null>(null);

  // Listen for editor updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "THEME_UPDATE") {
        setPreviewSections(event.data.sections);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const storeBySlugQuery = trpc.stores.getBySlug.useQuery(
    { slug: previewSlug || "" },
    { enabled: !!previewSlug }
  );

  const storeQuery = trpc.stores.getByDomain.useQuery(
    { domain: hostname },
    { enabled: !isPlatformDomain }
  );

  // Fallback for when we're viewing the storefront from within the admin dashboard
  const myStoreQuery = trpc.stores.getMyStore.useQuery(undefined, {
    enabled: isPlatformDomain && !previewSlug,
  });

  const store = previewSlug 
    ? storeBySlugQuery.data 
    : isPlatformDomain 
      ? myStoreQuery.data 
      : storeQuery.data;

  const productsQuery = trpc.products.listByStore.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  const themeQuery = trpc.themes.getByStoreId.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  const products = productsQuery.data || [];
  const theme = themeQuery.data;
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    setCart([...cart, product]);
  };

  const toggleWishlist = (productId: number) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
              style={{ backgroundColor: store?.primaryColor || "#000" }}
            >
              {(store?.name || "S")[0]}
            </div>
            <div>
              <span className="text-lg font-bold text-foreground block">
                {store?.name || "Store"}
              </span>
              <span className="text-xs text-foreground/50">Premium Shop</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Button variant="ghost" className="text-foreground hover:bg-accent/5 font-medium">
              Products
            </Button>
            <Button variant="ghost" className="text-foreground hover:bg-accent/5 font-medium">
              About
            </Button>
            <Button variant="ghost" className="text-foreground hover:bg-accent/5 font-medium">
              Contact
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/cart")}
              className="relative text-foreground hover:bg-accent/5 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground hover:bg-accent/5"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 p-4 space-y-2 bg-background">
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-accent/5 font-medium"
            >
              Products
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-accent/5 font-medium"
            >
              About
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-accent/5 font-medium"
            >
              Contact
            </Button>
          </div>
        )}
      </nav>

      {/* Dynamic Sections */}
      <SectionRenderer 
        sections={(previewSections || theme?.sections) as any || []} 
        products={products} 
      />


      {/* Premium Footer */}
      <footer className="border-t border-border/50 py-16 px-4 bg-gradient-to-b from-background to-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-foreground mb-4 text-lg">Shop</h3>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    Sale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4 text-lg">Company</h3>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4 text-lg">Legal</h3>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors font-medium">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-foreground/60 text-sm">
            <p>&copy; 2026 {store?.name || "Store"}. All rights reserved. Powered by Sellora</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
