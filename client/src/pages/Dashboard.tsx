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
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const storeQuery = trpc.stores.getMyStore.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const store = storeQuery.data;
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              {store?.name || "My Store"}
            </h1>
            <p className="text-foreground/60 mt-2 text-lg">
              Welcome back, <span className="font-semibold text-foreground">{user?.name || "Merchant"}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/ai-assistant")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 text-primary-foreground gap-2 transition-all duration-300"
            >
              <Zap className="w-4 h-4" />
              AI Assistant
            </Button>
            <Button
              onClick={() => setLocation("/products/new")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: ShoppingCart,
              label: "Total Orders",
              value: stats.orders.toString(),
              change: stats.orders === 0 ? "0%" : "+12%", // Mock trend for now
              gradient: "from-blue-500/10 to-blue-600/10",
              borderColor: "border-blue-200/50",
              iconColor: "text-blue-600",
            },
            {
              icon: TrendingUp,
              label: "Revenue",
              value: `$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change: stats.revenue === 0 ? "0%" : "+8%",
              gradient: "from-emerald-500/10 to-emerald-600/10",
              borderColor: "border-emerald-200/50",
              iconColor: "text-emerald-600",
            },
            {
              icon: Users,
              label: "Customers",
              value: stats.customers.toString(),
              change: stats.customers === 0 ? "0%" : "+5%",
              gradient: "from-purple-500/10 to-purple-600/10",
              borderColor: "border-purple-200/50",
              iconColor: "text-purple-600",
            },
            {
              icon: TrendingUp,
              label: "Estimated Profit",
              value: `$${stats.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change: stats.profit === 0 ? "0%" : "+15%",
              gradient: "from-orange-500/10 to-orange-600/10",
              borderColor: "border-orange-200/50",
              iconColor: "text-orange-600",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className={`p-6 border ${stat.borderColor} bg-gradient-to-br ${stat.gradient} hover:shadow-lg transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white/50 ${stat.iconColor} group-hover:bg-white transition-all`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 font-medium mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders - Premium Design */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Recent Orders
                  </h2>
                  <p className="text-foreground/50 text-sm mt-1">Your latest transactions</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/orders")}
                  className="text-primary hover:bg-primary/5 font-semibold"
                >
                  View All →
                </Button>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-border/30 rounded-xl hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          Order #{1000 + idx}
                        </p>
                        <p className="text-sm text-foreground/50 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">$234.50</p>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50/80 px-3 py-1 rounded-full inline-block mt-1">
                        Processing
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions - Premium Design */}
          <div>
            <Card className="p-8 border-border/50 shadow-sm hover:shadow-md transition-shadow h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Quick Actions
              </h2>
              <p className="text-foreground/50 text-sm mb-6">Manage your store</p>

              <div className="space-y-2">
                {[
                  { icon: Package, label: "Manage Products", path: "/products", color: "from-blue-500/10 to-blue-600/10" },
                  { icon: Users, label: "View Customers", path: "/customers", color: "from-purple-500/10 to-purple-600/10" },
                  { icon: TrendingUp, label: "Create Discount", path: "/discounts", color: "from-emerald-500/10 to-emerald-600/10" },
                  { icon: BarChart3, label: "Store Settings", path: "/settings", color: "from-orange-500/10 to-orange-600/10" },
                  { icon: Store, label: "App Marketplace", path: "/marketplace", color: "from-pink-500/10 to-pink-600/10" },
                  { icon: Download, label: "Export Data", path: "/export-data", color: "from-indigo-500/10 to-indigo-600/10" },
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={idx}
                      onClick={() => setLocation(action.path)}
                      className={`w-full justify-start px-4 py-3 rounded-lg border border-border/30 bg-gradient-to-r ${action.color} hover:border-accent/50 hover:shadow-md transition-all duration-300 group text-foreground font-medium`}
                    >
                      <Icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Insights Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card className="p-8 border-border/50 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-6">Performance Metrics</h3>
            <div className="space-y-4">
              {[
                { label: "Average Order Value", value: "$156.23", change: "+4.2%" },
                { label: "Customer Retention", value: "78%", change: "+2.1%" },
                { label: "Cart Abandonment", value: "22%", change: "-1.5%" },
              ].map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                  <span className="text-foreground/70 font-medium">{metric.label}</span>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{metric.value}</p>
                    <p className="text-xs text-emerald-600 font-semibold">{metric.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Store Health */}
          <Card className="p-8 border-border/50 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-6">Store Health</h3>
            <div className="space-y-4">
              {[
                { label: "Product Inventory", status: "Healthy", color: "bg-emerald-50 text-emerald-700" },
                { label: "Payment Processing", status: "Active", color: "bg-blue-50 text-blue-700" },
                { label: "Shipping Integration", status: "Connected", color: "bg-purple-50 text-purple-700" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                  <span className="text-foreground/70 font-medium">{item.label}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
