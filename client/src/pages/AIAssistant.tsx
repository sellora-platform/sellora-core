import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function AIAssistant() {
  const { isAuthenticated } = useAuth();
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
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Assistant
          </h1>
          <p className="text-foreground/60 mt-1">
            Describe what you want, and AI agents will help you create it
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-border/50 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                      <p className="text-foreground/60">
                        Start a conversation with the AI assistant
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
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent/10 text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-accent/10 text-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-3 border-t border-border/50 pt-4">
                <Textarea
                  placeholder="Describe what you want to create or change..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleSendMessage();
                    }
                  }}
                  className="resize-none border-border/50 focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!prompt.trim() || chatMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assistant Type */}
            <Card className="p-6 border-border/50">
              <h2 className="font-semibold text-foreground mb-4">
                Assistant Type
              </h2>
              <div className="space-y-2">
                {[
                  { value: "design", label: "Design" },
                  { value: "product_description", label: "Product Description" },
                  { value: "banner", label: "Banner" },
                  { value: "content", label: "Content" },
                  { value: "layout", label: "Layout" },
                  { value: "general", label: "General" },
                ].map((option) => (
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
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      type === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/5 text-foreground hover:bg-accent/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Recent Interactions */}
            <Card className="p-6 border-border/50">
              <h2 className="font-semibold text-foreground mb-4">
                Recent Interactions
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historyQuery.data?.slice(0, 5).map((interaction) => (
                  <button
                    key={interaction.id}
                    className="w-full text-left p-2 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors text-sm text-foreground/70 hover:text-foreground truncate"
                  >
                    {interaction.prompt}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
