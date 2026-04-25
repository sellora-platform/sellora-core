import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Billing() {
  const { user, isAuthenticated, refresh } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  const trialExpired = user?.trialEndsAt ? new Date(user.trialEndsAt) < new Date() : false;

  const plans = [
    {
      name: "Starter",
      tier: "starter",
      price: "$19",
      description: "Perfect for solo entrepreneurs",
      features: ["1 Store", "2 Staff Accounts", "1.5% Transaction Fee", "Basic Profit Intel", "All Native Features"],
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Growth",
      tier: "growth",
      price: "$49",
      description: "Best for growing brands",
      features: ["3 Stores", "10 Staff Accounts", "0.8% Transaction Fee", "Standard Profit Intel", "All Native Features"],
      icon: Rocket,
      popular: true,
      color: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      name: "Scale",
      tier: "scale",
      price: "$99",
      description: "For high-volume professional stores",
      features: ["10 Stores", "Unlimited Staff", "0.4% Transaction Fee", "Advanced Profit Intel", "All Native Features"],
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    }
  ];

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [receiptNote, setReceiptNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitManualPayment = trpc.subscriptions.submitManualPayment.useMutation({
    onSuccess: () => {
      toast.success("Receipt submitted! We will verify and activate your plan within 24 hours.");
      setIsManualModalOpen(false);
      refresh();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit receipt");
      setIsSubmitting(false);
    }
  });

  const handleSelectPlan = async (planTier: string, planName: string) => {
    const plan = plans.find(p => p.tier === planTier);
    setSelectedPlan(plan);
    setIsManualModalOpen(true);
  };

  const handleManualSubmit = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    
    submitManualPayment.mutate({
      tier: selectedPlan.tier,
      amount: selectedPlan.price.replace("$", ""),
      notes: receiptNote,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          {trialExpired && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-100 mb-4 animate-bounce">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">Your free trial has expired. Please select a plan to continue.</span>
            </div>
          )}
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Choose Your Plan</h1>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Scale your business with Sellora's powerful tools. Select the plan that best fits your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={`relative p-8 border-border/50 flex flex-col h-full hover:shadow-xl transition-all duration-500 group ${plan.popular ? 'border-primary shadow-lg scale-105 z-10 bg-gradient-to-b from-primary/5 to-transparent' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-xl ${plan.bgColor} ${plan.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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
                  onClick={() => handleSelectPlan(plan.tier, plan.name)}
                  className={`w-full py-6 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-1 ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20' : 'bg-accent/10 hover:bg-accent/20 text-foreground border-border/50'}`}
                >
                  Select Plan
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Manual Payment Modal */}
        {isManualModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg p-8 space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Manual Payment</h2>
                  <p className="text-foreground/50">Upgrade to {selectedPlan.name} Plan</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsManualModalOpen(false)}>✕</Button>
              </div>

              <div className="p-4 bg-accent/5 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Local Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Bank Name</span>
                    <span className="font-semibold">Meezan Bank Ltd</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Account Title</span>
                    <span className="font-semibold">Sellora Platform PVT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">IBAN</span>
                    <span className="font-mono font-bold select-all text-xs">PK00MEZN00123456789</span>
                  </div>
                  <div className="border-t border-border/30 pt-3 flex justify-between text-sm">
                    <span className="text-foreground/60">EasyPaisa / JazzCash</span>
                    <span className="font-bold select-all">0300-1234567</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/70">Transaction Details / ID</label>
                <textarea 
                  className="w-full h-24 p-3 rounded-xl border border-border/50 bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Enter Transaction ID or paste receipt screenshot link..."
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/20"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
              
              <p className="text-center text-[10px] text-foreground/40 italic">
                By submitting, you agree that Sellora will manually verify your payment. Activation takes up to 24 hours.
              </p>
            </Card>
          </div>
        )}

        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-sm text-foreground/40 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Secure local and international payment processing. 30-day money-back guarantee.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
