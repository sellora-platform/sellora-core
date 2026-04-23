import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Sparkles,
  ShoppingCart,
  BarChart3,
  Users,
  Zap,
  Lock,
  Globe,
  Palette,
  Cpu,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Lightbulb,
  Rocket,
} from "lucide-react";

export default function Features() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Store Management",
      description: "Tell our intelligent agents what you want, and they'll handle the rest. From design suggestions to product descriptions, everything is automated.",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-600",
    },
    {
      icon: ShoppingCart,
      title: "Complete E-Commerce Suite",
      description: "Everything you need to sell online. Product management, inventory tracking, shopping cart, and seamless checkout experience.",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-600",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights into your sales, revenue, and customer behavior. Make data-driven decisions with beautiful dashboards.",
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-600",
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Track all your customers, their order history, spending patterns, and build lasting relationships.",
      color: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-600",
    },
    {
      icon: Palette,
      title: "Customizable Storefront",
      description: "Create a unique, branded shopping experience. Customize colors, fonts, themes, and layouts without coding.",
      color: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-600",
    },
    {
      icon: Zap,
      title: "Discount & Coupon System",
      description: "Create promotional campaigns with percentage-based or fixed-amount discounts. Track usage and maximize conversions.",
      color: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-600",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Integrated payment processing with Stripe. Enterprise-grade security for all transactions.",
      color: "from-indigo-500/20 to-blue-500/20",
      iconColor: "text-indigo-600",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Sell to customers worldwide. Multi-currency support and international shipping integrations.",
      color: "from-teal-500/20 to-cyan-500/20",
      iconColor: "text-teal-600",
    },
  ];

  const aiFeatures = [
    {
      title: "Design Assistant",
      description: "Get AI-powered design suggestions tailored to your brand",
      icon: Palette,
    },
    {
      title: "Content Generator",
      description: "Create compelling product descriptions and marketing copy instantly",
      icon: Lightbulb,
    },
    {
      title: "Banner Creator",
      description: "Generate eye-catching promotional banners and hero images",
      icon: Zap,
    },
    {
      title: "Layout Optimizer",
      description: "AI suggests optimal store layouts for maximum conversions",
      icon: Cpu,
    },
  ];

  const benefits = [
    {
      title: "Save Time",
      description: "Automate repetitive tasks and focus on growing your business",
      icon: Rocket,
    },
    {
      title: "Increase Sales",
      description: "AI-optimized layouts and content drive higher conversion rates",
      icon: TrendingUp,
    },
    {
      title: "Professional Quality",
      description: "Get enterprise-grade features without enterprise-level complexity",
      icon: Star,
    },
    {
      title: "Scale Effortlessly",
      description: "Handle growth from startup to enterprise without limitations",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-md">
              S
            </div>
            <span className="text-lg font-bold text-foreground">Sellora</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-foreground hover:bg-accent/5 font-medium"
            >
              Home
            </Button>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">The Future of E-Commerce</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Build Your Store with <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">AI Power</span>
          </h1>
          <p className="text-xl text-foreground/60 mb-8 max-w-2xl mx-auto">
            Sellora combines the power of e-commerce with intelligent agents. Describe what you want, and AI agents will create it for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-primary-foreground gap-2 px-8 py-6 text-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="border-border/50 hover:bg-accent/5 px-8 py-6 text-lg"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Everything you need to build, manage, and grow your e-commerce business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-card/50 hover:from-card hover:to-card/80"
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 w-fit`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-foreground/60">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-4 border-t border-border/50 bg-gradient-to-br from-card/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">AI-Powered</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Intelligent Agents</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Powered by advanced AI, our agents understand your needs and execute them perfectly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-border/50 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-card/50"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4 w-fit">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground/60">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Sellora?</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Join thousands of merchants who are transforming their businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex gap-6 p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="p-4 rounded-lg bg-primary/10 h-fit">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">{benefit.title}</h3>
                    <p className="text-foreground/60">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 border-t border-border/50 bg-gradient-to-br from-card/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How We Compare</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Sellora offers more features at a better price
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 font-bold text-foreground">Feature</th>
                  <th className="text-center py-4 px-6 font-bold text-foreground">Sellora</th>
                  <th className="text-center py-4 px-6 font-bold text-foreground">Shopify</th>
                  <th className="text-center py-4 px-6 font-bold text-foreground">WooCommerce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  { feature: "AI-Powered Store Management", Sellora: true, shopify: false, woo: false },
                  { feature: "Product Management", Sellora: true, shopify: true, woo: true },
                  { feature: "AI Design Assistant", Sellora: true, shopify: false, woo: false },
                  { feature: "CSV Export", Sellora: true, shopify: true, woo: true },
                  { feature: "Customer Analytics", Sellora: true, shopify: true, woo: false },
                  { feature: "Discount System", Sellora: true, shopify: true, woo: true },
                  { feature: "Starting Price", Sellora: true, shopify: true, woo: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-accent/5 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {row.Sellora ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-foreground/20 rounded mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.shopify ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-foreground/20 rounded mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.woo ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-foreground/20 rounded mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 p-12 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Transform Your Store?</h2>
            <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
              Join the revolution. Start building your AI-powered store today with Sellora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-primary-foreground gap-2 px-8 py-6 text-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="border-primary/50 hover:bg-primary/5 px-8 py-6 text-lg"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-gradient-to-b from-background to-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-foreground/60 text-sm">
            <p>&copy; 2026 Sellora. All rights reserved. Powered by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
