'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Merchants', href: '/merchants', icon: Users },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { label: 'Stores', href: '/stores', icon: ShoppingBag },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 flex flex-col p-6 space-y-8 h-full bg-slate-950">
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <ShieldCheck className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">Sellora <span className="text-blue-500">Ops</span></span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-900">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
