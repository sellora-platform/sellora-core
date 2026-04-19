import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock } from "lucide-react";
import { useState } from "react";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would process the payment
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-12 border-border/50 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-foreground/60 mb-6">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="text-sm text-foreground/60 mb-6">
            Order #ORD-{Date.now()}
          </p>
          <Button
            onClick={() => setLocation("/storefront")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container h-16 flex items-center justify-between">
          <Button
            onClick={() => setLocation("/cart")}
            variant="ghost"
            className="text-foreground hover:bg-accent/5 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Button>
          <h1 className="text-xl font-bold text-foreground">Checkout</h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card className="p-6 border-border/50">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Contact Information
                </h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-border/50 focus:border-primary"
                  />
                </div>
              </Card>

              {/* Shipping Address */}
              <Card className="p-6 border-border/50">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name
                      </label>
                      <Input
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="border-border/50 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name
                      </label>
                      <Input
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: e.target.value,
                          })
                        }
                        className="border-border/50 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address
                    </label>
                    <Input
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City
                      </label>
                      <Input
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="border-border/50 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State
                      </label>
                      <Input
                        required
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="border-border/50 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        ZIP Code
                      </label>
                      <Input
                        required
                        value={formData.zip}
                        onChange={(e) =>
                          setFormData({ ...formData, zip: e.target.value })
                        }
                        className="border-border/50 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Country
                      </label>
                      <Input
                        required
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="border-border/50 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6 border-border/50">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Payment Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Card Number
                    </label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      required
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cardNumber: e.target.value,
                        })
                      }
                      className="border-border/50 focus:border-primary font-mono"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Expiry Date
                      </label>
                      <Input
                        placeholder="MM/YY"
                        required
                        value={formData.cardExpiry}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardExpiry: e.target.value,
                          })
                        }
                        className="border-border/50 focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        CVC
                      </label>
                      <Input
                        placeholder="123"
                        required
                        value={formData.cardCvc}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardCvc: e.target.value,
                          })
                        }
                        className="border-border/50 focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold gap-2"
              >
                <Lock className="w-4 h-4" />
                Complete Purchase
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 border-border/50 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Order Summary
              </h2>
              <div className="space-y-4 border-b border-border/50 pb-4 mb-4">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span>$99.99</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Tax</span>
                  <span>$11.00</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">$120.99</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
