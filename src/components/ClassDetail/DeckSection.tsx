import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ModernDeckCard } from "./ModernDeckCard";
import type { EnrichedDeck } from "./useDeckCategories";

type StudyMode = "progressive" | "random";

interface ExpansionState {
  isExpanded: boolean;
  onToggle: () => void;
}

interface SelectionState {
  selectedDecks: Set<string>;
  onToggleDeck: (deckId: string) => void;
}

interface FilterConfig {
  studyMode: StudyMode;
  recommendedDeckId?: string | null;
  activeFilter: string;
}

interface DeckSectionProps {
  title: string;
  decks: EnrichedDeck[];
  expansion: ExpansionState;
  selection: SelectionState;
  filterConfig: FilterConfig;
}

// Helper: Check if deck should be marked as recommended
function isDeckRecommended(
  deckId: string,
  recommendedDeckId: string | null | undefined,
  activeFilter: string
): boolean {
  return deckId === recommendedDeckId && activeFilter !== "all";
}

// Component: Empty state when no decks match filter
function EmptyState() {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="py-8 text-center text-gray-500">
        No decks match the current filter.
      </CardContent>
    </Card>
  );
}

export function DeckSection({
  title,
  decks,
  expansion,
  selection,
  filterConfig,
}: DeckSectionProps) {
  const { isExpanded, onToggle: onToggleExpand } = expansion;
  const { selectedDecks, onToggleDeck } = selection;
  const { studyMode, recommendedDeckId, activeFilter } = filterConfig;

  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <div>
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between mb-4 text-left"
      >
        <h2 className="text-2xl font-bold text-gray-900">
          {title}
          <span className="ml-3 text-sm font-normal text-gray-500">
            ({decks.length} decks)
          </span>
        </h2>
        <ChevronIcon className="w-6 h-6 text-gray-600" />
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {decks.length === 0 ? (
            <EmptyState />
          ) : (
            decks.map((deck) => (
              <ModernDeckCard
                key={deck.id}
                deck={{
                  ...deck,
                  isRecommended: isDeckRecommended(deck.id, recommendedDeckId, activeFilter),
                }}
                isSelected={selectedDecks.has(deck.id)}
                onToggle={() => onToggleDeck(deck.id)}
                studyMode={studyMode}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
