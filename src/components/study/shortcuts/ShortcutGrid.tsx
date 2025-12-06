import React from 'react';
import { ShortcutItem } from './ShortcutItem';

const SHORTCUTS = [
    { key: "Space", description: "Flip card / Show answer", icon: "⎵" },
    { key: "1-5", description: "Rate confidence (1=Again, 5=Perfect)", icon: "1-5" },
    { key: "←", description: "Previous card", icon: "←" },
    { key: "→", description: "Next card", icon: "→" },
    { key: "B", description: "Bookmark current card", icon: "B" },
    { key: "?", description: "Show/hide this help", icon: "?" },
    { key: "Esc", description: "Close modals", icon: "Esc" },
];

export const ShortcutGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {SHORTCUTS.map((shortcut, index) => (
                <ShortcutItem key={index} shortcut={shortcut} />
            ))}
        </div>
    );
};
