import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  Truck
} from "lucide-react";
import { Link } from "wouter";

interface CartViewProps {
  settings: {
    title?: string;
    showTrustBadges?: boolean;
    checkoutButtonText?: string;
    emptyCartText?: string;
  };
}

export default function CartView({ settings }: CartViewProps) {
  // Mock cart items for preview
  const cartItems = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200",
      variant: "Space Gray"
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 px-4 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{settings.emptyCartText || "Your cart is empty"}</h2>
          <p className="text-muted-foreground">Start shopping to add items to your cart.</p>
        </div>
        <Link href="/products">
          <Button size="lg" className="font-bold">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-4xl font-bold mb-10 tracking-tight">{settings.title || "Shopping Cart"}</h1>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-6 p-6 bg-white border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-foreground hover:text-primary cursor-pointer transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Variant: {item.variant}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border rounded-lg overflow-hidden bg-muted/30">
                    <button className="p-2 hover:bg-muted transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="px-4 font-bold">{item.quantity}</span>
                    <button className="p-2 hover:bg-muted transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="text-lg font-bold">${item.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border/50 rounded-2xl p-8 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Calculated at next step</span>
              </div>
              <div className="border-t border-border/50 pt-4 flex justify-between">
                <span className="font-bold text-lg text-foreground">Total</span>
                <span className="font-bold text-xl text-primary">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full h-14 text-lg font-bold gap-2 shadow-lg shadow-primary/20">
              {settings.checkoutButtonText || "Checkout Now"}
              <ArrowRight className="w-5 h-5" />
            </Button>

            {settings.showTrustBadges && (
              <div className="mt-8 space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span>Secure checkout guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Schema = {
  name: "Cart View",
  type: "cart-view",
  settings: [
    {
      id: "title",
      type: "text",
      label: "Title",
      default: "Your Shopping Bag"
    },
    {
      id: "checkoutButtonText",
      type: "text",
      label: "Checkout Button Text",
      default: "Proceed to Checkout"
    },
    {
      id: "emptyCartText",
      type: "text",
      label: "Empty Cart Message",
      default: "Your bag is currently empty."
    },
    {
      id: "showTrustBadges",
      type: "checkbox",
      label: "Show Trust Badges",
      default: true
    }
  ]
};
