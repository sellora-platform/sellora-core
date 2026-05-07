import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Zap,
  ShoppingCart,
  BarChart3,
  Sparkles,
  Users,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="animate-pulse text-foreground/50">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Sellora
            </span>
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
              variant="ghost"
              onClick={() => setLocation("/benefits")}
              className="text-foreground hover:bg-accent/5"
            >
              Benefits
            </Button>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The E-Commerce Platform
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build, manage, and grow your store with intelligent AI agents. Design
            beautiful storefronts, create compelling product descriptions, and
            automate your entire e-commerce operation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
            >
              Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/features")}
              className="h-12 px-8 text-base border-border hover:bg-accent/5"
            >
              View Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-center text-foreground/60 mb-16 max-w-2xl mx-auto">
            Everything you need to run a successful e-commerce business, enhanced
            with AI intelligence
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Agent Assistant",
                description:
                  "Describe what you want, and AI agents execute it. Design changes, product descriptions, banners—all through natural conversation.",
              },
              {
                icon: ShoppingCart,
                title: "Complete Storefront",
                description:
                  "Beautiful, customizable storefronts that convert. Manage products, collections, and customer experiences with ease.",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Real-time insights into your sales, customers, and store performance. Make data-driven decisions.",
              },
              {
                icon: Users,
                title: "Customer Management",
                description:
                  "Track customer profiles, order history, and engagement. Build lasting relationships with your customers.",
              },
              {
                icon: Zap,
                title: "Smart Automation",
                description:
                  "Automate discounts, inventory management, and order fulfillment. Save time on repetitive tasks.",
              },
              {
                icon: ShoppingCart,
                title: "Payment & Shipping",
                description:
                  "Integrated payment processing and shipping solutions. Stripe, PayPal, and major carriers supported.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors hover:border-accent/50"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Store?
          </h2>
          <p className="text-lg text-foreground/60 mb-8">
            Join thousands of merchants using Sellora to build smarter, more
            efficient e-commerce businesses.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
          >
            Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="container text-center text-foreground/60 text-sm">
          <p>&copy; 2026 Sellora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
