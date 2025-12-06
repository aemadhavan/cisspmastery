export const isHelpKey = (e: KeyboardEvent): boolean =>
    e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey;

export const isCloseKey = (e: KeyboardEvent, isVisible: boolean, isMinimized: boolean): boolean =>
    e.key === "Escape" && isVisible && !isMinimized;
