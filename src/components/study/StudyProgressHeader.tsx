"use client";

import { Progress } from "@/components/ui/progress";
import { Flame, Clock, Target, TrendingUp, Award } from "lucide-react";

interface StudyProgressHeaderProps {
  currentCard: number;
  totalCards: number;
  streak?: number;
  dailyGoal?: number;
  cardsToday?: number;
  studyMode?: "progressive" | "random";
  domainProgress?: number;
  domainName?: string;
}

export default function StudyProgressHeader({
  currentCard,
  totalCards,
  streak = 0,
  dailyGoal = 50,
  cardsToday = 0,
  studyMode = "progressive",
  domainProgress = 0,
  domainName
}: StudyProgressHeaderProps) {
  const progress = totalCards > 0 ? (currentCard / totalCards) * 100 : 0;
  const dailyProgress = dailyGoal > 0 ? (cardsToday / dailyGoal) * 100 : 0;

  return (
    <div className="w-full glass-strong rounded-2xl p-6 md:p-8 border-2 border-cyber-cyan/20 mb-8">
      {/* Top Row - Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Streak */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
          <div className="flex-shrink-0">
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {streak}
            </div>
            <div className="text-xs text-orange-300 truncate">Day Streak</div>
          </div>
        </div>

        {/* Daily Progress */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
          <div className="flex-shrink-0">
            <Target className="w-6 h-6 md:w-8 md:h-8 text-cyber-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {cardsToday}
            </div>
            <div className="text-xs text-cyber-cyan-light truncate">
              / {dailyGoal} today
            </div>
          </div>
        </div>

        {/* Study Mode Badge */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex-shrink-0">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg md:text-xl font-bold text-white capitalize">
              {studyMode}
            </div>
            <div className="text-xs text-purple-300 truncate">Mode Active</div>
          </div>
        </div>

        {/* Domain Progress (if provided) */}
        {domainProgress !== undefined && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex-shrink-0">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {domainProgress}%
              </div>
              <div className="text-xs text-green-300 truncate">
                {domainName || "Progress"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300 font-medium">
            Session Progress
          </span>
          <span className="text-cyber-cyan-light font-bold">
            {currentCard} / {totalCards} cards
          </span>
        </div>

        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 rounded-full blur-sm" />

          {/* Progress bar */}
          <Progress
            value={progress}
            className="h-3 bg-slate-800/50 border border-cyber-cyan/30 relative"
            style={{
              background: `linear-gradient(to right,
                rgba(6, 182, 212, 0.2) 0%,
                rgba(139, 92, 246, 0.2) 100%)`
            }}
          />

          {/* Percentage label */}
          {progress > 5 && (
            <div
              className="absolute top-0 h-full flex items-center px-2"
              style={{ left: `${Math.min(progress - 5, 90)}%` }}
            >
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Goal Progress (separate bar) */}
      {dailyGoal > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Daily Goal</span>
            <span className={`font-semibold ${cardsToday >= dailyGoal ? 'text-green-400' : 'text-slate-300'}`}>
              {Math.round(dailyProgress)}%
            </span>
          </div>
          <Progress
            value={Math.min(dailyProgress, 100)}
            className="h-2 bg-slate-800/50 border border-green-500/30"
          />
          {cardsToday >= dailyGoal && (
            <div className="text-xs text-green-400 flex items-center gap-1 animate-slide-up">
              <Award className="w-3 h-3" />
              <span>Daily goal achieved! 🎉</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
