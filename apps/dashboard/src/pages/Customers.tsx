import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, TrendingUp, DollarSign, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Customers() {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const ordersQuery = trpc.orders.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  // Extract unique customers from orders
  const customers = ordersQuery.data
    ? Array.from(
        new Map(
          ordersQuery.data.map((order: any) => [
            order.customerEmail,
            {
              email: order.customerEmail,
              orderCount: ordersQuery.data.filter(
                (o: any) => o.customerEmail === order.customerEmail
              ).length,
              totalSpent: ordersQuery.data
                .filter((o: any) => o.customerEmail === order.customerEmail)
                .reduce((sum: number, o: any) => sum + parseFloat(o.total.toString()), 0),
            },
          ])
        ).values()
      )
    : [];

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const filteredCustomers = customers.filter((c: any) =>
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum: number, c: any) => sum + c.totalSpent, 0);
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                Customers
              </h1>
              <p className="text-foreground/60 mt-2">
                Manage and analyze your customer base
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 border-border/50 bg-gradient-to-br from-blue-50/50 to-blue-50/20 dark:from-blue-950/20 dark:to-blue-950/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Total Customers</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{totalCustomers}</p>
                </div>
                <Users className="w-5 h-5 text-blue-600 opacity-50" />
              </div>
            </Card>
            <Card className="p-6 border-border/50 bg-gradient-to-br from-green-50/50 to-green-50/20 dark:from-green-950/20 dark:to-green-950/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-5 h-5 text-green-600 opacity-50" />
              </div>
            </Card>
            <Card className="p-6 border-border/50 bg-gradient-to-br from-purple-50/50 to-purple-50/20 dark:from-purple-950/20 dark:to-purple-950/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Avg. Order Value</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    ${avgOrderValue.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600 opacity-50" />
              </div>
            </Card>
          </div>
        </div>

        {/* Search Section */}
        <Card className="p-6 border-border/50 bg-gradient-to-br from-background to-card/50">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <Input
                placeholder="Search customers by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 py-3 border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 text-base transition-all"
              />
            </div>
            <span className="text-sm font-medium text-foreground/60 px-4 py-2 bg-background rounded-lg border border-border/30">
              {filteredCustomers.length} customers
            </span>
          </div>
        </Card>

        {/* Customers Grid */}
        {filteredCustomers.length === 0 ? (
          <Card className="p-16 border-border/50 text-center">
            <Users className="w-16 h-16 text-foreground/10 mx-auto mb-6" />
            <p className="text-lg font-medium text-foreground/60">No customers found</p>
            <p className="text-sm text-foreground/40 mt-2">
              {search ? "Try adjusting your search" : "Your customers will appear here"}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer: any) => (
              <Card
                key={customer.email}
                className="p-6 border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {customer.email}
                    </h3>
                    <p className="text-xs text-foreground/50 mt-1">Customer</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                </div>

                {/* Customer Stats */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Orders
                    </span>
                    <span className="font-bold text-foreground">{customer.orderCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total Spent
                    </span>
                    <span className="font-bold text-foreground">
                      ${customer.totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  className="w-full border-border/50 hover:bg-primary/5 group-hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
