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
    onError: (error) => {
      toast.error(error.message || "Failed to update domain.");
    }
  });

  const verifyDomainMutation = trpc.stores.verifyDomain.useMutation({
    onSuccess: (data) => {
      if (data.verified) {
        toast.success("Domain ownership verified successfully! SSL certificate is now being issued.");
        storeQuery.refetch();
      } else {
        toast.error(data.verification?.reason || "Domain verification failed. Please check your DNS records.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify domain.");
    }
  });

  const [domainInput, setDomainInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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
  // Generate a mock verification token based on store ID
  const verificationToken = `sellora_verify_${store?.id}_${store?.slug?.substring(0, 3)}`;

  const handleAddDomain = async () => {
    if (!domainInput) return;
    const sanitizedDomain = domainInput.toLowerCase().replace(/https?:\/\/|www\./g, "");
    
    await updateMutation.mutateAsync({
      storeId: store!.id,
      customDomain: sanitizedDomain,
    });
  };



  const handleVerify = async () => {
    if (!store?.customDomain) return;
    setIsVerifying(true);
    await verifyDomainMutation.mutateAsync({
      storeId: store.id,
      domain: store.customDomain,
    });
    setIsVerifying(false);
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
              Connect your brand with a professional web address
            </p>
          </div>
          {!hasCustomDomain && (
            <Button onClick={() => document.getElementById('domain-input')?.focus()} className="gap-2 shadow-sm">
              <Globe className="w-4 h-4" />
              Connect existing domain
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {/* Default Domain Card */}
          <Card className="p-6 border-border/50 bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground tracking-tight">{store?.slug}.raaenai.com</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <p className="text-[11px] text-foreground/50 font-medium uppercase tracking-wider">Default Sellora domain</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wider shadow-sm">
                  Connected
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider shadow-sm">
                  Primary
                </span>
              </div>
            </div>
          </Card>

          {/* Custom Domain Section */}
          {hasCustomDomain ? (
            <Card className="border-border/50 overflow-hidden shadow-sm">
              <div className="p-6 flex items-center justify-between bg-amber-500/[0.03] border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground tracking-tight">{store?.customDomain}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <p className="text-[11px] text-foreground/50 font-medium uppercase tracking-wider tracking-wider">Third-party domain</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    Action Required
                  </span>
                  <Button variant="outline" size="sm" onClick={() => updateMutation.mutate({ storeId: store!.id, customDomain: "" })} className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5 h-9">
                    Remove
                  </Button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-foreground">Connect your domain</h4>
                  <p className="text-sm text-foreground/60 leading-relaxed max-w-2xl">
                    To connect your domain, log in to your domain provider (like Namecheap) and add these records to your DNS settings. After saving, click verify below.
                  </p>
                </div>

                {/* DNS Records Table */}
                <div className="border border-border/50 rounded-2xl overflow-hidden bg-accent/5">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background border-b border-border/50">
                        <th className="px-6 py-4 text-[11px] font-bold text-foreground/40 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-foreground/40 uppercase tracking-wider">Host</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-foreground/40 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-foreground/40 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-background/50">
                      {/* A Record */}
                      <tr>
                        <td className="px-6 py-5">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[11px] font-bold">A</span>
                        </td>
                        <td className="px-6 py-5 text-sm font-mono text-foreground">@</td>
                        <td className="px-6 py-5 text-sm font-mono font-bold text-foreground">76.76.21.21</td>
                        <td className="px-6 py-5 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => {
                            navigator.clipboard.writeText("76.76.21.21");
                            toast.success("IP copied");
                          }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                      {/* CNAME Record */}
                      <tr>
                        <td className="px-6 py-5">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[11px] font-bold">CNAME</span>
                        </td>
                        <td className="px-6 py-5 text-sm font-mono text-foreground">www</td>
                        <td className="px-6 py-5 text-sm font-mono font-bold text-foreground">cname.vercel-dns.com</td>
                        <td className="px-6 py-5 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => {
                            navigator.clipboard.writeText("cname.vercel-dns.com");
                            toast.success("CNAME copied");
                          }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    className="flex-1 gap-2 h-12 shadow-lg shadow-primary/10" 
                    onClick={handleVerify}
                    disabled={isVerifying}
                  >
                    {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Verify Connection
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 gap-2" onClick={() => setShowGuide(true)}>
                    <ExternalLink className="w-4 h-4" />
                    How to do this? (Easy Guide)
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-600/70 leading-relaxed font-medium">
                    Domain changes can take up to 24 hours to work globally. If verification fails, please double-check your records and try again in a few hours.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-16 border-border/50 flex flex-col items-center text-center space-y-8 bg-accent/5 border-dashed relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner relative">
                <Globe className="w-12 h-12" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <div className="max-w-md space-y-3 relative">
                <h3 className="text-3xl font-bold text-foreground tracking-tight">Connect your own domain</h3>
                <p className="text-foreground/60 leading-relaxed text-sm">
                  Build a brand that customers remember. Connect your custom domain to remove <b>.raaenai.com</b> from your store's address.
                </p>
              </div>
              <div className="flex w-full max-w-sm gap-2 relative">
                <Input 
                  id="domain-input"
                  placeholder="e.g. yourbrand.com" 
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="h-14 border-border/50 bg-background text-base px-5 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20"
                />
                <Button 
                  className="h-14 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                  onClick={handleAddDomain}
                  disabled={updateMutation.isPending || !domainInput}
                >
                  Add Domain
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4 relative">
                <div className="flex items-center gap-2.5 text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500/60" />
                  Free SSL
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-green-500/60" />
                  SEO Ready
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                  <RefreshCw className="w-4 h-4 text-green-500/60" />
                  Auto-Renewal
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* External Help Card */}
        <Card className="p-8 border-border/50 bg-gradient-to-r from-primary/5 to-transparent border-primary/10 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-primary/5 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform" />
          <div className="flex items-center gap-6 relative">
            <div className="w-14 h-14 rounded-2xl bg-white border border-primary/10 flex items-center justify-center shadow-md">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-foreground">Need help with your domain provider?</h4>
              <p className="text-sm text-foreground/60 leading-relaxed">We have detailed, illustrated guides for all major domain registrars like Namecheap, GoDaddy, and Hostinger.</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-white h-11 px-6 shadow-sm group-hover:border-primary group-hover:text-primary transition-all relative">
            View Setup Guides
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      {/* Setup Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-xl overflow-hidden shadow-2xl border-primary/20">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-primary/5">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <Globe className="w-5 h-5" />
                How to connect your domain
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)} className="hover:bg-primary/10">Close</Button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              
              <div className="space-y-6">
                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md">1</div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Log in to your Domain Provider</h4>
                    <p className="text-sm text-foreground/70 leading-relaxed">Go to the website where you bought your domain (e.g., GoDaddy, Namecheap, or Hostinger) and find your <b>DNS Settings</b> or <b>Zone Editor</b>.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md">2</div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Delete old records</h4>
                    <p className="text-sm text-foreground/70 leading-relaxed">If you see any existing <b>A records</b> with the host <b>@</b> or <b>CNAME records</b> with the host <b>www</b>, delete them first to avoid conflicts.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md">3</div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Add the Sellora records</h4>
                    <p className="text-sm text-foreground/70 leading-relaxed mb-3">Create these two new records exactly as shown below:</p>
                    <div className="bg-background border border-border/50 rounded-lg p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground/50 uppercase w-16">Type: A</span>
                        <span className="text-sm font-mono bg-accent/10 px-2 py-0.5 rounded">Host: @</span>
                        <span className="text-sm font-mono font-bold">Value: 76.76.21.21</span>
                      </div>
                      <div className="h-px bg-border/50 w-full"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground/50 uppercase w-16">CNAME</span>
                        <span className="text-sm font-mono bg-accent/10 px-2 py-0.5 rounded">Host: www</span>
                        <span className="text-sm font-mono font-bold">Value: cname.vercel-dns.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  <b>Almost done!</b> After saving the records in your provider, wait about 10-15 minutes, then close this guide and click the <b>Verify Connection</b> button.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-border/50 bg-accent/5 flex justify-end">
              <Button onClick={() => setShowGuide(false)} className="px-8">Got it!</Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

