import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, subscriptions, userStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || null;
    const linkedinId = unsafe_metadata?.linkedinId as string | undefined;

    try {
      // Create user in database
      await db.insert(users).values({
        clerkUserId: id,
        email: email!,
        name,
        linkedinId: linkedinId || null,
        role: 'user', // Default role, can be changed manually to 'admin'
      });

      // Create free subscription for new user
      await db.insert(subscriptions).values({
        clerkUserId: id,
        planType: 'free',
        status: 'active',
      });

      // Initialize user stats
      await db.insert(userStats).values({
        clerkUserId: id,
        totalCardsStudied: 0,
        studyStreakDays: 0,
        totalStudyTime: 0,
        dailyCardsStudiedToday: 0,
      });

      console.log('User created:', id);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || null;

    try {
      await db
        .update(users)
        .set({
          email: email!,
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, id));

      console.log('User updated:', id);
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Cascade delete will handle related records
      await db.delete(users).where(eq(users.clerkUserId, id!));

      console.log('User deleted:', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
