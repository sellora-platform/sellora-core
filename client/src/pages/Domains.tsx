import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DomainsPage() {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const updateMutation = trpc.stores.update.useMutation({
    onSuccess: () => {
      storeQuery.refetch();
      toast.success("Domain settings updated");
    },
  });

  const [domainInput, setDomainInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (storeQuery.data?.customDomain) {
      setDomainInput(storeQuery.data.customDomain);
    }
  }, [storeQuery.data]);

  if (!isAuthenticated || loading || storeQuery.isLoading) {
    return null;
  }

  const store = storeQuery.data;
  const hasCustomDomain = !!store?.customDomain;

  const handleAddDomain = async () => {
    if (!domainInput) return;
    const sanitizedDomain = domainInput.toLowerCase().replace(/https?:\/\/|www\./g, "");
    
    await updateMutation.mutateAsync({
      storeId: store!.id,
      customDomain: sanitizedDomain,
    });
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Mock verification delay
    setTimeout(() => {
      setIsVerifying(false);
      toast.info("DNS records are still propagating. This can take up to 24-48 hours.");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Globe className="w-8 h-8 text-primary" />
              Domains
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage how customers find your store online
            </p>
          </div>
          {!hasCustomDomain && (
            <Button onClick={() => document.getElementById('domain-input')?.focus()} className="gap-2">
              <Globe className="w-4 h-4" />
              Connect existing domain
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {/* Default Domain Card */}
          <Card className="p-6 border-border/50 bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{store?.slug}.raaenai.com</h3>
                  <p className="text-xs text-foreground/50">Default Sellora domain</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wider">
                  Connected
                </span>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  Primary
                </span>
              </div>
            </div>
          </Card>

          {/* Custom Domain Section */}
          {hasCustomDomain ? (
            <Card className="border-border/50 overflow-hidden">
              <div className="p-6 flex items-center justify-between bg-amber-500/[0.03] border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{store?.customDomain}</h3>
                    <p className="text-xs text-foreground/50">Third-party domain</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Setup in progress
                  </span>
                  <Button variant="outline" size="sm" onClick={() => updateMutation.mutate({ storeId: store!.id, customDomain: "" })} className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5">
                    Remove
                  </Button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Steps Guide */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Complete your setup
                    </h4>
                    
                    <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Update DNS Records</h5>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                          Log in to your domain provider (Namecheap, GoDaddy, etc.) and add the records shown on the right.
                        </p>
                      </div>

                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Verify Connection</h5>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                          After saving the records, click the verify button. Propagation can take some time.
                        </p>
                      </div>

                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Wait for SSL</h5>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                          Once verified, we will automatically issue a free SSL certificate for your domain.
                        </p>
                      </div>
                    </div>

                    <Button 
                      className="w-full gap-2 h-11" 
                      onClick={handleVerify}
                      disabled={isVerifying}
                    >
                      {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Verify Connection
                    </Button>
                  </div>

                  <div className="bg-accent/5 rounded-2xl border border-border/50 p-6 space-y-6">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-foreground/50">Required DNS Records</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-background border border-border/50 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-foreground/40 uppercase">
                          <span>Type</span>
                          <span>Host</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-mono">
                          <span className="text-primary font-bold">A Record</span>
                          <span>@</span>
                        </div>
                        <div className="pt-2 border-t border-border/30 flex justify-between items-center">
                          <code className="text-lg font-bold text-foreground tracking-tight">76.76.21.21</code>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            navigator.clipboard.writeText("76.76.21.21");
                            toast.success("IP copied to clipboard");
                          }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-background border border-border/50 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-foreground/40 uppercase">
                          <span>Type</span>
                          <span>Host</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-mono">
                          <span className="text-primary font-bold">CNAME</span>
                          <span>www</span>
                        </div>
                        <div className="pt-2 border-t border-border/30 flex justify-between items-center">
                          <code className="text-sm font-bold text-foreground truncate">cname.vercel-dns.com</code>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            navigator.clipboard.writeText("cname.vercel-dns.com");
                            toast.success("CNAME copied to clipboard");
                          }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600/80 leading-relaxed">
                        Important: Remove any existing A or CNAME records for "@" and "www" before adding the ones above to avoid conflicts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 border-border/50 flex flex-col items-center text-center space-y-6 bg-accent/5 border-dashed">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Globe className="w-10 h-10" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Connect a Custom Domain</h3>
                <p className="text-foreground/60 leading-relaxed">
                  Give your store a professional look with your own domain name. It builds trust with your customers and helps with SEO.
                </p>
              </div>
              <div className="flex w-full max-w-sm gap-2">
                <Input 
                  id="domain-input"
                  placeholder="wazewear.com" 
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="h-12 border-border/50 bg-background"
                />
                <Button 
                  className="h-12 px-6"
                  onClick={handleAddDomain}
                  disabled={updateMutation.isPending || !domainInput}
                >
                  Add
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-xs text-foreground/40 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                  Free SSL Included
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/40 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                  One-click Setup
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/40 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                  SEO Ready
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* External Help Card */}
        <Card className="p-6 border-border/50 bg-primary/5 border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-primary/10 flex items-center justify-center shadow-sm">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Need help with your domain provider?</h4>
              <p className="text-sm text-foreground/60">We have detailed guides for Namecheap, GoDaddy, and Google Domains.</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-white">
            View Guides
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
