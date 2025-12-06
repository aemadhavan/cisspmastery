import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface DeckData {
    id: string;
    name: string;
    description: string | null;
    classId: string;
    className: string;
}

interface DeckCompletionStateProps {
    flashcardCount: number;
    deck: DeckData | null;
    onReset: () => void;
}

export function DeckCompletionState({ flashcardCount, deck, onReset }: DeckCompletionStateProps) {
    const className = deck?.className || "Unknown Class";

    return (
        <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white">
                Great Job!
            </h2>
            <p className="text-xl text-gray-300">
                You&apos;ve completed all {flashcardCount} cards in this deck.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    onClick={onReset}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Study Again
                </Button>
                <Link href={deck?.classId ? `/dashboard/class/${deck.classId}` : "/dashboard"}>
                    <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500/10 w-full sm:w-auto">
                        Back to {className}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
