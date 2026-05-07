import { Users, CreditCard, ShoppingBag, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-400">Welcome back, Admin. Here is what's happening with Sellora.</p>
        </div>
        <div className="text-sm bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
          May 06, 2026
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total MRR" 
          value="$45,231.89" 
          description="+20.1% from last month" 
          icon={<CreditCard className="w-4 h-4 text-emerald-400" />} 
        />
        <KpiCard 
          title="Active Merchants" 
          value="+2,350" 
          description="+180 new this week" 
          icon={<Users className="w-4 h-4 text-blue-400" />} 
        />
        <KpiCard 
          title="Total Stores" 
          value="4,892" 
          description="+12% conversion rate" 
          icon={<ShoppingBag className="w-4 h-4 text-purple-400" />} 
        />
        <KpiCard 
          title="Projected Profit" 
          value="$12,403" 
          description="+5.4% efficiency gain" 
          icon={<TrendingUp className="w-4 h-4 text-orange-400" />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Placeholder */}
        <div className="col-span-4 bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[400px] flex items-center justify-center">
          <p className="text-slate-500">Revenue Analytics Chart (Tremor integration coming soon)</p>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="col-span-3 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Subscriptions</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800" />
                  <div>
                    <p className="text-sm font-medium">Merchant {i}</p>
                    <p className="text-xs text-slate-500">Starter Plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">+$19.00</p>
                  <p className="text-xs text-slate-500">2h ago</p>
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
