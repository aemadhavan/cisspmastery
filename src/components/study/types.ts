export interface FlashcardMedia {
    id: string;
    url: string;
    altText: string | null;
    placement: string;
    order: number;
}

export interface CardData {
    question: string;
    answer: string;
    flashcardId?: string;
    isBookmarked?: boolean;
    domainNumber?: number;
    tags?: string[];
}

export interface MediaData {
    questionImages?: FlashcardMedia[];
    answerImages?: FlashcardMedia[];
}

export interface CardHandlers {
    onFlip?: () => void;
    onBookmarkToggle?: (flashcardId: string, isBookmarked: boolean) => void;
}

export interface PremiumFlashcardProps {
    cardData: CardData;
    mediaData?: MediaData;
    handlers?: CardHandlers;
}
