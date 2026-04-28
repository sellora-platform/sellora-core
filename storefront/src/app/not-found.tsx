import Link from 'next/link';

/**
 * Sellora Storefront 404 Page
 * 
 * Rendered when a subdomain does not match any existing store.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-gray-200">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Store not found
          </h2>
          <p className="text-gray-500 text-lg">
            The store you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-6">
          <Link 
            href="https://raaenai.com"
            className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
          >
            ← Back to Sellora
          </Link>
        </div>
      </div>
    </main>
  );
}
