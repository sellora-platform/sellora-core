import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Eye, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Customers() {
  const { isAuthenticated } = useAuth();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Customers
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage and view your customer base
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 border-border/50">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search customers by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-border/50 focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* Customers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-12 border-border/50 text-center">
                <Users className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/60">No customers found</p>
              </Card>
            </div>
          ) : (
            filteredCustomers.map((customer: any) => (
              <Card
                key={customer.email}
                className="p-6 border-border/50 hover:border-accent/50 transition-colors"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {customer.email}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {customer.orderCount} orders
                  </p>
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-border/30">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </div>
                  <div className="text-sm">
                    <p className="text-foreground/60">Total Spent</p>
                    <p className="text-lg font-semibold text-foreground">
                      ${parseFloat(customer.totalSpent.toString()).toFixed(2)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-border/50 hover:bg-accent/5 gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
