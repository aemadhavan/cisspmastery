import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface FlashcardMedia {
    id: string;
    fileUrl: string;
    altText: string | null;
    placement: string;
    order: number;
}

export interface FlashcardData {
    id: string;
    question: string;
    answer: string;
    explanation: string | null;
    deckName: string;
    className: string;
    media: FlashcardMedia[];
}

export interface DeckData {
    id: string;
    name: string;
    description: string | null;
    classId: string;
    className: string;
}

// Secure shuffle helper using crypto.getRandomValues()
const secureShuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomBuffer = new Uint32Array(1);
        crypto.getRandomValues(randomBuffer);
        const j = randomBuffer[0] % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export function useDeckData(deckId: string, mode: string) {
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [deck, setDeck] = useState<DeckData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadFlashcards = useCallback(async () => {
        if (!deckId) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/decks/${deckId}/flashcards`, {
                // Use default caching to respect server Cache-Control headers
                // This allows updates to be visible within 10 seconds
                cache: 'default',
            });
            if (!res.ok) throw new Error("Failed to load flashcards");

            const data = await res.json();
            setDeck(data.deck);

            let cards: FlashcardData[] = data.flashcards || [];

            // Apply study mode
            if (mode === 'random') {
                // Shuffle cards using cryptographically secure random
                cards = secureShuffleArray(cards);
            }
            // 'all' and 'progressive' modes use default order for individual decks

            setFlashcards(cards);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load flashcards');
            setError(error);
            toast.error("Failed to load flashcards");
        } finally {
            setLoading(false);
        }
    }, [deckId, mode]);

    useEffect(() => {
        loadFlashcards();
    }, [loadFlashcards]);

    return { flashcards, deck, loading, error, refetch: loadFlashcards };
}
