import React from 'react';
import { Trophy } from "lucide-react";

interface CelebrationHeaderProps {
    cardsCompleted: number;
}

export const CelebrationHeader = ({ cardsCompleted }: CelebrationHeaderProps) => {
    return (
        <>
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
        </>
    );
};
