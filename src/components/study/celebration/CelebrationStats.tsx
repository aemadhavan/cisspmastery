import React from 'react';
import { Flame } from "lucide-react";

interface CelebrationStatsProps {
    cardsCompleted: number;
    accuracy: number;
    streak: number;
    timeSpent: number;
}

export const CelebrationStats = ({ cardsCompleted, accuracy, streak, timeSpent }: CelebrationStatsProps) => {
    return (
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
    );
};
