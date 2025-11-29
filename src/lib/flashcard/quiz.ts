import { db } from '@/lib/db';
import { quizQuestions } from '@/lib/db/schema';
import { validateQuizFile } from '@/lib/validations/quiz';

/**
 * Inserts quiz questions for a flashcard
 *
 * @param flashcardId - The ID of the flashcard to attach the questions to
 * @param quizData - The quiz data to validate and insert
 * @param clerkUserId - The ID of the user creating the questions
 * @returns Object with success status and optional error message
 */
export async function insertQuizQuestions(
  flashcardId: string,
  quizData: unknown,
  clerkUserId: string
): Promise<{ success: boolean; error?: string }> {
  // Validate quiz data
  const quizValidation = validateQuizFile(quizData);
  if (!quizValidation.success) {
    return {
      success: false,
      error: `Invalid quiz data: ${quizValidation.error}`,
    };
  }

  // Insert quiz questions if any exist
  if (quizValidation.data.questions.length > 0) {
    await db.insert(quizQuestions).values(
      quizValidation.data.questions.map((q, index) => ({
        flashcardId: flashcardId,
        questionText: q.question,
        options: q.options,
        explanation: q.explanation || null,
        eliminationTactics: q.elimination_tactics ? JSON.stringify(q.elimination_tactics) : null,
        correctAnswerWithJustification: q.correct_answer_with_justification ? JSON.stringify(q.correct_answer_with_justification) : null,
        compareRemainingOptionsWithJustification: q.compare_remaining_options_with_justification ? JSON.stringify(q.compare_remaining_options_with_justification) : null,
        correctOptionsJustification: q.correct_options_justification ? JSON.stringify(q.correct_options_justification) : null,
        order: index,
        difficulty: null,
        createdBy: clerkUserId,
      }))
    );
  }

  return { success: true };
}
