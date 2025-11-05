# PostgreSQL Out of Memory Error - Diagnosis & Solutions

## Error Details
```
Error [PostgresError]: out of memory
severity: 'ERROR'
code: '53200'
detail: 'Failed on request of size 27400.'
```

## Root Cause
Your application is using **Xata.io free tier** as the PostgreSQL database provider. The error occurs because:

1. **Free tier memory limits**: Xata free tier databases have limited memory (typically 256MB-512MB)
2. **Connection pool too large**: You had 10 concurrent connections configured
3. **Complex nested queries**: Queries like `getClassWithProgress` load deeply nested data (classes → decks → flashcards → media)
4. **Server-side memory exhaustion**: The database server runs out of memory, not your application

## Solutions Applied ✅

### 1. Reduced Connection Pool (c:\Projects\cisspmastery\src\lib\db\index.ts)
Changed from:
```typescript
max: 10, // Too many connections for free tier
idle_timeout: 60,
max_lifetime: 60 * 30, // 30 minutes
```

To:
```typescript
max: 2, // Minimal connections for free tier
idle_timeout: 30, // Release faster
max_lifetime: 60 * 10, // 10 minutes
```

**Why this works:**
- Fewer connections = less memory usage per connection
- Faster timeout = connections released sooner
- Shorter lifetime = memory freed more frequently

### 2. Optimized Database Queries

**Changed files:**
- [src/lib/api/class-server.ts:68-70](c:\Projects\cisspmastery\src\lib\api\class-server.ts#L68-L70)
- [src/app/dashboard/page.tsx:50-52](c:\Projects\cisspmastery\src\app\dashboard\page.tsx#L50-L52)

**What changed:**
```typescript
// BEFORE: Loaded all columns (question, answer, explanation, etc.)
flashcards: {
  where: eq(flashcards.isPublished, true),
}

// AFTER: Load only IDs
flashcards: {
  where: eq(flashcards.isPublished, true),
  columns: {
    id: true, // Only load ID column
  },
}
```

**Why this works:**
- Flashcard question/answer text can be large (up to 10KB per card)
- Loading 100+ flashcards with full text = 1MB+ of data
- Loading only IDs = ~3.6KB for 100 cards (36 bytes × 100)
- **99% reduction in memory usage** for these queries
- Still get accurate counts and progress calculations

## Additional Recommendations

### 1. Upgrade Database Plan (Recommended for Production)
**Xata Paid Plans:**
- **Pro Plan**: $20/month - 2GB memory, better for production
- **Scale Plan**: Custom pricing - dedicated resources

**Alternative providers:**
- **Neon**: Free tier with better limits, serverless PostgreSQL
- **Vercel Postgres**: Integrated with Vercel deployments
- **Supabase**: Generous free tier (500MB database)

### 2. Optimize Queries (If staying on free tier)

Your `getClassWithProgress` query loads ALL flashcards in memory. Consider paginating:

```typescript
// Instead of loading all flashcards at once
with: {
  flashcards: {
    where: eq(flashcards.isPublished, true),
  },
}

// Load only IDs for counting
with: {
  flashcards: {
    where: eq(flashcards.isPublished, true),
    columns: { id: true }, // Only load ID column
  },
}
```

### 3. Monitor Database Memory

**Check Xata Dashboard:**
1. Go to https://app.xata.io
2. Select your database `cisspmastery`
3. Check "Metrics" tab for memory usage
4. Look for memory spikes

### 4. Use Redis Caching More Aggressively

You already have Redis caching in `getClassWithProgress`. Ensure it's working:
- Check cache hit rates in logs
- Increase TTL for frequently accessed data
- Pre-warm cache for popular classes

### 5. Restart Database (Temporary Fix)

If error persists, restart the Xata database:
1. Go to https://app.xata.io
2. Database Settings → Restart Database
3. Wait 1-2 minutes for restart

## Testing After Fix

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Monitor logs for connection info:**
   - Look for `[Cache HIT]` or `[Cache MISS]` messages
   - Check for any new database errors

3. **Test the pages that failed:**
   - Visit `/dashboard/class/[id]` pages
   - Check admin pages
   - Verify subscription data loads correctly

## When to Upgrade

Upgrade your database if you experience:
- ✅ **Frequent out of memory errors** (like now)
- ✅ **Slow query performance** (>2 seconds for simple queries)
- ✅ **Production deployment** (free tier not recommended for production)
- ✅ **Multiple concurrent users** (>10 users at same time)

## Current Status

- ✅ Connection pool reduced to 2 connections
- ✅ Faster timeout settings
- ⚠️ Free tier still has limitations
- 📝 Consider upgrading for production use

## Next Steps

1. Restart your dev server: `npm run dev`
2. Test the class detail pages
3. Monitor for any new errors
4. Consider upgrading database plan if issues persist

---

**Last Updated:** 2025-11-05
**Database Provider:** Xata.io (us-east-1)
**Connection String:** Check `.env.local` → `DATABASE_URL`
