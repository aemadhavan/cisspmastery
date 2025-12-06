import React from 'react';

interface ShortcutItemProps {
    shortcut: {
        key: string;
        description: string;
        icon: string;
    };
}

export const ShortcutItem = ({ shortcut }: ShortcutItemProps) => {
    return (
        <div
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyber-bg-light/50 to-cyber-bg-lighter/50 border border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors group"
        >
            {/* Key */}
            <div className="flex-shrink-0 min-w-[60px] flex justify-center">
                <kbd className="px-3 py-2 bg-cyber-bg border-2 border-cyber-cyan/40 rounded-lg font-mono text-lg font-bold text-cyber-cyan-light group-hover:text-cyber-cyan group-hover:border-cyber-cyan/60 transition-all shadow-lg">
                    {shortcut.icon}
                </kbd>
            </div>

            {/* Description */}
            <div className="flex-1 text-slate-300 text-sm group-hover:text-white transition-colors">
                {shortcut.description}
            </div>
        </div>
    );
};
