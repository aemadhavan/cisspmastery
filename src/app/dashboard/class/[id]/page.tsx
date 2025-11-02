import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getClassWithProgress } from "@/lib/api/class-server";
import ClassDetailClient from "@/components/ClassDetailClient";
import PerformanceMonitor from "@/components/PerformanceMonitor";

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const classData = await getClassWithProgress(id);

  if (!classData) {
    return {
      title: "Class Not Found | CISSP Mastery",
    };
  }

  return {
    title: `${classData.name} | CISSP Mastery`,
    description: classData.description || `Study ${classData.name} with confidence-based flashcards`,
  };
}

// Server Component - Pre-renders HTML with data
export default async function ClassDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Get authentication
  const { userId } = await auth();
  const user = await currentUser();

  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Unwrap params
  const { id: classId } = await params;

  // Fetch class data server-side (with Redis caching)
  const classData = await getClassWithProgress(classId);

  // Redirect to dashboard if class not found
  if (!classData) {
    redirect("/dashboard");
  }

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Performance Monitoring */}
      <PerformanceMonitor pageName="Class Detail Page (SSR)" showVisual={false} />

      {/* Header with Back Button */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Client Component with Interactive Features */}
      <ClassDetailClient classData={classData} isAdmin={isAdmin} />

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-6">
            <button className="pb-3 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
              Decks ({classData.decks.length})
            </button>
            <button className="pb-3 px-1 border-b-2 border-transparent text-slate-600 hover:text-slate-800">
              Learners (0)
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">About this class</h2>
          <p className="text-slate-600">
            {classData.description || "No description available."}
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div>
              <span className="text-sm text-slate-500">Total Decks:</span>
              <span className="ml-2 font-semibold text-slate-800">{classData.decks.length}</span>
            </div>
            <div>
              <span className="text-sm text-slate-500">Total Cards:</span>
              <span className="ml-2 font-semibold text-slate-800">
                {classData.decks.reduce((sum, deck) => sum + deck.cardCount, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
