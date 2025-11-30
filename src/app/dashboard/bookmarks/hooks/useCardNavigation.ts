import { useCallback } from 'react';

export function useCardNavigation(
    bookmarksLength: number,
    setCurrentIndex: (value: number | ((prev: number) => number)) => void
) {
    const handleNext = useCallback(() => {
        if (bookmarksLength === 0) return;
        // Loop to beginning when reaching the end
        setCurrentIndex((prev) => (prev + 1) % bookmarksLength);
    }, [bookmarksLength, setCurrentIndex]);

    const handlePrevious = useCallback(() => {
        if (bookmarksLength === 0) return;
        // Loop to end when at beginning
        setCurrentIndex((prev) => (prev - 1 + bookmarksLength) % bookmarksLength);
    }, [bookmarksLength, setCurrentIndex]);

    return { handleNext, handlePrevious };
}
