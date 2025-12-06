import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Sparkles } from "lucide-react";

import { FlashcardContentArea } from './FlashcardContentArea';
import { FlashcardMedia, CardData } from './types';

interface FlashcardFaceProps {
    type: 'question' | 'answer';
    cardData: CardData;
    content: string;
    images: FlashcardMedia[];
    onImageClick: (e: React.MouseEvent, img: FlashcardMedia) => void;
    isBookmarked: boolean;
    onBookmarkClick?: (e: React.MouseEvent) => void;
}

export function FlashcardFace({
    type,
    cardData,
    content,
    images,
    onImageClick,
    isBookmarked,
    onBookmarkClick,
}: FlashcardFaceProps) {
    const { domainNumber, tags = [], flashcardId } = cardData;
    const isQuestion = type === 'question';



    return (
        <Card
            className={`absolute inset-0 backface-hidden glass-strong border-2 overflow-hidden ${isQuestion
                ? 'border-cyber-cyan/30 hover-glow'
                : 'border-cyber-purple/40 shadow-neon-purple'
                } ${type === 'question' ? '' : 'touch-manipulation'}`}
            style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: isQuestion ? undefined : "rotateY(180deg)"
            }}
        >
            <div className={`absolute inset-0 cyber-grid-bg ${isQuestion ? 'opacity-30' : 'opacity-20'} pointer-events-none`} />
            {!isQuestion && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 via-transparent to-cyber-blue/10 pointer-events-none" />
            )}

            <div className="relative flex flex-col h-full p-6 md:p-10">
                {/* Header */}
                <div className="flex-shrink-0 flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`text-xs font-bold ${isQuestion ? 'text-cyber-cyan' : 'text-cyber-purple-dark neon-text-purple'} neon-text tracking-wider`}>
                                {isQuestion ? 'QUESTION' : 'ANSWER'}
                            </div>
                            {domainNumber && (
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isQuestion
                                    ? 'bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-cyan-light'
                                    : 'bg-cyber-purple/20 border border-cyber-purple/50 text-purple-300'
                                    }`}>
                                    Domain {domainNumber}
                                </div>
                            )}
                        </div>
                        {isQuestion && tags.length > 0 && (
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

                    {!isQuestion && flashcardId && onBookmarkClick && (
                        <Button
                            onClick={onBookmarkClick}
                            variant="ghost"
                            size="sm"
                            className="text-purple-300 hover:text-cyber-cyan-light hover:bg-cyber-purple/20 transition-all duration-300 border border-transparent hover:border-cyber-cyan/30"
                        >
                            {isBookmarked ? (
                                <BookmarkCheck className="w-5 h-5" />
                            ) : (
                                <Bookmark className="w-5 h-5" />
                            )}
                        </Button>
                    )}
                </div>

                {/* Content */}
                <FlashcardContentArea
                    html={content}
                    images={images}
                    onImageClick={onImageClick}
                    borderColor={isQuestion ? "border-cyber-cyan/40" : "border-cyber-purple/50"}
                />

                {/* Footer */}
                <div className="flex-shrink-0 mt-6 text-center">
                    {isQuestion ? (
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan-light text-sm font-medium hover:bg-cyber-cyan/20 transition-colors">
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline">Tap or press SPACE to reveal answer</span>
                            <span className="sm:hidden">Tap to reveal</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyber-purple/10 border border-cyber-purple/30 text-purple-300 text-sm font-medium">
                            Rate your confidence below
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
