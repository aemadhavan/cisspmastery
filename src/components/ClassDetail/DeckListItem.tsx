import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Play, Layers, ClipboardList } from "lucide-react";

interface DeckListItemProps {
  deck: {
    id: string;
    name: string;
    type: 'flashcard' | 'quiz';
    studiedCount: number;
    cardCount: number;
    progress: number;
  };
  isSelected: boolean;
  studyMode: string;
  onToggle: () => void;
}

export function DeckListItem({ deck, isSelected, studyMode, onToggle }: DeckListItemProps) {
  return (
    <Card
      className={`transition-all bg-white border shadow-sm ${
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={onToggle}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300'
            }`}>
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

          <div className="flex-shrink-0">
            {deck.type === 'quiz' ? (
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center" title="Quiz Deck">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center" title="Flashcard Deck">
                <Layers className="w-6 h-6 text-green-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {deck.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                deck.type === 'quiz'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {deck.type === 'quiz' ? 'Quiz' : 'Flashcard'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {deck.studiedCount} of {deck.cardCount} unique cards studied
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-blue-600">
              {deck.progress}%
            </div>
          </div>

          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Link href={`/dashboard/deck/${deck.id}?mode=${studyMode}`}>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 w-12 p-0"
              >
                <Play className="w-5 h-5 fill-white" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
