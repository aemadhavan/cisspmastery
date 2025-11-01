import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/admin';

export async function GET() {
  try {
    const user = await checkIsAdmin();

    return NextResponse.json({
      isAdmin: !!user
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({
      isAdmin: false
    });
  }
}
