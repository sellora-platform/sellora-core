import { db } from '@/lib/db';
import { subscriptionRequests, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { CheckCircle2, XCircle, Clock, Eye, ExternalLink } from 'lucide-react';
import { processSubscriptionRequest } from '@/app/actions/subscriptions';

export default async function SubscriptionsPage() {
  const requests = await db
    .select({
      id: subscriptionRequests.id,
      merchantId: subscriptionRequests.merchantId,
      merchantName: users.name,
      merchantEmail: users.email,
      tier: subscriptionRequests.tier,
      status: subscriptionRequests.status,
      amount: subscriptionRequests.amount,
      receiptImage: subscriptionRequests.receiptImage,
      notes: subscriptionRequests.notes,
      createdAt: subscriptionRequests.createdAt,
    })
    .from(subscriptionRequests)
    .leftJoin(users, eq(subscriptionRequests.merchantId, users.id))
    .orderBy(desc(subscriptionRequests.createdAt));

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Requests</h1>
        <p className="text-slate-400">Approve or reject manual payment receipts from merchants.</p>
      </div>

      <div className="grid gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <StatusBadge status={req.status as any} />
                  <span className="text-xs text-slate-500">
                    ID: #{req.id} • {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">{req.merchantName || 'Anonymous Merchant'}</h3>
                  <p className="text-sm text-slate-400">{req.merchantEmail}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Requested Tier</p>
                    <p className="font-bold text-blue-400 capitalize">{req.tier}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Amount Paid</p>
                    <p className="font-bold text-emerald-400">${req.amount}</p>
                  </div>
                </div>

                {req.notes && (
                  <div className="text-sm text-slate-400 italic">
                    " {req.notes} "
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 min-w-[240px]">
                {req.receiptImage ? (
                  <a 
                    href={req.receiptImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative aspect-video bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center hover:border-blue-500/50 transition-colors"
                  >
                    <img 
                      src={req.receiptImage} 
                      alt="Receipt" 
                      className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold flex items-center gap-1"><Eye size={14}/> View Receipt</span>
                    </div>
                  </a>
                ) : (
                  <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center text-slate-600 italic text-sm">
                    No receipt uploaded
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2">
                    <form action={async () => {
                      'use server';
                      await processSubscriptionRequest(req.id, req.merchantId, req.tier, 'approved');
                    }}>
                      <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <CheckCircle2 size={16}/> Approve
                      </button>
                    </form>
                    <form action={async () => {
                      'use server';
                      await processSubscriptionRequest(req.id, req.merchantId, req.tier, 'rejected');
                    }}>
                      <button className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <XCircle size={16}/> Reject
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl">
            <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No pending subscription requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const styles = {
    pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  return (
    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}
