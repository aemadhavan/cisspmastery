import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { classes, decks } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

/**
 * GET /api/admin/domains
 * Get all classes with full hierarchy (decks) - Admin only
 * NOTE: This endpoint name kept for backward compatibility
 * Actually returns classes → decks (not domains → topics → decks)
 */
export async function GET() {
  try {
    await requireAdmin();

    // Fetch all classes with their decks (no filters for admin)
    const allClasses = await db.query.classes.findMany({
      orderBy: [asc(classes.order)],
      with: {
        decks: {
          orderBy: [asc(decks.order)],
        },
      },
    });

    // Return in format expected by existing UI (for backward compatibility)
    // Map classes to "domains" and decks to be at the domain level
    const domains = allClasses.map((cls) => ({
      id: cls.id,
      name: cls.name,
      description: cls.description,
      order: cls.order,
      icon: cls.icon,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
      // Flatten the structure: put decks directly under domains
      // (skipping topics layer since we removed it)
      topics: [
        {
          id: cls.id, // Use class ID as topic ID for compatibility
          name: cls.name,
          domainId: cls.id,
          order: 0,
          decks: cls.decks,
        },
      ],
    }));

    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Error fetching classes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch classes';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
