import type { BookmarkedCard } from './useBookmarkLoader';

interface MediaImage {
    id: string;
    url: string;
    altText: string | null;
    placement: string;
    order: number;
}

export function mapMediaToImages(
    media: BookmarkedCard['media'],
    placement: 'question' | 'answer'
): MediaImage[] {
    return media
        ?.filter((m) => m.placement === placement)
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
            id: m.id,
            url: m.fileUrl,
            altText: m.altText,
            placement: m.placement,
            order: m.order,
        })) || [];
}
