import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { classes, decks } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

/**
 * GET /api/domains
 * Fetch all classes (formerly domains) with their decks and total card counts
 * Note: This endpoint maintains backward compatibility by using the old "domains" naming
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all classes with their decks
    const allClasses = await db.query.classes.findMany({
      orderBy: [asc(classes.order)],
      with: {
        decks: {
          orderBy: [asc(decks.order)],
        },
      },
    });

    // Calculate total card count for each class
    const classesWithStats = allClasses.map((classItem) => {
      const totalCards = classItem.decks.reduce((sum, deck) => sum + deck.cardCount, 0);

      return {
        id: classItem.id,
        name: classItem.name,
        description: classItem.description,
        order: classItem.order,
        icon: classItem.icon,
        cardCount: totalCards,
        createdAt: classItem.createdAt,
      };
    });

    return NextResponse.json({ domains: classesWithStats });

  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}
