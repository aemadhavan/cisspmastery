import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { bookmarkedFlashcards } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { cache } from '@/lib/redis';
import { CacheKeys } from '@/lib/redis/cache-keys';

/**
 * DELETE /api/bookmarks/[flashcardId]
 * Remove a flashcard from bookmarks
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flashcardId } = await params;

    if (!flashcardId) {
      return NextResponse.json({ error: 'flashcardId is required' }, { status: 400 });
    }

    // Delete the bookmark
    const result = await db
      .delete(bookmarkedFlashcards)
      .where(
        and(
          eq(bookmarkedFlashcards.clerkUserId, userId),
          eq(bookmarkedFlashcards.flashcardId, flashcardId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Bookmark not found'
      }, { status: 404 });
    }

    // Invalidate cache
    const cachePattern = CacheKeys.bookmarks.userAll(userId);
    await cache.del(cachePattern).catch((error) => {
      console.error('Failed to invalidate bookmark cache:', error);
    });

    return NextResponse.json({
      success: true,
      bookmarked: false,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Error removing bookmark:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove bookmark';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookmarks/[flashcardId]
 * Check if a flashcard is bookmarked
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flashcardId } = await params;

    if (!flashcardId) {
      return NextResponse.json({ error: 'flashcardId is required' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = CacheKeys.bookmarks.check(userId, flashcardId);
    const cachedResult = await cache.get<boolean>(cacheKey);

    if (cachedResult !== null) {
      return NextResponse.json({ bookmarked: cachedResult });
    }

    // Check database
    const bookmark = await db.query.bookmarkedFlashcards.findFirst({
      where: and(
        eq(bookmarkedFlashcards.clerkUserId, userId),
        eq(bookmarkedFlashcards.flashcardId, flashcardId)
      ),
    });

    const isBookmarked = !!bookmark;

    // Cache the result
    cache.set(cacheKey, isBookmarked, { ttl: 300 }).catch((error) => {
      console.error('Failed to cache bookmark check:', error);
    });

    return NextResponse.json({ bookmarked: isBookmarked });

  } catch (error) {
    console.error('Error checking bookmark:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check bookmark';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
