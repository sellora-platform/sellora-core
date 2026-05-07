import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ExportData() {
  const { isAuthenticated, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const storeQuery = trpc.stores.getMyStore.useQuery();
  const [loading, setLoading] = useState<string | null>(null);

  // Export procedures
  const exportSalesQuery = trpc.exports.exportSalesData.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: false }
  );
  const exportCustomersQuery = trpc.exports.exportCustomerData.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: false }
  );
  const exportOrderDetailsQuery = trpc.exports.exportOrderDetails.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: false }
  );
  const exportInventoryQuery = trpc.exports.exportProductInventory.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: false }
  );
  const exportDiscountsQuery = trpc.exports.exportDiscountUsage.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: false }
  );

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleExport = async (
    exportFn: any,
    exportName: string
  ) => {
    try {
      setLoading(exportName);
      const result = await exportFn();

      if (result.data) {
        // Create blob and download
        const blob = new Blob([result.data.csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(
          `Exported ${result.data.rowCount} rows to ${result.data.filename}`
        );
      }
    } catch (error) {
      toast.error(`Failed to export ${exportName}`);
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const exportOptions = [
    {
      id: "sales",
      title: "Sales Data",
      description: "Export all orders with totals, taxes, and discounts",
      icon: TrendingUp,
      color: "from-blue-500/10 to-blue-600/10",
      borderColor: "border-blue-200",
      fn: () => exportSalesQuery.refetch(),
    },
    {
      id: "customers",
      title: "Customer Data",
      description: "Export customer list with order history and spending",
      icon: Users,
      color: "from-purple-500/10 to-purple-600/10",
      borderColor: "border-purple-200",
      fn: () => exportCustomersQuery.refetch(),
    },
    {
      id: "orders",
      title: "Order Details",
      description: "Export detailed order information with line items",
      icon: ShoppingCart,
      color: "from-green-500/10 to-green-600/10",
      borderColor: "border-green-200",
      fn: () => exportOrderDetailsQuery.refetch(),
    },
    {
      id: "inventory",
      title: "Product Inventory",
      description: "Export product list with SKUs, prices, and stock levels",
      icon: Package,
      color: "from-orange-500/10 to-orange-600/10",
      borderColor: "border-orange-200",
      fn: () => exportInventoryQuery.refetch(),
    },
    {
      id: "discounts",
      title: "Discount Usage",
      description: "Export coupon codes with usage statistics",
      icon: Tag,
      color: "from-pink-500/10 to-pink-600/10",
      borderColor: "border-pink-200",
      fn: () => exportDiscountsQuery.refetch(),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Download className="w-8 h-8 text-primary" />
            Export Data
          </h1>
          <p className="text-foreground/60 mt-1">
            Download your sales, customer, and inventory data as CSV files
          </p>
        </div>

        {/* Info Banner */}
        <Card className="p-4 border-border/50 bg-blue-50/50 border-blue-200/50 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">CSV Export Information</p>
            <p>
              All exported files are generated in real-time from your current
              store data. Use these exports for analysis, backup, or integration
              with other tools.
            </p>
          </div>
        </Card>

        {/* Export Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isLoading = loading === option.id;

            return (
              <Card
                key={option.id}
                className={`p-6 border-border/50 bg-gradient-to-br ${option.color} hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/60 text-foreground/70">
                    CSV
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-foreground/60 mb-6">
                  {option.description}
                </p>

                <Button
                  onClick={() => handleExport(option.fn, option.id)}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10"
                >
                  <Download className="w-4 h-4" />
                  {isLoading ? "Generating..." : "Download CSV"}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <Card className="p-6 border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Export Format Details
          </h2>
          <div className="space-y-4 text-sm text-foreground/60">
            <div>
              <p className="font-medium text-foreground mb-1">Sales Data</p>
              <p>
                Includes order number, date, customer email, subtotal, tax,
                shipping, discounts, total amount, and order status.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Customer Data</p>
              <p>
                Shows unique customers with order count, total spent, first
                order date, last order date, and average order value.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Order Details</p>
              <p>
                Contains line-by-line order information including product names,
                SKUs, quantities, unit prices, and line totals.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                Product Inventory
              </p>
              <p>
                Lists all products with SKUs, prices, current stock quantities,
                and creation/update dates.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Discount Usage</p>
              <p>
                Shows coupon codes, discount type (percentage or fixed), value,
                usage count, and maximum uses.
              </p>
            </div>
          </div>
        </Card>

        {/* Usage Tips */}
        <Card className="p-6 border-border/50 bg-accent/5">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Tips for Using Your Data
          </h2>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Import CSV files into Excel, Google Sheets, or other
                spreadsheet applications
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Use data exports for financial reporting and tax preparation
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Analyze customer behavior and trends with your exported data
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Create regular backups of your business data for security
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Integrate with third-party tools and services using exported
                data
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
