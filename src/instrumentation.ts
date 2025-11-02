/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts
 *
 * This is the perfect place to initialize:
 * - Database connection warmup
 * - Performance monitoring
 * - Any server-side initialization
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and start database warmup
    const { startWarmup } = await import('./lib/db/warmup');
    startWarmup();

    console.log('[Instrumentation] Server initialized with:');
    console.log('  ✅ Database connection warmup enabled');
    console.log('  ✅ Performance monitoring active');
  }
}
