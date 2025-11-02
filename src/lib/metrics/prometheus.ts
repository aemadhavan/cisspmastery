/**
 * Prometheus Metrics Exporter
 * Provides metrics in Prometheus text format
 */

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  value: number;
  labels?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Map<string, Metric>;

  constructor() {
    this.metrics = new Map();
  }

  /**
   * Register or update a counter metric
   */
  counter(name: string, help: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    this.metrics.set(key, {
      name,
      type: 'counter',
      help,
      value: existing ? existing.value + value : value,
      labels,
    });
  }

  /**
   * Register or update a gauge metric
   */
  gauge(name: string, help: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);

    this.metrics.set(key, {
      name,
      type: 'gauge',
      help,
      value,
      labels,
    });
  }

  /**
   * Increment a counter metric
   */
  increment(name: string, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    if (existing) {
      existing.value++;
    } else {
      this.counter(name, '', 1, labels);
    }
  }

  /**
   * Get metric key including labels
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelStr}}`;
  }

  /**
   * Format labels for Prometheus output
   */
  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `{${labelStr}}`;
  }

  /**
   * Export metrics in Prometheus text format
   */
  export(): string {
    const lines: string[] = [];
    const metricsByName = new Map<string, Metric[]>();

    // Group metrics by name
    for (const metric of this.metrics.values()) {
      const existing = metricsByName.get(metric.name) || [];
      existing.push(metric);
      metricsByName.set(metric.name, existing);
    }

    // Format each metric group
    for (const [name, metrics] of metricsByName.entries()) {
      const firstMetric = metrics[0];

      // Add HELP and TYPE comments
      if (firstMetric.help) {
        lines.push(`# HELP ${name} ${firstMetric.help}`);
      }
      lines.push(`# TYPE ${name} ${firstMetric.type}`);

      // Add metric values
      for (const metric of metrics) {
        const labels = this.formatLabels(metric.labels);
        lines.push(`${name}${labels} ${metric.value}`);
      }

      lines.push(''); // Empty line between metrics
    }

    return lines.join('\n');
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get all metrics as JSON
   */
  toJSON(): Metric[] {
    return Array.from(this.metrics.values());
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();

/**
 * Collect application metrics
 */
export function collectAppMetrics(cache: {
  getMetrics: () => {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    errors: number;
    hitRate: number;
    totalOperations: number;
    connectionStatus: string;
  };
}): void {
  const collector = metricsCollector;
  collector.clear();

  // Cache metrics
  const cacheMetrics = cache.getMetrics();

  collector.counter(
    'cache_hits_total',
    'Total number of cache hits',
    cacheMetrics.hits
  );

  collector.counter(
    'cache_misses_total',
    'Total number of cache misses',
    cacheMetrics.misses
  );

  collector.counter(
    'cache_sets_total',
    'Total number of cache set operations',
    cacheMetrics.sets
  );

  collector.counter(
    'cache_deletes_total',
    'Total number of cache delete operations',
    cacheMetrics.deletes
  );

  collector.counter(
    'cache_errors_total',
    'Total number of cache errors',
    cacheMetrics.errors
  );

  collector.gauge(
    'cache_hit_rate',
    'Cache hit rate percentage',
    cacheMetrics.hitRate
  );

  collector.gauge(
    'cache_operations_total',
    'Total cache operations',
    cacheMetrics.totalOperations
  );

  collector.gauge(
    'cache_connection_status',
    'Cache connection status (1=connected, 0=disconnected)',
    cacheMetrics.connectionStatus === 'connected' ? 1 : 0
  );

  // Process metrics
  collector.gauge(
    'nodejs_process_uptime_seconds',
    'Process uptime in seconds',
    process.uptime()
  );

  if (process.memoryUsage) {
    const memUsage = process.memoryUsage();
    collector.gauge(
      'nodejs_memory_heap_used_bytes',
      'Heap memory used in bytes',
      memUsage.heapUsed
    );

    collector.gauge(
      'nodejs_memory_heap_total_bytes',
      'Total heap memory in bytes',
      memUsage.heapTotal
    );

    collector.gauge(
      'nodejs_memory_external_bytes',
      'External memory in bytes',
      memUsage.external
    );

    collector.gauge(
      'nodejs_memory_rss_bytes',
      'Resident set size in bytes',
      memUsage.rss
    );
  }
}
