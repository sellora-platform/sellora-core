import { Link, useLocation } from "wouter";
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
import { CartProvider, useCart } from "@/storefront/CartContext";

export default function Storefront({ params }: { params?: { slug?: string } }) {
  const [locationPath, setLocation] = useLocation();
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
  const searchParams = new URLSearchParams(window.location.search);
  const isPreview = searchParams.get("preview") === "true";
  const themeIdParam = searchParams.get("themeId");
  const themeId = themeIdParam ? parseInt(themeIdParam) : null;

  const [previewSections, setPreviewSections] = useState<any[] | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] = useState<any>({
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Inter"
  });

  // Listen for editor updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "THEME_UPDATE") {
        setPreviewSections(event.data.sections);
        setSelectedSectionId(event.data.selectedSectionId);
        if (event.data.globalSettings) {
          setGlobalSettings(event.data.globalSettings);
        }
      }
    };
    window.addEventListener("message", handleMessage);

    // Click to select logic for Editor
    const handleClick = (e: MouseEvent) => {
      if (!isPreview) return;
      const target = e.target as HTMLElement;
      const sectionElement = target.closest("[data-section-id]");
      if (sectionElement) {
        const sectionId = sectionElement.getAttribute("data-section-id");
        window.parent.postMessage({ type: "SECTION_SELECT", sectionId }, "*");
      }
    };
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("click", handleClick);
    };
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

  const themeByStoreQuery = trpc.themes.getByStoreId.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id && !themeId }
  );

  const themeByIdQuery = trpc.themes.getById.useQuery(
    { themeId: themeId || 0 },
    { enabled: !!themeId }
  );

  const products = productsQuery.data || [];
  const theme = themeId ? themeByIdQuery.data : themeByStoreQuery.data;

  const getPageKey = () => {
    if (locationPath.endsWith("/products")) return "product";
    if (locationPath.endsWith("/cart")) return "cart";
    if (locationPath.endsWith("/checkout")) return "checkout";
    return "index";
  };
  const pageKey = getPageKey();
  
  const themeSections = theme?.sections as Record<string, any>;
  const sectionsToRender = previewSections || (themeSections?.[pageKey] || []);
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
    <CartProvider>
      <StorefrontContent 
        store={store} 
        products={products} 
        theme={theme} 
        pageKey={pageKey} 
        sectionsToRender={sectionsToRender} 
        selectedSectionId={selectedSectionId}
        globalSettings={globalSettings}
        setLocation={setLocation}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </CartProvider>
  );
}

function StorefrontContent({ 
  store, 
  products, 
  theme, 
  pageKey, 
  sectionsToRender,
  selectedSectionId,
  globalSettings,
  setLocation,
  mobileMenuOpen,
  setMobileMenuOpen
}: any) {
  const { cartCount } = useCart();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background storefront-container">
      {/* Visual Selection & Global Theme Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${globalSettings.primaryColor};
          --background: ${globalSettings.backgroundColor};
        }
        .storefront-container {
          font-family: '${globalSettings.fontFamily}', sans-serif;
        }
        [data-section-id="${selectedSectionId}"] {
          outline: 3px solid #3b82f6 !important;
          outline-offset: -3px;
          position: relative;
          z-index: 40;
        }
        [data-section-id="${selectedSectionId}"]::after {
          content: "Selected";
          position: absolute;
          top: 0;
          right: 0;
          background: #3b82f6;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 8px;
          border-bottom-left-radius: 8px;
          z-index: 50;
        }
      ` }} />
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation(`/store/${store?.slug}`)}>
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
            <Link href={`/store/${store?.slug}`} className="text-foreground hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link href={`/store/${store?.slug}/products`} className="text-foreground hover:text-primary font-medium transition-colors">
              Products
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`/store/${store?.slug}/cart`)}
              className="relative text-foreground hover:bg-accent/5 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {cartCount}
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
          <div className="md:hidden border-t border-border/50 p-4 space-y-2 bg-background animate-in slide-in-from-top duration-300">
            <Link href={`/store/${store?.slug}`} className="block px-4 py-3 text-foreground font-bold hover:bg-accent/5 rounded-xl">
              Home
            </Link>
            <Link href={`/store/${store?.slug}/products`} className="block px-4 py-3 text-foreground font-bold hover:bg-accent/5 rounded-xl">
              Products
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <SectionRenderer 
          sections={sectionsToRender as any || []} 
          products={products} 
          pageType={pageKey}
        />
      </main>


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
