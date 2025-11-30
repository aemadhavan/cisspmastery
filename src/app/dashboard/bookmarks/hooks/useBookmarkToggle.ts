import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { BookmarkedCard } from './useBookmarkLoader';

export function useBookmarkToggle(
    bookmarks: BookmarkedCard[],
    setBookmarks: (bookmarks: BookmarkedCard[]) => void,
    currentIndex: number,
    setCurrentIndex: (index: number) => void
) {
    const router = useRouter();

    const handleBookmarkToggle = useCallback(
        async (flashcardId: string, isBookmarked: boolean) => {
            try {
                if (!isBookmarked) {
                    // Remove bookmark
                    const res = await fetch(`/api/bookmarks/${flashcardId}`, {
                        method: 'DELETE',
                    });

                    if (!res.ok) throw new Error('Failed to remove bookmark');

                    // Remove from local state
                    const updatedBookmarks = bookmarks.filter(
                        (b) => b.flashcardId !== flashcardId
                    );
                    setBookmarks(updatedBookmarks);

                    toast.success("Bookmark removed");

                    // If no more bookmarks, redirect back
                    if (updatedBookmarks.length === 0) {
                        toast.info("No more bookmarks to study");
                        router.push('/dashboard/bookmarks');
                        return;
                    }

                    // Adjust current index if needed
                    if (currentIndex >= updatedBookmarks.length) {
                        setCurrentIndex(updatedBookmarks.length - 1);
                    }
                } else {
                    // This shouldn't happen in bookmark study mode, but handle it anyway
                    const res = await fetch('/api/bookmarks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ flashcardId }),
                    });

                    if (!res.ok) throw new Error('Failed to add bookmark');
                    toast.success("Card bookmarked!");
                }
            } catch (error) {
                console.error('Bookmark error:', error);
                toast.error("Failed to update bookmark");
            }
        },
        [bookmarks, setBookmarks, currentIndex, setCurrentIndex, router]
    );

    return { handleBookmarkToggle };
}
