import { headers } from 'next/headers';
import Link from 'next/link';

/**
 * Sellora Storefront Homepage
 * 
 * This page renders when a merchant has their store live but hasn't
 * selected a custom theme yet.
 */
export default function StoreHome() {
  const headersList = headers();
  const storeDataRaw = headersList.get('x-store-data');
  
  if (!storeDataRaw) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Sellora</h1>
          <p className="text-gray-600 mt-2">Visit raaenai.com to create your own store.</p>
        </div>
      </div>
    );
  }

  const store = JSON.parse(storeDataRaw);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {store.name}
          </h1>
          <p className="text-2xl font-bold text-blue-600">
            Your store is live!
          </p>
          <p className="text-gray-500 text-lg leading-relaxed">
            Go to your dashboard to select a theme and set up your store.
          </p>
        </div>

        <div className="pt-8">
          <Link 
            href="https://raaenai.com/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Go to Dashboard
          </Link>
        </div>
        
        <div className="pt-12 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Powered by <span className="font-bold text-gray-600">Sellora</span>
          </p>
        </div>
      </div>
    </main>
  );
}
