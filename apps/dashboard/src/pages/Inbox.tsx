import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Send, 
  Mail, 
  MessageCircle, 
  Instagram, 
  Filter,
  User,
  MoreVertical,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info,
  Calendar,
  ShoppingBag,
  History
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const WHATSAPP_TEMPLATES = [
  { name: 'Order Confirmed', text: 'Hi! Your order has been received and is being processed. Thanks for shopping with us!' },
  { name: 'Shipping Update', text: 'Great news! Your order is on its way. You will receive tracking info shortly.' },
  { name: 'Support Reply', text: 'Hi! We have received your query. Our team will get back to you shortly.' },
  { name: 'Payment Reminder', text: 'Hi! We noticed your order is pending. Let us know if you need help completing the payment.' },
];

export default function Inbox() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(true);

  // 1. Fetch Store ID first
  const { data: myStores } = trpc.stores.getMyStores.useQuery();
  const storeId = myStores?.[0]?.id || 0;

  // 2. Fetch Conversations with Polling (every 5s)
  const { data: conversations, isLoading: isLoadingConvs, refetch: refetchConvs } = trpc.messages.listConversations.useQuery(
    { storeId },
    { 
      enabled: !!storeId,
      refetchInterval: 5000 // Poll every 5 seconds for new messages
    }
  );
  
  const { data: connectedChannels } = trpc.messages.listChannels.useQuery(
    { storeId },
    { enabled: !!storeId }
  );

  const { data: messages, isLoading: isLoadingMsgs, refetch: refetchMsgs } = trpc.messages.listMessages.useQuery(
    { conversationId: selectedId || 0 },
    { 
      enabled: !!selectedId,
      refetchInterval: 3000 // Poll faster for active chat
    }
  );

  const markAsRead = trpc.messages.markAsRead.useMutation({
    onSuccess: () => refetchConvs()
  });

  const sendMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setReplyText("");
      refetchMsgs();
      refetchConvs();
    }
  });

  const activeConv = (conversations as any[])?.find((c: any) => c.id === selectedId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark as read when selecting conversation
  useEffect(() => {
    if (selectedId && activeConv && activeConv.unreadCount > 0) {
      markAsRead.mutate({ conversationId: selectedId });
    }
  }, [selectedId, activeConv?.unreadCount]);

  const handleSend = () => {
    if (!selectedId || !replyText.trim()) return;
    sendMutation.mutate({ conversationId: selectedId, body: replyText });
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Left Sidebar: Conversation List */}
        <div className="w-96 flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight">Inbox</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Store ID: {storeId} • {conversations?.length || 0} Chats Found
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 bg-muted/30 border-border/50 h-11" placeholder="Search chats..." />
          </div>

          <Card className="flex-1 overflow-hidden border-border/50 flex flex-col bg-card/30 backdrop-blur-sm">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
              {isLoadingConvs ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Loading inbox...</div>
              ) : conversations?.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">No messages yet.</p>
                </div>
              ) : (
                (conversations as any[])?.map((conv: any) => (
                  <div 
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`p-4 border-b border-border/50 cursor-pointer transition-all hover:bg-primary/5 flex gap-3 relative group ${selectedId === conv.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border/50 overflow-hidden">
                      {/* Avatar Placeholder */}
                      <User className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm truncate pr-2">{conv.customerName || 'Anonymous'}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                          {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: false })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                           <Mail className="w-2.5 h-2.5" /> Email
                         </div>
                         {conv.unreadCount > 0 && (
                           <div className="bg-primary text-primary-foreground text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                             {conv.unreadCount}
                           </div>
                         )}
                      </div>
                    </div>
                    {selectedId !== conv.id && <ChevronRight className="w-4 h-4 text-muted-foreground/20 absolute right-2 top-1/2 -translate-y-1/2 group-hover:text-primary transition-colors" />}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Area: Message History */}
        <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-2xl shadow-primary/5 bg-card/20">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                    {activeConv.customerName?.[0] || 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold">{activeConv.customerName}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active • via Email
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowDetails(!showDetails)}
                    className={showDetails ? "text-primary bg-primary/10" : ""}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Message List */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary/10 scroll-smooth"
              >
                {isLoadingMsgs ? (
                  <div className="h-full flex items-center justify-center animate-pulse">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading history...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-muted/50 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                        Conversation Started {format(new Date(activeConv.createdAt), 'MMM dd, yyyy')}
                      </Badge>
                    </div>
                    {(messages as any[])?.map((msg: any, idx: number) => {
                      const showAvatar = idx === 0 || (messages as any[])[idx-1].senderType !== msg.senderType;
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.senderType === 'merchant' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                          <div className={`max-w-[80%] group ${msg.senderType === 'merchant' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                            <div className={`px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm transition-all hover:shadow-md ${
                              msg.senderType === 'merchant' 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-card text-foreground border border-border/50 rounded-tl-none'
                            }`}>
                              {msg.body.split('\n').map((line: string, i: number) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              {format(new Date(msg.createdAt), 'hh:mm a')}
                              {msg.senderType === 'merchant' && <CheckCircle2 className="w-2.5 h-2.5 text-primary" />}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 bg-muted/20 border-t border-border/50">
                <div className="bg-background border border-border/50 rounded-2xl p-2 focus-within:ring-2 ring-primary/20 transition-all flex flex-col gap-2 shadow-sm">
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 resize-none px-3 pt-2 text-[13px] min-h-[100px] scrollbar-none"
                    placeholder={`Type a professional reply to ${activeConv.customerName}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center px-2 pb-1">
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                            <Clock className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Templates</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {WHATSAPP_TEMPLATES.map((t, i) => (
                            <DropdownMenuItem 
                              key={i} 
                              className="text-xs font-medium cursor-pointer py-2"
                              onClick={() => setReplyText(t.text)}
                            >
                              {t.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"><Mail className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* WhatsApp Reply Button (shows if identifier is not an email) */}
                      {!activeConv.customerIdentifier.includes('@') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl font-bold h-9 px-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                          onClick={() => {
                            const phone = activeConv.customerIdentifier.replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(replyText || 'Hello!')}`, '_blank');
                          }}
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-2" />
                          WhatsApp
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="rounded-xl font-bold h-9 px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        onClick={handleSend}
                        disabled={sendMutation.isPending || !replyText.trim()}
                      >
                        {sendMutation.isPending ? "Sending..." : "Send"}
                        <Send className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-center text-muted-foreground mt-3 font-bold uppercase tracking-[0.2em] opacity-50">
                  Transmitting via {activeConv.customerIdentifier}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center animate-bounce duration-[3000ms] border border-primary/10">
                <MessageSquare className="w-12 h-12 text-primary/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Unified Inbox</h3>
                <p className="text-muted-foreground max-w-sm font-medium text-sm">
                  Select a communication to begin. Your omnichannel support is now operational.
                </p>
              </div>
              <div className="flex gap-6 pt-4">
                <div className="flex flex-col items-center gap-2 group cursor-help">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Email</span>
                </div>
                <div className={`flex flex-col items-center gap-2 group ${connectedChannels?.some(c => c.type === 'whatsapp') ? '' : 'opacity-40 grayscale'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">WhatsApp</span>
                </div>
                <div className="flex flex-col items-center gap-2 group opacity-40 grayscale">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center border border-pink-500/20">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Instagram</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Right Sidebar: Customer Details */}
        {activeConv && showDetails && (
          <div className="w-80 flex flex-col gap-4 animate-in slide-in-from-right duration-500">
            <Card className="flex-1 border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="p-6 text-center space-y-4 border-b border-border/50 bg-muted/20">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-black mx-auto border-4 border-background shadow-xl">
                  {activeConv.customerName?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{activeConv.customerName}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{activeConv.customerIdentifier}</p>
                </div>
                <div className="flex justify-center gap-2">
                  <Badge variant="secondary" className="text-[9px] font-black uppercase">Customer</Badge>
                  <Badge variant="outline" className="text-[9px] font-black uppercase text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Verified</Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Orders</p>
                    <p className="text-xl font-black">0</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Spent</p>
                    <p className="text-xl font-black">$0</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <User className="w-3 h-3" /> Profile Info
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">First Seen</p>
                        <p className="text-xs font-bold">{format(new Date(activeConv.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><History className="w-4 h-4 text-muted-foreground" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Last Activity</p>
                        <p className="text-xs font-bold">{formatDistanceToNow(new Date(activeConv.lastActivity), { addSuffix: true })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-2">
                   <Button variant="outline" className="w-full justify-start font-bold text-xs rounded-xl h-11">
                     <ShoppingBag className="w-4 h-4 mr-2 opacity-50" /> Create Order
                   </Button>
                   <Button variant="outline" className="w-full justify-start font-bold text-xs rounded-xl h-11 text-destructive hover:text-destructive hover:bg-destructive/5">
                     <MoreVertical className="w-4 h-4 mr-2 opacity-50" /> Block Customer
                   </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
