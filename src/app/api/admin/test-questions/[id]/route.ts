import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { testQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateTestQuestionSchema } from '@/lib/validations/test';
import { CacheInvalidation, safeInvalidate } from '@/lib/redis/invalidation';

/**
 * GET /api/admin/test-questions/[id]
 * Get a single test question by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const question = await db.query.testQuestions.findFirst({
      where: eq(testQuestions.id, params.id),
      with: {
        flashcard: {
          with: {
            deck: {
              with: {
                class: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Test question not found' }, { status: 404 });
    }

    return NextResponse.json({ question });

  } catch (error) {
    console.error('Error fetching test question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch test question';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/test-questions/[id]
 * Update a test question
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = updateTestQuestionSchema.safeParse({ ...body, id: params.id });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await db.query.testQuestions.findFirst({
      where: eq(testQuestions.id, params.id),
      with: {
        flashcard: {
          with: {
            deck: true,
          },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Test question not found' }, { status: 404 });
    }

    const { id, ...updateData } = validation.data;

    // If choices or correctAnswers are being updated, validate indices
    if (updateData.choices && updateData.correctAnswers) {
      const maxIndex = updateData.choices.length - 1;
      const invalidAnswers = updateData.correctAnswers.filter(idx => idx > maxIndex);

      if (invalidAnswers.length > 0) {
        return NextResponse.json(
          { error: `Correct answer indices must be between 0 and ${maxIndex}` },
          { status: 400 }
        );
      }
    }

    // Update question
    const [updatedQuestion] = await db
      .update(testQuestions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(testQuestions.id, params.id))
      .returning();

    // Invalidate cache
    await safeInvalidate(() =>
      CacheInvalidation.flashcard(
        existingQuestion.flashcardId,
        existingQuestion.flashcard.deckId,
        existingQuestion.flashcard.deck.classId
      )
    );

    return NextResponse.json({
      success: true,
      question: updatedQuestion,
    });

  } catch (error) {
    console.error('Error updating test question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update test question';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/test-questions/[id]
 * Delete a test question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Check if question exists
    const question = await db.query.testQuestions.findFirst({
      where: eq(testQuestions.id, params.id),
      with: {
        flashcard: {
          with: {
            deck: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Test question not found' }, { status: 404 });
    }

    // Delete question
    await db.delete(testQuestions).where(eq(testQuestions.id, params.id));

    // Invalidate cache
    await safeInvalidate(() =>
      CacheInvalidation.flashcard(
        question.flashcardId,
        question.flashcard.deckId,
        question.flashcard.deck.classId
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Test question deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting test question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete test question';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
