import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database URL from environment
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.vftzeolrxbgjwscntnwk:Ritsuki0714@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

// Create postgres client
const client = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';