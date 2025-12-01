import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { classes, decks, flashcards, userCardProgress } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { withErrorHandling } from '@/lib/api/error-handler';
import { withTracing } from '@/lib/middleware/with-tracing';
import { randomBytes } from 'crypto';

type FlashcardWithMeta = {
  id: string;
  [key: string]: unknown;
};

type ProgressRecord = {
  flashcardId: string;
  confidenceLevel: number | null;
  nextReviewDate: Date | null;
  lastSeen: Date | null;
  [key: string]: unknown;
};

/**
 * Check if card has not been studied yet
 */
function isCardUnstudied(progress: ProgressRecord | undefined): boolean {
  return !progress;
}

/**
 * Check if card has low confidence level
 */
function hasLowConfidence(progress: ProgressRecord): boolean {
  return progress.confidenceLevel !== null && progress.confidenceLevel < 4;
}

/**
 * Check if card is due for review
 */
function isDueForReview(progress: ProgressRecord, now: Date): boolean {
  return progress.nextReviewDate !== null && new Date(progress.nextReviewDate) <= now;
}

/**
 * Check if a card needs review in progressive mode
 */
function shouldIncludeInProgressiveMode(
  progress: ProgressRecord | undefined,
  now: Date
): boolean {
  if (isCardUnstudied(progress)) {
    return true;
  }

  if (hasLowConfidence(progress)) {
    return true;
  }

  if (isDueForReview(progress, now)) {
    return true;
  }

  return false;
}

/**
 * Shuffle array using Fisher-Yates algorithm with cryptographically secure randomness
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate cryptographically secure random index
    const randomBuffer = randomBytes(4);
    const randomValue = randomBuffer.readUInt32BE(0);
    const j = randomValue % (i + 1);

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sort cards for progressive mode study
 */
function sortCardsForProgressiveMode(
  a: FlashcardWithMeta,
  b: FlashcardWithMeta,
  progressMap: Map<string, ProgressRecord>
): number {
  const progressA = progressMap.get(a.id);
  const progressB = progressMap.get(b.id);

  // Cards not studied come first
  if (!progressA && progressB) return -1;
  if (progressA && !progressB) return 1;
  if (!progressA && !progressB) return 0;

  // Then by confidence level (lowest first)
  const confidenceA = progressA?.confidenceLevel ?? 0;
  const confidenceB = progressB?.confidenceLevel ?? 0;
  if (confidenceA !== confidenceB) {
    return confidenceA - confidenceB;
  }

  // Then by last seen (oldest first)
  const dateA = progressA?.lastSeen ? new Date(progressA.lastSeen).getTime() : 0;
  const dateB = progressB?.lastSeen ? new Date(progressB.lastSeen).getTime() : 0;
  return dateA - dateB;
}

/**
 * Apply study mode logic to flashcards
 */
function applyStudyMode(
  mode: string,
  allFlashcards: FlashcardWithMeta[],
  progressMap: Map<string, ProgressRecord>
): FlashcardWithMeta[] {
  switch (mode) {
    case 'progressive': {
      const now = new Date();
      const studyCards = allFlashcards.filter(card =>
        shouldIncludeInProgressiveMode(progressMap.get(card.id), now)
      );

      studyCards.sort((a, b) => sortCardsForProgressiveMode(a, b, progressMap));

      // If no cards need review, show all cards (user has mastered everything)
      return studyCards.length === 0 ? allFlashcards : studyCards;
    }

    case 'random':
      // nosemgrep: Using crypto.randomBytes() for flashcard shuffling (non-security-critical)
      return shuffleArray(allFlashcards);

    case 'all':
    default:
      return allFlashcards;
  }
}

/**
 * Build deck query conditions based on class ID and optional deck selection
 */
function buildDeckQueryConditions(classId: string, selectedDeckIds: string[] | null) {
  const conditions = [
    eq(decks.classId, classId),
    eq(decks.isPublished, true)
  ];

  if (selectedDeckIds && selectedDeckIds.length > 0) {
    conditions.push(inArray(decks.id, selectedDeckIds));
  }

  return conditions;
}

/**
 * Flatten flashcards from decks and add metadata
 */
function flattenDeckFlashcards(
  classDecks: Array<{ name: string; flashcards: Array<{ id: string;[key: string]: unknown }> }>,
  className: string
): FlashcardWithMeta[] {
  return classDecks.flatMap(deck =>
    deck.flashcards.map(card => ({
      ...card,
      deckName: deck.name,
      className,
    }))
  );
}

/**
 * Create a map of flashcard ID to progress record
 */
function createProgressMap(progressRecords: ProgressRecord[]): Map<string, ProgressRecord> {
  return new Map(progressRecords.map(p => [p.flashcardId, p]));
}

/**
 * Parse request parameters
 */
interface StudyParams {
  mode: string;
  selectedDeckIds: string[] | null;
}

function parseStudyParams(searchParams: URLSearchParams): StudyParams {
  const mode = searchParams.get('mode') || 'progressive';
  const decksParam = searchParams.get('decks');
  const selectedDeckIds = decksParam ? decksParam.split(',') : null;

  return { mode, selectedDeckIds };
}

/**
 * Fetch class with decks and flashcards
 */
async function fetchClassWithDecks(classId: string, selectedDeckIds: string[] | null) {
  const classData = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
  });

  if (!classData) {
    return { classData: null, classDecks: [] };
  }

  const deckConditions = buildDeckQueryConditions(classId, selectedDeckIds);
  const classDecks = await db.query.decks.findMany({
    where: and(...deckConditions),
    with: {
      flashcards: {
        where: eq(flashcards.isPublished, true),
        with: {
          media: true,
        },
      },
    },
  });

  return { classData, classDecks };
}

/**
 * Fetch user progress for flashcards
 */
async function fetchUserProgress(userId: string, cardIds: string[]) {
  const progressRecords = await db
    .select()
    .from(userCardProgress)
    .where(
      and(
        eq(userCardProgress.clerkUserId, userId),
        inArray(userCardProgress.flashcardId, cardIds)
      )
    );

  return createProgressMap(progressRecords);
}

/**
 * Create empty response for study cards
 */
function createEmptyResponse(mode: string, classData: { name: string; id: string }) {
  return NextResponse.json({
    flashcards: [],
    mode,
    className: classData.name,
    classId: classData.id,
  });
}

/**
 * GET /api/classes/[id]/study?mode=progressive|random|all&decks=deck1,deck2
 * Get flashcards for studying a class based on the selected mode
 * Optional: Filter by specific deck IDs (comma-separated)
 */
async function getClassStudyCards(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = await params;
    const { mode, selectedDeckIds } = parseStudyParams(request.nextUrl.searchParams);

    // Fetch class and decks
    const { classData, classDecks } = await fetchClassWithDecks(classId, selectedDeckIds);

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (!classDecks || classDecks.length === 0) {
      return createEmptyResponse(mode, classData);
    }

    // Flatten all flashcards from all decks
    const allFlashcards = flattenDeckFlashcards(classDecks, classData.name);

    if (allFlashcards.length === 0) {
      return createEmptyResponse(mode, classData);
    }

    // Get user's progress for all cards
    const cardIds = allFlashcards.map(card => card.id);
    const progressMap = await fetchUserProgress(userId, cardIds);

    // Apply study mode logic
    const studyCards = applyStudyMode(mode, allFlashcards, progressMap);

    return NextResponse.json({
      flashcards: studyCards,
      mode,
      className: classData.name,
      classId: classData.id,
      totalCards: allFlashcards.length,
      studyCardsCount: studyCards.length,
    });

  } catch (error) {
    console.error('Error fetching study cards:', error);
    throw error;
  }
}

export const GET = withTracing(
  withErrorHandling(getClassStudyCards as unknown as (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>, 'get class study cards'),
  { logRequest: true, logResponse: false }
);
