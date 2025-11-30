import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FlashcardMedia {
    id: string;
    fileUrl: string;
    altText: string | null;
    placement: string;
    order: number;
}

export interface BookmarkedCard {
    id: string;
    flashcardId: string;
    question: string;
    answer: string;
    deckId: string;
    deckName: string;
    classId: string;
    className: string;
    bookmarkedAt: string;
    media: FlashcardMedia[];
}

export function useBookmarkLoader(startIndex: number) {
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<BookmarkedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const loadBookmarks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bookmarks');
            if (!res.ok) throw new Error('Failed to load bookmarks');

            const data = await res.json();
            const bookmarkedCards = data.bookmarks || [];

            if (bookmarkedCards.length === 0) {
                toast.info("No bookmarks to study");
                router.push('/dashboard/bookmarks');
                return;
            }

            setBookmarks(bookmarkedCards);

            // Validate start index
            if (startIndex >= bookmarkedCards.length) {
                setCurrentIndex(0);
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            toast.error("Failed to load bookmarks");
            router.push('/dashboard/bookmarks');
        } finally {
            setLoading(false);
        }
    }, [router, startIndex]);

    return {
        bookmarks,
        setBookmarks,
        loading,
        currentIndex,
        setCurrentIndex,
        loadBookmarks,
    };
}
