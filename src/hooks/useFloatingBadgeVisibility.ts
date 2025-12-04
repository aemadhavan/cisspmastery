import { useState, useEffect } from "react";

const SCROLL_THRESHOLD = 400;
const INITIAL_DELAY_MS = 2000;

export function useFloatingBadgeVisibility() {
    const [isVisible, setIsVisible] = useState(false);

    // Show badge after a short delay
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), INITIAL_DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    // Reveal badge once the user has scrolled far enough
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > SCROLL_THRESHOLD) {
                setIsVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return { isVisible, setIsVisible };
}
