import { useMemo } from "react";
import type { DeckFilter } from "./FilterBar";

interface DeckWithProgress {
  id: string;
  progress: number;
  type: "flashcard" | "quiz";
}

function isInProgress(progress: number): boolean {
  return progress > 0 && progress < 90;
}

function matchesFilter<T extends DeckWithProgress>(deck: T, filter: DeckFilter): boolean {
  // Use switch statement for explicit, safe filtering (prevents dynamic code execution)
  switch (filter) {
    case "all":
      return true;
    case "not-started":
      return deck.progress === 0;
    case "in-progress":
      return isInProgress(deck.progress);
    case "mastered":
      return deck.progress >= 90;
    case "quiz":
      return deck.type === 'quiz';
    default:
      // Exhaustive check - TypeScript will error if a DeckFilter case is missing
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = filter;
      return true;
  }
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
