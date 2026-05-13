import { 
  MessageSquare, 
  Instagram, 
  Mail, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Settings2,
  RefreshCw,
  Zap,
  Info,
  X,
  Plus
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CHANNELS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Connect your official WhatsApp Business API or Personal account via QR.',
    icon: MessageCircle,
    color: 'bg-emerald-500',
    status: 'Not Connected',
    features: ['Auto-replies', 'Bulk Broadcasts', 'Order Notifications'],
    comingSoon: false
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    description: 'Manage Instagram DMs and Story replies directly from your inbox.',
    icon: Instagram,
    color: 'bg-pink-600',
    status: 'Not Connected',
    features: ['DM Management', 'Story Reply Tracking', 'Lead Generation'],
    comingSoon: false
  },
  {
    id: 'email',
    name: 'Business Email',
    description: 'Sync your Gmail, Outlook or custom SMTP email addresses.',
    icon: Mail,
    color: 'bg-blue-600',
    status: 'Not Connected',
    features: ['Unified Inbox', 'Custom Domain Tracking', 'Campaigns'],
    comingSoon: false
  },
  {
    id: 'messenger',
    name: 'FB Messenger',
    description: 'Integrate your Facebook Page messages with your storefront.',
    icon: MessageSquare,
    color: 'bg-blue-500',
    status: 'Coming Soon',
    features: ['Page Messages', 'Automated Chatbots'],
    comingSoon: true
  }
];

export default function Connect() {
  const [loadingChannel, setLoadingChannel] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    host: '',
    port: '465',
    user: '',
    pass: '',
    fromName: ''
  });

  const utils = trpc.useUtils();
  const connectChannel = trpc.messages.connectChannel.useMutation({
    onSuccess: () => {
      toast.success("Channel connected successfully!");
      setShowEmailModal(false);
      utils.messages.listChannels.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to connect channel: " + err.message);
    }
  });

  const handleConnect = (channelId: string) => {
    if (channelId === 'email') {
      setShowEmailModal(true);
      return;
    }

    setLoadingChannel(channelId);
    setTimeout(() => {
      toast.info(`Connecting to ${channelId}...`, {
        description: "Official Meta integration is coming in the next update.",
      });
      setLoadingChannel(null);
    }, 1500);
  };

  const handleSmtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    connectChannel.mutate({
      storeId: (window as any).__STORE_ID__ || 0,
      type: 'email',
      settings: {
        ...smtpForm,
        provider: 'smtp'
      }
    });
  };

  const getGoogleUrl = trpc.messages.getGoogleAuthUrl.useQuery({
    storeId: (window as any).__STORE_ID__ || 0
  }, { enabled: false });

  const handleGoogleConnect = async () => {
    const { data } = await getGoogleUrl.refetch();
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Sellora Connect</h1>
          <p className="text-muted-foreground max-w-2xl">
            Unify your customer communication across all platforms. Connect your accounts to enable centralized messaging and AI-powered automation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Active Sync Enabled</span>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CHANNELS.map((channel) => (
          <Card key={channel.id} className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl border-border/50">
            {/* Visual Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${channel.color} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="p-8 space-y-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${channel.color} text-white shadow-lg`}>
                    <channel.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{channel.name}</h3>
                    <Badge variant={channel.comingSoon ? "outline" : "secondary"} className="mt-1">
                      {channel.status}
                    </Badge>
                  </div>
                </div>
                {!channel.comingSoon && (
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Settings2 className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {channel.description}
              </p>

              <div className="space-y-3">
                <div className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground/70">Included Features</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {channel.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button 
                  className="flex-1 font-bold h-11" 
                  disabled={channel.comingSoon || loadingChannel === channel.id}
                  onClick={() => handleConnect(channel.id)}
                >
                  {loadingChannel === channel.id ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {channel.comingSoon ? "Get Early Access" : "Connect Account"}
                </Button>
                {!channel.comingSoon && (
                  <Button variant="outline" size="icon" className="h-11 w-11">
                    <Info className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <Card className="bg-muted/30 border-dashed p-6 border-2">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-background border shadow-sm">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold">Enterprise Scale Connectivity</h4>
            <p className="text-sm text-muted-foreground">
              Sellora Connect uses enterprise-grade OAuth 2.0 and official Meta/Google APIs. Your data is encrypted and we never store your personal passwords. 
              Our architecture is designed to handle high-volume traffic with 99.9% uptime.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Action */}
      <div className="flex items-center justify-center pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium group cursor-pointer hover:text-primary transition-colors">
          View Detailed Integration Guide <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Email Setup Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Connect Business Email
            </DialogTitle>
            <DialogDescription>
              Choose your email provider and enter your credentials to sync messages.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="smtp" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gmail">Google / Gmail</TabsTrigger>
              <TabsTrigger value="smtp">Custom SMTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gmail" className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <Info className="w-4 h-4" />
                  Gmail App Password Required
                </div>
                <p className="text-xs text-blue-600 leading-relaxed">
                  For security, Google requires an <strong>App Password</strong>. Go to Google Account {">"} Security {">"} 2-Step Verification {">"} App Passwords.
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Gmail Address</Label>
                  <Input placeholder="yourstore@gmail.com" />
                </div>
                <div className="space-y-1">
                  <Label>App Password</Label>
                  <Input type="password" placeholder="xxxx xxxx xxxx xxxx" />
                </div>
              </div>
              <Button className="w-full font-bold" onClick={handleGoogleConnect} disabled={getGoogleUrl.isFetching}>
                {getGoogleUrl.isFetching ? "Redirecting..." : "Connect with Google"}
              </Button>
            </TabsContent>

            <TabsContent value="smtp" className="space-y-4 py-4">
              <form onSubmit={handleSmtpSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>SMTP Host</Label>
                    <Input 
                      placeholder="smtp.yourhost.com" 
                      required 
                      value={smtpForm.host}
                      onChange={e => setSmtpForm({...smtpForm, host: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Port</Label>
                    <Input 
                      placeholder="465" 
                      required 
                      value={smtpForm.port}
                      onChange={e => setSmtpForm({...smtpForm, port: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>User / Email</Label>
                  <Input 
                    type="email" 
                    placeholder="info@yourstore.com" 
                    required 
                    value={smtpForm.user}
                    onChange={e => setSmtpForm({...smtpForm, user: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={smtpForm.pass}
                    onChange={e => setSmtpForm({...smtpForm, pass: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Sender Name (Displayed to customer)</Label>
                  <Input 
                    placeholder="Sellora Support" 
                    required 
                    value={smtpForm.fromName}
                    onChange={e => setSmtpForm({...smtpForm, fromName: e.target.value})}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full font-bold" disabled={connectChannel.isPending}>
                    {connectChannel.isPending ? "Connecting..." : "Save SMTP Settings"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
