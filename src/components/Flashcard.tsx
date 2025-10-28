"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface FlashcardMedia {
  id: string;
  url: string;
  altText: string | null;
  placement: string;
  order: number;
}

interface FlashcardProps {
  question: string;
  answer: string;
  questionImages?: FlashcardMedia[];
  answerImages?: FlashcardMedia[];
  onFlip?: () => void;
}

export default function Flashcard({
  question,
  answer,
  questionImages = [],
  answerImages = [],
  onFlip
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <div
        className={`relative w-full h-[500px] transition-transform duration-500 preserve-3d cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={handleFlip}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* Front of card (Question) */}
        <Card
          className="absolute inset-0 backface-hidden bg-slate-800/90 border-slate-700"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-8 overflow-hidden">
            <div className="text-sm font-semibold text-purple-400 mb-4">
              QUESTION
            </div>
            <p className="text-xl sm:text-2xl text-white text-center leading-relaxed">
              {question}
            </p>

            {/* Question Images */}
            {questionImages.length > 0 && (
              <div className="mt-6 flex flex-col gap-4 w-full max-w-md">
                {questionImages.map((img) => (
                  <div key={img.id} className="relative w-full">
                    <Image
                      src={img.url}
                      alt={img.altText || 'Question image'}
                      width={500}
                      height={300}
                      className="rounded-lg border border-slate-600 object-contain w-full h-auto"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-sm text-gray-400">
              Click to reveal answer
            </div>
          </CardContent>
        </Card>

        {/* Back of card (Answer) */}
        <Card
          className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-8 overflow-hidden">
            <div className="text-sm font-semibold text-purple-200 mb-4">
              ANSWER
            </div>
            <p className="text-xl sm:text-2xl text-white text-center leading-relaxed">
              {answer}
            </p>

            {/* Answer Images */}
            {answerImages.length > 0 && (
              <div className="mt-6 flex flex-col gap-4 w-full max-w-md">
                {answerImages.map((img) => (
                  <div key={img.id} className="relative w-full">
                    <Image
                      src={img.url}
                      alt={img.altText || 'Answer image'}
                      width={500}
                      height={300}
                      className="rounded-lg border border-purple-400 object-contain w-full h-auto"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-sm text-purple-200">
              Click to see question
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
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
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
