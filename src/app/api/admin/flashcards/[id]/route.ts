import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { flashcards, decks, flashcardMedia } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { deleteMultipleImagesFromBlob } from '@/lib/blob';

/**
 * PATCH /api/admin/flashcards/[id]
 * Update a flashcard (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { question, answer, explanation, order, isPublished, media } = body;

    // Check if flashcard exists with media
    const existingCard = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, id),
      with: {
        media: {
          orderBy: [asc(flashcardMedia.order)],
        },
      },
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // Update flashcard
    await db
      .update(flashcards)
      .set({
        question: question !== undefined ? question : existingCard.question,
        answer: answer !== undefined ? answer : existingCard.answer,
        explanation: explanation !== undefined ? explanation : existingCard.explanation,
        order: order !== undefined ? order : existingCard.order,
        isPublished: isPublished !== undefined ? isPublished : existingCard.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(flashcards.id, id))
      .returning();

    // Handle media updates if provided
    if (media !== undefined && Array.isArray(media)) {
      // Get existing media URLs for comparison
      const existingMediaUrls = existingCard.media?.map((m) => m.fileUrl) || [];
      const newMediaUrls = media.map((m: { url: string }) => m.url);

      // Find media to delete (exist in DB but not in new list)
      const mediaToDelete = existingCard.media?.filter(
        (m) => !newMediaUrls.includes(m.fileUrl)
      ) || [];

      // Delete removed media from Blob storage
      if (mediaToDelete.length > 0) {
        const urlsToDelete = mediaToDelete.map((m) => m.fileUrl);
        try {
          await deleteMultipleImagesFromBlob(urlsToDelete);
        } catch (error) {
          console.error('Error deleting old media from blob:', error);
        }

        // Delete media records from DB
        for (const m of mediaToDelete) {
          await db.delete(flashcardMedia).where(eq(flashcardMedia.id, m.id));
        }
      }

      // Find new media to insert (in new list but not in DB)
      const newMedia = media.filter(
        (m: { url: string }) => !existingMediaUrls.includes(m.url)
      );

      // Insert new media records
      if (newMedia.length > 0) {
        await db.insert(flashcardMedia).values(
          newMedia.map((m: {
            url: string;
            key: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
            placement: string;
            order: number;
            altText?: string;
          }) => ({
            flashcardId: id,
            fileUrl: m.url,
            fileKey: m.key,
            fileName: m.fileName,
            fileSize: m.fileSize,
            mimeType: m.mimeType,
            placement: m.placement,
            order: m.order,
            altText: m.altText || null,
          }))
        );
      }

      // Update order for existing media if needed
      for (const m of media) {
        const existingMedia = existingCard.media?.find((em) => em.fileUrl === m.url);
        if (existingMedia && existingMedia.order !== m.order) {
          await db
            .update(flashcardMedia)
            .set({ order: m.order })
            .where(eq(flashcardMedia.id, existingMedia.id));
        }
      }
    }

    // Fetch complete flashcard with updated media
    const completeFlashcard = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, id),
      with: {
        media: {
          orderBy: [asc(flashcardMedia.order)],
        },
      },
    });

    return NextResponse.json({
      success: true,
      flashcard: completeFlashcard,
    });

  } catch (error) {
    console.error('Error updating flashcard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update flashcard';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/flashcards/[id]
 * Delete a flashcard (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if flashcard exists and get media
    const existingCard = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, id),
      with: {
        media: true,
      },
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // Delete all associated media from Blob storage
    if (existingCard.media && existingCard.media.length > 0) {
      const mediaUrls = existingCard.media.map((m) => m.fileUrl);
      try {
        await deleteMultipleImagesFromBlob(mediaUrls);
      } catch (error) {
        console.error('Error deleting media from blob storage:', error);
        // Continue with flashcard deletion even if blob deletion fails
      }
    }

    // Delete flashcard (cascade will delete media records)
    await db.delete(flashcards).where(eq(flashcards.id, id));

    // Update deck card count
    const deck = await db.query.decks.findFirst({
      where: eq(decks.id, existingCard.deckId),
    });

    if (deck) {
      await db
        .update(decks)
        .set({
          cardCount: Math.max(0, deck.cardCount - 1),
          updatedAt: new Date(),
        })
        .where(eq(decks.id, deck.id));
    }

    return NextResponse.json({
      success: true,
      message: 'Flashcard deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting flashcard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete flashcard';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
