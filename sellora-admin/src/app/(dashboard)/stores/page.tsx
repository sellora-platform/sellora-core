import { db } from '@/lib/db';
import { stores, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { Globe, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const allStores = await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      customDomain: stores.customDomain,
      isActive: stores.isActive,
      merchantName: users.name,
      merchantEmail: users.email,
      createdAt: stores.createdAt,
    })
    .from(stores)
    .leftJoin(users, eq(stores.merchantId, users.id))
    .orderBy(desc(stores.createdAt));

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
        <p className="text-slate-400">Monitoring all active merchant storefronts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allStores.map((store) => (
          <div key={store.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                <Globe size={20} />
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider border ${
                store.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}>
                {store.isActive ? "Active" : "Disabled"}
              </span>
            </div>

            <h3 className="text-lg font-bold truncate">{store.name}</h3>
            <p className="text-xs text-slate-500 mb-4 italic">Owned by {store.merchantName || 'Anonymous'}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subdomain:</span>
                <span className="text-slate-200 font-mono">{store.slug}.sellora.com</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Custom Domain:</span>
                <span className="text-slate-200">{store.customDomain || 'None'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800/50 flex gap-2">
              <a 
                href={`https://${store.slug}.sellora.com`} 
                target="_blank" 
                className="flex-1 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
              >
                <ExternalLink size={14} /> Visit Store
              </a>
              <button className="p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-600/20 transition-colors">
                <ShieldAlert size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
