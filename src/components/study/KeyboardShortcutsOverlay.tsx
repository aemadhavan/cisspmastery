"use client";

import { useKeyboardShortcuts } from "@/components/study/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsMinimized } from "@/components/study/KeyboardShortcutsMinimized";
import { KeyboardShortcutsModal } from "@/components/study/KeyboardShortcutsModal";

interface KeyboardShortcutsOverlayProps {
  onClose?: () => void;
  autoHideAfterSessions?: number;
  isOpen?: boolean;
}

export default function KeyboardShortcutsOverlay({
  onClose,
  autoHideAfterSessions = 3,
  isOpen = false,
}: KeyboardShortcutsOverlayProps) {
  const {
    isVisible,
    isMinimized,
    sessionCount,
    handleClose,
    handleMinimize,
    handleRestore,
  } = useKeyboardShortcuts({ onClose, autoHideAfterSessions, isOpen });

  if (isMinimized || (!isVisible && sessionCount >= autoHideAfterSessions)) {
    return <KeyboardShortcutsMinimized onRestore={handleRestore} />;
  }

  if (!isVisible) return null;

  return (
    <KeyboardShortcutsModal
      onClose={handleClose}
      onMinimize={handleMinimize}
      sessionCount={sessionCount}
      autoHideAfterSessions={autoHideAfterSessions}
    />
  );
}
