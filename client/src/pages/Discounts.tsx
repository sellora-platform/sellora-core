import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tag,
  Plus,
  Copy,
  Trash2,
  TrendingDown,
  Calendar,
  Search,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Discounts() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const discountsQuery = trpc.discounts.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  const createMutation = trpc.discounts.create.useMutation({
    onSuccess: () => {
      discountsQuery.refetch();
      setShowForm(false);
      toast.success("Discount created successfully!");
    },
  });

  // Delete mutation not yet implemented
  // const deleteMutation = trpc.discounts.delete.useMutation({
  //   onSuccess: () => {
  //     discountsQuery.refetch();
  //     toast.success("Discount deleted successfully!");
  //   },
  // });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const discounts = discountsQuery.data || [];
  const filteredDiscounts = discounts.filter((d: any) =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateDiscount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const discountType = formData.get("discountType") as string;
    const value = parseFloat(formData.get("value") as string);

    createMutation.mutate({
      storeId: storeQuery.data?.id || 0,
      code: (formData.get("code") as string).toUpperCase(),
      type: discountType as "percentage" | "fixed_amount",
      value: value.toString(),
    });
  };

  const totalDiscounts = discounts.length;
  const totalValue = discounts.reduce((sum: number, d: any) => sum + parseFloat(d.value.toString()), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <Tag className="w-8 h-8 text-amber-600" />
                </div>
                Discounts & Coupons
              </h1>
              <p className="text-foreground/60 mt-2">
                Create and manage promotional codes
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg gap-2"
            >
              <Plus className="w-5 h-5" />
              New Discount
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 border-border/50 bg-gradient-to-br from-amber-50/50 to-amber-50/20 dark:from-amber-950/20 dark:to-amber-950/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Total Discounts</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{totalDiscounts}</p>
                </div>
                <Tag className="w-5 h-5 text-amber-600 opacity-50" />
              </div>
            </Card>
            <Card className="p-6 border-border/50 bg-gradient-to-br from-green-50/50 to-green-50/20 dark:from-green-950/20 dark:to-green-950/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Total Discount Value</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    ${totalValue.toFixed(2)}
                  </p>
                </div>
                <Zap className="w-5 h-5 text-green-600 opacity-50" />
              </div>
            </Card>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-8 border-border/50 bg-gradient-to-br from-background to-card/50">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create New Discount</h2>
            <form onSubmit={handleCreateDiscount} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Coupon Code
                  </label>
                  <Input
                    name="code"
                    placeholder="e.g., SUMMER20"
                    required
                    className="border-border/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Discount Type
                  </label>
                  <Select name="discountType" defaultValue="percentage">
                    <SelectTrigger className="border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Discount Value
                </label>
                <Input
                  name="value"
                  type="number"
                  placeholder="e.g., 20"
                  step="0.01"
                  required
                  className="border-border/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg"
                >
                  {createMutation.isPending ? "Creating..." : "Create Discount"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-border/50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search Section */}
        <Card className="p-6 border-border/50 bg-gradient-to-br from-background to-card/50">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <Input
                placeholder="Search discounts by code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 py-3 border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 text-base transition-all"
              />
            </div>
            <span className="text-sm font-medium text-foreground/60 px-4 py-2 bg-background rounded-lg border border-border/30">
              {filteredDiscounts.length} discounts
            </span>
          </div>
        </Card>

        {/* Discounts List */}
        {filteredDiscounts.length === 0 ? (
          <Card className="p-16 border-border/50 text-center">
            <Tag className="w-16 h-16 text-foreground/10 mx-auto mb-6" />
            <p className="text-lg font-medium text-foreground/60">No discounts found</p>
            <p className="text-sm text-foreground/40 mt-2">
              {search ? "Try adjusting your search" : "Create your first discount code"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDiscounts.map((discount: any) => (
              <Card
                key={discount.id}
                className="p-6 border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="font-mono text-lg font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                        {discount.code}
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Active
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-foreground/40" />
                        <span className="text-foreground/60">
                          {discount.type === "percentage"
                            ? `${discount.value}% off`
                            : `$${parseFloat(discount.value.toString()).toFixed(2)} off`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-foreground/40" />
                        <span className="text-foreground/60">
                          {discount.usageCount || 0} uses
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(discount.code);
                        toast.success("Code copied!");
                      }}
                      className="text-foreground/60 hover:text-foreground hover:bg-primary/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-50 cursor-not-allowed"
                      title="Delete coming soon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
