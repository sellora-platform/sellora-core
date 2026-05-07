'use client';

import { useState } from 'react';
import { login } from '@/app/actions/auth';
import { ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center space-y-4 mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Sellora CRM</h1>
            <p className="text-sm text-slate-400">Admin Authentication Required</p>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="password" 
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all text-lg tracking-widest"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center font-medium animate-shake">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Unlock Dashboard <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Secure internal portal for Sellora administrators only.
        </p>
      </div>
    </div>
  );
}
