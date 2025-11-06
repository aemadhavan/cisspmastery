/**
 * Database Connection Warmup
 * Keeps database connections alive to prevent cold starts
 */

import { db, withRetry } from './index';
import { sql } from 'drizzle-orm';

let warmupInterval: NodeJS.Timeout | null = null;

/**
 * Warm up database connection pool
 * Runs a simple query every 5 minutes to keep connections alive
 * Uses retry logic to handle transient connection errors
 */
export async function warmupDatabase() {
  try {
    await withRetry(
      () => db.execute(sql`SELECT 1 as warmup`),
      {
        maxRetries: 4,
        delayMs: 2000,
        queryName: 'db-warmup',
      }
    );
    console.log('[DB Warmup] Connection pool warmed up successfully');
    return true;
  } catch (error) {
    console.error('[DB Warmup] Failed to warm up connection after all retries:', error);
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

  // Add a small delay (3 seconds) before first warmup to allow connection pool to initialize
  // This prevents "CONNECT_TIMEOUT" errors on cold starts
  console.log('[DB Warmup] Scheduling initial warmup in 3 seconds...');
  setTimeout(() => {
    warmupDatabase();
  }, 3000);

  // Then warm up every 5 minutes
  warmupInterval = setInterval(() => {
    warmupDatabase();
  }, 5 * 60 * 1000); // 5 minutes

  console.log('[DB Warmup] Periodic warmup scheduled (every 5 minutes)');
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
