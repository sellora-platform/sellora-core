import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Search,
  Eye,
  ChevronDown,
  Loader2,
  Package,
  Calendar,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const ordersQuery = trpc.orders.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const orders = ordersQuery.data || [];
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200/50" },
      processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/50" },
      shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/50" },
      delivered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200/50" },
      cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200/50" },
      refunded: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200/50" },
    };
    return colors[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200/50" };
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Orders
            </h1>
            <p className="text-foreground/60 mt-2">
              Manage and fulfill customer orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-sm text-foreground/60 font-medium mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Revenue
              </span>
            </div>
            <p className="text-sm text-foreground/60 font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-orange-500/10 to-orange-600/10 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-orange-600" />
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-sm text-foreground/60 font-medium mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-foreground">{pendingOrders}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <Input
              placeholder="Search by order number or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-3 border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-border/50 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none pr-10 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40 pointer-events-none" />
          </div>
        </div>

        {/* Orders List */}
        {ordersQuery.isLoading ? (
          <Card className="p-12 border-border/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </Card>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status || "pending");
              return (
                <Card
                  key={order.id}
                  className="p-6 border-border/50 hover:shadow-lg hover:border-accent/50 transition-all duration-300 group cursor-pointer"
                  onClick={() => setLocation(`/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Order Number */}
                      <div className="min-w-fit">
                        <p className="text-xs text-foreground/60 font-medium mb-1">
                          Order ID
                        </p>
                        <p className="font-bold text-lg text-foreground">
                          {order.orderNumber}
                        </p>
                      </div>

                      {/* Customer */}
                      <div className="flex-1 min-w-fit">
                        <p className="text-xs text-foreground/60 font-medium mb-1">
                          Customer
                        </p>
                        <p className="font-medium text-foreground">
                          {order.customerEmail}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="hidden md:block min-w-fit">
                        <p className="text-xs text-foreground/60 font-medium mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Date
                        </p>
                        <p className="font-medium text-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="min-w-fit">
                        <p className="text-xs text-foreground/60 font-medium mb-1 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Total
                        </p>
                        <p className="font-bold text-lg text-foreground">
                          ${parseFloat(order.total.toString()).toFixed(2)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="min-w-fit">
                        <p className="text-xs text-foreground/60 font-medium mb-1">
                          Status
                        </p>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                        >
                          {(order.status || "pending")
                            .charAt(0)
                            .toUpperCase() +
                            (order.status || "pending").slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4 group-hover:bg-primary/10 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 border-border/50 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-accent/10">
                <ShoppingBag className="w-8 h-8 text-foreground/40" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  No orders found
                </h3>
                <p className="text-foreground/60">
                  {search || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No orders yet. Your orders will appear here."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
