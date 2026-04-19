import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, Plus, Copy, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Discounts() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed_amount">("percentage");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const discountsQuery = trpc.discounts.listByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  const createMutation = trpc.discounts.create.useMutation({
    onSuccess: () => {
      setCode("");
      setValue("");
      setMaxUses("");
      setShowForm(false);
      discountsQuery.refetch();
    },
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleCreateDiscount = async () => {
    if (!code || !value || !storeQuery.data) return;

    await createMutation.mutateAsync({
      storeId: storeQuery.data.id,
      code: code.toUpperCase(),
      type,
      value: value,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
    });
  };

  const discounts = discountsQuery.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="w-8 h-8 text-primary" />
              Discounts & Coupons
            </h1>
            <p className="text-foreground/60 mt-1">
              Create and manage discount codes
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Discount
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              New Discount Code
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Code
                </label>
                <Input
                  placeholder="e.g., SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border-border/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "percentage" | "fixed_amount")
                  }
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Value
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="border-border/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Uses (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="Unlimited if empty"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="border-border/50 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateDiscount}
                disabled={!code || !value || createMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Discount
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-border/50 hover:bg-accent/5"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Discounts Table */}
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/5 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Uses
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
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-foreground/60">
                        No discounts yet. Create one to get started!
                      </p>
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount: any) => (
                    <tr
                      key={discount.id}
                      className="hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-mono font-semibold text-foreground">
                          {discount.code}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/60">
                        {discount.type === "percentage" ? "Percentage" : "Fixed"}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : `$${parseFloat(discount.value.toString())}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/60">
                        {discount.usageCount || 0}
                        {discount.maxUses ? ` / ${discount.maxUses}` : ""}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-foreground/60 hover:bg-accent/10"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
