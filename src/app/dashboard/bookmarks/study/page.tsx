"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { QuizModal } from "@/components/QuizModal";
import { FlashcardDynamic as Flashcard } from "@/components/FlashcardDynamic";
import { useBookmarkLoader } from "../hooks/useBookmarkLoader";
import { useCardNavigation } from "../hooks/useCardNavigation";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { useBookmarkToggle } from "../hooks/useBookmarkToggle";
import { mapMediaToImages } from "../hooks/mapMediaToImages";

function BookmarkStudyContent() {
  const searchParams = useSearchParams();
  const startIndex = parseInt(searchParams.get('start') || '0');

  const {
    bookmarks,
    setBookmarks,
    loading,
    currentIndex,
    setCurrentIndex,
    loadBookmarks,
  } = useBookmarkLoader(startIndex);

  const { handleNext, handlePrevious } = useCardNavigation(
    bookmarks.length,
    setCurrentIndex
  );

  useKeyboardNavigation(handleNext, handlePrevious);

  const { handleBookmarkToggle } = useBookmarkToggle(
    bookmarks,
    setBookmarks,
    currentIndex,
    setCurrentIndex
  );

  const [showQuizModal, setShowQuizModal] = useState(false);

  const currentCard = bookmarks[currentIndex];
  const progress = bookmarks.length > 0 ? ((currentIndex + 1) / bookmarks.length) * 100 : 0;

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleTest = () => {
    setShowQuizModal(true);
  };

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

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">No bookmarks found</h1>
            <Link href="/dashboard/bookmarks">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                Back to Bookmarks
              </Button>
            </Link>
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
          <Link href="/dashboard/bookmarks">
            <Button variant="ghost" className="text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookmarks
            </Button>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-purple-400 mb-1">{currentCard.className}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Studying Bookmarks
              </h1>
              <p className="text-gray-400">
                Card {currentIndex + 1} of {bookmarks.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" aria-label="Bookmark study progress" />
          </div>
        </div>

        {/* Flashcard */}
        <div className="space-y-8">
          <Flashcard
            key={currentCard.flashcardId}
            flashcardId={currentCard.flashcardId}
            question={currentCard.question}
            answer={currentCard.answer}
            isBookmarked={true}
            questionImages={mapMediaToImages(currentCard.media, 'question')}
            answerImages={mapMediaToImages(currentCard.media, 'answer')}
            onTest={handleTest}
            onBookmarkToggle={handleBookmarkToggle}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="border-purple-400 text-purple-200 hover:bg-purple-500/10"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              className="border-purple-400 text-purple-200 hover:bg-purple-500/10"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Study Info */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">💡 Navigation Tips</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Use arrow keys (← →) to navigate between cards</li>
              <li>• Click the card to flip and see the answer</li>
              <li>• Remove bookmarks you&apos;ve mastered to focus on harder cards</li>
              <li>• Cards loop automatically - keep practicing!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {currentCard && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          flashcardId={currentCard.flashcardId}
          flashcardQuestion={currentCard.question}
        />
      )}
    </div>
  );
}

export default function BookmarkStudyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </div>
      </div>
    }>
      <BookmarkStudyContent />
    </Suspense>
  );
}
