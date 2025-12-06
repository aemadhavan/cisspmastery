"use client";

import { Progress } from "@/components/ui/progress";
import { Flame, Target, TrendingUp, Award } from "lucide-react";

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

// Helper component for individual stat cards
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}

function StatCard({ icon, value, label, bgGradient, borderColor, iconColor, textColor }: StatCardProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${bgGradient} border ${borderColor}`}>
      <div className="flex-shrink-0">
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl md:text-3xl font-bold text-white">
          {value}
        </div>
        <div className={`text-xs truncate ${textColor}`}>{label}</div>
      </div>
    </div>
  );
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
        <StatCard
          icon={<Flame className="w-6 h-6 md:w-8 md:h-8" />}
          value={streak}
          label="Day Streak"
          bgGradient="bg-gradient-to-br from-orange-500/10 to-red-500/10"
          borderColor="border-orange-500/30"
          iconColor="text-orange-400"
          textColor="text-orange-300"
        />

        <StatCard
          icon={<Target className="w-6 h-6 md:w-8 md:h-8" />}
          value={cardsToday}
          label={`/ ${dailyGoal} today`}
          bgGradient="bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
          borderColor="border-cyan-500/30"
          iconColor="text-cyber-cyan"
          textColor="text-cyber-cyan-light"
        />

        <StatCard
          icon={<TrendingUp className="w-6 h-6 md:w-8 md:h-8" />}
          value={studyMode.charAt(0).toUpperCase() + studyMode.slice(1)}
          label="Mode Active"
          bgGradient="bg-gradient-to-br from-purple-500/10 to-pink-500/10"
          borderColor="border-purple-500/30"
          iconColor="text-purple-400"
          textColor="text-purple-300"
        />

        {domainProgress !== undefined && (
          <StatCard
            icon={<Award className="w-6 h-6 md:w-8 md:h-8" />}
            value={`${domainProgress}%`}
            label={domainName || "Progress"}
            bgGradient="bg-gradient-to-br from-green-500/10 to-emerald-500/10"
            borderColor="border-green-500/30"
            iconColor="text-green-400"
            textColor="text-green-300"
          />
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
