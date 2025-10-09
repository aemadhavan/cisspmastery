import { auth } from '@clerk/nextjs/server';

/**
 * Check if the current user has access to paid features
 * Uses Clerk's has() method to check subscription plan
 */
export async function hasPaidAccess() {
  const { has } = await auth();

  // Check if user has the 'paid' plan using Clerk Billing
  return has ? has({ plan: 'paid' }) : false;
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
 * Returns 'paid' or 'free_user' based on Clerk Billing
 */
export async function getUserPlan() {
  const { has } = await auth();

  if (!has) {
    return 'free_user';
  }

  // Check if user has the 'paid' plan
  if (has({ plan: 'paid' })) {
    return 'paid';
  }

  return 'free_user';
}
