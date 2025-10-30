import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { classes, decks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/classes/:id - Get a specific class with its decks
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const classData = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!classData.length) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get all decks in this class
    const classDecks = await db
      .select()
      .from(decks)
      .where(eq(decks.classId, id));

    return NextResponse.json({
      class: classData[0],
      decks: classDecks,
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch class';
    return NextResponse.json(
      { error: message },
      { status: message?.includes('admin') ? 403 : 500 }
    );
  }
}

// PUT /api/admin/classes/:id - Update a class
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const { name, description, order, icon, color, isPublished } = body;

    const updatedClass = await db
      .update(classes)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(isPublished !== undefined && { isPublished }),
        updatedAt: new Date(),
      })
      .where(eq(classes.id, id))
      .returning();

    if (!updatedClass.length) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({
      class: updatedClass[0],
      message: 'Class updated successfully',
    });
  } catch (error) {
    console.error('Error updating class:', error);
    const message = error instanceof Error ? error.message : 'Failed to update class';
    return NextResponse.json(
      { error: message },
      { status: message?.includes('admin') ? 403 : 500 }
    );
  }
}

// DELETE /api/admin/classes/:id - Delete a class
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if class exists
    const classData = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!classData.length) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Delete class (cascades to decks and flashcards)
    await db.delete(classes).where(eq(classes.id, id));

    return NextResponse.json({
      message: 'Class deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete class';
    return NextResponse.json(
      { error: message },
      { status: message?.includes('admin') ? 403 : 500 }
    );
  }
}
