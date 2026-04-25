import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

interface FAQProps {
  settings: {
    heading?: string;
    subheading?: string;
    items?: Array<{ question: string; answer: string }>;
  };
}

export default function FAQ({ settings }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultItems = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied, simply contact us for a free return label."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location."
    },
    {
      question: "Are my payments secure?",
      answer: "Absolutely. We use industry-standard SSL encryption and partner with secure payment processors like Stripe."
    }
  ];

  const list = settings.items || defaultItems;

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-primary">Help Center</span>
        </div>
        
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-black tracking-tight">{settings.heading || "Frequently Asked Questions"}</h2>
          <p className="text-muted-foreground">
            {settings.subheading || "Find answers to common questions about our products and services."}
          </p>
        </div>

        <div className="space-y-4">
          {list.map((item, i) => (
            <div 
              key={i} 
              className={`rounded-2xl border transition-all duration-300 ${openIndex === i ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/20 bg-card"}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-lg text-foreground">{item.question}</span>
                <div className={`p-1 rounded-full transition-transform duration-300 ${openIndex === i ? "rotate-180 bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {openIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                  {item.answer}
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
  name: "FAQ Accordion",
  type: "faq",
  settings: [
    { id: "heading", type: "text", label: "Heading", default: "Common Questions" },
    { id: "subheading", type: "text", label: "Subheading", default: "Everything you need to know." }
  ]
};
