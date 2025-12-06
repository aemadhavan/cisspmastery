"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, Maximize2, Bookmark, BookmarkCheck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DOMPurify from "isomorphic-dompurify";
import { useSwipeGestureWithFeedback } from "@/hooks/useSwipeGesture";

interface FlashcardMedia {
  id: string;
  url: string;
  altText: string | null;
  placement: string;
  order: number;
}

interface PremiumFlashcardWithSwipeProps {
  question: string;
  answer: string;
  questionImages?: FlashcardMedia[];
  answerImages?: FlashcardMedia[];
  flashcardId?: string;
  isBookmarked?: boolean;
  domainNumber?: number;
  tags?: string[];
  onFlip?: () => void;
  onBookmarkToggle?: (flashcardId: string, isBookmarked: boolean) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enableSwipe?: boolean;
  currentIndex?: number;
  totalCards?: number;
}

interface FlashcardContentAreaProps {
  sanitizedHtml: string;
  images: FlashcardMedia[];
  onImageClick: (e: React.MouseEvent, img: FlashcardMedia) => void;
  borderColor: string;
}

function FlashcardContentArea({
  sanitizedHtml,
  images,
  onImageClick,
  borderColor,
}: FlashcardContentAreaProps) {
  const getGridLayoutClass = () => {
    if (images.length === 0) return '';
    if (images.length === 1) return 'w-full max-w-xl';
    return 'w-full grid grid-cols-2 gap-4';
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-2" style={{ maxHeight: 'calc(700px - 180px)' }}>
      <div className="flex flex-col items-center">
        <div
          className="text-base md:text-lg text-slate-100 text-left leading-relaxed mb-6 max-w-5xl prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        {images.length > 0 && (
          <div className={getGridLayoutClass()}>
            {images.map((img) => (
              <div
                key={img.id}
                className="relative w-full group cursor-zoom-in"
                onClick={(e) => onImageClick(e, img)}
              >
                <Image
                  src={img.url}
                  alt={img.altText || 'Flashcard image'}
                  width={500}
                  height={300}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
                  className={`rounded-lg border-2 ${borderColor} object-contain w-full h-auto max-h-64 transition-all duration-300 group-hover:border-cyber-cyan group-hover:shadow-cyber-glow`}
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-cyber-bg/90 backdrop-blur-sm text-cyber-cyan-light p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PremiumFlashcardWithSwipe({
  question,
  answer,
  questionImages = [],
  answerImages = [],
  flashcardId,
  isBookmarked = false,
  domainNumber,
  tags = [],
  onFlip,
  onBookmarkToggle,
  onSwipeLeft,
  onSwipeRight,
  enableSwipe = true,
  currentIndex,
  totalCards
}: PremiumFlashcardWithSwipeProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<FlashcardMedia | null>(null);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Swipe gesture hook with visual feedback
  const swipeRef = useSwipeGestureWithFeedback({
    onSwipeLeft: enableSwipe ? onSwipeLeft : undefined,
    onSwipeRight: enableSwipe ? onSwipeRight : undefined,
    minSwipeDistance: 80,
    maxSwipeTime: 400,
  });

  const sanitizedQuestion = useMemo(() => {
    if (typeof window === 'undefined') return question;
    return DOMPurify.sanitize(question, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'a'
      ],
      ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SAFE_FOR_TEMPLATES: true,
      RETURN_TRUSTED_TYPE: false
    });
  }, [question]);

  const sanitizedAnswer = useMemo(() => {
    if (typeof window === 'undefined') return answer;
    return DOMPurify.sanitize(answer, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'a'
      ],
      ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SAFE_FOR_TEMPLATES: true,
      RETURN_TRUSTED_TYPE: false
    });
  }, [answer]);

  // Show swipe hint on first card on mobile
  useEffect(() => {
    if (currentIndex === 0 && window.innerWidth < 768) {
      const hasSeenHint = localStorage.getItem('swipe-hint-seen');
      if (!hasSeenHint) {
        setShowSwipeHint(true);
        setTimeout(() => {
          setShowSwipeHint(false);
          localStorage.setItem('swipe-hint-seen', 'true');
        }, 3000);
      }
    }
  }, [currentIndex]);

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

  return (
    <div className="perspective-1000 w-full max-w-7xl mx-auto relative">
      {/* Swipe Hint (Mobile only, first card) */}
      {showSwipeHint && enableSwipe && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-50 pointer-events-none">
          <div className="flex items-center justify-between px-8 animate-pulse">
            <div className="flex items-center gap-2 bg-cyber-cyan/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyber-cyan/50">
              <ChevronLeft className="w-6 h-6 text-cyber-cyan animate-bounce-horizontal" />
              <span className="text-white text-sm font-semibold">Swipe</span>
            </div>
            <div className="flex items-center gap-2 bg-cyber-cyan/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyber-cyan/50">
              <span className="text-white text-sm font-semibold">Swipe</span>
              <ChevronRight className="w-6 h-6 text-cyber-cyan animate-bounce-horizontal" />
            </div>
          </div>
        </div>
      )}

      {/* Card position indicator (Mobile only) */}
      {currentIndex !== undefined && totalCards !== undefined && (
        <div className="md:hidden absolute -top-12 left-0 right-0 flex justify-center gap-1.5 z-10">
          {Array.from({ length: Math.min(totalCards, 10) }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex % 10
                  ? 'w-8 bg-cyber-cyan shadow-neon-cyan'
                  : 'w-1.5 bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}

      <div
        ref={swipeRef as any}
        className={`relative w-full min-h-[600px] md:min-h-[700px] transition-transform duration-700 preserve-3d cursor-pointer`}
        onClick={handleFlip}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* Front of card (Question) */}
        <Card
          className="absolute inset-0 backface-hidden glass-strong border-2 border-cyber-cyan/30 hover-glow overflow-hidden touch-manipulation"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
        >
          <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />

          <div className="relative flex flex-col h-full p-6 md:p-10">
            <div className="flex-shrink-0 flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-xs font-bold text-cyber-cyan neon-text tracking-wider">
                    QUESTION
                  </div>
                  {domainNumber && (
                    <div className="px-3 py-1 rounded-full bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-cyan-light text-xs font-semibold">
                      Domain {domainNumber}
                    </div>
                  )}
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded text-xs bg-cyber-purple/20 border border-cyber-purple/40 text-purple-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <FlashcardContentArea
              sanitizedHtml={sanitizedQuestion}
              images={questionImages}
              onImageClick={handleImageClick}
              borderColor="border-cyber-cyan/40"
            />

            <div className="flex-shrink-0 mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan-light text-sm font-medium hover:bg-cyber-cyan/20 transition-colors">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Tap or press SPACE to reveal answer</span>
                <span className="sm:hidden">Tap to reveal</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Back of card (Answer) */}
        <Card
          className="absolute inset-0 backface-hidden glass-strong border-2 border-cyber-purple/40 shadow-neon-purple overflow-hidden touch-manipulation"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="absolute inset-0 cyber-grid-bg opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 via-transparent to-cyber-blue/10 pointer-events-none" />

          <div className="relative flex flex-col h-full p-6 md:p-10">
            <div className="flex-shrink-0 flex items-center justify-between mb-6">
              <div className="flex-1 flex items-center gap-3">
                <div className="text-xs font-bold text-cyber-purple-dark neon-text-purple tracking-wider">
                  ANSWER
                </div>
                {domainNumber && (
                  <div className="px-3 py-1 rounded-full bg-cyber-purple/20 border border-cyber-purple/50 text-purple-300 text-xs font-semibold">
                    Domain {domainNumber}
                  </div>
                )}
              </div>

              {flashcardId && onBookmarkToggle && (
                <Button
                  onClick={handleBookmarkClick}
                  variant="ghost"
                  size="sm"
                  className="text-purple-300 hover:text-cyber-cyan-light hover:bg-cyber-purple/20 transition-all duration-300 border border-transparent hover:border-cyber-cyan/30"
                >
                  {bookmarked ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </Button>
              )}
            </div>

            <FlashcardContentArea
              sanitizedHtml={sanitizedAnswer}
              images={answerImages}
              onImageClick={handleImageClick}
              borderColor="border-cyber-purple/50"
            />

            <div className="flex-shrink-0 mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyber-purple/10 border border-cyber-purple/30 text-purple-300 text-sm font-medium">
                Rate your confidence below
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Image Zoom Modal (same as before) */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeZoom(e);
          }}
          onWheel={handleWheel}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeZoom(e);
            }}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-10 hover:shadow-cyber-glow"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <button
              onClick={handleZoomIn}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all hover:shadow-cyber-glow"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all hover:shadow-cyber-glow"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all hover:shadow-cyber-glow"
              aria-label="Reset zoom"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-cyber-cyan/20 border border-cyber-cyan/40 text-white px-4 py-2 rounded-lg text-sm font-semibold z-10">
            {Math.round(zoomScale * 100)}%
          </div>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
          >
            <div
              style={{
                transform: `scale(${zoomScale}) translate(${position.x / zoomScale}px, ${position.y / zoomScale}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <Image
                src={zoomedImage.url}
                alt={zoomedImage.altText || 'Zoomed image'}
                width={1920}
                height={1080}
                sizes="100vw"
                className="object-contain max-w-full max-h-[90vh]"
                priority
              />
            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <p className="text-white/70 text-sm">
              {zoomScale > 1
                ? 'Drag to pan • Scroll to zoom • ESC to close'
                : 'Scroll to zoom • ESC to close'
              }
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .touch-manipulation {
          touch-action: manipulation;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1s ease-in-out infinite;
        }

        /* Enhanced prose styling for cyber theme */
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #67e8f9;
        }
        .prose p {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.8;
        }
        .prose ul, .prose ol {
          padding-left: 1.75rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .prose li {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .prose strong {
          font-weight: 700;
          color: #f1f5f9;
        }
        .prose code {
          background-color: rgba(51, 65, 85, 0.8);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
          color: #67e8f9;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .prose pre {
          background-color: rgba(15, 23, 42, 0.9);
          padding: 1.25rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1rem 0;
          border: 1px solid rgba(6, 182, 212, 0.2);
        }
        .prose pre code {
          background: none;
          padding: 0;
          border: none;
        }
        .prose blockquote {
          border-left: 4px solid #06b6d4;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #cbd5e1;
          background: rgba(6, 182, 212, 0.05);
          padding: 1rem;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
