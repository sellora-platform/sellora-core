import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Store, Sparkles } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Onboarding() {
  const { isAuthenticated, user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const createMutation = trpc.stores.create.useMutation({
    onSuccess: () => {
      setLocation("/dashboard");
    },
  });

  if (!loading && !isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-foreground/50">Loading...</div>
      </div>
    );
  }

  const handleCreateStore = async () => {
    if (!formData.name || !formData.slug) return;

    await createMutation.mutateAsync({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-accent/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Sellora</h1>
          </div>
          <p className="text-lg text-foreground/60">
            Welcome, {user?.name}! Let's set up your store.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-border/50"
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <Card className="p-8 border-border/50 shadow-lg">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Store Name
                </h2>
                <p className="text-foreground/60 mb-4">
                  What's the name of your store?
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Store Name *
                </label>
                <Input
                  placeholder="e.g., My Awesome Store"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-border/50 focus:border-primary h-12 text-base"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.name}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Store URL
                </h2>
                <p className="text-foreground/60 mb-4">
                  Choose your store's web address
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Store Slug *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-foreground/60">Sellora.com/</span>
                  <Input
                    placeholder="my-store"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    className="border-border/50 focus:border-primary h-12 flex-1"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-border/50 hover:bg-accent/5 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.slug}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Store Description
                </h2>
                <p className="text-foreground/60 mb-4">
                  Tell customers about your store (optional)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Write a brief description of your store..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border-border/50 focus:border-primary resize-none"
                  rows={4}
                />
              </div>

              {/* Features Preview */}
              <div className="bg-accent/5 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Your store will include:
                </p>
                <ul className="text-sm text-foreground/60 space-y-1 ml-6">
                  <li>✓ AI-powered store management</li>
                  <li>✓ Product catalog with variants</li>
                  <li>✓ Customer orders & analytics</li>
                  <li>✓ Discount & coupon system</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-border/50 hover:bg-accent/5 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateStore}
                  disabled={!formData.name || !formData.slug || createMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                >
                  {createMutation.isPending ? "Creating..." : "Create Store"}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-foreground/60">
          <p>
            By creating a store, you agree to our Terms of Service and Privacy
            Policy
          </p>
        </div>
      </div>
    </div>
  );
}
