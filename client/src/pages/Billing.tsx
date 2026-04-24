import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Billing() {
  const { user, isAuthenticated, refresh } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  const trialExpired = user?.trialEndsAt ? new Date(user.trialEndsAt) < new Date() : false;

  const plans = [
    {
      name: "Basic",
      price: "$19",
      description: "Perfect for new merchants",
      features: ["Up to 50 products", "Standard theme editor", "Basic analytics", "Email support"],
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Professional",
      price: "$49",
      description: "Best for growing businesses",
      features: ["Unlimited products", "Advanced theme editor", "Profit intelligence", "Priority support"],
      icon: Rocket,
      popular: true,
      color: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "For high-volume stores",
      features: ["Custom theme development", "Dedicated account manager", "Advanced API access", "24/7 Phone support"],
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    }
  ];

  const handleSelectPlan = async (planName: string) => {
    // In a real app, this would redirect to Stripe or open a payment modal
    toast.info(`Redirecting to payment for ${planName} plan...`);
    
    // Simulate payment success for development
    setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/update-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planName.toLowerCase(), status: "active" }),
        });
        
        if (res.ok) {
          toast.success("Subscription activated!");
          await refresh();
          setLocation("/dashboard");
        }
      } catch (err) {
        toast.error("Payment failed. Please try again.");
      }
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          {trialExpired && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-100 mb-4 animate-bounce">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">Your free trial has expired. Please select a plan to continue.</span>
            </div>
          )}
          <h1 className="text-4xl font-bold text-foreground">Choose Your Plan</h1>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Scale your business with Sellora's powerful tools. Select the plan that best fits your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={`relative p-8 border-border/50 flex flex-col h-full hover:shadow-xl transition-all duration-500 ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-xl ${plan.bgColor} ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-foreground/50 text-sm mt-2">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-foreground/50">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-foreground/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-6 font-bold rounded-xl ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-accent/10 hover:bg-accent/20 text-foreground border-border/50'}`}
                >
                  Get Started
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-8">
          <p className="text-sm text-foreground/40">
            Secure payments processed via Stripe. All plans include a 30-day money-back guarantee.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
