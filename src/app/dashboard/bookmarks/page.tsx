"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, GraduationCap } from "lucide-react";
import { useBookmarks } from "./hooks/useBookmarks";
import { BookmarkCard } from "./components/BookmarkCard";
import { EmptyBookmarksState } from "./components/EmptyBookmarksState";

export default function BookmarksPage() {
  const { bookmarks, loading, handleRemoveBookmark } = useBookmarks();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                My Bookmarks
              </h1>
              <p className="text-gray-400">
                {bookmarks.length} {bookmarks.length === 1 ? 'card' : 'cards'} bookmarked
              </p>
            </div>
            {bookmarks.length > 0 && (
              <Link href="/dashboard/bookmarks/study">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Study All Bookmarks
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Empty State or Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <EmptyBookmarksState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                bookmarks={bookmarks}
                onRemove={handleRemoveBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
