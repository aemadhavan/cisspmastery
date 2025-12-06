"use client";

import { useEffect, useState } from "react";
import { CelebrationConfetti } from "./celebration/CelebrationConfetti";
import { CelebrationStats } from "./celebration/CelebrationStats";
import { CelebrationMessage } from "./celebration/CelebrationMessage";
import { CelebrationHeader } from "./celebration/CelebrationHeader";
import { CelebrationActions } from "./celebration/CelebrationActions";

interface CompletionCelebrationProps {
  cardsCompleted: number;
  accuracy?: number;
  streak?: number;
  timeSpent?: number; // in minutes
  onRestart?: () => void;
  backLink?: string;
  backLinkLabel?: string;
}

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

  return (
    <div className="w-full max-w-3xl mx-auto">
      <CelebrationConfetti show={showConfetti} />

      {/* Main Card */}
      <div className="glass-strong rounded-2xl p-8 md:p-12 border-2 border-cyber-cyan/40 shadow-cyber-glow-strong text-center animate-scale-in">
        <CelebrationHeader cardsCompleted={cardsCompleted} />

        <CelebrationStats
          cardsCompleted={cardsCompleted}
          accuracy={accuracy}
          streak={streak}
          timeSpent={timeSpent}
        />

        <CelebrationMessage streak={streak} accuracy={accuracy} />

        <CelebrationActions
          onRestart={onRestart}
          backLink={backLink}
          backLinkLabel={backLinkLabel}
        />
      </div>
    </div>
  );
}
