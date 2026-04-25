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
    { id: "heading", type: "text", label: "Heading", default: "Customer Stories" },
    { id: "subheading", type: "text", label: "Subheading", default: "Hear from our community." }
  ]
};
