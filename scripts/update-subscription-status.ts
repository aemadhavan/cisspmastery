/**
 * Script to manually update subscription status for testing
 * Run with: npx tsx scripts/update-subscription-status.ts
 */

import { db } from '../src/lib/db';
import { subscriptions } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function updateSubscription() {
  try {
    // IMPORTANT: Update this with YOUR actual Clerk User ID
    // Get it from: https://dashboard.clerk.com or from the error message
    const clerkUserId = process.argv[2] || 'user_33oqZCsrKLsESLa3hoPcJpUHEFf';

    console.log('Searching for subscriptions with clerk_user_id:', clerkUserId);

    // Find all subscriptions for this user
    const userSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.clerkUserId, clerkUserId),
    });

    console.log(`Found ${userSubscriptions.length} subscriptions`);

    if (userSubscriptions.length === 0) {
      console.log('No subscriptions found. Creating a new one...');

      // Create a new subscription
      const newSub = await db.insert(subscriptions).values({
        clerkUserId: clerkUserId,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        planType: 'lifetime', // Changed from 'free' to 'lifetime'
        status: 'active',
        currentPeriodStart: new Date('2025-10-31T10:16:42Z'),
        currentPeriodEnd: new Date('2026-10-31T10:16:42Z'), // 1 year from start
        cancelAtPeriodEnd: false,
      }).returning();

      console.log('Created new subscription:', newSub);
    } else {
      // Update existing subscription
      userSubscriptions.forEach((sub) => {
        console.log('Subscription details:');
        console.log('  ID:', sub.id);
        console.log('  Status:', sub.status);
        console.log('  Plan Type:', sub.planType);
        console.log('  Created At:', sub.createdAt);
        console.log('  Clerk User ID:', sub.clerkUserId);
      });

      // Update the first subscription to ensure it's active
      const subscriptionId = userSubscriptions[0].id;

      console.log('\nUpdating subscription to active...');

      const updated = await db
        .update(subscriptions)
        .set({
          status: 'active',
          planType: 'lifetime',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

      console.log('Updated subscription:', updated);
    }

    console.log('\n✅ Subscription updated successfully!');
    console.log('Refresh your browser to see the changes.');

  } catch (error) {
    console.error('Error updating subscription:', error);
  }

  process.exit(0);
}

updateSubscription();
