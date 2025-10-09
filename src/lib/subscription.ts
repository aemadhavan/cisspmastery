import { auth } from '@clerk/nextjs/server';

/**
 * Check if the current user has access to paid features
 * TODO: Implement proper subscription checking with Clerk metadata or database
 */
export async function hasPaidAccess() {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  // TODO: Check user's subscription status from publicMetadata or database
  // For now, return true for all authenticated users
  return true;
}

/**
 * Check if the current user is on the free plan
 */
export async function hasFreeAccess() {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Get the user's current plan
 * TODO: Implement proper plan detection from Clerk metadata or database
 */
export async function getUserPlan() {
  const { userId } = await auth();

  if (!userId) {
    return 'free';
  }

  // TODO: Check user's publicMetadata for subscription plan
  // const user = await clerkClient.users.getUser(userId);
  // const plan = user.publicMetadata?.plan;

  return 'paid'; // Default to paid for authenticated users for now
}
