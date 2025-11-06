import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { testAttempts, testAnswers, deckTests, userStats } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { submitTestSchema } from '@/lib/validations/test';

/**
 * POST /api/tests/submit
 * Complete and submit a test attempt
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = submitTestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { attemptId } = validation.data;

    // Verify attempt belongs to user and is in progress
    const attempt = await db.query.testAttempts.findFirst({
      where: and(
        eq(testAttempts.id, attemptId),
        eq(testAttempts.clerkUserId, userId)
      ),
      with: {
        answers: true,
        deckTest: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Test attempt not found' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Test already ${attempt.status}` },
        { status: 400 }
      );
    }

    // Calculate total points and score
    const totalPointsPossible = await db
      .select({ total: sql<number>`SUM(${testAnswers.pointsEarned})` })
      .from(testAnswers)
      .where(eq(testAnswers.attemptId, attemptId));

    const pointsEarned = attempt.answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

    // Calculate percentage score
    const score = attempt.totalQuestions > 0
      ? (attempt.correctAnswers / attempt.totalQuestions) * 100
      : 0;

    // Determine if passed
    const passingScore = attempt.deckTest?.passingScore || 70;
    const passed = score >= passingScore;

    // Calculate time spent
    const startedAt = new Date(attempt.startedAt);
    const completedAt = new Date();
    const timeSpentSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    // Update attempt
    const [completedAttempt] = await db
      .update(testAttempts)
      .set({
        status: 'completed',
        completedAt,
        score: score.toFixed(2),
        passed,
        timeSpent: timeSpentSeconds,
        updatedAt: new Date(),
      })
      .where(eq(testAttempts.id, attemptId))
      .returning();

    // Update user stats
    await db
      .insert(userStats)
      .values({
        clerkUserId: userId,
        totalCardsStudied: attempt.totalQuestions,
        totalStudyTime: timeSpentSeconds,
        lastActiveDate: completedAt,
      })
      .onConflictDoUpdate({
        target: userStats.clerkUserId,
        set: {
          totalCardsStudied: sql`${userStats.totalCardsStudied} + ${attempt.totalQuestions}`,
          totalStudyTime: sql`${userStats.totalStudyTime} + ${timeSpentSeconds}`,
          lastActiveDate: completedAt,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      result: {
        attemptId: completedAttempt.id,
        status: completedAttempt.status,
        totalQuestions: completedAttempt.totalQuestions,
        questionsAnswered: completedAttempt.questionsAnswered,
        correctAnswers: completedAttempt.correctAnswers,
        score: parseFloat(completedAttempt.score || '0'),
        passed,
        passingScore,
        timeSpent: timeSpentSeconds,
        completedAt,
      },
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit test';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
