import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, ShieldCheck, Clock, Crown, Upload, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Billing() {
  const { user, isAuthenticated, refresh } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  // Fetch dynamic settings from admin
  const settingsQuery = trpc.platformSettings.getPublic.useQuery();
  const s = settingsQuery.data || {} as Record<string, string>;

  const currency = s.plan_currency || "PKR";
  const trialExpired = user?.trialEndsAt ? new Date(user.trialEndsAt) < new Date() : false;

  const plans = [
    {
      name: "Starter",
      tier: "starter",
      price: s.plan_starter_price || "4999",
      description: "Perfect for solo entrepreneurs",
      features: ["1 Store", "2 Staff Accounts", "1.5% Transaction Fee", "Basic Profit Intel", "All Native Features"],
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      name: "Growth",
      tier: "growth",
      price: s.plan_growth_price || "12999",
      description: "Best for growing brands",
      features: ["3 Stores", "10 Staff Accounts", "0.8% Transaction Fee", "Standard Profit Intel", "All Native Features"],
      icon: Rocket,
      popular: true,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/30",
    },
    {
      name: "Scale",
      tier: "scale",
      price: s.plan_scale_price || "24999",
      description: "For high-volume professional stores",
      features: ["10 Stores", "50 Staff Accounts", "0.4% Transaction Fee", "Advanced Profit Intel", "All Native Features"],
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      name: "Empire",
      tier: "empire",
      price: s.plan_empire_price || "49999",
      description: "Unlimited everything, VIP support",
      features: ["Unlimited Stores", "Unlimited Staff", "0% Transaction Fee", "Predictive Profit Intel", "Dedicated Account Manager"],
      icon: Crown,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    }
  ];

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [receiptNote, setReceiptNote] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const myRequests = trpc.subscriptions.getMyRequests.useQuery();
  const submitManualPayment = trpc.subscriptions.submitManualPayment.useMutation({
    onSuccess: () => {
      toast.success("Receipt submitted! We will verify and activate your plan within 24 hours.");
      setIsManualModalOpen(false);
      setReceiptNote("");
      setReceiptImage(null);
      myRequests.refetch();
      refresh();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit receipt");
      setIsSubmitting(false);
    }
  });

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setIsManualModalOpen(true);
  };

  const handleScreenshotUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const apiBase = (window.location.origin.includes("localhost") ? "http://localhost:4000" : "https://www.raaenai.com").replace(/\/$/, "");
      const res = await fetch(`${apiBase}/api/trpc/upload.image?batch=1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ "0": { json: { name: file.name, size: file.size, type: file.type, data: base64 } } }),
      });
      const data = await res.json();
      const url = data[0]?.result?.data?.json?.url;
      if (url) {
        setReceiptImage(url);
        toast.success("Receipt uploaded!");
      } else throw new Error("Upload failed");
    } catch {
      toast.error("Failed to upload. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!selectedPlan) return;
    if (!receiptImage && !receiptNote.trim()) {
      toast.error("Please upload a receipt screenshot or enter a transaction ID.");
      return;
    }
    setIsSubmitting(true);
    submitManualPayment.mutate({
      tier: selectedPlan.tier,
      amount: selectedPlan.price,
      receiptImage: receiptImage || undefined,
      notes: receiptNote,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatPrice = (price: string) => {
    return parseInt(price).toLocaleString();
  };

  // Check if any payment details are configured
  const hasPaymentDetails = !!(s.payment_bank_name || s.payment_jazzcash || s.payment_easypaisa);

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
            Scale your business with Sellora's powerful tools. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = user?.tier === plan.tier;
            return (
              <Card 
                key={plan.name}
                className={`relative p-6 flex flex-col h-full hover:shadow-xl transition-all duration-500 group ${
                  plan.popular ? 'border-primary shadow-lg scale-[1.02] z-10 bg-gradient-to-b from-primary/5 to-transparent' : 'border-border/50'
                } ${isCurrent ? 'ring-2 ring-emerald-500/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 right-4 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Current
                  </div>
                )}
                
                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl ${plan.bgColor} ${plan.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-foreground/50 text-xs mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-foreground/40 font-bold">{currency}</span>
                    <span className="text-3xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                    <span className="text-foreground/50 text-xs">/mo</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-xs text-foreground/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-5 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 text-xs ${
                    isCurrent ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 cursor-default' :
                    plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20' : 
                    'bg-accent/10 hover:bg-accent/20 text-foreground border-border/50'
                  }`}
                >
                  {isCurrent ? 'Current Plan ✓' : 'Select Plan'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* ── Pending Requests ──────────────────────────── */}
        {myRequests.data && myRequests.data.filter((r: any) => r.status === "pending").length > 0 && (
          <Card className="p-6 border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-800">Pending Verification</h3>
            </div>
            <p className="text-sm text-amber-700">
              Your payment receipt is being verified. Plan activation usually happens within 24 hours. 
              Contact support if you need faster activation.
            </p>
          </Card>
        )}

        {/* Manual Payment Modal */}
        {isManualModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg p-8 space-y-6 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Upgrade Plan</h2>
                  <p className="text-foreground/50 text-sm">{selectedPlan.name} — {currency} {formatPrice(selectedPlan.price)}/month</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setIsManualModalOpen(false); setReceiptImage(null); setReceiptNote(""); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Payment Details */}
              {hasPaymentDetails ? (
                <div className="p-5 bg-accent/5 rounded-xl border border-border/50 space-y-4">
                  <h3 className="font-bold text-xs text-primary uppercase tracking-widest">Payment Details</h3>
                  <div className="space-y-3">
                    {s.payment_bank_name && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-foreground/60">Bank Name</span>
                        <span className="font-semibold">{s.payment_bank_name}</span>
                      </div>
                    )}
                    {s.payment_account_title && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-foreground/60">Account Title</span>
                        <span className="font-semibold">{s.payment_account_title}</span>
                      </div>
                    )}
                    {s.payment_iban && (
                      <div className="flex justify-between items-center text-sm group">
                        <span className="text-foreground/60">IBAN / Account #</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold select-all text-xs">{s.payment_iban}</span>
                          <button onClick={() => copyToClipboard(s.payment_iban)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-3.5 h-3.5 text-foreground/40 hover:text-primary" />
                          </button>
                        </div>
                      </div>
                    )}
                    {(s.payment_jazzcash || s.payment_easypaisa) && (
                      <div className="border-t border-border/30 pt-3 space-y-2">
                        {s.payment_jazzcash && (
                          <div className="flex justify-between items-center text-sm group">
                            <span className="text-foreground/60">JazzCash</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold select-all">{s.payment_jazzcash}</span>
                              <button onClick={() => copyToClipboard(s.payment_jazzcash)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy className="w-3.5 h-3.5 text-foreground/40 hover:text-primary" />
                              </button>
                            </div>
                          </div>
                        )}
                        {s.payment_easypaisa && (
                          <div className="flex justify-between items-center text-sm group">
                            <span className="text-foreground/60">Easypaisa</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold select-all">{s.payment_easypaisa}</span>
                              <button onClick={() => copyToClipboard(s.payment_easypaisa)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy className="w-3.5 h-3.5 text-foreground/40 hover:text-primary" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {s.payment_instructions && (
                    <p className="text-[10px] text-foreground/40 italic border-t border-border/30 pt-3">{s.payment_instructions}</p>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <p className="text-sm text-amber-700 font-medium">Payment details are being configured. Please contact support.</p>
                </div>
              )}

              {/* Receipt Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Payment Proof *</label>
                {receiptImage ? (
                  <div className="relative inline-block border border-border p-2 rounded-lg bg-muted/20">
                    <img src={receiptImage} alt="Receipt" className="w-48 h-48 object-contain rounded" />
                    <button
                      onClick={() => setReceiptImage(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                    <Upload className="w-8 h-8 text-foreground/20 group-hover:text-primary/50 mb-2 transition-colors" />
                    <span className="text-xs text-foreground/40 font-medium">
                      {isUploading ? "Uploading..." : "Click to upload payment screenshot"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleScreenshotUpload(e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Transaction ID / Notes</label>
                <textarea 
                  className="w-full h-20 p-3 rounded-xl border border-border/50 bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Enter Transaction ID or any additional details..."
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleManualSubmit}
                disabled={isSubmitting || (!receiptImage && !receiptNote.trim())}
                className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
              
              <p className="text-center text-[10px] text-foreground/40 italic">
                Your plan will be activated within 24 hours after payment verification.
              </p>
            </Card>
          </div>
        )}

        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-sm text-foreground/40 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Secure local payment processing. 14-day money-back guarantee.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
