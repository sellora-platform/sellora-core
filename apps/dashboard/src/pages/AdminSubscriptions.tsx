import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, X, Clock, User, CreditCard } from "lucide-react";

export default function AdminSubscriptions() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const requestsQuery = trpc.subscriptions.getAllPendingRequests.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const approveMutation = trpc.subscriptions.approveRequest.useMutation({
    onSuccess: () => {
      toast.success("Subscription approved!");
      utils.subscriptions.getAllPendingRequests.invalidate();
    },
  });

  const rejectMutation = trpc.subscriptions.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Subscription rejected.");
      utils.subscriptions.getAllPendingRequests.invalidate();
    },
  });

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center space-y-4 max-w-md">
            <X className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-foreground/60">Only administrators can access this page.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const requests = requestsQuery.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Subscription Requests</h1>
          <p className="text-foreground/60 mt-2">Manage manual payment verifications</p>
        </div>

        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Clock className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/40 font-medium">No pending requests found.</p>
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="p-6 border-border/50 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">Merchant ID: {req.merchantId}</p>
                        <p className="text-sm text-foreground/50">{new Date(req.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-accent/5 border border-border/30">
                        <p className="text-xs text-foreground/40 font-bold uppercase">Requested Tier</p>
                        <p className="font-bold text-primary capitalize">{req.tier}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent/5 border border-border/30">
                        <p className="text-xs text-foreground/40 font-bold uppercase">Amount Paid</p>
                        <p className="font-bold text-foreground">${req.amount}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-background border border-border/50">
                      <p className="text-xs text-foreground/40 font-bold uppercase mb-2">Transaction Details</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{req.notes || "No details provided"}</p>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-3 min-w-[150px]">
                    <Button 
                      onClick={() => approveMutation.mutate({ requestId: req.id })}
                      disabled={approveMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold h-12"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => rejectMutation.mutate({ requestId: req.id })}
                      disabled={rejectMutation.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 gap-2 font-bold h-12"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
