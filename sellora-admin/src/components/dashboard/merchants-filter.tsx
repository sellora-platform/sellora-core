'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useCallback } from 'react';

interface MerchantsFilterProps {
  currentQuery: string;
  currentTier: string;
}

export function MerchantsFilter({ currentQuery, currentTier }: MerchantsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/merchants?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex items-center gap-3">
      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const q = (form.elements.namedItem('q') as HTMLInputElement).value;
        updateFilter('q', q);
      }} className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
        <input
          type="text"
          name="q"
          defaultValue={currentQuery}
          placeholder="Search merchants..."
          className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 w-[240px] transition-all"
        />
      </form>

      <select
        defaultValue={currentTier}
        onChange={(e) => updateFilter('tier', e.target.value)}
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
  );
}
