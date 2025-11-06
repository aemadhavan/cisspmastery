import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { testQuestions, flashcards } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { createTestQuestionSchema, bulkTestQuestionsSchema } from '@/lib/validations/test';
import { CacheInvalidation, safeInvalidate } from '@/lib/redis/invalidation';

/**
 * GET /api/admin/test-questions
 * Get all test questions (admin only)
 * Query params: flashcardId, deckId, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const flashcardId = searchParams.get('flashcardId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query;

    if (flashcardId) {
      // Get questions for specific flashcard
      query = db.query.testQuestions.findMany({
        where: eq(testQuestions.flashcardId, flashcardId),
        orderBy: [desc(testQuestions.order)],
        limit,
        offset,
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
    } else {
      // Get all questions
      query = db.query.testQuestions.findMany({
        orderBy: [desc(testQuestions.createdAt)],
        limit,
        offset,
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
    }

    const questions = await query;

    return NextResponse.json({
      questions,
      total: questions.length,
    });

  } catch (error) {
    console.error('Error fetching test questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch test questions';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * POST /api/admin/test-questions
 * Create new test question or bulk import (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    // Check if this is a bulk import
    if (body.questions && Array.isArray(body.questions)) {
      return handleBulkImport(body, admin.clerkUserId);
    }

    // Single question creation
    const validation = createTestQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify flashcard exists
    const flashcard = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, data.flashcardId),
      with: {
        deck: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // Validate that correct answer indices are within bounds
    const maxIndex = data.choices.length - 1;
    const invalidAnswers = data.correctAnswers.filter(idx => idx > maxIndex);

    if (invalidAnswers.length > 0) {
      return NextResponse.json(
        { error: `Correct answer indices must be between 0 and ${maxIndex}` },
        { status: 400 }
      );
    }

    // Create test question
    const [question] = await db
      .insert(testQuestions)
      .values({
        flashcardId: data.flashcardId,
        question: data.question,
        choices: data.choices,
        correctAnswers: data.correctAnswers,
        explanation: data.explanation || null,
        pointValue: data.pointValue,
        timeLimit: data.timeLimit || null,
        difficulty: data.difficulty || null,
        order: data.order,
        isActive: data.isActive,
        createdBy: admin.clerkUserId,
      })
      .returning();

    // Invalidate related cache entries
    await safeInvalidate(() =>
      CacheInvalidation.flashcard(data.flashcardId, flashcard.deck.id, flashcard.deck.classId)
    );

    return NextResponse.json({
      success: true,
      question,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating test question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create test question';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * Handle bulk import of test questions from JSON
 */
async function handleBulkImport(body: unknown, clerkUserId: string) {
  const validation = bulkTestQuestionsSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.issues },
      { status: 400 }
    );
  }

  const { questions, strategy, validateOnly } = validation.data;

  // Collect validation errors
  const errors: Array<{ index: number; error: string }> = [];
  const validQuestions: typeof questions = [];

  // Validate all questions and check flashcard existence
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // Check if flashcard exists
    const flashcard = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, q.flashcardId),
    });

    if (!flashcard) {
      errors.push({ index: i, error: `Flashcard ${q.flashcardId} not found` });
      continue;
    }

    // Validate correct answer indices
    const maxIndex = q.choices.length - 1;
    const invalidAnswers = q.correctAnswers.filter(idx => idx > maxIndex);

    if (invalidAnswers.length > 0) {
      errors.push({ index: i, error: `Correct answer indices must be between 0 and ${maxIndex}` });
      continue;
    }

    validQuestions.push(q);
  }

  // If validateOnly mode, return validation results
  if (validateOnly) {
    return NextResponse.json({
      valid: errors.length === 0,
      validCount: validQuestions.length,
      errorCount: errors.length,
      errors,
    });
  }

  // If there are validation errors, don't proceed
  if (errors.length > 0) {
    return NextResponse.json({
      error: 'Some questions failed validation',
      validCount: validQuestions.length,
      errorCount: errors.length,
      errors,
    }, { status: 400 });
  }

  // Handle import strategy
  if (strategy === 'replace') {
    // Get all unique flashcard IDs
    const flashcardIds = [...new Set(validQuestions.map(q => q.flashcardId))];

    // Delete existing questions for these flashcards
    for (const flashcardId of flashcardIds) {
      await db.delete(testQuestions).where(eq(testQuestions.flashcardId, flashcardId));
    }
  } else if (strategy === 'skip') {
    // Check for existing questions and skip duplicates
    const filteredQuestions = [];

    for (const q of validQuestions) {
      const existing = await db.query.testQuestions.findFirst({
        where: and(
          eq(testQuestions.flashcardId, q.flashcardId),
          eq(testQuestions.question, q.question)
        ),
      });

      if (!existing) {
        filteredQuestions.push(q);
      }
    }

    validQuestions.splice(0, validQuestions.length, ...filteredQuestions);
  }

  // Insert all valid questions
  const insertedQuestions = await db
    .insert(testQuestions)
    .values(
      validQuestions.map(q => ({
        flashcardId: q.flashcardId,
        question: q.question,
        choices: q.choices,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation || null,
        pointValue: q.pointValue,
        timeLimit: q.timeLimit || null,
        difficulty: q.difficulty || null,
        order: q.order,
        isActive: q.isActive,
        createdBy: clerkUserId,
      }))
    )
    .returning();

  return NextResponse.json({
    success: true,
    imported: insertedQuestions.length,
    skipped: questions.length - insertedQuestions.length,
    questions: insertedQuestions,
  }, { status: 201 });
}
