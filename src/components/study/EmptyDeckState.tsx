import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube } from "lucide-react";
import { DeckQuizModal } from "@/components/DeckQuizModal";

interface DeckData {
    id: string;
    name: string;
    description: string | null;
    classId: string;
    className: string;
}

interface EmptyDeckStateProps {
    deck: DeckData | null;
    deckHasQuiz: boolean;
    showDeckQuizModal: boolean;
    setShowDeckQuizModal: (show: boolean) => void;
    onDeckTest: () => void;
}

export function EmptyDeckState({
    deck,
    deckHasQuiz,
    showDeckQuizModal,
    setShowDeckQuizModal,
    onDeckTest
}: EmptyDeckStateProps) {
    const deckName = deck?.name || "Unknown Deck";
    const className = deck?.className || "Unknown Class";
    const deckId = deck?.id || "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href={deck?.classId ? `/dashboard/class/${deck.classId}` : "/dashboard"}>
                    <Button variant="ghost" className="text-white mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to {className}
                    </Button>
                </Link>

                <div className="mb-8">
                    <p className="text-sm text-purple-400 mb-1">{className}</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        {deckName}
                    </h1>

                    {/* Show Take Deck Test button if quiz available */}
                    {deckHasQuiz && (
                        <Button
                            onClick={onDeckTest}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                            <TestTube className="w-4 h-4 mr-2" />
                            Take Deck Test
                        </Button>
                    )}
                </div>

                <div className="text-center text-white mt-12">
                    <h2 className="text-xl font-bold mb-4">No flashcards available</h2>
                    <p className="text-gray-400">This deck doesn&apos;t have any flashcards yet.</p>
                    {deckHasQuiz && (
                        <p className="text-blue-400 mt-4">But you can still take the deck test above!</p>
                    )}
                </div>
            </div>

            {/* Deck Quiz Modal */}
            {deckHasQuiz && (
                <DeckQuizModal
                    isOpen={showDeckQuizModal}
                    onClose={() => setShowDeckQuizModal(false)}
                    deckId={deckId}
                    deckName={deckName}
                />
            )}
        </div>
    );
}
