import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { uploadImageToBlob } from '@/lib/blob';

/**
 * POST /api/admin/upload
 * Upload image to Vercel Blob Storage (admin only)
 *
 * Expected multipart/form-data with:
 * - file: The image file
 * - flashcardId: The flashcard ID (optional, can be 'temp' for new flashcards)
 * - placement: 'question' or 'answer'
 * - order: Order number for multiple images
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const flashcardId = (formData.get('flashcardId') as string) || 'temp';
    const placement = formData.get('placement') as 'question' | 'answer';
    const order = parseInt(formData.get('order') as string) || 0;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!placement || (placement !== 'question' && placement !== 'answer')) {
      return NextResponse.json(
        { error: 'Invalid placement. Must be "question" or "answer"' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const uploadResult = await uploadImageToBlob(
      file,
      flashcardId,
      placement,
      order
    );

    return NextResponse.json({
      success: true,
      ...uploadResult,
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
