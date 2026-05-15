import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Megaphone, Mail, MessageSquare, ShoppingCart, Users, TrendingUp, Send, Plus, Trash2,
  Clock, Zap, BarChart3, ArrowRight, Eye, MousePointerClick, Target, Edit, Power,
  Bot, Gift, UserPlus, ShoppingBag, CalendarClock, Sparkles, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ── Stat Card ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card className="p-5 border-border/40 bg-card/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-lg transition-all duration-500">
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} -mr-6 -mt-6 rounded-full opacity-[0.07] group-hover:scale-[2] transition-transform duration-700`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
          <p className="text-2xl font-black mt-1.5 tracking-tight">{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-1 font-medium">{sub}</p>}
        </div>
        <Icon className={`w-4 h-4 ${color.replace("bg-", "text-")}`} />
      </div>
    </Card>
  );
}

// ── Campaign Status Badge ───────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    draft: { cls: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", label: "Draft" },
    scheduled: { cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Scheduled" },
    sending: { cls: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Sending" },
    sent: { cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Sent" },
    paused: { cls: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Paused" },
    failed: { cls: "bg-red-500/10 text-red-500 border-red-500/20", label: "Failed" },
  };
  const s = map[status] || map.draft;
  return <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${s.cls}`}>{s.label}</Badge>;
}

// ── Trigger Icon Map ────────────────────────────────────────
const triggerMeta: Record<string, { icon: any; label: string; desc: string; color: string }> = {
  abandoned_cart: { icon: ShoppingCart, label: "Abandoned Cart", desc: "Customer leaves items in cart", color: "text-orange-500" },
  welcome: { icon: UserPlus, label: "Welcome Flow", desc: "New subscriber joins", color: "text-blue-500" },
  post_purchase: { icon: ShoppingBag, label: "Post Purchase", desc: "After order is completed", color: "text-emerald-500" },
  winback: { icon: Target, label: "Win-back", desc: "Re-engage inactive customers", color: "text-purple-500" },
  birthday: { icon: Gift, label: "Birthday", desc: "Customer birthday celebration", color: "text-pink-500" },
};

export default function Marketing() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const storeQuery = trpc.stores.getMyStore.useQuery();
  const storeId = storeQuery.data?.id || 0;

  const overview = trpc.marketing.getOverview.useQuery({ storeId }, { enabled: !!storeId });
  const campaigns = trpc.marketing.listCampaigns.useQuery({ storeId }, { enabled: !!storeId });
  const automations = trpc.marketing.listAutomations.useQuery({ storeId }, { enabled: !!storeId });
  const abandonedCarts = trpc.marketing.listAbandonedCarts.useQuery({ storeId }, { enabled: !!storeId });

  const createCampaign = trpc.marketing.createCampaign.useMutation({ onSuccess: () => { campaigns.refetch(); overview.refetch(); toast.success("Campaign created"); setShowCampaignModal(false); } });
  const deleteCampaign = trpc.marketing.deleteCampaign.useMutation({ onSuccess: () => { campaigns.refetch(); overview.refetch(); toast.success("Campaign deleted"); } });
  const sendCampaign = trpc.marketing.sendCampaign.useMutation({ onSuccess: () => { campaigns.refetch(); overview.refetch(); toast.success("Campaign sent!"); } });
  const createAutomation = trpc.marketing.createAutomation.useMutation({ onSuccess: () => { automations.refetch(); overview.refetch(); toast.success("Automation created"); setShowAutoModal(false); } });
  const toggleAutomation = trpc.marketing.toggleAutomation.useMutation({ onSuccess: () => { automations.refetch(); overview.refetch(); } });
  const deleteAutomation = trpc.marketing.deleteAutomation.useMutation({ onSuccess: () => { automations.refetch(); overview.refetch(); toast.success("Automation deleted"); } });

  // Campaign form
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [cf, setCf] = useState({ name: "", channel: "email" as "email" | "whatsapp", subject: "", body: "", segment: "all" });

  // Automation form
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [af, setAf] = useState({ name: "", trigger: "abandoned_cart" as string, channel: "email" as "email" | "whatsapp", subject: "", body: "", delayMinutes: 60, includeDiscount: false, discountValue: "" });

  if (!isAuthenticated) return null;
  const o = overview.data;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20">
                <Megaphone className="w-8 h-8 text-violet-500" />
              </div>
              Marketing
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Campaigns, automations & recovery — all in one place.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 font-bold text-xs" onClick={() => setShowAutoModal(true)}>
              <Bot className="w-4 h-4" /> New Automation
            </Button>
            <Button className="gap-2 font-bold text-xs bg-violet-600 hover:bg-violet-700" onClick={() => setShowCampaignModal(true)}>
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Subscribers" value={o?.subscribers ?? "—"} color="bg-blue-500" />
          <StatCard icon={Send} label="Campaigns Sent" value={o?.campaigns.sent ?? "—"} sub={`${o?.campaigns.draft ?? 0} drafts`} color="bg-violet-500" />
          <StatCard icon={ShoppingCart} label="Abandoned Carts" value={o?.abandonedCarts.active ?? "—"} sub={`${o?.abandonedCarts.recoveryRate ?? 0}% recovered`} color="bg-orange-500" />
          <StatCard icon={Zap} label="Active Automations" value={o?.automations.active ?? "—"} sub={`${o?.automations.totalConverted ?? 0} converted`} color="bg-emerald-500" />
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="campaigns" className="gap-2 font-bold text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Send className="w-3.5 h-3.5" /> Campaigns</TabsTrigger>
            <TabsTrigger value="automations" className="gap-2 font-bold text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Bot className="w-3.5 h-3.5" /> Automations</TabsTrigger>
            <TabsTrigger value="abandoned" className="gap-2 font-bold text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><ShoppingCart className="w-3.5 h-3.5" /> Abandoned Carts</TabsTrigger>
          </TabsList>

          {/* ─── Campaigns Tab ─────────────────────────────── */}
          <TabsContent value="campaigns" className="space-y-4">
            {!campaigns.data?.length ? (
              <Card className="p-16 text-center border-dashed border-2 border-border/50">
                <Send className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Create your first email or WhatsApp campaign to reach your subscribers.</p>
                <Button className="mt-6 gap-2 bg-violet-600 hover:bg-violet-700" onClick={() => setShowCampaignModal(true)}><Plus className="w-4 h-4" /> Create Campaign</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {campaigns.data.map((c: any) => (
                  <Card key={c.id} className="p-5 border-border/40 hover:border-violet-500/30 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center gap-5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.channel === "email" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                        {c.channel === "email" ? <Mail className="w-5 h-5 text-blue-500" /> : <MessageSquare className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold truncate">{c.name}</h3>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {c.subject || c.body?.slice(0, 80)}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-8 text-center shrink-0">
                        <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sent</p><p className="text-lg font-black">{c.recipientCount || 0}</p></div>
                        <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Opened</p><p className="text-lg font-black">{c.openedCount || 0}</p></div>
                        <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Clicked</p><p className="text-lg font-black">{c.clickedCount || 0}</p></div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {c.status === "draft" && (
                          <Button size="sm" variant="ghost" className="gap-1.5 text-xs font-bold text-violet-500 hover:text-violet-600 hover:bg-violet-500/10" onClick={() => sendCampaign.mutate({ id: c.id, storeId })}>
                            <Send className="w-3.5 h-3.5" /> Send
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-red-500" onClick={() => deleteCampaign.mutate({ id: c.id, storeId })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── Automations Tab ───────────────────────────── */}
          <TabsContent value="automations" className="space-y-4">
            {!automations.data?.length ? (
              <Card className="p-16 text-center border-dashed border-2 border-border/50">
                <Bot className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No automations yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Set up automated flows for abandoned carts, welcome emails, and more.</p>
                <Button className="mt-6 gap-2 bg-violet-600 hover:bg-violet-700" onClick={() => setShowAutoModal(true)}><Plus className="w-4 h-4" /> Create Automation</Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {automations.data.map((a: any) => {
                  const meta = triggerMeta[a.trigger] || triggerMeta.abandoned_cart;
                  const TIcon = meta.icon;
                  return (
                    <Card key={a.id} className="p-5 border-border/40 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.isActive ? "bg-emerald-500/10" : "bg-muted"}`}>
                            <TIcon className={`w-5 h-5 ${a.isActive ? meta.color : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{a.name}</h3>
                            <p className="text-[10px] text-muted-foreground">{meta.desc}</p>
                          </div>
                        </div>
                        <Switch checked={a.isActive} onCheckedChange={() => toggleAutomation.mutate({ id: a.id, storeId })} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.delayMinutes}m delay</span>
                        <span className="flex items-center gap-1">{a.channel === "email" ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />} {a.channel}</span>
                        {a.includeDiscount && <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Discount</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/30">
                        <div><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Sent</p><p className="text-base font-black">{a.sentCount || 0}</p></div>
                        <div><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Converted</p><p className="text-base font-black">{a.convertedCount || 0}</p></div>
                        <div><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Revenue</p><p className="text-base font-black">${parseFloat(a.revenue || "0").toLocaleString()}</p></div>
                      </div>
                      <Button size="icon" variant="ghost" className="absolute top-3 right-12 w-7 h-7 text-muted-foreground hover:text-red-500" onClick={() => deleteAutomation.mutate({ id: a.id, storeId })}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── Abandoned Carts Tab ───────────────────────── */}
          <TabsContent value="abandoned" className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={ShoppingCart} label="Total Abandoned" value={o?.abandonedCarts.total ?? 0} color="bg-orange-500" />
              <StatCard icon={AlertTriangle} label="Active" value={o?.abandonedCarts.active ?? 0} color="bg-red-500" />
              <StatCard icon={TrendingUp} label="Recovered" value={o?.abandonedCarts.recovered ?? 0} sub={`${o?.abandonedCarts.recoveryRate ?? 0}%`} color="bg-emerald-500" />
              <StatCard icon={Sparkles} label="Recovered Value" value={`$${(o?.abandonedCarts.recoveredValue ?? 0).toLocaleString()}`} color="bg-violet-500" />
            </div>
            {!abandonedCarts.data?.length ? (
              <Card className="p-16 text-center border-dashed border-2 border-border/50">
                <ShoppingCart className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No abandoned carts</h3>
                <p className="text-sm text-muted-foreground mt-1">Abandoned carts from your storefront will appear here automatically.</p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {abandonedCarts.data.map((cart: any) => (
                  <Card key={cart.id} className="p-4 border-border/40 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cart.status === "recovered" ? "bg-emerald-500/10" : cart.status === "reminded" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                        <ShoppingCart className={`w-5 h-5 ${cart.status === "recovered" ? "text-emerald-500" : cart.status === "reminded" ? "text-amber-500" : "text-red-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{cart.customerEmail || cart.customerPhone || "Anonymous"}</p>
                        <p className="text-[10px] text-muted-foreground">{(cart.cartItems?.length || 0)} items · ${parseFloat(cart.cartTotal || "0").toFixed(2)}</p>
                      </div>
                      <div className="hidden md:block text-right shrink-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{cart.remindersSent || 0} reminders</p>
                      </div>
                      <Badge variant="outline" className={`text-[8px] font-black uppercase shrink-0 ${cart.status === "recovered" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : cart.status === "reminded" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {cart.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Create Campaign Modal ─────────────────────────── */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-black text-xl">Create Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Campaign name" value={cf.name} onChange={e => setCf(p => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={cf.channel} onValueChange={(v: any) => setCf(p => ({ ...p, channel: v }))}>
                <SelectTrigger><SelectValue placeholder="Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email"><span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span></SelectItem>
                  <SelectItem value="whatsapp"><span className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</span></SelectItem>
                </SelectContent>
              </Select>
              <Select value={cf.segment} onValueChange={(v) => setCf(p => ({ ...p, segment: v }))}>
                <SelectTrigger><SelectValue placeholder="Audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="subscribers">Subscribers Only</SelectItem>
                  <SelectItem value="buyers">Past Buyers</SelectItem>
                  <SelectItem value="vip">VIP (5+ orders)</SelectItem>
                  <SelectItem value="inactive">Inactive (30d+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cf.channel === "email" && <Input placeholder="Subject line" value={cf.subject} onChange={e => setCf(p => ({ ...p, subject: e.target.value }))} />}
            <Textarea placeholder={cf.channel === "email" ? "Email body (HTML supported)" : "WhatsApp message"} rows={5} value={cf.body} onChange={e => setCf(p => ({ ...p, body: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700 gap-2" disabled={!cf.name || !cf.body || createCampaign.isPending} onClick={() => createCampaign.mutate({ storeId, ...cf })}>
              <Plus className="w-4 h-4" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Automation Modal ───────────────────────── */}
      <Dialog open={showAutoModal} onOpenChange={setShowAutoModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-black text-xl">Create Automation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Automation name" value={af.name} onChange={e => setAf(p => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={af.trigger} onValueChange={(v) => setAf(p => ({ ...p, trigger: v }))}>
                <SelectTrigger><SelectValue placeholder="Trigger" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(triggerMeta).map(([k, v]) => (
                    <SelectItem key={k} value={k}><span className="flex items-center gap-2"><v.icon className={`w-3.5 h-3.5 ${v.color}`} /> {v.label}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={af.channel} onValueChange={(v: any) => setAf(p => ({ ...p, channel: v }))}>
                <SelectTrigger><SelectValue placeholder="Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email"><span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span></SelectItem>
                  <SelectItem value="whatsapp"><span className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input type="number" placeholder="Delay (minutes)" value={af.delayMinutes} onChange={e => setAf(p => ({ ...p, delayMinutes: parseInt(e.target.value) || 60 }))} className="flex-1" />
              <span className="text-xs text-muted-foreground shrink-0">min delay</span>
            </div>
            {af.channel === "email" && <Input placeholder="Subject line" value={af.subject} onChange={e => setAf(p => ({ ...p, subject: e.target.value }))} />}
            <Textarea placeholder="Message body" rows={4} value={af.body} onChange={e => setAf(p => ({ ...p, body: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoModal(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700 gap-2" disabled={!af.name || !af.body || createAutomation.isPending} onClick={() => createAutomation.mutate({ storeId, ...af })}>
              <Plus className="w-4 h-4" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
