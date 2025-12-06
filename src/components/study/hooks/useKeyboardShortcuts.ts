import { useState, useEffect, useCallback } from "react";
import { isHelpKey, isCloseKey } from "./keyboardUtils";

interface UseKeyboardShortcutsProps {
    onClose?: () => void;
    autoHideAfterSessions?: number;
    isOpen?: boolean;
}

export function useKeyboardShortcuts({
    onClose,
    autoHideAfterSessions = 3,
    isOpen = false,
}: UseKeyboardShortcutsProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);

    // Sync state with props
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (isMinimized) setIsMinimized(false);
        }
    }, [isOpen, isMinimized]);

    // Handle session counting and auto-show
    useEffect(() => {
        // Check if user has seen this before
        const seen = localStorage.getItem("keyboard-shortcuts-seen");
        const count = parseInt(seen || "0", 10);

        setSessionCount(count);

        if (count < autoHideAfterSessions) {
            // Show overlay for first few sessions
            const timer = setTimeout(() => setIsVisible(true), 1000);
            localStorage.setItem("keyboard-shortcuts-seen", String(count + 1));
            return () => clearTimeout(timer);
        }
    }, [autoHideAfterSessions]);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        onClose?.();
    }, [onClose]);

    // Keyboard event listeners
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Toggle help with '?' key
            if (isHelpKey(e)) {
                e.preventDefault();
                setIsVisible((prev) => !prev);
                if (isMinimized) setIsMinimized(false);
            }

            // Close with Escape
            if (isCloseKey(e, isVisible, isMinimized)) {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isVisible, isMinimized, handleClose]);

    const handleMinimize = useCallback(() => {
        setIsMinimized(true);
    }, []);

    const handleRestore = useCallback(() => {
        setIsVisible(true);
        setIsMinimized(false);
    }, []);

    return {
        isVisible,
        isMinimized,
        sessionCount,
        handleClose,
        handleMinimize,
        handleRestore,
        setIsVisible,
    };
}
