import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { DeckItem } from "./DeckItem";

export interface Deck {
  id: string;
  name: string;
  cardCount: number;
}

export interface ClassData {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  totalCards: number;
  progress: number;
  decks: Deck[];
}

export interface SelectionState {
  isSelected: boolean;
  isExpanded: boolean;
  selectedDeckCount: number;
  selectedDecks: Set<string>;
}

export interface ClassCardHandlers {
  onToggleClass: () => void;
  onToggleExpand: () => void;
  onToggleDeck: (deckId: string) => void;
}

export interface ClassCardProps {
  classData: ClassData;
  selectionState: SelectionState;
  handlers: ClassCardHandlers;
}

function getColorClass(color: string | null) {
  const colorMap: { [key: string]: string } = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500",
    teal: "bg-teal-500",
  };
  return colorMap[color || "purple"] || "bg-purple-500";
}

export function ClassCard({
  classData,
  selectionState,
  handlers,
}: ClassCardProps) {
  const { name, icon, color, totalCards, progress, decks } = classData;
  const { isSelected, isExpanded, selectedDeckCount, selectedDecks } = selectionState;
  const { onToggleClass, onToggleExpand, onToggleDeck } = handlers;
  return (
    <Card
      className={`bg-slate-800/50 border-2 transition-all ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onToggleClass}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                isSelected
                  ? 'bg-blue-500'
                  : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
              }`}
            >
              {isSelected && <Check className="w-6 h-6 text-white" />}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {icon && <span className="text-2xl">{icon}</span>}
                <div className={`w-3 h-3 rounded-full ${getColorClass(color)}`}></div>
              </div>
              <CardTitle className="text-lg text-white mb-1">{name}</CardTitle>
              <p className="text-sm text-gray-400">
                {decks.length} deck{decks.length !== 1 ? 's' : ''} • {totalCards} card{totalCards !== 1 ? 's' : ''}
                {selectedDeckCount > 0 && ` • ${selectedDeckCount} selected`}
              </p>
              <div className="mt-2">
                <Progress value={progress} className="h-2" aria-label={`${name} progress`} />
              </div>
            </div>

            {decks.length > 0 && (
              <button
                onClick={onToggleExpand}
                className="p-2 rounded-full hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2 pl-14">
            {decks.map((deck) => (
              <DeckItem
                key={deck.id}
                deckId={deck.id}
                deckName={deck.name}
                cardCount={deck.cardCount}
                isSelected={selectedDecks.has(deck.id)}
                onToggle={() => onToggleDeck(deck.id)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
