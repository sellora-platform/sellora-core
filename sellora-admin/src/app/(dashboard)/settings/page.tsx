import { Settings as SettingsIcon, Shield, Bell, Lock, Database } from 'lucide-react';

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-slate-400">Configure CRM preferences and security protocols.</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Shield className="text-blue-500" size={20} />
            <h3 className="font-bold">Security & Access</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security to your admin account.</p>
              </div>
              <button className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-bold text-slate-400">Disabled</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Admin Session Timeout</p>
                <p className="text-xs text-slate-500">Automatically logout after 30 minutes of inactivity.</p>
              </div>
              <select className="bg-slate-950 border border-slate-800 rounded-lg text-sm p-2 outline-none">
                <option>15 mins</option>
                <option>30 mins</option>
                <option>1 hour</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Database className="text-emerald-500" size={20} />
            <h3 className="font-bold">System Configuration</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Disable merchant storefronts for scheduled maintenance.</p>
              </div>
              <div className="w-12 h-6 bg-slate-800 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Analytics Cache Duration</p>
                <p className="text-xs text-slate-500">Set how long to cache heavy financial queries.</p>
              </div>
              <span className="text-sm font-bold text-blue-400">5 Minutes</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
