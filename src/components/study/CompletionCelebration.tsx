"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface CompletionCelebrationProps {
  cardsCompleted: number;
  accuracy?: number;
  streak?: number;
  timeSpent?: number; // in minutes
  onRestart?: () => void;
  backLink?: string;
  backLinkLabel?: string;
}

// Helper function to generate confetti pieces
const generateConfettiPieces = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
  }));
};

// Helper function to get motivational message
const getMotivationalMessage = (streak: number, accuracy: number) => {
  if (streak >= 7) {
    return {
      text: `Amazing dedication! You're on a ${streak}-day streak. Keep this momentum going to achieve CISSP mastery! 🚀`,
      highlight: "Amazing dedication!",
      highlightClass: "text-cyber-cyan"
    };
  }

  if (accuracy >= 80) {
    return {
      text: `Excellent work! Your ${Math.round(accuracy)}% accuracy shows you're truly understanding these concepts. 💪`,
      highlight: "Excellent work!",
      highlightClass: "text-green-400"
    };
  }

  return {
    text: "Great progress! Every card brings you closer to CISSP certification. Keep going! ⭐",
    highlight: "Great progress!",
    highlightClass: "text-cyber-cyan"
  };
};

export default function CompletionCelebration({
  cardsCompleted,
  accuracy = 0,
  streak = 0,
  timeSpent = 0,
  onRestart,
  backLink = "/dashboard",
  backLinkLabel = "Dashboard"
}: CompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Auto-hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const confettiPieces = showConfetti ? generateConfettiPieces(50) : [];
  const motivationalMessage = getMotivationalMessage(streak, accuracy);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}

      {/* Main Card */}
      <div className="glass-strong rounded-2xl p-8 md:p-12 border-2 border-cyber-cyan/40 shadow-cyber-glow-strong text-center animate-scale-in">
        {/* Trophy Icon */}
        <div className="mb-6 animate-bounce">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-neon-cyan">
            <Trophy className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-bold text-white neon-text mb-4">
          Congratulations!
        </h2>

        <p className="text-xl text-slate-300 mb-8">
          You&apos;ve completed all {cardsCompleted} cards 🎉
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Cards Completed */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyber-blue/20 border border-cyber-cyan/30">
            <div className="text-3xl font-bold text-white mb-1">
              {cardsCompleted}
            </div>
            <div className="text-xs text-cyber-cyan-light">Cards</div>
          </div>

          {/* Accuracy */}
          {accuracy > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(accuracy)}%
              </div>
              <div className="text-xs text-green-300">Accuracy</div>
            </div>
          )}

          {/* Streak */}
          {streak > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <div className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-1">
                <Flame className="w-6 h-6 text-orange-400" />
                {streak}
              </div>
              <div className="text-xs text-orange-300">Day Streak</div>
            </div>
          )}

          {/* Time Spent */}
          {timeSpent > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <div className="text-3xl font-bold text-white mb-1">
                {timeSpent}
              </div>
              <div className="text-xs text-purple-300">Minutes</div>
            </div>
          )}
        </div>

        {/* Motivational Message */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyber-cyan/10 to-cyber-purple/10 border border-cyber-cyan/20">
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            <span className={`font-bold ${motivationalMessage.highlightClass}`}>
              {motivationalMessage.highlight}
            </span>{' '}
            {motivationalMessage.text.replace(motivationalMessage.highlight + '! ', '')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRestart && (
            <Button
              onClick={onRestart}
              size="lg"
              className="bg-gradient-to-r from-cyber-cyan to-cyber-blue hover:from-cyber-cyan-light hover:to-cyber-blue text-white font-bold px-8 py-6 text-lg shadow-cyber-glow hover:shadow-cyber-glow-strong transition-all"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Study Again
            </Button>
          )}

          <Link href={backLink}>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-2 border-cyber-cyan/50 hover:border-cyber-cyan hover:bg-cyber-cyan/10 text-white font-semibold px-8 py-6 text-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to {backLinkLabel}
            </Button>
          </Link>
        </div>

        {/* Next Steps Suggestion */}
        <div className="mt-8 pt-6 border-t border-cyber-cyan/20">
          <p className="text-sm text-slate-400 mb-3">
            📊 What&apos;s next?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-xs">
            <Link href="/dashboard/weak-topics" className="text-cyber-cyan hover:text-cyber-cyan-light transition-colors">
              → Review weak topics
            </Link>
            <Link href="/dashboard/practice-test" className="text-cyber-cyan hover:text-cyber-cyan-light transition-colors">
              → Take practice test
            </Link>
            <Link href="/dashboard/next-domain" className="text-cyber-cyan hover:text-cyber-cyan-light transition-colors">
              → Study next domain
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
