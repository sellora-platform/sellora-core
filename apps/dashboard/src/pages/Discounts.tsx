import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tag, Plus, Copy, Trash2, TrendingDown, Calendar, Search,
  Zap, MoreHorizontal, Power, CopyPlus, Percent, DollarSign,
  Truck, ShoppingBag, Clock, CheckCircle2, XCircle, ChevronDown,
  ChevronUp, Package, Users,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type TabKey = "all" | "active" | "scheduled" | "expired";

// ─── Helpers ──────────────────────────────────────────────
function getDiscountStatus(d: any): "active" | "scheduled" | "expired" | "inactive" {
  if (!d.isActive) return "inactive";
  const now = new Date();
  if (d.endDate && new Date(d.endDate) < now) return "expired";
  if (d.startDate && new Date(d.startDate) > now) return "scheduled";
  return "active";
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", label: "Active" },
    scheduled: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", label: "Scheduled" },
    expired: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500", label: "Expired" },
    inactive: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", label: "Inactive" },
  };
  const s = map[status] || map.inactive;
  return <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
}

function scopeIcon(scope: string) {
  if (scope === "shipping") return <Truck className="w-4 h-4" />;
  if (scope === "products") return <Package className="w-4 h-4" />;
  return <ShoppingBag className="w-4 h-4" />;
}

function formatValue(d: any) {
  if (d.scope === "shipping") return "Free Shipping";
  if (d.type === "percentage") return `${d.value}% off`;
  return `$${parseFloat(d.value?.toString() || "0").toFixed(2)} off`;
}

// ─── Create Form ─────────────────────────────────────────
function CreateDiscountForm({ storeId, onSuccess, onCancel }: { storeId: number; onSuccess: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", code: "", description: "",
    method: "code" as "code" | "automatic",
    type: "percentage" as "percentage" | "fixed_amount",
    scope: "order" as "order" | "products" | "shipping",
    value: "", maxDiscount: "",
    appliesTo: "all" as "all" | "specific_products" | "specific_collections",
    minPurchase: "", minQuantity: "",
    maxUses: "", maxUsesPerCustomer: "",
    startDate: "", endDate: "",
  });

  const createMutation = trpc.discounts.create.useMutation({
    onSuccess: () => { toast.success("Discount created!"); onSuccess(); },
    onError: (err) => toast.error(err.message),
  });

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    set("code", code);
  };

  const handleSubmit = () => {
    if (!form.title || !form.code || !form.value) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      storeId,
      title: form.title,
      code: form.code.toUpperCase(),
      description: form.description || undefined,
      method: form.method,
      type: form.scope === "shipping" ? "fixed_amount" : form.type,
      scope: form.scope,
      value: form.scope === "shipping" ? "0" : form.value,
      maxDiscount: form.maxDiscount || undefined,
      appliesTo: form.appliesTo,
      minPurchase: form.minPurchase || undefined,
      minQuantity: form.minQuantity ? parseInt(form.minQuantity) : undefined,
      maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      maxUsesPerCustomer: form.maxUsesPerCustomer ? parseInt(form.maxUsesPerCustomer) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    });
  };

  const totalSteps = 3;

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Progress */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-5 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">Create Discount</h2>
          <span className="text-sm text-foreground/50">Step {step} of {totalSteps}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Step 1: Method & Type */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-3">Discount Method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "code", label: "Discount Code", desc: "Customers enter a code at checkout", icon: Tag },
                  { value: "automatic", label: "Automatic", desc: "Applied automatically when conditions are met", icon: Zap },
                ].map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => set("method", opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.method === opt.value ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}
                  >
                    <opt.icon className={`w-5 h-5 mb-2 ${form.method === opt.value ? "text-primary" : "text-foreground/40"}`} />
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-foreground/50 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Discount Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "order", type: "percentage", label: "Percentage Off", icon: Percent },
                  { value: "order", type: "fixed_amount", label: "Fixed Amount Off", icon: DollarSign },
                  { value: "shipping", type: "fixed_amount", label: "Free Shipping", icon: Truck },
                ].map((opt) => (
                  <button key={opt.label} type="button"
                    onClick={() => { set("scope", opt.value); set("type", opt.type); }}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.scope === opt.value && form.type === opt.type ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <opt.icon className={`w-5 h-5 mx-auto mb-2 ${form.scope === opt.value && form.type === opt.type ? "text-primary" : "text-foreground/40"}`} />
                    <p className="text-sm font-medium">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Title *</label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g., Summer Sale 25% Off" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Discount Code *</label>
                <div className="flex gap-2">
                  <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g., SUMMER25" className="font-mono" />
                  <Button type="button" variant="outline" onClick={generateCode} className="shrink-0">Generate</Button>
                </div>
              </div>
            </div>

            {form.scope !== "shipping" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {form.type === "percentage" ? "Percentage (%)" : "Amount ($)"} *
                  </label>
                  <Input type="number" value={form.value} onChange={(e) => set("value", e.target.value)}
                    placeholder={form.type === "percentage" ? "e.g., 25" : "e.g., 10.00"} step="0.01"
                    min="0" max={form.type === "percentage" ? "100" : undefined}
                  />
                </div>
                {form.type === "percentage" && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Discount Cap ($)</label>
                    <Input type="number" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} placeholder="No limit" step="0.01" />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Applies To</label>
              <Select value={form.appliesTo} onValueChange={(v) => set("appliesTo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="specific_products">Specific Products</SelectItem>
                  <SelectItem value="specific_collections">Specific Collections</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Step 3: Conditions & Limits */}
        {step === 3 && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Minimum Purchase ($)</label>
                <Input type="number" value={form.minPurchase} onChange={(e) => set("minPurchase", e.target.value)} placeholder="No minimum" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Minimum Quantity</label>
                <Input type="number" value={form.minQuantity} onChange={(e) => set("minQuantity", e.target.value)} placeholder="No minimum" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Total Usage Limit</label>
                <Input type="number" value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} placeholder="Unlimited" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Limit Per Customer</label>
                <Input type="number" value={form.maxUsesPerCustomer} onChange={(e) => set("maxUsesPerCustomer", e.target.value)} placeholder="Unlimited" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Start Date</label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">End Date</label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>

            {/* Summary Card */}
            <Card className="p-5 bg-primary/5 border-primary/20">
              <h4 className="font-bold text-sm mb-3">Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-foreground/60">Method:</span>
                <span className="font-medium capitalize">{form.method}</span>
                <span className="text-foreground/60">Type:</span>
                <span className="font-medium">{form.scope === "shipping" ? "Free Shipping" : form.type === "percentage" ? `${form.value || 0}% Off` : `$${form.value || 0} Off`}</span>
                <span className="text-foreground/60">Code:</span>
                <span className="font-mono font-bold text-primary">{form.code || "—"}</span>
                {form.minPurchase && <><span className="text-foreground/60">Min Purchase:</span><span>${form.minPurchase}</span></>}
                {form.maxUses && <><span className="text-foreground/60">Max Uses:</span><span>{form.maxUses}</span></>}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="px-8 py-5 bg-muted/30 border-t border-border/30 flex justify-between">
        <div>
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}><ChevronUp className="w-4 h-4 mr-1" /> Back</Button>}
          <Button variant="ghost" onClick={onCancel} className="ml-2">Cancel</Button>
        </div>
        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)}>Next <ChevronDown className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-gradient-to-r from-primary to-primary/80">
            {createMutation.isPending ? "Creating..." : "Create Discount"}
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function Discounts() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const discountsQuery = trpc.discounts.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );
  const analyticsQuery = trpc.discounts.getAnalytics.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  const deleteMutation = trpc.discounts.delete.useMutation({
    onSuccess: () => { discountsQuery.refetch(); analyticsQuery.refetch(); toast.success("Discount deleted!"); },
  });
  const toggleMutation = trpc.discounts.toggleActive.useMutation({
    onSuccess: () => { discountsQuery.refetch(); analyticsQuery.refetch(); toast.success("Status updated!"); },
  });
  const duplicateMutation = trpc.discounts.duplicate.useMutation({
    onSuccess: () => { discountsQuery.refetch(); analyticsQuery.refetch(); toast.success("Discount duplicated!"); },
  });

  if (!isAuthenticated) { setLocation("/"); return null; }

  const discounts = discountsQuery.data || [];
  const analytics = analyticsQuery.data;
  const storeId = storeQuery.data?.id || 0;

  // Filter by tab
  const tabFiltered = discounts.filter((d: any) => {
    if (tab === "all") return true;
    return getDiscountStatus(d) === tab;
  });

  // Filter by search
  const filtered = tabFiltered.filter((d: any) =>
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.title?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: discounts.length },
    { key: "active", label: "Active", count: analytics?.active || 0 },
    { key: "scheduled", label: "Scheduled", count: analytics?.scheduled || 0 },
    { key: "expired", label: "Expired", count: analytics?.expired || 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Tag className="w-6 h-6 text-amber-600" />
              </div>
              Discounts
            </h1>
            <p className="text-foreground/50 mt-1 text-sm">Create and manage promotional codes</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-primary to-primary/80 gap-2">
              <Plus className="w-4 h-4" /> Create Discount
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Discounts", value: analytics?.total || 0, icon: Tag, color: "amber" },
            { label: "Active Now", value: analytics?.active || 0, icon: CheckCircle2, color: "emerald" },
            { label: "Total Uses", value: analytics?.totalUsed || 0, icon: Users, color: "blue" },
            { label: "Scheduled", value: analytics?.scheduled || 0, icon: Clock, color: "violet" },
          ].map((stat) => (
            <Card key={stat.label} className="p-5 border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-5 h-5 text-${stat.color}-500 opacity-60`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <CreateDiscountForm
            storeId={storeId}
            onSuccess={() => { setShowForm(false); discountsQuery.refetch(); analyticsQuery.refetch(); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Tabs + Search */}
        <Card className="border-border/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/30 px-1">
            <div className="flex">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-5 py-3.5 text-sm font-medium transition-all relative ${
                    tab === t.key ? "text-primary" : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-foreground/40"}`}>{t.count}</span>
                  {tab === t.key && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
                </button>
              ))}
            </div>
            <div className="pr-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 w-52 text-sm border-border/30" />
            </div>
          </div>

          {/* Discount List */}
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Tag className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
              <p className="font-medium text-foreground/50">No discounts found</p>
              <p className="text-sm text-foreground/30 mt-1">{search ? "Try a different search" : "Create your first discount"}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map((d: any) => {
                const status = getDiscountStatus(d);
                return (
                  <div key={d.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0">
                        {scopeIcon(d.scope || "order")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-0.5">
                          <span className="font-mono text-sm font-bold text-primary">{d.code}</span>
                          {statusBadge(status)}
                          {d.method === "automatic" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400">AUTO</span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/50 truncate">{d.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold">{formatValue(d)}</p>
                        <p className="text-xs text-foreground/40">{d.usedCount || 0} uses{d.maxUses ? ` / ${d.maxUses}` : ""}</p>
                      </div>

                      {d.endDate && (
                        <div className="text-right hidden lg:block">
                          <p className="text-xs text-foreground/40">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(d.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div className="relative">
                        <Button variant="ghost" size="sm" onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        {openMenuId === d.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl py-1 w-48">
                              <button onClick={() => { navigator.clipboard.writeText(d.code); toast.success("Copied!"); setOpenMenuId(null); }}
                                className="w-full px-4 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-2">
                                <Copy className="w-3.5 h-3.5" /> Copy Code
                              </button>
                              <button onClick={() => { toggleMutation.mutate({ discountId: d.id, storeId }); setOpenMenuId(null); }}
                                className="w-full px-4 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-2">
                                <Power className="w-3.5 h-3.5" /> {d.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button onClick={() => { duplicateMutation.mutate({ discountId: d.id, storeId }); setOpenMenuId(null); }}
                                className="w-full px-4 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-2">
                                <CopyPlus className="w-3.5 h-3.5" /> Duplicate
                              </button>
                              <div className="border-t border-border my-1" />
                              <button onClick={() => {
                                if (confirm("Delete this discount?")) {
                                  deleteMutation.mutate({ discountId: d.id, storeId }); setOpenMenuId(null);
                                }
                              }}
                                className="w-full px-4 py-2.5 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
