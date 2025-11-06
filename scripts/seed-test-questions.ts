/**
 * Seed script for test questions and deck tests
 * Run with: npx tsx scripts/seed-test-questions.ts
 */

import { db } from '../src/lib/db';
import { testQuestions, deckTests, testQuestionPool, flashcards, decks } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedTestQuestions() {
  console.log('🌱 Seeding test questions...\n');

  try {
    // Get first admin user (you'll need to replace this with your actual admin user ID)
    const adminUserId = process.env.ADMIN_USER_ID || 'user_2qQ8ZXxXxXxXxXxXxXxXxX'; // Replace with your Clerk user ID

    // Get some flashcards to add questions to
    const existingFlashcards = await db.query.flashcards.findMany({
      limit: 10,
      with: {
        deck: {
          with: {
            class: true,
          },
        },
      },
    });

    if (existingFlashcards.length === 0) {
      console.log('❌ No flashcards found. Please run the main seed script first.');
      process.exit(1);
    }

    console.log(`✅ Found ${existingFlashcards.length} flashcards\n`);

    // Sample test questions for CISSP domains
    const sampleQuestions = [
      {
        question: 'Which of the following BEST describes the concept of "defense in depth"?',
        choices: [
          'Using a single, very strong security control',
          'Implementing multiple layers of security controls',
          'Focusing solely on perimeter security',
          'Relying on user training as the primary defense',
        ],
        correctAnswers: [1],
        explanation: 'Defense in depth is a security strategy that employs multiple layers of security controls throughout an IT system. This ensures that if one control fails, others are in place to prevent a security breach.',
        difficulty: 2,
      },
      {
        question: 'What are the three main components of the CIA Triad in information security?',
        choices: [
          'Confidentiality, Integrity, Availability',
          'Compliance, Integrity, Authentication',
          'Confidentiality, Identity, Authorization',
          'Control, Integration, Accountability',
        ],
        correctAnswers: [0],
        explanation: 'The CIA Triad represents the three fundamental principles of information security: Confidentiality (protecting information from unauthorized access), Integrity (ensuring data accuracy and completeness), and Availability (ensuring authorized users have access when needed).',
        difficulty: 1,
      },
      {
        question: 'Which encryption algorithm is considered asymmetric?',
        choices: [
          'AES (Advanced Encryption Standard)',
          'DES (Data Encryption Standard)',
          'RSA (Rivest-Shamir-Adleman)',
          '3DES (Triple DES)',
        ],
        correctAnswers: [2],
        explanation: 'RSA is an asymmetric encryption algorithm that uses a pair of keys (public and private). AES, DES, and 3DES are all symmetric encryption algorithms that use the same key for encryption and decryption.',
        difficulty: 2,
      },
      {
        question: 'What is the primary purpose of a Security Information and Event Management (SIEM) system?',
        choices: [
          'To encrypt all network traffic',
          'To provide real-time analysis of security alerts',
          'To replace all firewalls',
          'To store user passwords',
        ],
        correctAnswers: [1],
        explanation: 'A SIEM system collects, analyzes, and correlates security event data from multiple sources in real-time, helping organizations detect and respond to security threats quickly.',
        difficulty: 2,
      },
      {
        question: 'Which of the following is NOT a valid risk response strategy?',
        choices: [
          'Risk Avoidance',
          'Risk Transfer',
          'Risk Acceptance',
          'Risk Elimination',
        ],
        correctAnswers: [3],
        explanation: 'The four valid risk response strategies are: Avoidance (eliminating the risk), Transfer (shifting the risk to a third party), Mitigation (reducing the risk), and Acceptance (acknowledging and accepting the risk). "Risk Elimination" is not a standard risk response term.',
        difficulty: 3,
      },
    ];

    let questionsCreated = 0;

    // Create test questions for each flashcard
    for (let i = 0; i < Math.min(existingFlashcards.length, sampleQuestions.length); i++) {
      const flashcard = existingFlashcards[i];
      const questionData = sampleQuestions[i];

      const [question] = await db
        .insert(testQuestions)
        .values({
          flashcardId: flashcard.id,
          question: questionData.question,
          choices: questionData.choices,
          correctAnswers: questionData.correctAnswers,
          explanation: questionData.explanation,
          pointValue: 1,
          difficulty: questionData.difficulty,
          order: i,
          isActive: true,
          createdBy: adminUserId,
        })
        .returning();

      console.log(`✅ Created test question for flashcard: ${flashcard.question.substring(0, 50)}...`);
      questionsCreated++;
    }

    console.log(`\n✅ Created ${questionsCreated} test questions\n`);

    // Create a deck test for the first deck with questions
    const firstDeck = await db.query.decks.findFirst({
      with: {
        flashcards: {
          with: {
            testQuestions: true,
          },
        },
      },
    });

    if (firstDeck && firstDeck.flashcards.some(fc => fc.testQuestions && fc.testQuestions.length > 0)) {
      const deckQuestions = firstDeck.flashcards
        .flatMap(fc => fc.testQuestions || [])
        .filter(Boolean);

      if (deckQuestions.length > 0) {
        const [deckTest] = await db
          .insert(deckTests)
          .values({
            deckId: firstDeck.id,
            name: `${firstDeck.name} - Practice Test`,
            description: 'Comprehensive practice test covering all topics in this deck',
            testType: 'deck',
            questionCount: null, // All questions
            timeLimit: 1800, // 30 minutes
            passingScore: 70,
            shuffleQuestions: true,
            shuffleChoices: true,
            showCorrectAnswers: true,
            allowRetakes: true,
            maxAttempts: null, // Unlimited
            isPremium: false,
            isPublished: true,
            createdBy: adminUserId,
          })
          .returning();

        console.log(`✅ Created deck test: ${deckTest.name}\n`);

        // Add all questions to the test pool
        await db.insert(testQuestionPool).values(
          deckQuestions.map((q, index) => ({
            deckTestId: deckTest.id,
            testQuestionId: q.id,
            order: index,
          }))
        );

        console.log(`✅ Added ${deckQuestions.length} questions to test pool\n`);
      }
    }

    console.log('🎉 Test questions seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Test Questions: ${questionsCreated}`);
    console.log(`   - Deck Tests: 1`);
    console.log('\n💡 Next steps:');
    console.log('   1. Test the admin API endpoints');
    console.log('   2. Test the user API endpoints');
    console.log('   3. Build the UI components');

  } catch (error) {
    console.error('❌ Error seeding test questions:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedTestQuestions();
