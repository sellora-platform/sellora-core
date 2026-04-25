import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  Lock
} from "lucide-react";

interface CheckoutFormProps {
  settings: {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonColor?: string;
  };
}

export default function CheckoutForm({ settings }: CheckoutFormProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="grid lg:grid-cols-12 gap-12">
        {/* Checkout Steps */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{settings.heading || "Checkout"}</h1>
            <p className="text-muted-foreground">{settings.subheading || "Fill in your details below to complete your order."}</p>
          </div>

          {/* Contact Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-bold">Contact Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-12 rounded-xl" />
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-bold">Shipping Address</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" className="h-12 rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Street Name" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input id="zip" placeholder="10001" className="h-12 rounded-xl" />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</div>
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-2xl flex items-center gap-4 cursor-pointer">
                <CreditCard className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <span className="font-bold block">Credit / Debit Card</span>
                  <span className="text-xs text-muted-foreground">Secure payment via Stripe</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                </div>
              </div>
              <div className="p-4 border border-border rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <Truck className="w-6 h-6 text-muted-foreground" />
                <div className="flex-1">
                  <span className="font-bold block">Cash on Delivery</span>
                  <span className="text-xs text-muted-foreground">Pay when your order arrives</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2"></div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4">
          <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-lg bg-white border flex-shrink-0 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">Premium Product Name</p>
                  <p className="text-xs text-muted-foreground">Qty: 1</p>
                </div>
                <span className="font-bold text-sm">$49.99</span>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">$49.99</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">$49.99</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold rounded-xl gap-2 shadow-lg shadow-primary/10"
              style={{ backgroundColor: settings.buttonColor }}
            >
              <Lock className="w-5 h-5" />
              {settings.buttonText || "Complete Purchase"}
            </Button>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Payments are 100% secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Schema = {
  name: "Checkout Form",
  type: "checkout-form",
  settings: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Secure Checkout"
    },
    {
      id: "subheading",
      type: "text",
      label: "Subheading",
      default: "Please enter your shipping and payment details."
    },
    {
      id: "buttonText",
      type: "text",
      label: "Button Text",
      default: "Place Order Now"
    },
    {
      id: "buttonColor",
      type: "color",
      label: "Button Color",
      default: "#000000"
    }
  ]
};
