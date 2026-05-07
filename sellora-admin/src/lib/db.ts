import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ DATABASE_URL is missing. Database connection will fail at runtime.');
}

// Build-safe connection
const sql = neon(connectionString || '');
export const db = drizzle(sql, { schema });
