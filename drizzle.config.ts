import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres.vftzeolrxbgjwscntnwk:Ritsuki0714@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  },
  verbose: true,
  strict: true,
});