import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { classes, decks, flashcards, flashcardMedia } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cache } from '@/lib/redis';
import { CacheKeys, CacheTTL } from '@/lib/redis/cache-keys';

/**
 * GET /api/domains/[domainId]/flashcards
 * Fetch all flashcards for a specific class (formerly domain)
 * Note: This endpoint maintains backward compatibility by using the old "domains" naming
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const { userId } = await auth();
    const { domainId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get from cache first
    const cacheKey = CacheKeys.domainFlashcards.all(domainId);
    const cachedData = await cache.get<{
      domain: { id: string; name: string; description: string | null };
      flashcards: unknown[];
      totalCards: number;
    }>(cacheKey);

    if (cachedData) {
      const response = NextResponse.json(cachedData);
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    // Cache miss - fetch from database
    const classItem = await db.query.classes.findFirst({
      where: eq(classes.id, domainId),
      with: {
        decks: {
          orderBy: [asc(decks.order)],
          where: eq(decks.isPremium, false), // TODO: Check user subscription for premium access
          with: {
            flashcards: {
              orderBy: [asc(flashcards.order)],
              where: eq(flashcards.isPublished, true),
              with: {
                media: {
                  orderBy: [asc(flashcardMedia.order)],
                },
              },
            },
          },
        },
      },
    });

    if (!classItem) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Flatten all flashcards from all decks
    const allFlashcards = classItem.decks.flatMap((deck) =>
      deck.flashcards.map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation,
        deckId: deck.id,
        deckName: deck.name,
        media: card.media.map((m) => ({
          id: m.id,
          url: m.fileUrl,
          altText: m.altText,
          placement: m.placement,
          order: m.order,
        })),
      }))
    );

    const responseData = {
      domain: {
        id: classItem.id,
        name: classItem.name,
        description: classItem.description,
      },
      flashcards: allFlashcards,
      totalCards: allFlashcards.length,
    };

    // Store in cache (fire and forget)
    cache.set(cacheKey, responseData, { ttl: CacheTTL.FLASHCARDS }).catch((error) => {
      console.error('Failed to cache domain flashcards:', error);
    });

    const response = NextResponse.json(responseData);
    response.headers.set('X-Cache', 'MISS');
    return response;

  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}
