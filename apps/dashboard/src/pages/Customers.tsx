import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, TrendingUp, DollarSign, ShoppingBag, ArrowRight, MailCheck, Calendar } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow, format } from "date-fns";

export default function Customers() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [search, setSearch] = useState("");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const storeId = storeQuery.data?.id || 0;

  const customersQuery = trpc.customers.list.useQuery(
    { storeId },
    { enabled: !!storeId }
  );

  if (!isAuthenticated) {
    return null;
  }

  const customers = customersQuery.data || [];
  const filteredCustomers = customers.filter((c: any) =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    ((c.firstName || "") + " " + (c.lastName || "")).toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum: number, c: any) => sum + parseFloat(c.totalSpent || "0"), 0);
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                CustomersBase
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Analyze subscriber growth and manage your customer relationships.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Audience</p>
                  <p className="text-3xl font-black text-foreground mt-2">{totalCustomers}</p>
                </div>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Revenue</p>
                  <p className="text-3xl font-black text-foreground mt-2">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
            </Card>
            <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Average Value</p>
                  <p className="text-3xl font-black text-foreground mt-2">
                    ${avgOrderValue.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </Card>
          </div>
        </div>

        {/* Search Section */}
        <Card className="p-4 border-border/50 bg-muted/20 backdrop-blur-sm">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm transition-all"
              />
            </div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-background border px-4 h-12 flex items-center rounded-xl">
              {filteredCustomers.length} Found
            </div>
          </div>
        </Card>

        {/* Customers Grid */}
        {customersQuery.isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <Card className="p-20 border-border/50 text-center bg-card/30">
            <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <h3 className="text-xl font-bold">No customers yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Your subscribers and buyers will appear here automatically once they interact with your store.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer: any) => {
              const isNew = new Date(customer.createdAt).getTime() > Date.now() - (24 * 60 * 60 * 1000);
              return (
                <Card
                  key={customer.id}
                  className="p-6 border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative bg-card/40 backdrop-blur-sm overflow-hidden"
                >
                  {isNew && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-[0.2em] shadow-lg">
                      New
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20 mb-4 group-hover:scale-110 transition-transform">
                        {customer.firstName?.[0] || customer.email[0].toUpperCase()}
                      </div>
                      <h3 className="text-lg font-black text-foreground truncate group-hover:text-primary transition-colors">
                        {customer.firstName ? `${customer.firstName} ${customer.lastName}` : customer.email.split('@')[0]}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1 truncate uppercase tracking-widest">{customer.email}</p>
                    </div>
                  </div>

                  {/* Customer Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {customer.acceptsMarketing && (
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-2">
                        <MailCheck className="w-3 h-3 mr-1" /> Marketing
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-blue-500/5 text-blue-500 border-blue-500/20 px-2">
                      <Calendar className="w-3 h-3 mr-1" /> Joined {format(new Date(customer.createdAt), 'MMM yyyy')}
                    </Badge>
                  </div>

                  {/* Customer Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-border/30">
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Orders</p>
                      <p className="text-xl font-black">{customer.totalOrders || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Spent</p>
                      <p className="text-xl font-black">${parseFloat(customer.totalSpent || "0").toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full border-border/50 rounded-xl h-12 font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500 flex items-center justify-center gap-2"
                  >
                    View History
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
