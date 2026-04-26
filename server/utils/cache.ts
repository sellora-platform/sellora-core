/**
 * Global Caching Layer: High-performance data retrieval for Sellora.
 * Designed to be swappable with Redis for production scale.
 */
export const CacheEngine = {
  // In-memory store (simplified for demo, would use Redis in prod)
  private _store: Map<string, { value: any; expiry: number }> = new Map(),

  /**
   * Sets a value in the cache with a Time-To-Live (TTL).
   */
  set(key: string, value: any, ttlSeconds: number = 300) {
    const expiry = Date.now() + ttlSeconds * 1000;
    this._store.set(key, { value, expiry });
  },

  /**
   * Retrieves a value from the cache if not expired.
   */
  get<T>(key: string): T | null {
    const cached = this._store.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this._store.delete(key);
      return null;
    }

    return cached.value as T;
  },

  /**
   * Deletes a specific key.
   */
  delete(key: string) {
    this._store.delete(key);
  },

  /**
   * Invalidates all keys for a specific tenant.
   */
  invalidateTenant(tenantId: number | string) {
    const prefix = `tenant:${tenantId}:`;
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        this._store.delete(key);
      }
    }
  },

  /**
   * Key Generator for Tenant Data
   */
  tenantKey(tenantId: number | string, resource: string) {
    return `tenant:${tenantId}:${resource}`;
  }
};
