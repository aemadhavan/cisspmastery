import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { decks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandling } from '@/lib/api/error-handler';
import { withTracing } from '@/lib/middleware/with-tracing';

// GET /api/admin/decks/:id - Get a specific deck
async function getDeck(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const deck = await db.query.decks.findFirst({
      where: eq(decks.id, id),
      with: {
        class: true,
        flashcards: {
          with: {
            media: true,
            quizQuestions: true,
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    throw error;
  }
}

export const GET = withTracing(
  withErrorHandling(getDeck as (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>, 'get admin deck'),
  { logRequest: true, logResponse: false }
) as typeof getDeck;

// PUT /api/admin/decks/:id - Update a deck
async function updateDeck(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const { name, description, type, order, isPremium, isPublished } = body;

    const updatedDeck = await db
      .update(decks)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(order !== undefined && { order }),
        ...(isPremium !== undefined && { isPremium }),
        ...(isPublished !== undefined && { isPublished }),
        updatedAt: new Date(),
      })
      .where(eq(decks.id, id))
      .returning();

    if (!updatedDeck.length) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json({
      deck: updatedDeck[0],
      message: 'Deck updated successfully',
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    throw error;
  }
}

export const PUT = withTracing(
  withErrorHandling(updateDeck as (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>, 'update admin deck'),
  { logRequest: true, logResponse: false }
) as typeof updateDeck;

// DELETE /api/admin/decks/:id - Delete a deck
async function deleteDeck(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if deck exists
    const deck = await db
      .select()
      .from(decks)
      .where(eq(decks.id, id))
      .limit(1);

    if (!deck.length) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Delete deck (cascades to flashcards)
    await db.delete(decks).where(eq(decks.id, id));

    return NextResponse.json({
      message: 'Deck deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
}

export const DELETE = withTracing(
  withErrorHandling(deleteDeck as (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>, 'delete admin deck'),
  { logRequest: true, logResponse: false }
) as typeof deleteDeck;
