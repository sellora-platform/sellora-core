import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * (item.quantity || 1),
    0
  );
  const tax = subtotal * 0.1;
  const shipping = cartItems.length > 0 ? 10 : 0;
  const total = subtotal + tax + shipping;

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container h-16 flex items-center justify-between">
          <Button
            onClick={() => setLocation("/storefront")}
            variant="ghost"
            className="text-foreground hover:bg-accent/5 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
          <h1 className="text-xl font-bold text-foreground">Shopping Cart</h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <Card className="p-12 border-border/50 text-center">
                <ShoppingCart className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Your cart is empty
                </h2>
                <p className="text-foreground/60 mb-6">
                  Add some products to get started
                </p>
                <Button
                  onClick={() => setLocation("/storefront")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continue Shopping
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card
                    key={item.id}
                    className="p-6 border-border/50 flex gap-6 items-start"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-foreground/20" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {item.name}
                      </h3>
                      <p className="text-sm text-foreground/60 mb-2">
                        {item.shortDescription}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-2 border border-border/50 rounded-lg p-1">
                        <Button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              (item.quantity || 1) - 1
                            )
                          }
                          variant="ghost"
                          size="sm"
                          className="text-foreground hover:bg-accent/5"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-foreground">
                          {item.quantity || 1}
                        </span>
                        <Button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              (item.quantity || 1) + 1
                            )
                          }
                          variant="ghost"
                          size="sm"
                          className="text-foreground hover:bg-accent/5"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleRemoveItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 border-border/50 sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-foreground">
                Order Summary
              </h2>

              {/* Coupon */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="border-border/50 focus:border-primary"
                  />
                  <Button
                    variant="outline"
                    className="border-border/50 hover:bg-accent/5"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border/50 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-foreground">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={() => setLocation("/checkout")}
                  disabled={cartItems.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold"
                >
                  Proceed to Checkout
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-border/50 pt-4 space-y-2 text-xs text-foreground/60">
                <p>✓ Secure checkout</p>
                <p>✓ Free returns</p>
                <p>✓ Fast shipping</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
