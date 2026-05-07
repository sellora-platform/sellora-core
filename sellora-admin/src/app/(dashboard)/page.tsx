import { Users, CreditCard, ShoppingBag, TrendingUp, BarChart3, DollarSign, PieChart } from "lucide-react";
import { db } from '@/lib/db';
import { users, stores, plans } from '@/lib/schema';
import { count, eq, sql } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Real data fetching
  const [totalMerchants] = await db.select({ value: count() }).from(users);
  const [totalStores] = await db.select({ value: count() }).from(stores);
  
  // Calculate MRR (Monthly Recurring Revenue)
  const mrrData = await db
    .select({
      tier: users.tier,
      count: count(),
      price: plans.monthlyPrice,
    })
    .from(users)
    .innerJoin(plans, eq(users.tier, plans.tier))
    .groupBy(users.tier, plans.monthlyPrice);

  const totalMrr = mrrData.reduce((acc, curr) => {
    return acc + (Number(curr.count) * Number(curr.price));
  }, 0);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-400">Welcome back, Admin. Real-time platform metrics for Sellora.</p>
        </div>
        <div className="text-sm bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg" suppressHydrationWarning>
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards with Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total MRR" 
          value={`$${totalMrr.toLocaleString()}`} 
          description="Based on active subscriptions" 
          icon={<CreditCard className="w-4 h-4 text-emerald-400" />} 
        />
        <KpiCard 
          title="Active Merchants" 
          value={totalMerchants.value.toString()} 
          description="Total registered users" 
          icon={<Users className="w-4 h-4 text-blue-400" />} 
        />
        <KpiCard 
          title="Total Stores" 
          value={totalStores.value.toString()} 
          description="Total stores created" 
          icon={<ShoppingBag className="w-4 h-4 text-purple-400" />} 
        />
        <KpiCard 
          title="Projected Profit" 
          value={`$${(totalMrr * 0.7).toLocaleString()}`} 
          description="Estimated 70% margin" 
          icon={<TrendingUp className="w-4 h-4 text-orange-400" />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[400px] flex items-center justify-center">
          <p className="text-slate-500">Revenue Analytics Chart (Integration in progress...)</p>
        </div>

        <div className="col-span-3 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Subscription Tiers Breakdown</h3>
          <div className="space-y-4">
            {mrrData.map((data) => (
              <div key={data.tier} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    data.tier === 'empire' ? 'bg-purple-500' : 
                    data.tier === 'scale' ? 'bg-blue-500' : 
                    data.tier === 'growth' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium capitalize">{data.tier}</p>
                    <p className="text-xs text-slate-500">{data.count} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">
                    +${(Number(data.count) * Number(data.price)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-center text-slate-400">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
