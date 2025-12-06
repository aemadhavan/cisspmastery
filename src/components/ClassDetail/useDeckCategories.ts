import { useMemo } from "react";
import type { Deck } from "@/lib/api/class-server";
import {
  extractDomainFromDeckName,
  extractDayNumberFromDeckName,
  getDomainInfo
} from "@/lib/utils/cissp-domains";

export interface EnrichedDeck extends Deck {
  domain: number | null;
  domainName?: string;
  dayNumber: number;
}

// Helper: Check if deck name contains a day number
const hasDayNumber = (deckName: string): boolean =>
  deckName.toLowerCase().includes('day ');

// Helper: Check if deck is a flashcard type
const isFlashcard = (deck: { type: string }): boolean =>
  deck.type === 'flashcard';

// Helper: Enrich a single deck with domain and day info
function enrichDeck(deck: Deck): EnrichedDeck {
  const domain = extractDomainFromDeckName(deck.name);
  const domainInfo = domain ? getDomainInfo(domain) : null;
  const dayNumber = extractDayNumberFromDeckName(deck.name) || deck.order + 1;

  return {
    ...deck,
    domain,
    domainName: domainInfo?.shortName,
    dayNumber,
  };
}

// Helper: Find deck with lowest progress from list
function findLowestProgressDeck(decks: EnrichedDeck[]): EnrichedDeck | null {
  if (decks.length === 0) return null;
  return decks.reduce((min, deck) =>
    deck.progress < min.progress ? deck : min
  );
}

export function useDeckCategories(decks: Deck[]) {
  // Enrich decks with domain and day information
  const enrichedDecks = useMemo<EnrichedDeck[]>(
    () => decks.map(enrichDeck),
    [decks]
  );

  // Categorize decks and calculate counts in a single pass
  const categorizedData = useMemo(() => {
    const structured: EnrichedDeck[] = [];
    const extra: EnrichedDeck[] = [];
    const practice: EnrichedDeck[] = [];
    const notMastered: EnrichedDeck[] = [];

    let notStartedCount = 0;
    let inProgressCount = 0;
    let masteredCount = 0;

    enrichedDecks.forEach(deck => {
      // Categorize by type and day
      if (deck.type === 'quiz') {
        practice.push(deck);
      } else if (isFlashcard(deck)) {
        if (hasDayNumber(deck.name)) {
          structured.push(deck);
        } else {
          extra.push(deck);
        }

        // Track not mastered flashcards for recommendation
        if (deck.progress < 90) {
          notMastered.push(deck);
        }
      }

      // Count by progress
      if (deck.progress === 0) {
        notStartedCount++;
      } else if (deck.progress < 90) {
        inProgressCount++;
      } else {
        masteredCount++;
      }
    });

    return {
      structuredPlanDecks: structured,
      extraDecks: extra,
      practiceDecks: practice,
      recommendedDeck: findLowestProgressDeck(notMastered),
      filterCounts: {
        all: enrichedDecks.length,
        notStarted: notStartedCount,
        inProgress: inProgressCount,
        mastered: masteredCount,
        quiz: practice.length,
      },
    };
  }, [enrichedDecks]);

  return {
    enrichedDecks,
    ...categorizedData,
  };
}
