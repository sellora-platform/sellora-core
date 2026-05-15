import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function OrderDetails() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const params = useParams();
  const orderId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  const orderQuery = trpc.orders.getById.useQuery(
    { id: orderId },
    { enabled: !!orderId }
  );

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      orderQuery.refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const confirmPaymentMutation = trpc.orders.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment confirmed");
      orderQuery.refetch();
    },
    onError: (err) => toast.error(err.message)
  });
  
  const sendEmailMutation = trpc.orders.sendManualConfirmationEmail.useMutation({
    onSuccess: () => toast.success("Confirmation email sent to customer"),
    onError: (err) => toast.error(err.message)
  });

  if (!isAuthenticated) return null;

  if (orderQuery.isPending) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const order = orderQuery.data;
  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Order not found</h2>
          <Button onClick={() => setLocation("/orders")} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: "Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
      processing: { label: "Processing", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Package },
      shipped: { label: "Shipped", color: "text-purple-600 bg-purple-50 border-purple-200", icon: Truck },
      delivered: { label: "Delivered", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
      cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
    };
    return statuses[status] || statuses.pending;
  };

  const status = getStatusInfo(order.status || "pending");

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setLocation("/orders")}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Order {order.orderNumber}
                </h1>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${status.color} flex items-center gap-1.5`}>
                  <status.icon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <p className="text-foreground/60 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => sendEmailMutation.mutate({ orderId: order.id })}
              disabled={sendEmailMutation.isPending}
            >
              <Mail className="w-4 h-4" />
              Send Email
            </Button>
            {order.status === "pending" && (
              <Button 
                onClick={() => updateStatusMutation.mutate({ id: order.id, status: "processing" })}
                disabled={updateStatusMutation.isPending}
              >
                Mark as Processing
              </Button>
            )}
            {order.status === "processing" && (
              <Button 
                onClick={() => updateStatusMutation.mutate({ id: order.id, status: "shipped" })}
                disabled={updateStatusMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Ship Order
              </Button>
            )}
            {order.status === "shipped" && (
              <Button 
                onClick={() => updateStatusMutation.mutate({ id: order.id, status: "delivered" })}
                disabled={updateStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark as Delivered
              </Button>
            )}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Button 
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => updateStatusMutation.mutate({ id: order.id, status: "cancelled" })}
                disabled={updateStatusMutation.isPending}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info (Items) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-border/50">
              <div className="p-6 border-b border-border/50 bg-muted/30">
                <h3 className="font-bold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Order Items
                </h3>
              </div>
              <div className="divide-y divide-border/50">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-muted rounded border border-border/50 overflow-hidden flex-shrink-0">
                        {/* Placeholder or real image if available */}
                        <div className="w-full h-full flex items-center justify-center opacity-40">
                          <Package className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/60 mt-1">
                          SKU: {item.sku || "N/A"} | Price: ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">x{item.quantity}</p>
                      <p className="text-sm font-medium text-foreground/60">
                        ${parseFloat(item.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-muted/30 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-medium">${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-border/50">
                  <span>Total</span>
                  <span className="text-primary">${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {order.notes && (
              <Card className="p-6 border-border/50">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Order Notes
                </h3>
                <p className="text-foreground/80 text-sm italic">
                  "{order.notes}"
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar Info (Customer & Payment) */}
          <div className="space-y-6">
            {/* Customer Details */}
            <Card className="p-6 border-border/50">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Customer
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/5 rounded">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-medium">Name</p>
                    <p className="font-bold">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/5 rounded">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-medium">Email</p>
                    <p className="font-bold">{order.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/5 rounded">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-medium">Phone</p>
                    <p className="font-bold">{order.customerPhone}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6 border-border/50">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Shipping Address
              </h3>
              <div className="space-y-1 text-sm text-foreground/80">
                <p className="font-bold text-foreground">{order.customerName}</p>
                <p>{(order.shippingAddress as any)?.line1}</p>
                {(order.shippingAddress as any)?.line2 && <p>{(order.shippingAddress as any).line2}</p>}
                {(order.shippingAddress as any)?.area && <p className="font-medium">Area: {(order.shippingAddress as any).area}</p>}
                {(order.shippingAddress as any)?.landmark && <p className="text-primary font-bold">Landmark: {(order.shippingAddress as any).landmark}</p>}
                <p>{(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state}</p>
                <p>{(order.shippingAddress as any)?.country} {(order.shippingAddress as any)?.postalCode}</p>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-6 border-border/50">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Payment Info
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-foreground/60 font-medium mb-1">Method</p>
                  <p className="font-bold uppercase tracking-wider">{order.paymentMethod?.replace("_", " ") || "N/A"}</p>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded border border-border/50">
                  <div>
                    <p className="text-[10px] text-foreground/60 font-bold uppercase">Status</p>
                    <p className={`text-sm font-bold ${order.paymentStatus === "confirmed" ? "text-green-600" : "text-orange-600"}`}>
                      {order.paymentStatus?.toUpperCase() || "PENDING"}
                    </p>
                  </div>
                  {order.paymentStatus !== "confirmed" && order.paymentMethod !== "cod" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => confirmPaymentMutation.mutate({ id: order.id })}
                      disabled={confirmPaymentMutation.isPending}
                    >
                      Confirm
                    </Button>
                  )}
                </div>

                {order.paymentScreenshot && (
                  <div>
                    <p className="text-xs text-foreground/60 font-medium mb-3">Payment Proof</p>
                    <div className="relative group rounded-lg overflow-hidden border border-border/50 cursor-pointer"
                         onClick={() => window.open(order.paymentScreenshot!, "_blank")}>
                      <img 
                        src={order.paymentScreenshot} 
                        alt="Payment Proof" 
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
