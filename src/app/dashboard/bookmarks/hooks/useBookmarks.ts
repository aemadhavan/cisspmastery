import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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
}

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<BookmarkedCard[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBookmarks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bookmarks');
            if (!res.ok) throw new Error('Failed to load bookmarks');

            const data = await res.json();
            setBookmarks(data.bookmarks || []);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            toast.error("Failed to load bookmarks");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRemoveBookmark = useCallback(async (flashcardId: string) => {
        try {
            const res = await fetch(`/api/bookmarks/${flashcardId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to remove bookmark');

            setBookmarks(prev => prev.filter(b => b.flashcardId !== flashcardId));
            toast.success("Bookmark removed");
        } catch (error) {
            console.error('Error removing bookmark:', error);
            toast.error("Failed to remove bookmark");
        }
    }, []);

    useEffect(() => {
        loadBookmarks();
    }, [loadBookmarks]);

    return {
        bookmarks,
        loading,
        handleRemoveBookmark,
    };
}
