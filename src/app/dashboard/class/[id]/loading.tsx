import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" className="mb-4" disabled>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Class Info Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8">
            {/* Left: Class Info */}
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96 mb-4" />

              {/* Overall Progress */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>

            {/* Right: Study Controls */}
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-12 w-64" />
            </div>
          </div>

          {/* Deck List */}
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-16" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs and About */}
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-slate-200 mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
