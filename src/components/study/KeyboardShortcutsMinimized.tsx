import React from "react";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsMinimizedProps {
    onRestore: () => void;
}

export function KeyboardShortcutsMinimized({
    onRestore,
}: KeyboardShortcutsMinimizedProps) {
    return (
        <button
            onClick={onRestore}
            className="fixed bottom-6 right-6 z-40 p-4 rounded-full glass-strong border-2 border-cyber-cyan/30 hover:border-cyber-cyan/60 hover:shadow-cyber-glow transition-all duration-300 group"
            aria-label="Show keyboard shortcuts"
        >
            <Keyboard className="w-6 h-6 text-cyber-cyan group-hover:text-cyber-cyan-light transition-colors" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-cyber-cyan rounded-full flex items-center justify-center text-xs font-bold text-cyber-bg">
                ?
            </span>
        </button>
    );
}
