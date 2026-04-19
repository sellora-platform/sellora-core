import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, CreditCard, Truck, Mail, BarChart3, Plus } from "lucide-react";
import { useState } from "react";

const integrations = [
  {
    id: "stripe",
    name: "Stripe Payments",
    description: "Accept credit cards and digital payments securely",
    icon: CreditCard,
    category: "Payments",
    installed: false,
    price: "Free",
  },
  {
    id: "shipping",
    name: "Shipping Integration",
    description: "Manage shipping rates and carrier integration",
    icon: Truck,
    category: "Shipping",
    installed: false,
    price: "Free",
  },
  {
    id: "email",
    name: "Email Marketing",
    description: "Send automated emails to customers",
    icon: Mail,
    category: "Marketing",
    installed: false,
    price: "Free",
  },
  {
    id: "analytics",
    name: "Advanced Analytics",
    description: "Deep insights into your store performance",
    icon: BarChart3,
    category: "Analytics",
    installed: false,
    price: "Premium",
  },
];

export default function Marketplace() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [installed, setInstalled] = useState<string[]>([]);

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleInstall = (id: string) => {
    if (!installed.includes(id)) {
      setInstalled([...installed, id]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Store className="w-8 h-8 text-primary" />
            App Marketplace
          </h1>
          <p className="text-foreground/60 mt-1">
            Extend your store with powerful integrations
          </p>
        </div>

        {/* Featured Section */}
        <Card className="p-8 border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Recommended for You
          </h2>
          <p className="text-foreground/60 mb-6">
            Get started with these essential integrations to grow your business
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.slice(0, 2).map((app) => {
              const Icon = app.icon;
              const isInstalled = installed.includes(app.id);
              return (
                <Card
                  key={app.id}
                  className="p-4 border-border/50 flex items-start justify-between"
                >
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {app.name}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {app.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleInstall(app.id)}
                    disabled={isInstalled}
                    className={
                      isInstalled
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }
                  >
                    {isInstalled ? "✓ Installed" : "Install"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* All Apps */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            All Integrations
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((app) => {
              const Icon = app.icon;
              const isInstalled = installed.includes(app.id);
              return (
                <Card
                  key={app.id}
                  className="p-6 border-border/50 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-accent/20 text-foreground/60">
                      {app.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-lg mb-2">
                    {app.name}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-4">
                    {app.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {app.price}
                    </span>
                    <Button
                      onClick={() => handleInstall(app.id)}
                      disabled={isInstalled}
                      className={
                        isInstalled
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      }
                    >
                      {isInstalled ? (
                        <>✓ Installed</>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Install
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Installed Apps */}
        {installed.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Installed Apps ({installed.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {integrations
                .filter((app) => installed.includes(app.id))
                .map((app) => {
                  const Icon = app.icon;
                  return (
                    <Card
                      key={app.id}
                      className="p-6 border-border/50 border-green-200 bg-green-50/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {app.name}
                            </h3>
                            <p className="text-sm text-green-600">
                              ✓ Active
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-foreground/60 hover:bg-accent/5"
                        >
                          Settings
                        </Button>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
