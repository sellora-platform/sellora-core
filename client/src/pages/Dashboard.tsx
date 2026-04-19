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
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const storeQuery = trpc.stores.getMyStore.useQuery();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const store = storeQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {store?.name || "My Store"}
            </h1>
            <p className="text-foreground/60 mt-1">
              Welcome back, {user?.name || "Merchant"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/ai-assistant")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </Button>
            <Button
              onClick={() => setLocation("/products/new")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: ShoppingCart,
              label: "Total Orders",
              value: "1,234",
              change: "+12%",
            },
            {
              icon: TrendingUp,
              label: "Revenue",
              value: "$45,231",
              change: "+8%",
            },
            {
              icon: Users,
              label: "Customers",
              value: "892",
              change: "+5%",
            },
            {
              icon: BarChart3,
              label: "Conversion",
              value: "3.2%",
              change: "+0.5%",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6 border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-primary/60" />
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Recent Orders
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/orders")}
                  className="text-primary hover:bg-primary/5"
                >
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Order #{1000 + idx}
                      </p>
                      <p className="text-sm text-foreground/60">
                        2 hours ago
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">$234.50</p>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Processing
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Button
                  onClick={() => setLocation("/products")}
                  variant="outline"
                  className="w-full justify-start border-border/50 hover:bg-accent/5"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Manage Products
                </Button>
                <Button
                  onClick={() => setLocation("/customers")}
                  variant="outline"
                  className="w-full justify-start border-border/50 hover:bg-accent/5"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Customers
                </Button>
                <Button
                  onClick={() => setLocation("/discounts")}
                  variant="outline"
                  className="w-full justify-start border-border/50 hover:bg-accent/5"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Discount
                </Button>
                <Button
                  onClick={() => setLocation("/settings")}
                  variant="outline"
                  className="w-full justify-start border-border/50 hover:bg-accent/5"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Store Settings
                </Button>
                <Button
                  onClick={() => setLocation("/marketplace")}
                  variant="outline"
                  className="w-full justify-start border-border/50 hover:bg-accent/5"
                >
                  <Store className="w-4 h-4 mr-2" />
                  App Marketplace
                </Button>
                <Button
                  onClick={() => setLocation("/export-data")}
                  variant="outline"
                  className="w-full justify-start border-border/50 hover:bg-accent/5"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
