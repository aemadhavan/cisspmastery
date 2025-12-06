"use client";

import { useState } from "react";
// Button removed being unused
import { Flame, Brain, Zap, Target, Trophy, LucideIcon } from "lucide-react";

interface ConfidenceLevel {
  value: number;
  label: string;
  shortLabel: string;
  color: string;
  hoverColor: string;
  borderColor: string;
  hoverBorderColor: string;
  icon: LucideIcon;
  iconColor: string;
  description: string;
  bgGlow: string;
}

const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  {
    value: 1,
    label: "Not at all",
    shortLabel: "Again",
    color: "from-red-600 to-red-700",
    hoverColor: "hover:from-red-500 hover:to-red-600",
    borderColor: "border-red-500/50",
    hoverBorderColor: "hover:border-red-400",
    icon: Flame,
    iconColor: "text-red-400",
    description: "I need to review this",
    bgGlow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
  },
  {
    value: 2,
    label: "Barely",
    shortLabel: "Hard",
    color: "from-orange-600 to-orange-700",
    hoverColor: "hover:from-orange-500 hover:to-orange-600",
    borderColor: "border-orange-500/50",
    hoverBorderColor: "hover:border-orange-400",
    icon: Brain,
    iconColor: "text-orange-400",
    description: "Need more practice",
    bgGlow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
  },
  {
    value: 3,
    label: "Somewhat",
    shortLabel: "Good",
    color: "from-yellow-600 to-yellow-700",
    hoverColor: "hover:from-yellow-500 hover:to-yellow-600",
    borderColor: "border-yellow-500/50",
    hoverBorderColor: "hover:border-yellow-400",
    icon: Zap,
    iconColor: "text-yellow-400",
    description: "Getting there",
    bgGlow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]"
  },
  {
    value: 4,
    label: "Mostly",
    shortLabel: "Easy",
    color: "from-lime-600 to-lime-700",
    hoverColor: "hover:from-lime-500 hover:to-lime-600",
    borderColor: "border-lime-500/50",
    hoverBorderColor: "hover:border-lime-400",
    icon: Target,
    iconColor: "text-lime-400",
    description: "Know it well",
    bgGlow: "hover:shadow-[0_0_30px_rgba(132,204,22,0.4)]"
  },
  {
    value: 5,
    label: "Perfectly",
    shortLabel: "Perfect",
    color: "from-green-600 to-green-700",
    hoverColor: "hover:from-green-500 hover:to-green-600",
    borderColor: "border-green-500/50",
    hoverBorderColor: "hover:border-green-400",
    icon: Trophy,
    iconColor: "text-green-400",
    description: "Mastered",
    bgGlow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
  }
];


interface PremiumConfidenceRatingProps {
  onRate: (confidence: number) => void;
  disabled?: boolean;
  autoAdvance?: boolean;
}

export default function PremiumConfidenceRating({
  onRate,
  disabled = false,
  autoAdvance = true
}: PremiumConfidenceRatingProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRate = async (confidence: number) => {
    if (disabled || isAnimating) return;

    setSelectedRating(confidence);
    setIsAnimating(true);

    // Brief animation delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200));

    onRate(confidence);

    if (autoAdvance) {
      // Reset after auto-advance
      setTimeout(() => {
        setSelectedRating(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 neon-text">
          How well did you know this?
        </h3>
        <p className="text-sm md:text-base text-slate-400">
          Be honest - this helps optimize your learning path
        </p>
      </div>

      {/* Desktop View - 5 columns */}
      <div className="hidden sm:grid sm:grid-cols-5 gap-3 md:gap-4">
        {CONFIDENCE_LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = selectedRating === level.value;

          return (
            <button
              key={level.value}
              onClick={() => handleRate(level.value)}
              disabled={disabled}
              className={`
                group relative h-auto py-6 px-3 flex flex-col items-center gap-3
                bg-gradient-to-br ${level.color} ${level.hoverColor}
                rounded-xl border-2 ${level.borderColor} ${level.hoverBorderColor}
                transition-all duration-300 transform
                ${!disabled && !isAnimating ? 'hover:scale-105 hover:-translate-y-1' : ''}
                ${level.bgGlow}
                ${isSelected ? 'scale-105 -translate-y-1 ring-2 ring-white/50' : ''}
                ${disabled || isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                overflow-hidden
              `}
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {/* Icon */}
              <div className={`${level.iconColor} transition-transform duration-300 ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}>
                <Icon className="w-8 h-8" />
              </div>

              {/* Rating Number */}
              <span className="text-3xl font-bold text-white">
                {level.value}
              </span>

              {/* Label */}
              <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                {level.shortLabel}
              </span>

              {/* Description - Hidden on smaller screens */}
              <span className="text-xs text-white/70 text-center leading-tight hidden lg:block">
                {level.description}
              </span>

              {/* Keyboard shortcut hint */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <kbd className="px-2 py-1 text-xs font-mono bg-black/30 rounded border border-white/20">
                  {level.value}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile View - Stacked */}
      <div className="sm:hidden space-y-3">
        {CONFIDENCE_LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = selectedRating === level.value;

          return (
            <button
              key={level.value}
              onClick={() => handleRate(level.value)}
              disabled={disabled}
              className={`
                group relative w-full py-5 px-6 flex items-center gap-4
                bg-gradient-to-br ${level.color} ${level.hoverColor}
                rounded-xl border-2 ${level.borderColor} ${level.hoverBorderColor}
                transition-all duration-300
                ${!disabled && !isAnimating ? 'active:scale-98' : ''}
                ${level.bgGlow}
                ${isSelected ? 'scale-[1.02] ring-2 ring-white/50' : ''}
                ${disabled || isAnimating ? 'opacity-50' : ''}
                overflow-hidden
              `}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-active:translate-x-full transition-transform duration-700" />

              {/* Icon & Number */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Icon className={`w-7 h-7 ${level.iconColor}`} />
                <span className="text-2xl font-bold text-white">
                  {level.value}
                </span>
              </div>

              {/* Labels */}
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white uppercase tracking-wide">
                  {level.label}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  {level.description}
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-between items-center text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          Review soon
        </span>
        <span className="hidden sm:inline">Rate honestly for better results</span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600"></span>
          Mastered
        </span>
      </div>

      {/* Keyboard shortcuts hint (desktop only) */}
      <div className="hidden sm:block mt-4 text-center">
        <p className="text-xs text-slate-500">
          💡 Pro tip: Press keys <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">1</kbd>-<kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">5</kbd> for quick rating
        </p>
      </div>
    </div>
  );
}
