import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, Zap, Lightbulb, Palette, FileText, Layout as LayoutIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AIAssistant() {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<
    "design" | "product_description" | "banner" | "content" | "layout" | "general"
  >("general");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const storeQuery = trpc.stores.getMyStore.useQuery();
  const chatMutation = trpc.ai.chat.useMutation();
  const historyQuery = trpc.ai.getHistory.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data?.id }
  );

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleSendMessage = async () => {
    if (!prompt.trim() || !storeQuery.data) return;

    const userMessage = prompt;
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await chatMutation.mutateAsync({
        storeId: storeQuery.data.id,
        type,
        prompt: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response },
      ]);
      toast.success("Response generated!");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
      toast.error("Failed to generate response");
    }
  };

  const assistantTypes = [
    { value: "design", label: "Design", icon: Palette, color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-600" },
    { value: "product_description", label: "Product Description", icon: FileText, color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-600" },
    { value: "banner", label: "Banner", icon: Zap, color: "from-yellow-500/20 to-orange-500/20", iconColor: "text-yellow-600" },
    { value: "content", label: "Content", icon: Lightbulb, color: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-600" },
    { value: "layout", label: "Layout", icon: LayoutIcon, color: "from-indigo-500/20 to-blue-500/20", iconColor: "text-indigo-600" },
    { value: "general", label: "General", icon: Sparkles, color: "from-primary/20 to-primary/10", iconColor: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            AI Assistant
          </h1>
          <p className="text-foreground/60">
            Describe what you want, and AI agents will help you create it
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 border-border/50 h-[600px] flex flex-col bg-gradient-to-br from-background to-card/30">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <div className="p-4 rounded-full bg-primary/10 mx-auto mb-4 w-fit">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-foreground mb-2">Start a conversation</p>
                      <p className="text-sm text-foreground/60 max-w-xs">
                        Tell the AI assistant what you want to create or change in your store
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                            : "bg-card border border-border/50 text-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border/50 text-foreground px-4 py-3 rounded-xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-4 border-t border-border/30 pt-6">
                <Textarea
                  placeholder="Describe what you want to create or change..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleSendMessage();
                    }
                  }}
                  className="resize-none border-border/50 focus:ring-2 focus:ring-primary/20 min-h-20"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!prompt.trim() || chatMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-primary-foreground gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assistant Type Selection */}
            <Card className="p-6 border-border/50 bg-gradient-to-br from-background to-card/50">
              <h2 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Assistant Type
              </h2>
              <div className="space-y-3">
                {assistantTypes.map((option) => {
                  const Icon = option.icon;
                  const isSelected = type === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        setType(
                          option.value as
                            | "design"
                            | "product_description"
                            | "banner"
                            | "content"
                            | "layout"
                            | "general"
                        )
                      }
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                        isSelected
                          ? "bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 shadow-md"
                          : "bg-background border-border/30 hover:border-primary/50 hover:bg-card/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : option.iconColor}`} />
                        <span className={`font-medium ${isSelected ? "text-foreground" : "text-foreground/70"}`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Recent Interactions */}
            {historyQuery.data && historyQuery.data.length > 0 && (
              <Card className="p-6 border-border/50 bg-gradient-to-br from-background to-card/50">
                <h2 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Recent
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {historyQuery.data.slice(0, 5).map((interaction) => (
                    <button
                      key={interaction.id}
                      onClick={() => setPrompt((interaction.prompt as string) || "")}
                      className="w-full text-left p-3 rounded-lg bg-card border border-border/30 hover:border-primary/50 hover:bg-card/80 transition-all text-sm text-foreground/70 hover:text-foreground truncate"
                      title={interaction.prompt as string}
                    >
                      {(interaction.prompt as string)?.substring(0, 50)}...
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Tips */}
            <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Be specific about what you want</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Include style preferences</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Ask for revisions if needed</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
