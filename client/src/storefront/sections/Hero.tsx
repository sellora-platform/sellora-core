import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export type HeroSettings = {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  alignment: "left" | "center" | "right";
  showTrustBadges: boolean;
};

export const HeroSchema = {
  name: "Hero Banner",
  type: "hero",
  settings: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Elevate Your Style"
    },
    {
      id: "subheading",
      type: "textarea",
      label: "Subheading",
      default: "Discover our premium curated collection of high-quality products."
    },
    {
      id: "buttonText",
      type: "text",
      label: "Button Text",
      default: "Shop Now"
    },
    {
      id: "alignment",
      type: "select",
      label: "Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" }
      ],
      default: "center"
    },
    {
      id: "showTrustBadges",
      type: "checkbox",
      label: "Show Trust Badges",
      default: true
    }
  ]
};

export default function Hero({ settings }: { settings: HeroSettings }) {
  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  }[settings.alignment || "center"];

  return (
    <section className="py-24 px-4 border-b border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
      <div className={`container max-w-5xl flex flex-col ${alignmentClass}`}>
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">New Collection</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
          {settings.heading || "Elevate Your Style"}
        </h1>
        
        <p className="text-xl text-foreground/60 mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {settings.subheading || "Discover our premium curated collection of high-quality products designed for the modern lifestyle."}
        </p>

        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Button size="lg" className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            {settings.buttonText || "Shop Now"}
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl font-bold hover:bg-accent/5">
            Learn More
          </Button>
        </div>

        {settings.showTrustBadges && (
          <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-border/30 w-full justify-center">
            {/* Badges here... */}
          </div>
        )}
      </div>
      
      {/* Abstract Background Shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
    </section>
  );
}
