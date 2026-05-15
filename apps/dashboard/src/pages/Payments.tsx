import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Wallet, Banknote, Building2, Zap, Clock, ShieldCheck, Save, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Payments() {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const updateMutation = trpc.stores.update.useMutation({
    onSuccess: () => {
      storeQuery.refetch();
    },
  });

  const [formData, setFormData] = useState({
    paymentCodEnabled: true,
    paymentBankEnabled: false,
    paymentBankDetails: { bankName: "", accountTitle: "", accountNumber: "" },
    paymentJazzcashEnabled: false,
    paymentJazzcashNumber: "",
    paymentJazzcashName: "",
    paymentEasypaisaEnabled: false,
    paymentEasypaisaNumber: "",
    paymentEasypaisaName: "",
  });

  useEffect(() => {
    if (storeQuery.data) {
      setFormData({
        paymentCodEnabled: storeQuery.data.paymentCodEnabled ?? true,
        paymentBankEnabled: storeQuery.data.paymentBankEnabled ?? false,
        paymentBankDetails: (storeQuery.data.paymentBankDetails as any) || { bankName: "", accountTitle: "", accountNumber: "" },
        paymentJazzcashEnabled: storeQuery.data.paymentJazzcashEnabled ?? false,
        paymentJazzcashNumber: storeQuery.data.paymentJazzcashNumber || "",
        paymentJazzcashName: storeQuery.data.paymentJazzcashName || "",
        paymentEasypaisaEnabled: storeQuery.data.paymentEasypaisaEnabled ?? false,
        paymentEasypaisaNumber: storeQuery.data.paymentEasypaisaNumber || "",
        paymentEasypaisaName: storeQuery.data.paymentEasypaisaName || "",
      });
    }
  }, [storeQuery.data]);

  if (!isAuthenticated || loading || storeQuery.isLoading) {
    return null;
  }

  const handleSave = async () => {
    if (!storeQuery.data) return;

    try {
      await updateMutation.mutateAsync({
        storeId: storeQuery.data.id,
        ...formData,
      });
      toast.success("Payment settings updated successfully");
    } catch (error) {
      toast.error("Failed to update payment settings");
    }
  };

  const isSaving = updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-primary" />
              Payments
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage how your customers pay for their orders
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </Button>
        </div>

        <div className="space-y-6">
          {/* ── Cash on Delivery ─────────────────────────────────────── */}
          <Card className="p-6 border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Cash on Delivery (COD)</h2>
                  <p className="text-sm text-foreground/60 max-w-lg mt-1">
                    Allow customers to pay in cash when their order is delivered. This is the most popular payment method in Pakistan.
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.paymentCodEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, paymentCodEnabled: checked })}
              />
            </div>
          </Card>

          {/* ── Manual Bank Transfer ─────────────────────────────────── */}
          <Card className="p-6 border-border/50 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Bank Transfer</h2>
                  <p className="text-sm text-foreground/60 max-w-lg mt-1">
                    Customers transfer money directly to your bank account and upload a receipt during checkout.
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.paymentBankEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, paymentBankEnabled: checked })}
              />
            </div>

            {formData.paymentBankEnabled && (
              <div className="pt-4 border-t border-border/50 grid gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-2">Bank Name</label>
                    <Input
                      value={formData.paymentBankDetails.bankName}
                      onChange={(e) => setFormData({ ...formData, paymentBankDetails: { ...formData.paymentBankDetails, bankName: e.target.value } })}
                      placeholder="e.g. Meezan Bank, HBL"
                      className="bg-accent/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-2">Account Title</label>
                    <Input
                      value={formData.paymentBankDetails.accountTitle}
                      onChange={(e) => setFormData({ ...formData, paymentBankDetails: { ...formData.paymentBankDetails, accountTitle: e.target.value } })}
                      placeholder="e.g. John Doe"
                      className="bg-accent/5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-2">IBAN / Account Number</label>
                  <Input
                    value={formData.paymentBankDetails.accountNumber}
                    onChange={(e) => setFormData({ ...formData, paymentBankDetails: { ...formData.paymentBankDetails, accountNumber: e.target.value } })}
                    placeholder="e.g. PK00MEZN00123456789"
                    className="font-mono bg-accent/5"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* ── Mobile Wallets ───────────────────────────────────────── */}
          <Card className="p-6 border-border/50 space-y-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Mobile Wallets</h2>
            
            {/* JazzCash */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900">JazzCash Transfer</h3>
                    <p className="text-xs text-red-700">Customers send payment to your JazzCash mobile account.</p>
                  </div>
                </div>
                <Switch
                  checked={formData.paymentJazzcashEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, paymentJazzcashEnabled: checked })}
                />
              </div>
              {formData.paymentJazzcashEnabled && (
                <div className="px-4 animate-in fade-in duration-300 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-2">Account Title</label>
                    <Input
                      value={formData.paymentJazzcashName}
                      onChange={(e) => setFormData({ ...formData, paymentJazzcashName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="bg-accent/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-2">JazzCash Number</label>
                    <Input
                      value={formData.paymentJazzcashNumber}
                      onChange={(e) => setFormData({ ...formData, paymentJazzcashNumber: e.target.value })}
                      placeholder="e.g. 03001234567"
                      className="font-mono bg-accent/5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Easypaisa */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900">Easypaisa Transfer</h3>
                    <p className="text-xs text-emerald-700">Customers send payment to your Easypaisa mobile account.</p>
                  </div>
                </div>
                <Switch
                  checked={formData.paymentEasypaisaEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, paymentEasypaisaEnabled: checked })}
                />
              </div>
              {formData.paymentEasypaisaEnabled && (
                <div className="px-4 animate-in fade-in duration-300 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-2">Account Title</label>
                    <Input
                      value={formData.paymentEasypaisaName}
                      onChange={(e) => setFormData({ ...formData, paymentEasypaisaName: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="bg-accent/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-2">Easypaisa Number</label>
                    <Input
                      value={formData.paymentEasypaisaNumber}
                      onChange={(e) => setFormData({ ...formData, paymentEasypaisaNumber: e.target.value })}
                      placeholder="e.g. 03001234567"
                      className="font-mono bg-accent/5"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ── Automated Gateways (Coming Soon) ─────────────────────── */}
          <Card className="p-6 border-border/50 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Automated Payment Gateways</h2>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              
              <p className="text-sm text-foreground/60 max-w-2xl mb-6">
                We are actively integrating with top payment providers to allow automated credit/debit card processing and direct wallet integrations. This will automatically verify payments without needing manual receipt uploads.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col items-center justify-center text-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                    <span className="font-bold text-indigo-600 text-xl">S</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Stripe</h3>
                    <p className="text-[10px] text-foreground/50 mt-1">International Cards</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col items-center justify-center text-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="font-bold text-red-600 text-xl">J</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">JazzCash Auto</h3>
                    <p className="text-[10px] text-foreground/50 mt-1">Direct API Integration</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col items-center justify-center text-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <span className="font-bold text-emerald-600 text-xl">E</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Easypaisa Auto</h3>
                    <p className="text-[10px] text-foreground/50 mt-1">Direct API Integration</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
