import { Check } from "lucide-react";

interface DeckItemProps {
  deckId: string;
  deckName: string;
  cardCount: number;
  isSelected: boolean;
  onToggle: () => void;
}

export function DeckItem({ deckName, cardCount, isSelected, onToggle }: DeckItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-blue-500/20 border-2 border-blue-500'
          : 'bg-slate-700/50 border-2 border-transparent hover:bg-slate-700'
      }`}
    >
      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
        isSelected
          ? 'bg-blue-500'
          : 'bg-slate-600 border border-slate-500'
      }`}>
        {isSelected && <Check className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-white">{deckName}</p>
        <p className="text-xs text-gray-400">{cardCount} cards</p>
      </div>
    </button>
  );
}
