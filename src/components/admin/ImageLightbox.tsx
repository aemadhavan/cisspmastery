"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: Array<{
    url?: string;
    altText?: string;
    fileName: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous Button */}
      {currentIndex > 0 && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}

      {/* Next Button */}
      {currentIndex < images.length - 1 && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}

      {/* Image */}
      <div
        className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImage?.url && (
          <img
            src={currentImage.url}
            alt={currentImage.altText || currentImage.fileName}
            className="max-w-full max-h-full object-contain rounded"
          />
        )}
      </div>

      {/* Image Info */}
      {currentImage?.altText && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/70 text-white px-4 py-2 rounded max-w-2xl text-center">
          {currentImage.altText}
        </div>
      )}
    </div>
  );
}
