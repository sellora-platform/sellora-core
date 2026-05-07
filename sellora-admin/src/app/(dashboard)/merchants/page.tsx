import { db } from '@/lib/db';
import { users, stores } from '@/lib/schema';
import { eq, sql, count, like, or, and } from 'drizzle-orm';
import { PlanToggle } from '@/components/dashboard/plan-toggle';
import { Search } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: { q?: string; tier?: string };
}) {
  const query = searchParams.q || '';
  const tierFilter = searchParams.tier || '';

  // Fetch real merchants with search and filter
  const merchantData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      tier: users.tier,
      subscriptionStatus: users.subscriptionStatus,
      storeCount: count(stores.id),
    })
    .from(users)
    .leftJoin(stores, eq(users.id, stores.merchantId))
    .where(
      and(
        query ? or(like(users.name, `%${query}%`), like(users.email, `%${query}%`)) : undefined,
        tierFilter ? eq(users.tier, tierFilter as any) : undefined
      )
    )
    .groupBy(users.id)
    .orderBy(sql`${users.createdAt} DESC`);

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
          <p className="text-slate-400">Manage all merchants and their subscription tiers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <form className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search merchants..." 
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 w-[240px] transition-all"
            />
          </form>
          
          <select 
            name="tier"
            defaultValue={tierFilter}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set('tier', e.target.value);
              window.location.href = url.toString();
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Tiers</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="scale">Scale</option>
            <option value="empire">Empire</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800">
              <th className="px-6 py-4 font-semibold text-sm text-slate-400">Merchant</th>
              <th className="px-6 py-4 font-semibold text-sm text-slate-400">Stores</th>
              <th className="px-6 py-4 font-semibold text-sm text-slate-400">Status</th>
              <th className="px-6 py-4 font-semibold text-sm text-slate-400 text-right">Plan Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {merchantData.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-medium group-hover:text-blue-400 transition-colors">{merchant.name || 'Anonymous'}</p>
                  <p className="text-xs text-slate-500">{merchant.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                    {merchant.storeCount} {Number(merchant.storeCount) === 1 ? 'store' : 'stores'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider border",
                    merchant.subscriptionStatus === 'active' 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                  )}>
                    {merchant.subscriptionStatus || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <PlanToggle userId={merchant.id} currentTier={merchant.tier} />
                </td>
              </tr>
            ))}
            {merchantData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                  No merchants found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
