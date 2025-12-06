import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeGestureWithFeedback } from "@/hooks/useSwipeGesture";

import { useFlashcardState } from "./useFlashcardState";
import { FlashcardContainer } from "./FlashcardContainer";
import { CardData, MediaData, CardHandlers } from "./types";

interface SwipeConfig {
  enableSwipe?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  currentIndex?: number;
  totalCards?: number;
}

interface PremiumFlashcardWithSwipeProps {
  cardData: CardData;
  mediaData?: MediaData;
  swipeConfig?: SwipeConfig;
  handlers?: CardHandlers;
}

export default function PremiumFlashcardWithSwipe({
  cardData,
  mediaData = {},
  swipeConfig = {},
  handlers = {}
}: PremiumFlashcardWithSwipeProps) {
  const { isBookmarked = false, flashcardId } = cardData;
  const { enableSwipe = true, onSwipeLeft, onSwipeRight, currentIndex, totalCards } = swipeConfig;

  const [showSwipeHint, setShowSwipeHint] = useState(false);

  const state = useFlashcardState(isBookmarked, flashcardId, handlers);

  // Swipe gesture hook with visual feedback
  const swipeRef = useSwipeGestureWithFeedback({
    onSwipeLeft: enableSwipe ? onSwipeLeft : undefined,
    onSwipeRight: enableSwipe ? onSwipeRight : undefined,
    minSwipeDistance: 80,
    maxSwipeTime: 400,
  });

  // Show swipe hint on first card on mobile
  useEffect(() => {
    if (currentIndex === 0 && window.innerWidth < 768) {
      const hasSeenHint = localStorage.getItem('swipe-hint-seen');
      if (!hasSeenHint) {
        setShowSwipeHint(true);
        setTimeout(() => {
          setShowSwipeHint(false);
          localStorage.setItem('swipe-hint-seen', 'true');
        }, 3000);
      }
    }
  }, [currentIndex]);

  return (
    <FlashcardContainer
      cardData={cardData}
      mediaData={mediaData}
      state={state}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      swipeRef={swipeRef as any}
    >
      {/* Swipe Hint (Mobile only, first card) */}
      {showSwipeHint && enableSwipe && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-50 pointer-events-none">
          <div className="flex items-center justify-between px-8 animate-pulse">
            <div className="flex items-center gap-2 bg-cyber-cyan/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyber-cyan/50">
              <ChevronLeft className="w-6 h-6 text-cyber-cyan animate-bounce-horizontal" />
              <span className="text-white text-sm font-semibold">Swipe</span>
            </div>
            <div className="flex items-center gap-2 bg-cyber-cyan/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyber-cyan/50">
              <span className="text-white text-sm font-semibold">Swipe</span>
              <ChevronRight className="w-6 h-6 text-cyber-cyan animate-bounce-horizontal" />
            </div>
          </div>
        </div>
      )}

      {/* Card position indicator (Mobile only) */}
      {currentIndex !== undefined && totalCards !== undefined && (
        <div className="md:hidden absolute -top-12 left-0 right-0 flex justify-center gap-1.5 z-10">
          {Array.from({ length: Math.min(totalCards, 10) }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex % 10
                ? 'w-8 bg-cyber-cyan shadow-neon-cyan'
                : 'w-1.5 bg-slate-600'
                }`}
            />
          ))}
        </div>
      )}
    </FlashcardContainer>
  );
}
