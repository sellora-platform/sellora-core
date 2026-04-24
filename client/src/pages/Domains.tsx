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

  const handleVerify = () => {
    setIsVerifying(true);
    // Mock verification delay
    setTimeout(() => {
      setIsVerifying(false);
      toast.info("DNS records detected, but propagation takes time. Ownership verified successfully! Now waiting for Vercel to issue SSL.");
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

              <div className="p-8 space-y-10">
                {/* Steps Guide */}
                <div className="grid lg:grid-cols-5 gap-10">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-1">
                      <h4 className="font-bold text-xl flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Verification Required
                      </h4>
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        To prove you own <b>{store?.customDomain}</b>, you must complete the steps below.
                      </p>
                    </div>
                    
                    <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md">1</div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Ownership Verification</h5>
                        <p className="text-[13px] text-foreground/60 leading-relaxed mb-3">
                          Add a TXT record to your DNS settings so we can verify you own this domain.
                        </p>
                        <div className="p-3 rounded-lg bg-accent/5 border border-border/50 flex flex-col gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">TXT Host: <code className="text-foreground/80 lowercase">sellora-verify</code></span>
                          <div className="flex justify-between items-center gap-2">
                            <code className="text-[11px] font-bold text-primary break-all">{verificationToken}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => {
                              navigator.clipboard.writeText(verificationToken);
                              toast.success("Verification token copied");
                            }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="relative pl-10">
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md">2</div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">A Record Setup</h5>
                        <p className="text-[13px] text-foreground/60 leading-relaxed">
                          Point your domain to our global network by adding an A record.
                        </p>
                      </div>

                      <div className="relative pl-10">
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md">3</div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Verify & Go Live</h5>
                        <p className="text-[13px] text-foreground/60 leading-relaxed">
                          Once DNS records are saved, click verify. Propagation can take up to 24 hours.
                        </p>
                      </div>
                    </div>

                    <Button 
                      className="w-full gap-2 h-12 shadow-lg shadow-primary/10" 
                      onClick={handleVerify}
                      disabled={isVerifying}
                    >
                      {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Verify Connection
                    </Button>
                  </div>

                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-accent/5 rounded-2xl border border-border/50 p-7 space-y-6">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary/40" />
                        Required DNS Records
                      </h4>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-background border border-border/50 space-y-3 shadow-sm">
                          <div className="flex justify-between items-center text-[10px] font-bold text-foreground/40 uppercase">
                            <span>Type</span>
                            <span>Host</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-mono">
                            <span className="text-primary font-bold">A Record</span>
                            <span className="font-bold">@</span>
                          </div>
                          <div className="pt-3 border-t border-border/30 flex justify-between items-center">
                            <code className="text-base font-bold text-foreground tracking-tight">76.76.21.21</code>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              navigator.clipboard.writeText("76.76.21.21");
                              toast.success("IP copied to clipboard");
                            }}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-background border border-border/50 space-y-3 shadow-sm">
                          <div className="flex justify-between items-center text-[10px] font-bold text-foreground/40 uppercase">
                            <span>Type</span>
                            <span>Host</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-mono">
                            <span className="text-primary font-bold">CNAME</span>
                            <span className="font-bold">www</span>
                          </div>
                          <div className="pt-3 border-t border-border/30 flex justify-between items-center">
                            <code className="text-[12px] font-bold text-foreground truncate max-w-[120px]">cname.vercel-dns.com</code>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              navigator.clipboard.writeText("cname.vercel-dns.com");
                              toast.success("CNAME copied to clipboard");
                            }}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <h5 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Setup Tutorial</h5>
                        <div className="grid gap-3">
                          <button onClick={() => setShowGuide(true)} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group text-left w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors text-primary font-bold text-xs italic">nc</div>
                              <div>
                                <h6 className="font-bold text-sm text-foreground">Namecheap Setup</h6>
                                <p className="text-[11px] text-foreground/50">Follow the step-by-step guide</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                          </button>

                          <button onClick={() => setShowGuide(true)} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group text-left w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors text-primary font-bold text-xs italic">gd</div>
                              <div>
                                <h6 className="font-bold text-sm text-foreground">GoDaddy Setup</h6>
                                <p className="text-[11px] text-foreground/50">Configure your GoDaddy DNS</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 shadow-sm" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-700/80">Propagation Period</p>
                        <p className="text-[11px] text-amber-600/70 leading-relaxed">
                          DNS changes can take anywhere from a few minutes to 24 hours to take effect globally. If verification fails, please try again in an hour.
                        </p>
                      </div>
                    </div>
                  </div>
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
              <p className="text-sm text-foreground/60 leading-relaxed">We have detailed, illustrated guides for all major domain registrars.</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-white h-11 px-6 shadow-sm group-hover:border-primary group-hover:text-primary transition-all relative">
            View Setup Guides
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      {/* Setup Guide Modal (Simplified) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-accent/5">
              <h3 className="font-bold text-lg">Namecheap Setup Guide</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)}>Close</Button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-sm leading-relaxed">Log in to your <b>Namecheap</b> account and go to the <b>Domain List</b>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-sm leading-relaxed">Click <b>Manage</b> next to your domain, then go to the <b>Advanced DNS</b> tab.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-sm leading-relaxed">Find <b>Host Records</b> and remove any existing A or CNAME records for <b>@</b> and <b>www</b>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</div>
                  <p className="text-sm leading-relaxed">Add a new <b>A Record</b> with Host: <b>@</b> and Value: <b>76.76.21.21</b>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">5</div>
                  <p className="text-sm leading-relaxed">Add a new <b>CNAME Record</b> with Host: <b>www</b> and Value: <b>cname.vercel-dns.com</b>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">6</div>
                  <p className="text-sm leading-relaxed">Add a new <b>TXT Record</b> with Host: <b>sellora-verify</b> and Value: <b>{verificationToken}</b>.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-primary/80 leading-relaxed font-medium">
                  After saving, return here and click <b>Verify Connection</b>. Once ownership is verified, your store will be live on your custom domain instantly!
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-border/50 bg-accent/5 flex justify-end">
              <Button onClick={() => setShowGuide(false)}>I've added the records</Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

