import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { classes } from '@/lib/db/schema';
import { desc, asc } from 'drizzle-orm';

// GET /api/admin/classes - Get all classes
export async function GET() {
  try {
    await requireAdmin();

    const allClasses = await db
      .select()
      .from(classes)
      .orderBy(asc(classes.order), desc(classes.createdAt));

    return NextResponse.json({
      classes: allClasses,
      total: allClasses.length,
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch classes';
    return NextResponse.json(
      { error: message },
      { status: message?.includes('admin') ? 403 : 500 }
    );
  }
}

// POST /api/admin/classes - Create a new class
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const { name, description, order, icon, color, isPublished } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      );
    }

    const newClass = await db
      .insert(classes)
      .values({
        name,
        description: description || null,
        order: order || 0,
        icon: icon || null,
        color: color || 'purple',
        isPublished: isPublished !== undefined ? isPublished : true,
        createdBy: admin.clerkUserId,
      })
      .returning();

    return NextResponse.json({
      class: newClass[0],
      message: 'Class created successfully',
    });
  } catch (error) {
    console.error('Error creating class:', error);
    const message = error instanceof Error ? error.message : 'Failed to create class';
    return NextResponse.json(
      { error: message },
      { status: message?.includes('admin') ? 403 : 500 }
    );
  }
}
