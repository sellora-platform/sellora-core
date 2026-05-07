import { db } from '@/lib/db';
import { users, plans } from '@/lib/schema';
import { eq, sql, count } from 'drizzle-orm';
import { BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // 1. Calculate Revenue by Tier
  const revenueData = await db
    .select({
      tier: users.tier,
      count: count(),
      monthlyPrice: plans.monthlyPrice,
    })
    .from(users)
    .innerJoin(plans, eq(users.tier, plans.tier))
    .groupBy(users.tier, plans.monthlyPrice);

  const totalMrr = revenueData.reduce((acc, curr) => {
    return acc + (Number(curr.count) * Number(curr.monthlyPrice));
  }, 0);

  // 2. Growth over time (by month)
  const growthData = await db
    .select({
      month: sql`DATE_TRUNC('month', ${users.createdAt})`,
      count: count(),
    })
    .from(users)
    .groupBy(sql`DATE_TRUNC('month', ${users.createdAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${users.createdAt})`);

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-400">Deep dive into Sellora's growth and financial performance.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <AnalyticsCard 
          title="Monthly Recurring Revenue" 
          value={`$${totalMrr.toLocaleString()}`} 
          trend="+12.5%" 
          icon={<DollarSign className="text-emerald-400" />}
        />
        <AnalyticsCard 
          title="Avg. Revenue Per User" 
          value={`$${(totalMrr / (revenueData.reduce((a, b) => a + Number(b.count), 0) || 1)).toFixed(2)}`} 
          trend="+2.1%" 
          icon={<TrendingUp className="text-blue-400" />}
        />
        <AnalyticsCard 
          title="Customer Lifetime Value" 
          value="$1,240" 
          trend="+5.4%" 
          icon={<BarChart3 className="text-purple-400" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Growth Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Merchant Growth
            </h3>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">Last 6 Months</span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {growthData.map((d: any, i) => {
              const height = (Number(d.count) / Math.max(...growthData.map((m: any) => Number(m.count)))) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500/80 rounded-t-lg transition-all duration-500 group-hover:to-blue-400 group-hover:from-blue-500/40 relative"
                    style={{ height: `${height || 10}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                    {new Date(d.month).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PieChart size={20} className="text-purple-500" />
              Revenue Breakdown
            </h3>
            <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">By Tier</span>
          </div>

          <div className="space-y-4">
            {revenueData.sort((a,b) => Number(b.monthlyPrice) - Number(a.monthlyPrice)).map((data) => {
              const share = ((Number(data.count) * Number(data.monthlyPrice)) / totalMrr) * 100;
              return (
                <div key={data.tier} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-slate-300">{data.tier}</span>
                    <span className="font-bold">${(Number(data.count) * Number(data.monthlyPrice)).toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        data.tier === 'empire' ? 'bg-purple-500' : 
                        data.tier === 'scale' ? 'bg-blue-500' : 
                        data.tier === 'growth' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition-all group overflow-hidden relative">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
        {icon}
      </div>
      <div className="flex justify-between items-center text-slate-400">
        <span className="text-sm font-medium tracking-wide uppercase">{title}</span>
        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-4xl font-bold tracking-tighter">{value}</div>
        <p className="text-xs mt-2 flex items-center gap-1">
          <span className="text-emerald-400 font-bold">{trend}</span>
          <span className="text-slate-500">vs last month</span>
        </p>
      </div>
    </div>
  );
}
