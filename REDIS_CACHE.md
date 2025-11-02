# Redis Caching Implementation

This document describes the Redis caching implementation using Vercel KV for the CISSP Mastery application.

## Overview

Redis caching has been implemented to improve performance and reduce database load by caching frequently accessed data. The implementation uses Vercel KV (Redis) as the caching layer.

## Benefits

- **Reduced Database Load**: Minimizes queries to PostgreSQL, critical given Xata's connection limits
- **Faster Response Times**: Redis responses are significantly faster than database queries
- **Better Scalability**: Handle more concurrent users without hitting database connection limits
- **Cost Optimization**: Reduce database query costs

## Architecture

### Cache Layers

1. **Redis Cache (Primary)**: Vercel KV for fast, distributed caching
2. **HTTP Cache (Secondary)**: Browser/CDN caching via Cache-Control headers
3. **Database (Source of Truth)**: PostgreSQL via Drizzle ORM

### Cache Flow

```
Request → Redis Cache → Database (on miss) → Store in Redis → Response
                ↓
            Cache Hit → Response
```

## Cached Endpoints

### 1. GET /api/domains
**What**: List of all classes with card counts
**Cache Key**: `domains:all`
**TTL**: 5 minutes (300 seconds)
**Invalidated When**: Classes or decks are created/updated/deleted

### 2. GET /api/classes/[id]
**What**: Class details with deck progress (user-specific)
**Cache Key**: `class:{classId}:user:{userId}`
**TTL**: 2 minutes (120 seconds)
**Invalidated When**:
- Class/deck data changes
- User progress updates for any card in this class

### 3. GET /api/domains/[domainId]/flashcards
**What**: All flashcards for a class
**Cache Key**: `domain:{domainId}:flashcards`
**TTL**: 10 minutes (600 seconds)
**Invalidated When**: Flashcards are created/updated/deleted in this class

### 4. GET /api/decks/[id]/flashcards
**What**: All flashcards for a specific deck
**Cache Key**: `deck:{deckId}:flashcards`
**TTL**: 10 minutes (600 seconds)
**Invalidated When**: Flashcards are created/updated/deleted in this deck

## Cache Invalidation Strategy

Cache invalidation is implemented to ensure data consistency. When data changes, related cache entries are automatically cleared.

### Invalidation Rules

1. **Flashcard Created/Updated/Deleted**:
   - Invalidates: `deck:{deckId}:flashcards`
   - Invalidates: `domain:{classId}:flashcards`
   - Invalidates: All `class:{classId}:user:*` entries

2. **Deck Created/Updated/Deleted**:
   - Invalidates: `domains:all`
   - Invalidates: `deck:{deckId}:flashcards`
   - Invalidates: `domain:{classId}:flashcards`
   - Invalidates: All `class:{classId}:user:*` entries

3. **Class Created/Updated/Deleted**:
   - Invalidates: `domains:all`
   - Invalidates: `domain:{classId}:flashcards`
   - Invalidates: All `class:{classId}:user:*` entries

4. **User Progress Updated**:
   - Invalidates: `progress:{userId}:card:{cardId}`
   - Invalidates: All `class:{classId}:user:*` entries

## Implementation Files

### Core Files
- `src/lib/redis/index.ts` - Redis connection and utility functions
- `src/lib/redis/cache-keys.ts` - Cache key generators and TTL constants
- `src/lib/redis/invalidation.ts` - Cache invalidation helpers

### Modified API Routes
- `src/app/api/domains/route.ts` - Classes list with caching
- `src/app/api/classes/[id]/route.ts` - Class details with caching
- `src/app/api/domains/[domainId]/flashcards/route.ts` - Domain flashcards with caching
- `src/app/api/decks/[id]/flashcards/route.ts` - Deck flashcards with caching
- `src/app/api/admin/flashcards/route.ts` - Admin flashcard creation with invalidation
- `src/app/api/admin/flashcards/[id]/route.ts` - Admin flashcard update/delete with invalidation
- `src/app/api/progress/card/route.ts` - User progress with invalidation

## Setup Instructions

### 1. Create Vercel KV Store

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Database
3. Select "KV" (Redis)
4. Give it a name (e.g., "cissp-cache")
5. Select your region (choose closest to your database)
6. Create the store

### 2. Configure Environment Variables

Vercel automatically sets these variables for deployed apps. For local development:

1. Copy the connection details from your Vercel KV dashboard
2. Add to your `.env.local`:

```bash
KV_REST_API_URL=https://your-kv-store.kv.vercel-storage.com
KV_REST_API_TOKEN=your_token_here
KV_REST_API_READ_ONLY_TOKEN=your_readonly_token_here
```

### 3. Deploy

The caching implementation is automatically active when environment variables are present. If Redis is not configured, the app gracefully degrades to database-only mode.

## Monitoring Cache Performance

### Cache Hit Headers

All cached endpoints include an `X-Cache` header:
- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response fetched from database and cached

### Monitor in Browser DevTools

1. Open Network tab
2. Make requests to cached endpoints
3. Check response headers for `X-Cache`
4. First request will be MISS, subsequent requests will be HIT

### Example

```bash
# First request (cache miss)
curl -I https://your-app.com/api/domains
# X-Cache: MISS

# Second request within TTL (cache hit)
curl -I https://your-app.com/api/domains
# X-Cache: HIT
```

## Cache Management

### Graceful Degradation

The cache implementation is designed to fail gracefully:
- If Redis is unavailable, requests go directly to the database
- Cache errors are logged but don't break the API
- Users won't experience errors due to cache failures

### Manual Cache Clearing (if needed)

If you need to manually clear cache (e.g., during development):

```typescript
import { cache } from '@/lib/redis';

// Clear specific key
await cache.del('domains:all');

// Clear all keys matching pattern
await cache.delPattern('class:*');

// Clear everything (use sparingly!)
await cache.delPattern('*');
```

## Performance Expectations

### Before Caching
- Database queries: 100-300ms per request
- Risk of hitting connection limits with concurrent users

### After Caching
- Cache hits: 5-20ms per request
- Database load reduced by ~80-90% for read operations
- Can handle 10x more concurrent users

## Best Practices

1. **TTL Selection**: Balance freshness vs. performance
   - Frequently changing data: shorter TTL (1-2 minutes)
   - Rarely changing data: longer TTL (10+ minutes)

2. **Cache Keys**: Use descriptive, hierarchical keys
   - Good: `class:abc123:user:xyz789`
   - Bad: `c1u1`

3. **Invalidation**: Always invalidate related caches when data changes

4. **Error Handling**: Cache operations should never break the API
   - Use try-catch blocks
   - Log errors but continue execution
   - Gracefully degrade to database queries

## Troubleshooting

### Cache Not Working

1. **Check environment variables**: Ensure KV credentials are set
2. **Check logs**: Look for Redis connection errors
3. **Verify headers**: Check if `X-Cache` header is present

### Stale Data Issues

1. **Check invalidation**: Ensure cache is invalidated on mutations
2. **Reduce TTL**: Lower TTL for frequently changing data
3. **Manual clear**: Use `cache.del()` to clear specific keys

### Performance Not Improved

1. **Monitor cache hit rate**: Check `X-Cache` headers
2. **Review cache keys**: Ensure cache keys are consistent
3. **Check Redis latency**: Verify Redis is in same region as app

## Future Enhancements

Potential improvements for the caching system:

1. **Cache Warming**: Pre-populate cache on deployment
2. **Advanced TTL**: Dynamic TTL based on data volatility
3. **Cache Analytics**: Track hit rates and performance metrics
4. **Compression**: Compress large cached objects
5. **Distributed Cache**: Multi-region cache replication

## Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Cache Invalidation Strategies](https://redis.io/docs/manual/patterns/cache-invalidation/)
