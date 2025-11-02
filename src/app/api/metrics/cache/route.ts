import { NextResponse } from 'next/server';
import { cache } from '@/lib/redis';

/**
 * Cache Metrics Endpoint
 * GET /api/metrics/cache
 *
 * Returns cache performance metrics including:
 * - Hit/miss counts and rates
 * - Connection status
 * - Error tracking
 */
export async function GET() {
  try {
    const metrics = cache.getMetrics();
    const health = await cache.checkHealth();

    return NextResponse.json({
      metrics: {
        ...metrics,
        hitRateFormatted: `${metrics.hitRate.toFixed(2)}%`,
      },
      health: {
        ...health,
        latencyFormatted: `${health.latency.toFixed(2)}ms`,
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching cache metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache metrics' },
      { status: 500 }
    );
  }
}

/**
 * Reset Cache Metrics
 * POST /api/metrics/cache/reset
 */
export async function POST() {
  try {
    cache.resetMetrics();

    return NextResponse.json({
      message: 'Cache metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resetting cache metrics:', error);
    return NextResponse.json(
      { error: 'Failed to reset cache metrics' },
      { status: 500 }
    );
  }
}
