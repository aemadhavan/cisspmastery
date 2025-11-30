import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface SummaryCardProps {
  selectedDecksCount: number;
  totalSelectedCards: number;
  isStarting: boolean;
  onStartSession: () => void;
}

export function SummaryCard({
  selectedDecksCount,
  totalSelectedCards,
  isStarting,
  onStartSession,
}: SummaryCardProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Session Summary</h3>
            <p className="text-sm text-gray-400">
              {selectedDecksCount} deck{selectedDecksCount !== 1 ? 's' : ''} selected • {totalSelectedCards} card{totalSelectedCards !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={onStartSession}
            disabled={selectedDecksCount === 0 || isStarting}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Play className="w-5 h-5 mr-2 fill-white" />
            {isStarting ? 'Starting...' : 'Start Session'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
