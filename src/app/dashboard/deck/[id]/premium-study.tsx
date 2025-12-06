"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { toast } from "sonner";

// Premium components
import PremiumFlashcard from "@/components/study/PremiumFlashcard";
import PremiumConfidenceRating from "@/components/study/PremiumConfidenceRating";
import StudyProgressHeader from "@/components/study/StudyProgressHeader";
import KeyboardShortcutsOverlay from "@/components/study/KeyboardShortcutsOverlay";
import CompletionCelebration from "@/components/study/CompletionCelebration";
import CyberBackground from "@/components/study/CyberBackground";

interface FlashcardMedia {
  id: string;
  fileUrl: string;
  altText: string | null;
  placement: string;
  order: number;
}

interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  explanation: string | null;
  deckName: string;
  className: string;
  media: FlashcardMedia[];
  domain?: number;
  tags?: string[];
}

interface DeckData {
  id: string;
  name: string;
  description: string | null;
  classId: string;
  className: string;
}

export default function PremiumDeckStudyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const deckId = params.id as string;
  const mode = searchParams.get('mode') || 'progressive';

  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  // User stats (would normally come from API)
  const [userStats, setUserStats] = useState({
    streak: 5,
    dailyGoal: 50,
    cardsToday: 23,
    accuracy: 0,
  });

  // Settings
  const [backgroundVariant, setBackgroundVariant] = useState<"matrix" | "grid" | "particles" | "none">("grid");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const currentCard = flashcards[currentIndex];
  const allCardsStudied = studiedCards.size === flashcards.length && flashcards.length > 0;

  // Load flashcards
  useEffect(() => {
    loadFlashcards();
  }, [deckId, mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (!isFlipped && !showRating) {
            handleFlip();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (showRating) {
            e.preventDefault();
            handleRate(parseInt(e.key));
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'b':
        case 'B':
          if (currentCard) {
            e.preventDefault();
            handleBookmarkToggle(currentCard.id, !bookmarkedCards.has(currentCard.id));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, showRating, isFlipped, currentCard, bookmarkedCards]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/flashcards`, {
        cache: 'default',
      });
      if (!res.ok) throw new Error("Failed to load flashcards");

      const data = await res.json();
      setDeck(data.deck);

      let cards = data.flashcards || [];

      if (mode === 'random') {
        cards = [...cards].sort(() => Math.random() - 0.5);
      }

      setFlashcards(cards);
    } catch {
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(true);
    setTimeout(() => setShowRating(true), 400);
  };

  const handleRate = async (confidence: number) => {
    if (!currentCard) return;

    try {
      const res = await fetch("/api/progress/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcardId: currentCard.id,
          confidenceLevel: confidence,
        }),
      });

      if (!res.ok) throw new Error("Failed to save progress");

      const newStudied = new Set(studiedCards);
      newStudied.add(currentIndex);
      setStudiedCards(newStudied);

      // Update stats
      setUserStats(prev => ({
        ...prev,
        cardsToday: prev.cardsToday + 1,
        accuracy: Math.round(((prev.accuracy * prev.cardsToday + (confidence / 5 * 100)) / (prev.cardsToday + 1)))
      }));

      // Auto-advance to next card
      if (currentIndex < flashcards.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setShowRating(false);
          setIsFlipped(false);
        }, 300);
      } else {
        // Session complete
        setTimeout(() => {
          setShowRating(false);
        }, 300);
      }
    } catch (error) {
      toast.error("Failed to save your rating");
      console.error("Error saving progress:", error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowRating(false);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowRating(false);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setStudiedCards(new Set());
    setShowRating(false);
    setIsFlipped(false);
    toast.success("Progress reset! Starting from card 1");
  };

  const handleBookmarkToggle = async (flashcardId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flashcardId }),
        });
        if (!res.ok) throw new Error('Failed to add bookmark');
        setBookmarkedCards(prev => new Set(prev).add(flashcardId));
        toast.success("Card bookmarked!");
      } else {
        const res = await fetch(`/api/bookmarks/${flashcardId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to remove bookmark');
        setBookmarkedCards(prev => {
          const updated = new Set(prev);
          updated.delete(flashcardId);
          return updated;
        });
        toast.success("Bookmark removed");
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error("Failed to update bookmark");
    }
  };

  const getTimeSpent = () => {
    return Math.round((Date.now() - sessionStartTime) / 60000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-bg via-cyber-bg-light to-cyber-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin mb-4" />
          <p className="text-cyber-cyan-light text-lg">Loading your study session...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-bg via-cyber-bg-light to-cyber-bg">
        <CyberBackground variant={backgroundVariant} intensity="low" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Link href={deck?.classId ? `/dashboard/class/${deck.classId}` : "/dashboard"}>
            <Button variant="ghost" className="text-white mb-6 hover:bg-cyber-cyan/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {deck?.className || "Dashboard"}
            </Button>
          </Link>
          <div className="text-center text-white mt-12">
            <h2 className="text-2xl font-bold mb-4">No flashcards available</h2>
            <p className="text-slate-400">This deck doesn't have any flashcards yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-bg via-cyber-bg-light to-cyber-bg">
      {/* Cyber Background */}
      <CyberBackground variant={backgroundVariant} intensity="low" />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={deck?.classId ? `/dashboard/class/${deck.classId}` : "/dashboard"}>
            <Button variant="ghost" className="text-white hover:bg-cyber-cyan/10 border border-cyber-cyan/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {deck?.className || "Dashboard"}
            </Button>
          </Link>

          <Button
            onClick={() => setShowKeyboardHelp(true)}
            variant="outline"
            className="border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Shortcuts
          </Button>
        </div>

        {/* Progress Header */}
        {!allCardsStudied && (
          <StudyProgressHeader
            currentCard={currentIndex + 1}
            totalCards={flashcards.length}
            streak={userStats.streak}
            dailyGoal={userStats.dailyGoal}
            cardsToday={userStats.cardsToday}
            studyMode={mode as "progressive" | "random"}
            domainName={deck?.name}
          />
        )}

        {/* Main Study Area */}
        {!allCardsStudied ? (
          <div className="space-y-8">
            {/* Flashcard */}
            {currentCard && (
              <PremiumFlashcard
                flashcardId={currentCard.id}
                question={currentCard.question}
                answer={currentCard.answer}
                isBookmarked={bookmarkedCards.has(currentCard.id)}
                questionImages={currentCard.media?.filter(m => m.placement === 'question').sort((a, b) => a.order - b.order).map(m => ({
                  id: m.id,
                  url: m.fileUrl,
                  altText: m.altText,
                  placement: m.placement,
                  order: m.order
                }))}
                answerImages={currentCard.media?.filter(m => m.placement === 'answer').sort((a, b) => a.order - b.order).map(m => ({
                  id: m.id,
                  url: m.fileUrl,
                  altText: m.altText,
                  placement: m.placement,
                  order: m.order
                }))}
                domainNumber={currentCard.domain}
                tags={currentCard.tags}
                onFlip={handleFlip}
                onBookmarkToggle={handleBookmarkToggle}
              />
            )}

            {/* Confidence Rating */}
            {showRating && (
              <div className="animate-slide-up">
                <PremiumConfidenceRating onRate={handleRate} />
              </div>
            )}

            {/* Study Tip */}
            {!showRating && (
              <div className="max-w-2xl mx-auto glass rounded-xl p-4 border border-cyber-cyan/20">
                <p className="text-sm text-slate-300 text-center">
                  💡 <span className="font-semibold text-cyber-cyan">Pro Tip:</span>{' '}
                  Press <kbd className="px-2 py-1 bg-cyber-bg border border-cyber-cyan/40 rounded text-xs">SPACE</kbd> to flip the card,
                  then rate your confidence with keys <kbd className="px-2 py-1 bg-cyber-bg border border-cyber-cyan/40 rounded text-xs">1-5</kbd>
                </p>
              </div>
            )}
          </div>
        ) : (
          <CompletionCelebration
            cardsCompleted={flashcards.length}
            accuracy={userStats.accuracy}
            streak={userStats.streak}
            timeSpent={getTimeSpent()}
            onRestart={handleReset}
            backLink={deck?.classId ? `/dashboard/class/${deck.classId}` : "/dashboard"}
            backLinkLabel={deck?.className || "Dashboard"}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay
        onClose={() => setShowKeyboardHelp(false)}
        autoHideAfterSessions={3}
      />
    </div>
  );
}
