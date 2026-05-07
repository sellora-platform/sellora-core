import { PlanToggle } from '@/components/dashboard/plan-toggle';

// Dummy data for merchants
const merchants = [
  { id: 1, name: 'Ahmad Ali', email: 'ahmad@example.com', stores: 2, tier: 'starter', status: 'active' },
  { id: 2, name: 'Sara Khan', email: 'sara@fashionhub.pk', stores: 1, tier: 'growth', status: 'active' },
  { id: 3, name: 'Zain Store', email: 'contact@zain.com', stores: 5, tier: 'scale', status: 'active' },
  { id: 4, name: 'Empire Retail', email: 'admin@empire.com', stores: 12, tier: 'empire', status: 'active' },
  { id: 5, name: 'New Seller', email: 'test@new.com', stores: 0, tier: 'free', status: 'trialing' },
];

export default function MerchantsPage() {
  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
        <p className="text-slate-400">Manage all merchants and their subscription tiers.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800">
              <th className="px-6 py-4 font-semibold text-sm">Merchant</th>
              <th className="px-6 py-4 font-semibold text-sm">Stores</th>
              <th className="px-6 py-4 font-semibold text-sm">Status</th>
              <th className="px-6 py-4 font-semibold text-sm text-right">Plan Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {merchants.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium">{merchant.name}</p>
                  <p className="text-xs text-slate-500">{merchant.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {merchant.stores} stores
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider",
                    merchant.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                  )}>
                    {merchant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <PlanToggle userId={merchant.id} currentTier={merchant.tier} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
