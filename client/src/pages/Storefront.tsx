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
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Storefront() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const productsQuery = trpc.products.listByStore.useQuery({ storeId: storeQuery.data?.id || 0 }, { enabled: !!storeQuery.data?.id });

  const store = storeQuery.data;
  const products = productsQuery.data || [];
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

      {/* Premium Hero Section */}
      <section className="py-16 px-4 border-b border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Discover Excellence</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            {store?.name || "Welcome to Our Store"}
          </h1>
          <p className="text-xl text-foreground/60 mb-8 max-w-2xl mx-auto">
            {store?.description || "Discover our amazing collection of premium products"}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-foreground/70">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground/70">Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-foreground/70">Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 border-b border-border/50 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-4 border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 text-base transition-all"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Products</h2>
            <p className="text-foreground/60">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="p-16 border-border/50 text-center">
              <Package className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-lg text-foreground/60">No products found</p>
              <p className="text-sm text-foreground/40 mt-2">Try adjusting your search</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="border-border/50 overflow-hidden hover:shadow-xl hover:border-accent/50 transition-all duration-300 group flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-56 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center overflow-hidden">
                    {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                      <img
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || ''}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingCart className="w-16 h-16 text-foreground/10 group-hover:text-foreground/20 transition-colors" />
                    )}

                    {/* Wishlist Button */}
                    <Button
                      onClick={() => toggleWishlist(product.id as number)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white text-foreground/60 hover:text-destructive transition-all"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.has(product.id as number)
                            ? "fill-destructive text-destructive"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4 line-clamp-2 flex-1">
                      {product.shortDescription || (typeof product.description === 'string' ? product.description : '')}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-foreground/60">(42 reviews)</span>
                    </div>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-t border-border/30">
                      <div>
                        <span className="text-2xl font-bold text-foreground">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-foreground/50 line-through ml-2">
                            ${parseFloat(product.compareAtPrice.toString()).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        (product.quantity ?? 0) > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {(product.quantity ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={(product.quantity || 0) === 0}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-primary-foreground gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p>&copy; 2026 {store?.name || "Store"}. All rights reserved. Powered by ShopifyAI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
