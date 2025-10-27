import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { domains, topics, decks } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

/**
 * GET /api/admin/domains
 * Get all domains with full hierarchy (topics and decks) - Admin only
 */
export async function GET() {
  try {
    await requireAdmin();

    // Fetch all domains with their topics and decks (no filters for admin)
    const allDomains = await db.query.domains.findMany({
      orderBy: [asc(domains.order)],
      with: {
        topics: {
          orderBy: [asc(topics.order)],
          with: {
            decks: {
              orderBy: [asc(decks.order)],
            },
          },
        },
      },
    });

    return NextResponse.json({ domains: allDomains });

  } catch (error) {
    console.error('Error fetching domains:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch domains';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
