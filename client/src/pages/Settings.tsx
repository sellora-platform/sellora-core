import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function StoreSettings() {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const updateMutation = trpc.stores.update.useMutation({
    onSuccess: () => {
      storeQuery.refetch();
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    fontFamily: "sans-serif",
    customDomain: "",
  });

  // Sync form data when store query finishes
  useEffect(() => {
    if (storeQuery.data) {
      setFormData({
        name: storeQuery.data.name || "",
        description: storeQuery.data.description || "",
        primaryColor: storeQuery.data.primaryColor || "#000000",
        secondaryColor: storeQuery.data.secondaryColor || "#ffffff",
        fontFamily: storeQuery.data.fontFamily || "sans-serif",
        customDomain: storeQuery.data.customDomain || "",
      });
    }
  }, [storeQuery.data]);

  if (!isAuthenticated || loading || storeQuery.isLoading) {
    return null;
  }

  const handleSave = async () => {
    if (!storeQuery.data) return;

    try {
      await updateMutation.mutateAsync({
        storeId: storeQuery.data.id,
        ...formData,
      });
      // Success toast is handled by TRPC or we could add one here
    } catch (error) {
      console.error("Failed to update store:", error);
    }
  };

  const isDomainConnected = storeQuery.data?.customDomain && !updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Store Settings
          </h1>
          <p className="text-foreground/60 mt-1">
            Manage your store's identity and custom domains
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6 border-border/50">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Store Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-border/50 focus:border-primary"
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border-border/50 focus:border-primary resize-none"
                    rows={4}
                    placeholder="Tell your customers about your store"
                  />
                </div>
              </div>
            </Card>

            {/* Domain Settings */}
            <Card className="p-6 border-border/50 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Domains
                  </h2>
                  <p className="text-sm text-foreground/60">
                    Connect your own professional domain
                  </p>
                </div>
                {storeQuery.data?.customDomain && (
                  <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending Connection
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-border/50 bg-accent/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground/70">Default Address</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">Primary</span>
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {storeQuery.data?.slug}.raaenai.com
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Custom Domain
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="e.g. wazewear.com"
                          value={formData.customDomain}
                          onChange={(e) =>
                            setFormData({ ...formData, customDomain: e.target.value.toLowerCase().replace(/https?:\/\/|www\./g, "") })
                          }
                          className="border-border/50 focus:border-primary pl-9"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30">
                          https://
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/50 mt-2">
                      Enter your domain name (e.g. <b>wazewear.com</b>). We will handle the SSL certificate automatically.
                    </p>
                  </div>
                  
                  {formData.customDomain && (
                    <div className="bg-primary/[0.03] border border-primary/20 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">!</div>
                        <h3 className="text-sm font-bold text-foreground">Setup Required</h3>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        To finish connecting your domain, go to your domain provider (like Namecheap) and set these records:
                      </p>
                      
                      <div className="grid gap-3">
                        <div className="p-3 rounded-lg bg-background border border-border/50 flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/40">A Record (Host: @)</span>
                          <div className="flex justify-between items-center">
                            <code className="text-primary font-bold">76.76.21.21</code>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => navigator.clipboard.writeText("76.76.21.21")}>Copy</Button>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-background border border-border/50 flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/40">CNAME (Host: www)</span>
                          <div className="flex justify-between items-center">
                            <code className="text-primary font-bold">cname.vercel-dns.com</code>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => navigator.clipboard.writeText("cname.vercel-dns.com")}>Copy</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Design Settings */}
            <Card className="p-6 border-border/50">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Design Settings
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-12 h-10 rounded-lg border border-border/50 cursor-pointer"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryColor: e.target.value,
                          })
                        }
                        className="flex-1 border-border/50 focus:border-primary font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="w-12 h-10 rounded-lg border border-border/50 cursor-pointer"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="flex-1 border-border/50 focus:border-primary font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Font Family
                  </label>
                  <select
                    value={formData.fontFamily}
                    onChange={(e) =>
                      setFormData({ ...formData, fontFamily: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>

          {/* Preview */}
          <div>
            <Card className="p-6 border-border/50 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Preview
              </h2>
              <div
                className="p-4 rounded-lg border-2 border-dashed border-border/50"
                style={{
                  backgroundColor: formData.secondaryColor,
                  borderColor: formData.primaryColor,
                }}
              >
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: formData.primaryColor }}
                >
                  {formData.name || "Store Name"}
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{
                    color: formData.primaryColor,
                    opacity: 0.7,
                  }}
                >
                  {formData.description || "Store description"}
                </p>
                <button
                  className="w-full py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Shop Now
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
