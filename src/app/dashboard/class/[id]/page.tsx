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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Performance Monitoring */}
      <PerformanceMonitor pageName="Class Detail Page (SSR)" showVisual={false} />

      {/* Header with Back Button */}
      <div className="border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Client Component with Interactive Features */}
      <ClassDetailClient classData={classData} isAdmin={isAdmin} />
    </div>
  );
}
