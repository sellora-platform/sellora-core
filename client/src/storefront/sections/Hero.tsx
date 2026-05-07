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
  name: "Hero",
  type: "hero",
  settings: [
    // Content
    { id: "heading", type: "text", label: "Heading", default: "Refined Essentials." },
    { id: "subheading", type: "textarea", label: "Subheading", default: "Experience the perfect blend of premium quality and minimalist design." },
    { id: "badge", type: "text", label: "Badge Text (top label)", default: "Est. 2024 — Curated Series" },
    { id: "showBadge", type: "checkbox", label: "Show Badge", default: true },

    // Primary Button
    { id: "buttonText", type: "text", label: "Primary Button Text", default: "Shop Now" },
    { id: "buttonLink", type: "url", label: "Primary Button Link", default: "/products" },
    { id: "buttonStyle", type: "select", label: "Primary Button Style", options: [
      { label: "Filled", value: "filled" },
      { label: "Outlined", value: "outlined" },
      { label: "Ghost", value: "ghost" },
    ], default: "filled" },

    // Secondary Button
    { id: "showSecondaryButton", type: "checkbox", label: "Show Secondary Button", default: true },
    { id: "secondaryButtonText", type: "text", label: "Secondary Button Text", default: "Lookbook" },
    { id: "secondaryButtonLink", type: "url", label: "Secondary Button Link", default: "/collections" },

    // Image
    { id: "image", type: "image", label: "Background Image" },
    { id: "imageOverlay", type: "select", label: "Image Overlay", options: [
      { label: "None", value: "none" },
      { label: "Light", value: "light" },
      { label: "Medium", value: "medium" },
      { label: "Dark", value: "dark" },
      { label: "Gradient Left", value: "gradient-left" },
      { label: "Gradient Center", value: "gradient-center" },
    ], default: "gradient-left" },
    { id: "imageOpacity", type: "range", label: "Image Opacity", min: 10, max: 100, step: 5, default: 60 },

    // Layout
    { id: "alignment", type: "select", label: "Content Alignment", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ], default: "left" },
    { id: "minHeight", type: "select", label: "Section Height", options: [
      { label: "Small (60vh)", value: "60vh" },
      { label: "Medium (75vh)", value: "75vh" },
      { label: "Large (90vh)", value: "90vh" },
      { label: "Full Screen (100vh)", value: "100vh" },
    ], default: "90vh" },

    // Typography
    { id: "headingSize", type: "select", label: "Heading Size", options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" },
      { label: "Extra Large", value: "xl" },
    ], default: "large" },
    { id: "headingWeight", type: "select", label: "Heading Weight", options: [
      { label: "Light", value: "font-light" },
      { label: "Normal", value: "font-normal" },
      { label: "Medium", value: "font-medium" },
      { label: "Bold", value: "font-bold" },
      { label: "Black", value: "font-black" },
    ], default: "font-light" },
    { id: "headingColor", type: "text", label: "Heading Color", default: "" },
    { id: "subheadingColor", type: "text", label: "Subheading Color", default: "" },

    // Layout controls
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 200, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 200, step: 4, default: 80 },
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
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
