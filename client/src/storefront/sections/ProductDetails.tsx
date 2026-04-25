import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RotateCcw 
} from "lucide-react";

interface ProductDetailsProps {
  settings: {
    showSocialSharing?: boolean;
    showTrustBadges?: boolean;
    buttonColor?: string;
    buttonText?: string;
    imagePosition?: "left" | "right";
  };
  products?: any[];
}

export default function ProductDetails({ settings, products }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  
  // In a real scenario, we'd get the current product from context or URL
  // For preview, we'll use the first product
  const product = products?.[0] || {
    name: "Premium Sample Product",
    price: "49.99",
    description: "This is a beautiful premium product that shows how your store will look. It has amazing features and quality build.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    category: "Accessories"
  };

  const isLeft = settings.imagePosition !== "right";

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className={`grid md:grid-cols-2 gap-12 items-start ${isLeft ? "" : "md:flex-row-reverse"}`}>
        
        {/* Product Images */}
        <div className={`space-y-4 ${!isLeft ? "md:order-2" : ""}`}>
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-sm border border-border/50">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer border border-border/50 hover:border-primary transition-colors">
                <img src={product.image} className="w-full h-full object-cover opacity-60 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-sm text-muted-foreground">(48 Reviews)</span>
            </div>
          </div>

          <div className="text-3xl font-bold text-foreground">
            ${product.price}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium border-x">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
              <Button 
                size="lg" 
                className="flex-1 gap-2 font-bold h-12 shadow-lg shadow-primary/20"
                style={{ backgroundColor: settings.buttonColor }}
              >
                <ShoppingCart className="w-5 h-5" />
                {settings.buttonText || "Add to Cart"}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {settings.showSocialSharing && (
              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Share:</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full"><Share2 className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </div>

          {settings.showTrustBadges && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-lg"><Truck className="w-5 h-5 text-primary" /></div>
                <span className="text-xs font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-lg"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                <span className="text-xs font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-lg"><RotateCcw className="w-5 h-5 text-primary" /></div>
                <span className="text-xs font-medium">Easy Returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const Schema = {
  name: "Product Details",
  type: "product-details",
  settings: [
    {
      id: "imagePosition",
      type: "select",
      label: "Image Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" }
      ],
      default: "left"
    },
    {
      id: "buttonText",
      type: "text",
      label: "Button Text",
      default: "Add to Cart"
    },
    {
      id: "buttonColor",
      type: "color",
      label: "Button Color",
      default: "#000000"
    },
    {
      id: "showSocialSharing",
      type: "checkbox",
      label: "Show Social Sharing",
      default: true
    },
    {
      id: "showTrustBadges",
      type: "checkbox",
      label: "Show Trust Badges",
      default: true
    }
  ]
};
