import { PremiumFlashcardProps } from "./types";
import { useFlashcardState } from "./useFlashcardState";
import { FlashcardContainer } from "./FlashcardContainer";

export default function PremiumFlashcard({
  cardData,
  mediaData = {},
  handlers = {}
}: PremiumFlashcardProps) {
  const { isBookmarked = false, flashcardId } = cardData;

  const state = useFlashcardState(isBookmarked, flashcardId, handlers);

  return (
    <FlashcardContainer
      cardData={cardData}
      mediaData={mediaData}
      state={state}
    />
  );
}
