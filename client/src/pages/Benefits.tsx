import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Zap,
  BarChart3,
  Sparkles,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Headphones,
  Layers,
  CheckCircle2,
  ArrowRight,
  Star,
  Flame,
} from "lucide-react";

export default function Benefits() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">ShopifyAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/features")}
              className="text-foreground hover:bg-accent/5"
            >
              Features
            </Button>
            <Button
              onClick={() =>
                isAuthenticated
                  ? setLocation("/dashboard")
                  : (window.location.href = getLoginUrl())
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Why ShopifyAI Wins</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Build Your Empire
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              10x Faster & Cheaper
            </span>
          </h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            ShopifyAI combines the power of Shopify with AI automation. Get professional results without hiring expensive teams. Scale your business while you sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() =>
                isAuthenticated
                  ? setLocation("/dashboard")
                  : (window.location.href = getLoginUrl())
              }
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
            >
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/features")}
              className="h-12 px-8 text-base border-border hover:bg-accent/5"
            >
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Thousands Choose ShopifyAI
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              The platform designed for modern entrepreneurs who want to build faster, smarter, and more profitably.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Benefit 1: Time Savings */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 rounded-2xl p-8 hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Save 40+ Hours Monthly
              </h3>
              <p className="text-foreground/70 mb-4">
                AI generates product descriptions, marketing copy, and designs automatically. What takes 15 minutes manually takes 2 minutes with ShopifyAI.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>87% faster product descriptions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>80% faster store design</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>96% faster analytics</span>
                </div>
              </div>
            </div>

            {/* Benefit 2: Cost Savings */}
            <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-border/50 rounded-2xl p-8 hover:border-accent/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Save $1,400-7,200/Month
              </h3>
              <p className="text-foreground/70 mb-4">
                No need to hire copywriters, designers, or consultants. AI does the work for you at a fraction of the cost.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>vs $500-2000 copywriter</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>vs $1000-5000 designer</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>98% cheaper than Shopify + tools</span>
                </div>
              </div>
            </div>

            {/* Benefit 3: Professional Quality */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 rounded-2xl p-8 hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Professional Results Instantly
              </h3>
              <p className="text-foreground/70 mb-4">
                Get enterprise-quality designs, copy, and analytics without hiring expensive professionals. Your store looks premium from day one.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>AI-optimized product descriptions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Professional design suggestions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>SEO-optimized content</span>
                </div>
              </div>
            </div>

            {/* Benefit 4: Faster Growth */}
            <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-border/50 rounded-2xl p-8 hover:border-accent/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Grow 3-4x Faster
              </h3>
              <p className="text-foreground/70 mb-4">
                Launch your store in 30 minutes instead of weeks. Get to profitability faster with AI-powered optimization.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>5x faster store setup</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>2.8x faster revenue growth</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>Scale without hiring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Features Section */}
      <section className="py-20 px-4 border-t border-border/50 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Features that would cost thousands to build are included in every plan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Sparkles,
                title: "AI Content Generator",
                description:
                  "Generate product descriptions, marketing copy, and social media posts in seconds.",
              },
              {
                icon: Layers,
                title: "AI Design Assistant",
                description:
                  "Get color palettes, layout suggestions, and design recommendations automatically.",
              },
              {
                icon: BarChart3,
                title: "AI Analytics",
                description:
                  "Automatic insights, trend detection, and actionable recommendations.",
              },
              {
                icon: Zap,
                title: "AI Store Optimizer",
                description:
                  "Suggestions to increase conversions, reduce cart abandonment, and boost sales.",
              },
              {
                icon: Users,
                title: "AI Customer Insights",
                description:
                  "Understand customer behavior, predict churn, and identify VIP customers.",
              },
              {
                icon: Shield,
                title: "AI Inventory Manager",
                description:
                  "Predict demand, prevent stockouts, and optimize inventory levels.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-background border border-border/50 rounded-xl p-6 hover:border-primary/20 transition-all"
              >
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              The ShopifyAI Difference
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              See how ShopifyAI compares to traditional e-commerce platforms.
            </p>
          </div>

          <div className="overflow-x-auto max-w-6xl mx-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    Shopify
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    WooCommerce
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    ShopifyAI
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Setup Time",
                    shopify: "2-3 hours",
                    woo: "4-6 hours",
                    shopifyai: "30 minutes",
                  },
                  {
                    feature: "AI Content Generation",
                    shopify: "❌",
                    woo: "❌",
                    shopifyai: "✅",
                  },
                  {
                    feature: "AI Design Suggestions",
                    shopify: "❌",
                    woo: "❌",
                    shopifyai: "✅",
                  },
                  {
                    feature: "AI Analytics",
                    shopify: "❌",
                    woo: "❌",
                    shopifyai: "✅",
                  },
                  {
                    feature: "Monthly Cost (base)",
                    shopify: "$29-299",
                    woo: "$0 + hosting",
                    shopifyai: "$29-99",
                  },
                  {
                    feature: "Cost with AI tools",
                    shopify: "$500-1500",
                    woo: "$500-2000",
                    shopifyai: "$29-99",
                  },
                  {
                    feature: "Product Descriptions",
                    shopify: "Manual",
                    woo: "Manual",
                    shopifyai: "AI-Generated",
                  },
                  {
                    feature: "Store Design",
                    shopify: "DIY/Hire",
                    woo: "DIY/Hire",
                    shopifyai: "AI-Suggested",
                  },
                  {
                    feature: "Customer Support",
                    shopify: "Email/Chat",
                    woo: "Community",
                    shopifyai: "24/7 AI + Human",
                  },
                  {
                    feature: "Scalability",
                    shopify: "Manual",
                    woo: "Manual",
                    shopifyai: "AI-Powered",
                  },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 hover:bg-accent/5 transition-all"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center text-foreground/60">
                      {row.shopify}
                    </td>
                    <td className="py-4 px-4 text-center text-foreground/60">
                      {row.woo}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-primary">
                      {row.shopifyai}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 px-4 border-t border-border/50 bg-gradient-to-b from-transparent to-accent/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Real entrepreneurs building real businesses with ShopifyAI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                business: "Handmade Jewelry",
                result: "$47K revenue in 6 months",
                quote:
                  "ShopifyAI saved me 40 hours per week. I went from 0 to $47K in 6 months without hiring anyone.",
              },
              {
                name: "Marcus Johnson",
                business: "Fitness Supplements",
                result: "3x revenue growth",
                quote:
                  "The AI content generation alone increased my conversion rate by 23%. Best decision I made.",
              },
              {
                name: "Emma Rodriguez",
                business: "Eco-Friendly Products",
                result: "234 customers in 3 months",
                quote:
                  "I spent $50K on designers and copywriters before. ShopifyAI does it all for $99/month.",
              },
            ].map((story, idx) => (
              <div
                key={idx}
                className="bg-background border border-border/50 rounded-xl p-8 hover:border-primary/20 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="text-foreground/70 mb-6 italic">"{story.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{story.name}</p>
                  <p className="text-sm text-foreground/60">{story.business}</p>
                  <p className="text-sm font-medium text-primary mt-2">
                    {story.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to Build Your Empire?
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Join thousands of entrepreneurs using ShopifyAI to build, manage, and scale their e-commerce businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() =>
                isAuthenticated
                  ? setLocation("/dashboard")
                  : (window.location.href = getLoginUrl())
              }
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
            >
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base border-border hover:bg-accent/5"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-foreground/50 mt-6">
            No credit card required. Start selling in 30 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-background/50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">ShopifyAI</span>
              </div>
              <p className="text-sm text-foreground/60">
                The AI-powered e-commerce platform for modern entrepreneurs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-foreground/50">
            <p>&copy; 2026 ShopifyAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
