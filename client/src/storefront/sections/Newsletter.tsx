import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NewsletterProps {
  settings: {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    placeholder?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export default function Newsletter({ settings }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribed(true);
    toast.success("Subscribed successfully!", {
      description: "You'll be the first to hear about new arrivals."
    });
  };

  return (
    <section className="py-24 px-4 overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div 
        className="max-w-5xl mx-auto rounded-[3rem] p-12 md:p-20 relative shadow-2xl overflow-hidden text-center"
        style={{ 
          backgroundColor: settings.backgroundColor || "#1a1a1a",
          color: settings.textColor || "#ffffff"
        }}
      >
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {settings.heading || "Join the Inner Circle"}
            </h2>
            <p className="text-white/60 text-lg">
              {settings.subheading || "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals."}
            </p>
          </div>

          {subscribed ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-xl">You're on the list!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={settings.placeholder || "Enter your email address"}
                  className="h-14 px-6 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30 backdrop-blur-sm"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-lg gap-2 shadow-xl shadow-white/5 active:scale-95 transition-all"
              >
                {settings.buttonText || "Subscribe"}
                <Send className="w-5 h-5" />
              </Button>
            </form>
          )}

          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}

export const Schema = {
  name: "Newsletter Signup",
  type: "newsletter",
  settings: [
    { id: "heading", type: "text", label: "Heading", default: "Stay Updated" },
    { id: "subheading", type: "text", label: "Subheading", default: "Get the latest news and offers." },
    { id: "backgroundColor", type: "color", label: "Background Color", default: "#1a1a1a" },
    { id: "textColor", type: "color", label: "Text Color", default: "#ffffff" }
  ]
};
