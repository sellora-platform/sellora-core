'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { updateMerchantTier } from '@/app/actions/merchants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tiers = [
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'growth', label: 'Growth' },
  { value: 'scale', label: 'Scale' },
  { value: 'empire', label: 'Empire' },
];

interface PlanToggleProps {
  userId: number;
  currentTier: string;
}

export function PlanToggle({ userId, currentTier }: PlanToggleProps) {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState(currentTier);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newTier: string) => {
    if (newTier === tier) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const result = await updateMerchantTier(userId, newTier);
      if (result.success) {
        setTier(newTier);
        setOpen(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Network error. Failed to update plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left w-[180px]">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center justify-between w-full px-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all"
      >
        <span className="capitalize">{tier}</span>
        {loading ? (
          <Loader2 className="w-4 h-4 ml-2 animate-spin text-blue-500" />
        ) : (
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
        )}
      </button>

      {open && !loading && (
        <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {tiers.map((t) => (
            <button
              key={t.value}
              onClick={() => handleUpdate(t.value)}
              className={cn(
                "flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-slate-800 transition-colors text-left",
                tier === t.value && "text-blue-400 bg-blue-400/5"
              )}
            >
              {t.label}
              {tier === t.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
