/**
 * Database Connection Warmup
 * Keeps database connections alive to prevent cold starts
 */

import { db } from './index';
import { sql } from 'drizzle-orm';

let warmupInterval: NodeJS.Timeout | null = null;

/**
 * Warm up database connection pool
 * Runs a simple query every 5 minutes to keep connections alive
 */
export async function warmupDatabase() {
  try {
    await db.execute(sql`SELECT 1 as warmup`);
    console.log('[DB Warmup] Connection pool warmed up successfully');
    return true;
  } catch (error) {
    console.error('[DB Warmup] Failed to warm up connection:', error);
    return false;
  }
}

/**
 * Start periodic warmup (only in server-side code)
 */
export function startWarmup() {
  // Only run in server environment
  if (typeof window !== 'undefined') {
    return;
  }

  // Clear existing interval if any
  if (warmupInterval) {
    clearInterval(warmupInterval);
  }

  // Warm up immediately
  warmupDatabase();

  // Then warm up every 5 minutes
  warmupInterval = setInterval(() => {
    warmupDatabase();
  }, 5 * 60 * 1000); // 5 minutes

  console.log('[DB Warmup] Started periodic warmup (every 5 minutes)');
}

/**
 * Stop periodic warmup
 */
export function stopWarmup() {
  if (warmupInterval) {
    clearInterval(warmupInterval);
    warmupInterval = null;
    console.log('[DB Warmup] Stopped periodic warmup');
  }
}

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  startWarmup();
}
