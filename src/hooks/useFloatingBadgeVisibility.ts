import { useState, useEffect } from 'react';

export function useFloatingBadgeVisibility() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show badge after a short delay
        const timer = setTimeout(() => setIsVisible(true), 2000);

        // Handle scroll to hide/show badge
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            // Show badge when user scrolls down a bit
            if (scrollPosition > 400) {
                setIsVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return { isVisible, setIsVisible };
}
