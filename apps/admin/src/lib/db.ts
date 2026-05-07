import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

console.log("🛠️ Initializing Database Connection (Build Safe Mode v4)");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ DATABASE_URL is missing in Production! Queries will fail.');
  } else {
    console.warn('⚠️ DATABASE_URL is missing in Development.');
  }
}

// Build-safe connection: pass a fallback string to neon() to prevent crash during build-time module evaluation
const sql = neon(connectionString || 'postgresql://placeholder:placeholder@localhost:5432/placeholder');
export const db = drizzle(sql, { schema });
