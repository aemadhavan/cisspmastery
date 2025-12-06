import { useState, useEffect } from 'react';
import { CardHandlers, FlashcardMedia } from './types';

export interface FlashcardState {
    isFlipped: boolean;
    setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
    zoomedImage: FlashcardMedia | null;
    setZoomedImage: React.Dispatch<React.SetStateAction<FlashcardMedia | null>>;
    bookmarked: boolean;
    zoomScale: number;
    position: { x: number; y: number };
    isDragging: boolean;
    handleFlip: () => void;
    handleImageClick: (e: React.MouseEvent, img: FlashcardMedia) => void;
    closeZoom: (e?: React.MouseEvent) => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleResetZoom: () => void;
    handleWheel: (e: React.WheelEvent) => void;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleMouseMove: (e: React.MouseEvent) => void;
    handleMouseUp: () => void;
    handleBookmarkClick: (e: React.MouseEvent) => void;
}

export function useFlashcardState(
    initialBookmarked: boolean = false,
    flashcardId?: string,
    handlers: CardHandlers = {}
): FlashcardState {
    const { onFlip, onBookmarkToggle } = handlers;

    const [isFlipped, setIsFlipped] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<FlashcardMedia | null>(null);
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [zoomScale, setZoomScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        onFlip?.();
    };

    const handleImageClick = (e: React.MouseEvent, img: FlashcardMedia) => {
        e.stopPropagation();
        e.preventDefault();
        setZoomedImage(img);
    };

    const closeZoom = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomedImage(null);
        setZoomScale(1);
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
    };

    const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => {
        setZoomScale(prev => Math.max(prev - 0.5, 1));
        if (zoomScale - 0.5 <= 1) setPosition({ x: 0, y: 0 });
    };
    const handleResetZoom = () => {
        setZoomScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(zoomScale + delta, 1), 5);
        setZoomScale(newScale);
        if (newScale <= 1) setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoomScale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoomScale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (flashcardId && onBookmarkToggle) {
            const newBookmarkedState = !bookmarked;
            setBookmarked(newBookmarkedState);
            onBookmarkToggle(flashcardId, newBookmarkedState);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && zoomedImage) {
                closeZoom();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedImage]);

    return {
        isFlipped,
        setIsFlipped,
        zoomedImage,
        setZoomedImage,
        bookmarked,
        zoomScale,
        position,
        isDragging,
        handleFlip,
        handleImageClick,
        closeZoom,
        handleZoomIn,
        handleZoomOut,
        handleResetZoom,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleBookmarkClick
    };
}
