import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use Vercel Postgres connection string (works with Neon, Xata.io, etc.)
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL!,
  },
} satisfies Config;
