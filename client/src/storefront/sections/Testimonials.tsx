import { Button } from "@/components/ui/button";
import { Star, Quote } from "lucide-react";

interface TestimonialsProps {
  settings: {
    heading?: string;
    subheading?: string;
    testimonials?: Array<{
      name: string;
      role: string;
      content: string;
      rating: number;
      avatar: string;
    }>;
  };
}

export default function Testimonials({ settings }: TestimonialsProps) {
  const defaultTestimonials = [
    {
      name: "Sarah Johnson",
      role: "Verified Buyer",
      content: "The quality of the products exceeded my expectations. Fast shipping and excellent customer service!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      name: "Michael Chen",
      role: "Store Owner",
      content: "I've been shopping here for months and I'm always impressed by the curated selection. Highly recommended!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=michael"
    },
    {
      name: "Elena Rodriguez",
      role: "Fashion Blogger",
      content: "Absolutely love the unique designs and the premium feel of everything. This is my go-to store now.",
      rating: 4,
      avatar: "https://i.pravatar.cc/150?u=elena"
    }
  ];

  const list = settings.testimonials || defaultTestimonials;

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black tracking-tight">{settings.heading || "What Our Customers Say"}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {settings.subheading || "Join thousands of happy customers who trust Sellora for their premium shopping needs."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {list.map((t, i) => (
            <div key={i} className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-border/50 hover:shadow-xl transition-all hover:-translate-y-2 relative group">
              <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="w-12 h-12" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className={`w-4 h-4 ${idx < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                ))}
              </div>

              <p className="text-foreground/80 leading-relaxed mb-8 italic">"{t.content}"</p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Schema = {
  name: "Testimonials",
  type: "testimonials",
  settings: [
    // Content
    { id: "sectionTitle", type: "text", label: "Section Title", default: "What Our Customers Say" },
    { id: "sectionSubtitle", type: "textarea", label: "Section Subtitle", default: "Trusted by thousands of happy customers worldwide." },
    { id: "showSubtitle", type: "checkbox", label: "Show Subtitle", default: true },
    { id: "testimonial1", type: "textarea", label: "Review 1", default: "Absolutely love the quality of these products." },
    { id: "author1", type: "text", label: "Author 1 Name", default: "Sarah J." },
    { id: "role1", type: "text", label: "Author 1 Role", default: "Verified Buyer" },
    { id: "rating1", type: "select", label: "Rating 1", options: [
      { label: "5 Stars", value: "5" }, { label: "4 Stars", value: "4" }, { label: "3 Stars", value: "3" },
    ], default: "5" },
    { id: "testimonial2", type: "textarea", label: "Review 2", default: "Fast shipping and excellent customer service!" },
    { id: "author2", type: "text", label: "Author 2 Name", default: "Michael R." },
    { id: "role2", type: "text", label: "Author 2 Role", default: "Loyal Customer" },
    { id: "rating2", type: "select", label: "Rating 2", options: [
      { label: "5 Stars", value: "5" }, { label: "4 Stars", value: "4" }, { label: "3 Stars", value: "3" },
    ], default: "5" },
    { id: "testimonial3", type: "textarea", label: "Review 3", default: "Premium quality at a fair price." },
    { id: "author3", type: "text", label: "Author 3 Name", default: "Elena M." },
    { id: "role3", type: "text", label: "Author 3 Role", default: "Fashion Blogger" },
    { id: "rating3", type: "select", label: "Rating 3", options: [
      { label: "5 Stars", value: "5" }, { label: "4 Stars", value: "4" }, { label: "3 Stars", value: "3" },
    ], default: "5" },
    // Layout
    { id: "columns", type: "select", label: "Columns", options: [
      { label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" },
    ], default: "3" },
    { id: "showRating", type: "checkbox", label: "Show Star Ratings", default: true },
    { id: "showRole", type: "checkbox", label: "Show Author Role", default: true },
    { id: "cardStyle", type: "select", label: "Card Style", options: [
      { label: "Minimal", value: "minimal" }, { label: "Bordered", value: "bordered" },
      { label: "Shadow", value: "shadow" }, { label: "Quoted", value: "quoted" },
    ], default: "minimal" },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "cardBgColor", type: "text", label: "Card Background Color", default: "" },
    { id: "textColor", type: "text", label: "Text Color", default: "" },
    { id: "accentColor", type: "text", label: "Accent Color (stars/quote)", default: "" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};
