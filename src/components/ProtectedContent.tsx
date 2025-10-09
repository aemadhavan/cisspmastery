'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ProtectedContentProps {
  children: React.ReactNode;
  plan?: string;
  feature?: string;
}

/**
 * Component to protect content based on user's subscription plan
 * TODO: Implement proper subscription checking with Clerk metadata or database
 */
export default function ProtectedContent({
  children,
}: ProtectedContentProps) {
  const { user } = useUser();

  // TODO: Check user subscription status from user metadata or database
  // For now, show content to all authenticated users
  const hasAccess = !!user;

  if (!hasAccess) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold text-white">Premium Content</h3>
          <p className="text-gray-300">
            This content is available exclusively for paid subscribers.
            Upgrade now to unlock all features.
          </p>
          <div className="pt-4">
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
