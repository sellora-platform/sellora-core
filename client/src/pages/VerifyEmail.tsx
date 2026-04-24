import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [location, setLocation] = useLocation();
  const { user, refetch } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // If user is already verified, redirect to dashboard
  useEffect(() => {
    if (user?.isVerified) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Verification failed");
        return;
      }

      toast.success("Email verified successfully!");
      await refetch();
      setLocation("/onboarding");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("New code sent to your email");
      } else {
        toast.error("Failed to resend code");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
            <Sparkles className="h-8 w-8 text-primary" />
            Sellora
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Verification required
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to <br />
              <span className="font-bold text-foreground">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-bold h-16 border-border/50 focus:ring-primary/20"
                  maxLength={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Account"}
              </Button>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResend} 
                  disabled={resending}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  {resending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Resend Code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="link" onClick={() => setLocation("/login")} className="text-muted-foreground hover:text-primary">
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}
