import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShortcutGrid } from "./shortcuts/ShortcutGrid";

interface KeyboardShortcutsModalProps {
    onClose: () => void;
    onMinimize: () => void;
    sessionCount: number;
    autoHideAfterSessions: number;
}

export function KeyboardShortcutsModal({
    onClose,
    onMinimize,
    sessionCount,
    autoHideAfterSessions,
}: KeyboardShortcutsModalProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Overlay Panel */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 animate-scale-in">
                <div className="glass-strong border-2 border-cyber-cyan/40 rounded-2xl p-8 shadow-cyber-glow-strong">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white neon-text mb-2">
                                Keyboard Shortcuts
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Master these shortcuts to study faster
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={onMinimize}
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-white hover:bg-cyber-cyan/10"
                            >
                                <span className="text-xl">−</span>
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-white hover:bg-cyber-cyan/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <ShortcutGrid />

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-cyber-cyan/20">
                        <p className="text-xs text-slate-500">
                            Press{" "}
                            <kbd className="px-2 py-1 bg-cyber-bg border border-slate-600 rounded text-cyber-cyan">
                                ?
                            </kbd>{" "}
                            anytime to toggle this help
                        </p>
                        <Button
                            onClick={onClose}
                            className="bg-gradient-to-r from-cyber-cyan to-cyber-blue hover:from-cyber-cyan-light hover:to-cyber-blue text-white font-semibold px-6"
                        >
                            Got it!
                        </Button>
                    </div>

                    {/* First-time indicator */}
                    {sessionCount < autoHideAfterSessions && (
                        <div className="mt-4 p-3 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30">
                            <p className="text-xs text-cyber-cyan-light text-center">
                                ✨ This help will auto-hide after {autoHideAfterSessions} sessions.
                                Press{" "}
                                <kbd className="px-1.5 py-0.5 bg-cyber-bg border border-cyber-cyan/40 rounded text-xs">
                                    ?
                                </kbd>{" "}
                                to show it again anytime.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
