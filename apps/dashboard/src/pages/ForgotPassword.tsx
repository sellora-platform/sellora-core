import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Loader2, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
        <div className="w-full max-w-md space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
            <MailCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a password reset link to <b>{email}</b>. Please check your inbox and spam folder.
          </p>
          <Button variant="outline" onClick={() => setLocation("/login")} className="w-full">
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
            <Sparkles className="h-8 w-8 text-primary" />
            Sellora
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Reset your account password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password?</CardTitle>
            <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => setLocation("/login")}>
                Back to login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
