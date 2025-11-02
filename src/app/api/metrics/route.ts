import { NextResponse } from 'next/server';
import { cache } from '@/lib/redis';
import { collectAppMetrics, metricsCollector } from '@/lib/metrics/prometheus';

/**
 * Prometheus Metrics Endpoint
 * GET /api/metrics
 *
 * Returns metrics in Prometheus text format for scraping
 */
export async function GET() {
  try {
    // Collect current metrics
    collectAppMetrics(cache);

    // Export in Prometheus format
    const prometheusText = metricsCollector.export();

    return new Response(prometheusText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}

/**
 * Get metrics as JSON
 * GET /api/metrics?format=json
 */
export async function POST() {
  try {
    // Collect current metrics
    collectAppMetrics(cache);

    // Return as JSON
    const metrics = metricsCollector.toJSON();

    return NextResponse.json({
      metrics,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
