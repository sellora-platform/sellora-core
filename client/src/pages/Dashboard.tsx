import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  MessageSquare,
  Store,
  Download,
  ArrowUpRight,
  Clock,
  Package,
  Zap,
  Sparkles,
  Check,
  Layout,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated, loading, refresh } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  
  const storesQuery = trpc.stores.getMyStores.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const myRequestsQuery = trpc.subscriptions.getMyRequests.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const store = storesQuery.data?.[0];
  const pendingRequest = myRequestsQuery.data?.find(r => r.status === "pending");

  const statsQuery = trpc.dashboard.getStats.useQuery(undefined, {
    enabled: !!store,
  });

  if (loading || !isAuthenticated) {
    return null;
  }

  const stats = statsQuery.data || {
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    profit: 0,
  };

  const planName = user?.tier.toUpperCase() || "FREE";
  const storeLimit = user?.tier === "starter" ? 1 : user?.tier === "growth" ? 3 : user?.tier === "scale" ? 10 : user?.tier === "empire" ? 999 : 1;
  const storeCount = storesQuery.data?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* TOP BAR: Welcome & Plan Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              Marhaba, {user?.name?.split(' ')[0] || "Merchant"}! <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-foreground/60 text-lg">Here's what's happening with your empire today.</p>
          </div>

          <Card className="p-4 bg-card/40 backdrop-blur-md border-primary/20 flex items-center gap-6 shadow-xl shadow-primary/5">
            <div className="flex flex-col items-center px-4 border-r border-border/50">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Current Tier</span>
              <span className="text-xl font-black text-foreground">{planName}</span>
            </div>
            <div className="flex flex-col items-center px-4">
              <span className="text-[10px] font-bold text-foreground/40 tracking-widest uppercase">Stores</span>
              <span className="text-xl font-black text-foreground">{storeCount} <span className="text-foreground/30">/ {storeLimit}</span></span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setLocation("/billing")} className="text-primary hover:bg-primary/5 font-bold">
              Upgrade
            </Button>
          </Card>
        </div>

        {/* STATUS NOTIFICATIONS (Banners) */}
        {pendingRequest && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-amber-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center animate-pulse">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Subscription Pending Verification</h3>
                <p className="text-sm text-foreground/60">We received your {pendingRequest.tier} plan request. Activation takes up to 24 hours.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation("/billing")}>View Receipt</Button>
          </div>
        )}

        {/* MAIN ACTIONS & CHECKLIST */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Action 1: Theme Editor */}
          <Card 
            onClick={() => setLocation("/editor")}
            className="group lg:col-span-2 relative overflow-hidden p-10 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer border-2"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
              <Layout className="w-64 h-64 text-primary" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground">Design Your Storefront</h2>
                <p className="text-foreground/60 text-lg max-w-md">Our visual editor is now live. Build a world-class shopping experience with sections and blocks.</p>
              </div>
              <Button size="lg" className="h-14 px-10 rounded-xl bg-primary font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Open Theme Editor
              </Button>
            </div>
          </Card>

          {/* Action 2: Launch Checklist */}
          <Card className="p-8 border-border/50 bg-card/30 space-y-6">
            <h3 className="text-xl font-bold text-foreground">Launch Checklist</h3>
            <div className="space-y-4">
              {[
                { label: "Create First Product", done: stats.products > 0, path: "/products/new" },
                { label: "Customize Store Theme", done: false, path: "/editor" },
                { label: "Set Up Local Payments", done: true, path: "/billing" }, // Mocked for now
                { label: "Add Custom Domain", done: !!store?.customDomain, path: "/settings" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-border/50 group-hover:border-primary'}`}>
                      {item.done && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${item.done ? 'text-foreground/40 line-through' : 'text-foreground/80'}`}>{item.label}</span>
                  </div>
                  {!item.done && <Button variant="ghost" size="sm" onClick={() => setLocation(item.path)} className="text-primary hover:bg-primary/5 p-0 h-auto">Setup</Button>}
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-border/50">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Growth Tip</p>
                <p className="text-sm text-foreground/70">"Stores with a custom domain have 3x higher trust scores in Pakistan."</p>
              </div>
            </div>
          </Card>
        </div>

        {/* STATS SECTION */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Business Intelligence</h2>
            <Button variant="ghost" onClick={refresh} className="text-foreground/40 hover:text-primary"><Clock className="w-4 h-4 mr-2" /> Refresh Data</Button>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: ShoppingCart, label: "Orders", value: stats.orders, color: "text-blue-500", bg: "bg-blue-500/5" },
              { icon: TrendingUp, label: "Net Revenue", value: `$${stats.revenue.toFixed(2)}`, color: "text-emerald-500", bg: "bg-emerald-500/5" },
              { icon: Users, label: "Customers", value: stats.customers, color: "text-purple-500", bg: "bg-purple-500/5" },
              { icon: Package, label: "Products", value: stats.products, color: "text-orange-500", bg: "bg-orange-500/5" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className={`p-6 border-border/40 ${stat.bg} group hover:border-primary/30 transition-all cursor-pointer`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-foreground/60">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-black text-foreground">{stat.value}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* QUICK ACCESS GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 space-y-4 hover:shadow-lg transition-all border-border/50">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Marketing & AI</h3>
            <p className="text-sm text-foreground/50">Auto-generate ads and social media posts for your products.</p>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/ai-assistant")}>Open AI Assistant</Button>
          </Card>
          
          <Card className="p-8 space-y-4 hover:shadow-lg transition-all border-border/50">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Inventory Control</h3>
            <p className="text-sm text-foreground/50">Keep track of your stock across all your stores in one place.</p>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/products")}>Manage Stock</Button>
          </Card>

          <Card className="p-8 space-y-4 hover:shadow-lg transition-all border-border/50 bg-gradient-to-br from-foreground to-foreground/80 text-background">
            <div className="w-10 h-10 rounded-xl bg-background/20 text-background flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Sellora Academy</h3>
            <p className="text-sm text-background/60">Learn how to scale from 0 to 100 orders per day in Pakistan.</p>
            <Button variant="secondary" className="w-full bg-background text-foreground font-bold">Watch Tutorials</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
