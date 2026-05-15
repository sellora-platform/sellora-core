'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Tag, Globe, Save, Loader2, Check } from 'lucide-react';
import { getPlatformSettings, updatePlatformSettings } from '../../actions/settings';

export const dynamic = "force-dynamic";

type SettingRow = { id: number; key: string; value: string; label: string | null; group: string };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPlatformSettings().then((rows: SettingRow[]) => {
      const map: Record<string, string> = {};
      rows.forEach(r => { map[r.key] = r.value; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updatePlatformSettings(settings);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-slate-400">Configure payment details, plan pricing, and general platform settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          } disabled:opacity-50`}
        >
          {saved ? <><Check size={16} /> Saved!</> : saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* ── Payment Details ─────────────────────── */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <CreditCard className="text-blue-500" size={20} />
            <div>
              <h3 className="font-bold">Payment Details</h3>
              <p className="text-xs text-slate-500">Shown to merchants when they upgrade their plan</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <SettingField label="Bank Name" value={settings.payment_bank_name} onChange={v => update('payment_bank_name', v)} placeholder="e.g. Meezan Bank, HBL, UBL" />
            <SettingField label="Account Title" value={settings.payment_account_title} onChange={v => update('payment_account_title', v)} placeholder="Account holder name" />
            <SettingField label="IBAN / Account Number" value={settings.payment_iban} onChange={v => update('payment_iban', v)} placeholder="e.g. PK00MEZN0099001234567890" mono />
            <div className="grid grid-cols-2 gap-4">
              <SettingField label="JazzCash Number" value={settings.payment_jazzcash} onChange={v => update('payment_jazzcash', v)} placeholder="e.g. 03001234567" />
              <SettingField label="Easypaisa Number" value={settings.payment_easypaisa} onChange={v => update('payment_easypaisa', v)} placeholder="e.g. 03001234567" />
            </div>
            <SettingField label="Payment Instructions" value={settings.payment_instructions} onChange={v => update('payment_instructions', v)} placeholder="Instructions shown to merchants" textarea />
          </div>
        </section>

        {/* ── Plan Pricing ─────────────────────── */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Tag className="text-emerald-500" size={20} />
            <div>
              <h3 className="font-bold">Plan Pricing</h3>
              <p className="text-xs text-slate-500">Set monthly prices for each subscription tier</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <SettingField label="Currency" value={settings.plan_currency} onChange={v => update('plan_currency', v)} placeholder="PKR" />
              <div /> {/* spacer */}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SettingField label="Starter (per month)" value={settings.plan_starter_price} onChange={v => update('plan_starter_price', v)} placeholder="4999" prefix={settings.plan_currency || 'PKR'} />
              <SettingField label="Growth (per month)" value={settings.plan_growth_price} onChange={v => update('plan_growth_price', v)} placeholder="12999" prefix={settings.plan_currency || 'PKR'} />
              <SettingField label="Scale (per month)" value={settings.plan_scale_price} onChange={v => update('plan_scale_price', v)} placeholder="24999" prefix={settings.plan_currency || 'PKR'} />
              <SettingField label="Empire (per month)" value={settings.plan_empire_price} onChange={v => update('plan_empire_price', v)} placeholder="49999" prefix={settings.plan_currency || 'PKR'} />
            </div>
          </div>
        </section>

        {/* ── General ─────────────────────── */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Globe className="text-purple-500" size={20} />
            <div>
              <h3 className="font-bold">General</h3>
              <p className="text-xs text-slate-500">Platform identity and support channels</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <SettingField label="Platform Name" value={settings.platform_name} onChange={v => update('platform_name', v)} placeholder="Sellora" />
            <div className="grid grid-cols-2 gap-4">
              <SettingField label="Support Email" value={settings.support_email} onChange={v => update('support_email', v)} placeholder="support@sellora.com" />
              <SettingField label="Support WhatsApp" value={settings.support_whatsapp} onChange={v => update('support_whatsapp', v)} placeholder="+923001234567" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingField({ label, value, onChange, placeholder, mono, textarea, prefix }: {
  label: string; value?: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; textarea?: boolean; prefix?: string;
}) {
  const inputClass = `w-full bg-slate-950 border border-slate-800 rounded-lg text-sm p-3 outline-none focus:border-blue-600 transition-colors text-white placeholder:text-slate-700 ${mono ? 'font-mono' : ''}`;
  
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      {textarea ? (
        <textarea className={inputClass + " h-20 resize-none"} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : prefix ? (
        <div className="flex">
          <span className="bg-slate-800 border border-r-0 border-slate-700 rounded-l-lg px-3 flex items-center text-xs font-bold text-slate-500">{prefix}</span>
          <input className={inputClass + " rounded-l-none"} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        </div>
      ) : (
        <input className={inputClass} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
