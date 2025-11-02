import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { classes, decks } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { cache } from '@/lib/redis';
import { CacheKeys, CacheTTL } from '@/lib/redis/cache-keys';

/**
 * GET /api/domains
 * Fetch all classes (formerly domains) with their decks and total card counts
 * Note: This endpoint maintains backward compatibility by using the old "domains" naming
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get from cache first
    const cacheKey = CacheKeys.domains.all();
    const cachedData = await cache.get<{ domains: unknown[] }>(cacheKey);

    if (cachedData) {
      const response = NextResponse.json(cachedData);
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    // Cache miss - fetch from database
    const allClasses = await db.query.classes.findMany({
      orderBy: [asc(classes.order)],
      with: {
        decks: {
          orderBy: [asc(decks.order)],
        },
      },
    });

    // Calculate total card count for each class
    const classesWithStats = allClasses.map((classItem) => {
      const totalCards = classItem.decks.reduce((sum, deck) => sum + deck.cardCount, 0);

      return {
        id: classItem.id,
        name: classItem.name,
        description: classItem.description,
        order: classItem.order,
        icon: classItem.icon,
        cardCount: totalCards,
        createdAt: classItem.createdAt,
      };
    });

    const responseData = { domains: classesWithStats };

    // Store in cache (fire and forget)
    cache.set(cacheKey, responseData, { ttl: CacheTTL.DOMAINS_LIST }).catch((error) => {
      console.error('Failed to cache domains:', error);
    });

    const response = NextResponse.json(responseData);
    response.headers.set('X-Cache', 'MISS');
    return response;

  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}
