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
    const colors: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700",
      processing: "bg-blue-50 text-blue-700",
      shipped: "bg-purple-50 text-purple-700",
      delivered: "bg-green-50 text-green-700",
      cancelled: "bg-red-50 text-red-700",
      refunded: "bg-gray-50 text-gray-700",
    };
    return colors[status] || "bg-gray-50 text-gray-700";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-primary" />
              Orders
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage and fulfill customer orders
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 border-border/50">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search by order number or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-border/50 focus:border-primary"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-border/50 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none appearance-none pr-10"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-foreground/40 pointer-events-none" />
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="border-border/50 overflow-hidden">
          {ordersQuery.isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/5 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-foreground/60">No orders found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-accent/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">
                            {order.orderNumber}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">
                            {order.customerEmail}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground/60">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          ${parseFloat(order.total.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(
                              order.status || "pending"
                            )}`}
                          >
                            {(order.status || "pending")
                              .charAt(0)
                              .toUpperCase() +
                              (order.status || "pending").slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setLocation(`/orders/${order.id}`)
                            }
                            className="text-primary hover:bg-primary/5"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
