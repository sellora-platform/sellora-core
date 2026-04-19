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
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Storefront() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  // Get store ID from URL or use default
  const storeId = 1; // In a real app, this would come from the URL

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const productsQuery = trpc.products.listByStore.useQuery(
    { storeId },
    { enabled: true }
  );

  const store = storeQuery.data;
  const products = productsQuery.data || [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: store?.primaryColor || "#000" }}
            >
              {(store?.name || "S")[0]}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {store?.name || "Store"}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-foreground hover:bg-accent/5">
              Products
            </Button>
            <Button variant="ghost" className="text-foreground hover:bg-accent/5">
              About
            </Button>
            <Button variant="ghost" className="text-foreground hover:bg-accent/5">
              Contact
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/cart")}
              className="relative text-foreground hover:bg-accent/5"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
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
          <div className="md:hidden border-t border-border/50 p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-accent/5"
            >
              Products
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-accent/5"
            >
              About
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-accent/5"
            >
              Contact
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4 border-b border-border/50 bg-gradient-to-br from-accent/5 to-background">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {store?.name || "Welcome to Our Store"}
          </h1>
          <p className="text-lg text-foreground/60 mb-8">
            {store?.description || "Discover our amazing products"}
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 border-b border-border/50">
        <div className="container max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-border/50 focus:border-primary h-12"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Featured Products
          </h2>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No products found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="border-border/50 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Product Image Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-foreground/20" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
                      {product.shortDescription}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-foreground/60">(42)</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-foreground">
                        ${parseFloat(product.price.toString()).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground/60 hover:text-destructive hover:bg-destructive/5"
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Sale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-foreground/60 text-sm">
            <p>&copy; 2026 {store?.name || "Store"}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
