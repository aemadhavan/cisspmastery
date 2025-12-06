import { useMemo } from "react";
import type { DeckFilter } from "./FilterBar";

interface DeckWithProgress {
  id: string;
  progress: number;
  type: "flashcard" | "quiz";
}

// Filter predicate functions
const FILTER_PREDICATES: Record<DeckFilter, (deck: DeckWithProgress) => boolean> = {
  all: () => true,
  "not-started": (deck) => deck.progress === 0,
  "in-progress": (deck) => deck.progress > 0 && deck.progress < 90,
  mastered: (deck) => deck.progress >= 90,
  quiz: (deck) => deck.type === 'quiz',
};

function matchesFilter<T extends DeckWithProgress>(deck: T, filter: DeckFilter): boolean {
  const predicate = FILTER_PREDICATES[filter];
  return predicate ? predicate(deck) : true;
}

export function useDeckFiltering<T extends DeckWithProgress>(
  decks: T[],
  activeFilter: DeckFilter,
  excludeDeckId?: string | null
) {
  return useMemo(() => {
    return decks.filter(deck => {
      if (excludeDeckId && deck.id === excludeDeckId) return false;
      return matchesFilter(deck, activeFilter);
    });
  }, [decks, activeFilter, excludeDeckId]);
}
