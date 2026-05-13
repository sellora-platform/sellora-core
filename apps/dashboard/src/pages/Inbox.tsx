import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ChevronRight
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Inbox() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

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

  // 3. Fetch Messages for selected conversation with Polling
  const { data: messages, isLoading: isLoadingMsgs, refetch: refetchMsgs } = trpc.messages.listMessages.useQuery(
    { conversationId: selectedId || 0 },
    { 
      enabled: !!selectedId,
      refetchInterval: 3000 // Poll faster for active chat
    }
  );

  const sendMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setReplyText("");
      refetchMsgs();
      refetchConvs();
    }
  });

  const activeConv = conversations?.find(c => c.id === selectedId);

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
                conversations?.map((conv) => (
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
                  <Button variant="ghost" size="icon"><Search className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary/10">
                {isLoadingMsgs ? (
                  <div className="h-full flex items-center justify-center animate-pulse">Loading history...</div>
                ) : (
                  messages?.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.senderType === 'merchant' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] group ${msg.senderType === 'merchant' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                          msg.senderType === 'merchant' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted/80 text-foreground border border-border/50 rounded-tl-none'
                        }`}>
                          {msg.body}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.senderType === 'merchant' && <CheckCircle2 className="w-2.5 h-2.5 inline ml-1 text-primary" />}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 bg-muted/20 border-t border-border/50">
                <div className="bg-background border border-border/50 rounded-2xl p-2 focus-within:ring-2 ring-primary/20 transition-all flex flex-col gap-2">
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 resize-none px-3 pt-2 text-sm min-h-[80px]"
                    placeholder={`Reply to ${activeConv.customerName}...`}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Clock className="w-4 h-4" /></Button>
                    </div>
                    <Button 
                      size="sm" 
                      className="rounded-xl font-bold h-9 px-5 shadow-lg shadow-primary/20"
                      onClick={handleSend}
                      disabled={sendMutation.isPending || !replyText.trim()}
                    >
                      {sendMutation.isPending ? "Sending..." : "Send Reply"}
                      <Send className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-3 font-bold uppercase tracking-widest">
                  Secure message via {activeConv.customerIdentifier}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center animate-bounce duration-[3000ms]">
                <MessageSquare className="w-12 h-12 text-primary/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Your Unified Inbox</h3>
                <p className="text-muted-foreground max-w-sm font-medium">
                  Select a conversation from the left to start chatting with your customers in real-time.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Email</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center grayscale opacity-40">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">WhatsApp</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center grayscale opacity-40">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Instagram</span>
                </div>
              </div>
            </div>
          )}
        </Card>
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
