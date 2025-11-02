# Backend Performance Monitoring Guide

This document provides comprehensive information about the performance monitoring and optimization features implemented in the CISSP Mastery application.

## Table of Contents

1. [Overview](#overview)
2. [Database Optimization](#database-optimization)
3. [API Performance Timing](#api-performance-timing)
4. [Cache Monitoring](#cache-monitoring)
5. [Rate Limiting](#rate-limiting)
6. [Distributed Tracing](#distributed-tracing)
7. [Metrics Export](#metrics-export)
8. [Health Checks](#health-checks)

---

## Overview

The application includes comprehensive performance monitoring capabilities:

- **Database Query Optimization**: Indexed queries and N+1 prevention
- **API Response Time Tracking**: Server-Timing headers and detailed metrics
- **Cache Hit/Miss Ratios**: Redis metrics with dashboard
- **Rate Limiting**: Token bucket algorithm with sliding window
- **Distributed Tracing**: Request ID propagation
- **Prometheus Metrics**: Standard metrics export
- **Health Checks**: Database and cache connectivity

---

## Database Optimization

### Indexes Added

The following indexes have been added to optimize query performance:

```sql
-- User card progress (most frequently queried)
CREATE INDEX idx_user_card_progress_user_flashcard ON user_card_progress(clerk_user_id, flashcard_id);
CREATE INDEX idx_user_card_progress_mastery ON user_card_progress(clerk_user_id, mastery_status);

-- Flashcards
CREATE INDEX idx_flashcards_deck_published ON flashcards(deck_id, is_published);
CREATE INDEX idx_flashcards_deck_order ON flashcards(deck_id, "order");

-- Decks
CREATE INDEX idx_decks_class_published ON decks(class_id, is_published);
CREATE INDEX idx_decks_class_order ON decks(class_id, "order");

-- Study sessions
CREATE INDEX idx_study_sessions_user_deck ON study_sessions(clerk_user_id, deck_id);
CREATE INDEX idx_study_sessions_user_started ON study_sessions(clerk_user_id, started_at);
```

### Applying Migrations

To apply the database indexes:

```bash
# Apply migrations
npm run db:push

# Or manually apply the SQL file
psql $DATABASE_URL -f drizzle/migrations/0001_add_performance_indexes.sql
```

### Query Optimization Example

**Before** (N+1 queries):
```typescript
// Makes N queries for N users
const users = await getAllUsers();
for (const user of users) {
  const progress = await getUserProgress(user.id); // N queries!
}
```

**After** (Single aggregated query):
```typescript
// Single query with aggregation
const usersWithProgress = await db
  .select({
    ...userFields,
    newCount: sql`COUNT(CASE WHEN mastery_status = 'new' THEN 1 END)`,
    learningCount: sql`COUNT(CASE WHEN mastery_status = 'learning' THEN 1 END)`,
    masteredCount: sql`COUNT(CASE WHEN mastery_status = 'mastered' THEN 1 END)`,
  })
  .from(users)
  .leftJoin(userCardProgress, eq(users.clerkUserId, userCardProgress.clerkUserId))
  .groupBy(users.clerkUserId);
```

---

## API Performance Timing

### Basic Usage

```typescript
import { createApiTimer, addTimingHeaders, formatTimingLog, timeAsync } from '@/lib/api-timing';

export async function GET(request: Request) {
  const timer = createApiTimer('/api/example', request.method);

  try {
    // Time database queries
    const data = await timeAsync(
      timer,
      async () => db.query.users.findMany(),
      'db'
    );

    // Time cache operations
    const cached = await timeAsync(
      timer,
      async () => cache.get('key'),
      'cache'
    );

    const metrics = timer.end(200);
    console.log(formatTimingLog(metrics));

    const response = NextResponse.json(data);
    return addTimingHeaders(response, metrics);
  } catch (error) {
    const metrics = timer.end(500);
    console.error(formatTimingLog(metrics));
    throw error;
  }
}
```

### Response Headers

The timing middleware adds these headers to responses:

```
Server-Timing: total;dur=45.23, db;dur=12.45, cache;dur=2.34
X-Response-Time: 45.23ms
X-Performance-Rating: Good
```

### Performance Ratings

- **Good**: < 100ms
- **Needs Improvement**: 100-500ms
- **Poor**: > 500ms

---

## Cache Monitoring

### Get Cache Metrics

```bash
GET /api/metrics/cache
```

**Response:**
```json
{
  "metrics": {
    "hits": 1234,
    "misses": 234,
    "sets": 567,
    "deletes": 12,
    "errors": 0,
    "hitRate": 84.05,
    "hitRateFormatted": "84.05%",
    "totalOperations": 1468,
    "connectionStatus": "connected",
    "lastError": null,
    "lastErrorTime": null
  },
  "health": {
    "healthy": true,
    "latency": 3.45,
    "latencyFormatted": "3.45ms"
  },
  "timestamp": "2025-11-02T10:30:00.000Z"
}
```

### Reset Metrics

```bash
POST /api/metrics/cache/reset
```

### Programmatic Access

```typescript
import { cache } from '@/lib/redis';

// Get current metrics
const metrics = cache.getMetrics();
console.log(`Cache hit rate: ${metrics.hitRate.toFixed(2)}%`);

// Check health
const health = await cache.checkHealth();
console.log(`Redis latency: ${health.latency}ms`);

// Reset metrics
cache.resetMetrics();
```

---

## Rate Limiting

### Using Predefined Presets

```typescript
import { withRateLimit } from '@/lib/middleware/with-rate-limit';
import { RateLimitPresets } from '@/lib/rate-limit';

// Apply strict rate limiting (10 req/min)
export const GET = withRateLimit(
  async (request: NextRequest) => {
    return NextResponse.json({ data: 'Hello' });
  },
  RateLimitPresets.strict
);
```

### Available Presets

| Preset | Max Requests | Window | Use Case |
|--------|--------------|--------|----------|
| `strict` | 10 | 1 minute | High-security endpoints |
| `standard` | 60 | 1 minute | General API endpoints |
| `generous` | 100 | 1 minute | Public read endpoints |
| `auth` | 5 | 15 minutes | Login/authentication |
| `api` | 1000 | 1 hour | High-throughput APIs |

### Custom Rate Limiting

```typescript
import { applyRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  // Custom rate limit
  const { allowed, result } = await applyRateLimit(
    `user:${userId}`,
    {
      maxRequests: 50,
      windowMs: 60 * 1000, // 1 minute
      keyPrefix: 'api:custom',
    }
  );

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: getRateLimitHeaders(result),
      }
    );
  }

  // Process request...
}
```

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-11-02T10:31:00.000Z
Retry-After: 23
```

---

## Distributed Tracing

### Using Tracing Middleware

```typescript
import { withTracing } from '@/lib/middleware/with-tracing';

export const GET = withTracing(
  async (request: NextRequest) => {
    return NextResponse.json({ data: 'Hello' });
  },
  {
    logRequest: true,
    logResponse: true,
  }
);
```

### Request Context

```typescript
import {
  extractOrGenerateRequestId,
  requestContextStore,
  logWithContext
} from '@/lib/tracing/request-context';

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);

  // Create context
  const context = requestContextStore.create(
    requestId,
    'GET',
    '/api/example'
  );

  // Add metadata
  requestContextStore.addMetadata(requestId, 'userId', userId);

  // Log with context
  logWithContext(requestId, 'info', 'Processing request', { data: 'example' });

  // Clean up
  requestContextStore.remove(requestId);
}
```

### Trace Headers

Requests and responses include these headers for distributed tracing:

```
X-Request-ID: req_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
X-Trace-ID: req_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Combining Middleware

```typescript
import { compose } from '@/lib/middleware/with-tracing';
import { withTracing } from '@/lib/middleware/with-tracing';
import { withRateLimit } from '@/lib/middleware/with-rate-limit';
import { RateLimitPresets } from '@/lib/rate-limit';

// Compose multiple middleware
const enhance = compose(
  withTracing,
  (handler) => withRateLimit(handler, RateLimitPresets.standard)
);

export const GET = enhance(
  async (request: NextRequest) => {
    return NextResponse.json({ data: 'Hello' });
  }
);
```

---

## Metrics Export

### Prometheus Format

```bash
GET /api/metrics
```

**Response (text/plain):**
```
# HELP cache_hits_total Total number of cache hits
# TYPE cache_hits_total counter
cache_hits_total 1234

# HELP cache_misses_total Total number of cache misses
# TYPE cache_misses_total counter
cache_misses_total 234

# HELP cache_hit_rate Cache hit rate percentage
# TYPE cache_hit_rate gauge
cache_hit_rate 84.05

# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds 3600

# HELP nodejs_memory_heap_used_bytes Heap memory used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes 45678912
```

### JSON Format

```bash
POST /api/metrics
```

**Response:**
```json
{
  "metrics": [
    {
      "name": "cache_hits_total",
      "type": "counter",
      "help": "Total number of cache hits",
      "value": 1234
    },
    {
      "name": "cache_hit_rate",
      "type": "gauge",
      "help": "Cache hit rate percentage",
      "value": 84.05
    }
  ],
  "timestamp": "2025-11-02T10:30:00.000Z"
}
```

### Prometheus Scraping Configuration

Add this to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'cissp-mastery'
    scrape_interval: 30s
    static_configs:
      - targets: ['your-domain.com']
    metrics_path: '/api/metrics'
```

---

## Health Checks

### Endpoint

```bash
GET /api/health
```

### Response

**Healthy:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T10:30:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12.34,
      "error": null
    },
    "cache": {
      "status": "healthy",
      "responseTime": 3.45,
      "error": null
    }
  },
  "uptime": 3600,
  "totalResponseTime": 15.79
}
```

**Degraded (cache down, db up):**
```json
{
  "status": "degraded",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12.34
    },
    "cache": {
      "status": "unhealthy",
      "responseTime": 0,
      "error": "Connection timeout"
    }
  }
}
```

**Unhealthy (database down):**
```json
{
  "status": "unhealthy",
  "services": {
    "database": {
      "status": "unhealthy",
      "responseTime": 0,
      "error": "Connection refused"
    }
  }
}
```

### Status Codes

- `200`: Healthy or degraded (cache optional)
- `503`: Unhealthy (database unavailable)

### Kubernetes Liveness/Readiness Probe

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Performance Monitoring Dashboard

### Recommended Tools

1. **Grafana** - Visualize Prometheus metrics
2. **Datadog** - Full-stack monitoring
3. **New Relic** - APM and distributed tracing
4. **Sentry** - Error tracking with performance

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 200ms | > 500ms |
| Cache Hit Rate | > 80% | < 60% |
| Database Query Time | < 50ms | > 200ms |
| Error Rate | < 0.1% | > 1% |
| Rate Limit Rejections | < 1% | > 5% |

---

## Troubleshooting

### High Response Times

1. Check cache hit rate - should be > 80%
2. Review database query performance
3. Check for N+1 query patterns
4. Verify indexes are being used

### Cache Issues

```bash
# Check cache health
curl https://your-domain.com/api/metrics/cache

# Reset cache metrics
curl -X POST https://your-domain.com/api/metrics/cache/reset
```

### Rate Limit Issues

```typescript
// Reset rate limit for a user
import { RateLimiter } from '@/lib/rate-limit';

const limiter = new RateLimiter({ maxRequests: 60, windowMs: 60000 });
await limiter.reset('user:123');
```

---

## Best Practices

### 1. Always Use Indexes

```typescript
// ✅ Good - uses index
where(and(
  eq(userCardProgress.clerkUserId, userId),
  inArray(userCardProgress.flashcardId, ids)
))

// ❌ Bad - full table scan
where(sql`clerk_user_id LIKE '%${userId}%'`)
```

### 2. Batch Database Queries

```typescript
// ✅ Good - single query
const allProgress = await db
  .select()
  .from(userCardProgress)
  .where(inArray(userCardProgress.flashcardId, allIds));

// ❌ Bad - N queries
for (const id of allIds) {
  await db.select().from(userCardProgress).where(eq(flashcardId, id));
}
```

### 3. Use Cache Effectively

```typescript
// ✅ Good - cache with appropriate TTL
await cache.set(key, data, { ttl: 300 }); // 5 minutes

// ❌ Bad - no TTL (memory leak risk)
await cache.set(key, data);
```

### 4. Implement Rate Limiting

```typescript
// ✅ Good - protected endpoint
export const POST = withRateLimit(handler, RateLimitPresets.strict);

// ❌ Bad - no rate limiting
export const POST = handler;
```

### 5. Add Request Tracing

```typescript
// ✅ Good - traceable requests
export const GET = withTracing(handler);

// ❌ Bad - no tracing
export const GET = handler;
```

---

## Migration Checklist

- [ ] Apply database indexes migration
- [ ] Update environment variables for Redis
- [ ] Configure Prometheus scraping
- [ ] Set up health check monitoring
- [ ] Configure rate limits for endpoints
- [ ] Add tracing to critical routes
- [ ] Set up alerting for key metrics
- [ ] Document custom rate limit configurations

---

## Support

For issues or questions:
- Check logs: `docker logs -f app-container`
- Review metrics: `/api/metrics`
- Check health: `/api/health`
- Reset cache: `POST /api/metrics/cache/reset`
