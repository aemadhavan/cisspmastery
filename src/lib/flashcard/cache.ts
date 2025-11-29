import { db } from '@/lib/db';
import { decks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from '@/lib/redis';
import { CacheKeys } from '@/lib/redis/cache-keys';

/**
 * Invalidates flashcard-related cache entries for a deck
 * This includes:
 * - Deck flashcards cache
 * - Domain flashcards cache (if deck exists and has a classId)
 *
 * @param deckId - The ID of the deck whose cache should be invalidated
 * @returns Promise<void>
 */
export async function invalidateFlashcardCache(deckId: string): Promise<void> {
  try {
    // Get the deck to find the classId for domain cache invalidation
    const deck = await db.query.decks.findFirst({
      where: eq(decks.id, deckId),
    });

    // Invalidate deck flashcards cache
    await cache.del(CacheKeys.deck.flashcards(deckId));

    // Invalidate domain flashcards cache if deck exists
    if (deck) {
      await cache.del(CacheKeys.domainFlashcards.all(deck.classId));
    }
  } catch (error) {
    console.error('Error invalidating flashcard cache:', error);
    // Don't throw - cache invalidation failures shouldn't break the operation
  }
}
