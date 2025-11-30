import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { users, userStats, userCardProgress, flashcards } from '@/lib/db/schema';
import { eq, sql, desc, and, inArray, count } from 'drizzle-orm';
import { withErrorHandling } from '@/lib/api/error-handler';
import { withTracing } from '@/lib/middleware/with-tracing';

/**
 * GET /api/admin/analytics/users
 * Get performance analytics for all users (admin only)
 */
async function getUsersAnalytics(request: NextRequest) {
  await requireAdmin();

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const domainId = searchParams.get('domainId');

  // If specific user requested
  if (userId) {
    return getUserAnalytics(userId, domainId);
  }

  // OPTIMIZED: Single aggregated query instead of N+1 queries
  // Get all users with their stats AND mastery breakdown in one query
  const usersWithProgress = await db
    .select({
      clerkUserId: users.clerkUserId,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      totalCardsStudied: userStats.totalCardsStudied,
      studyStreakDays: userStats.studyStreakDays,
      totalStudyTime: userStats.totalStudyTime,
      lastActiveDate: userStats.lastActiveDate,
      // Aggregate mastery counts in single query using safe SQL functions
      newCount: count(sql`CASE WHEN ${userCardProgress.masteryStatus} = 'new' THEN 1 END`).as('new_count'),
      learningCount: count(sql`CASE WHEN ${userCardProgress.masteryStatus} = 'learning' THEN 1 END`).as('learning_count'),
      masteredCount: count(sql`CASE WHEN ${userCardProgress.masteryStatus} = 'mastered' THEN 1 END`).as('mastered_count'),
    })
    .from(users)
    .leftJoin(userStats, eq(users.clerkUserId, userStats.clerkUserId))
    .leftJoin(userCardProgress, eq(users.clerkUserId, userCardProgress.clerkUserId))
    .groupBy(
      users.clerkUserId,
      users.email,
      users.name,
      users.role,
      users.createdAt,
      userStats.totalCardsStudied,
      userStats.studyStreakDays,
      userStats.totalStudyTime,
      userStats.lastActiveDate
    )
    .orderBy(desc(userStats.totalCardsStudied))
    .then((results) =>
      results.map((user) => ({
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        totalCardsStudied: user.totalCardsStudied,
        studyStreakDays: user.studyStreakDays,
        totalStudyTime: user.totalStudyTime,
        lastActiveDate: user.lastActiveDate,
        masteryBreakdown: {
          new: user.newCount || 0,
          learning: user.learningCount || 0,
          mastered: user.masteredCount || 0,
        },
        totalCardsInProgress: (user.newCount || 0) + (user.learningCount || 0) + (user.masteredCount || 0),
      }))
    );

  return NextResponse.json({
    users: usersWithProgress,
    total: usersWithProgress.length,
  });
}

export const GET = withTracing(
  withErrorHandling(getUsersAnalytics, 'get admin user analytics'),
  { logRequest: true, logResponse: true }
);

function extractFlashcardIds(classItem: { decks: { flashcards: { id: string }[] }[] }) {
  return classItem.decks.flatMap((deck) => deck.flashcards.map((card) => card.id));
}

function createEmptyProgress(classId: string, className: string) {
  return {
    domainId: classId,
    domainName: className,
    totalCards: 0,
    studiedCards: 0,
    masteredCards: 0,
    learningCards: 0,
    newCards: 0,
    progress: 0,
  };
}

function calculateMasteryBreakdown(progressRecords: { masteryStatus: string }[]) {
  return {
    studied: progressRecords.length,
    mastered: progressRecords.filter((p) => p.masteryStatus === 'mastered').length,
    learning: progressRecords.filter((p) => p.masteryStatus === 'learning').length,
    new: progressRecords.filter((p) => p.masteryStatus === 'new').length,
  };
}

async function calculateClassProgress(
  userId: string,
  classItem: { id: string; name: string; decks: { flashcards: { id: string }[] }[] }
) {
  const flashcardIds = extractFlashcardIds(classItem);

  if (flashcardIds.length === 0) {
    return createEmptyProgress(classItem.id, classItem.name);
  }

  const progressRecords = await db
    .select()
    .from(userCardProgress)
    .where(
      and(
        eq(userCardProgress.clerkUserId, userId),
        inArray(userCardProgress.flashcardId, flashcardIds)
      )
    );

  const breakdown = calculateMasteryBreakdown(progressRecords);

  return {
    domainId: classItem.id,
    domainName: classItem.name,
    totalCards: flashcardIds.length,
    studiedCards: breakdown.studied,
    masteredCards: breakdown.mastered,
    learningCards: breakdown.learning,
    newCards: breakdown.new,
    progress: Math.round((breakdown.studied / flashcardIds.length) * 100),
  };
}

async function getCardDetailsForClass(
  userId: string,
  flashcardIds: string[]
) {
  if (flashcardIds.length === 0) return null;

  return db
    .select({
      flashcardId: userCardProgress.flashcardId,
      confidenceLevel: userCardProgress.confidenceLevel,
      timesSeen: userCardProgress.timesSeen,
      masteryStatus: userCardProgress.masteryStatus,
      lastSeen: userCardProgress.lastSeen,
    })
    .from(userCardProgress)
    .where(
      and(
        eq(userCardProgress.clerkUserId, userId),
        inArray(userCardProgress.flashcardId, flashcardIds)
      )
    );
}

/**
 * Get detailed analytics for a specific user
 */
async function getUserAnalytics(userId: string, domainId: string | null) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
    with: { stats: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const allClasses = await db.query.classes.findMany({
    with: {
      decks: {
        with: {
          flashcards: {
            where: eq(flashcards.isPublished, true),
          },
        },
      },
    },
  });

  const classProgress = await Promise.all(
    allClasses.map((classItem) => calculateClassProgress(userId, classItem))
  );

  let cardDetails = null;
  if (domainId) {
    const classItem = allClasses.find((d) => d.id === domainId);
    if (classItem) {
      const flashcardIds = extractFlashcardIds(classItem);
      cardDetails = await getCardDetailsForClass(userId, flashcardIds);
    }
  }

  return NextResponse.json({
    user: {
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    stats: user.stats,
    domainProgress: classProgress,
    cardDetails,
  });
}
