import React from 'react';

interface CelebrationMessageProps {
    streak: number;
    accuracy: number;
}

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

export const CelebrationMessage = ({ streak, accuracy }: CelebrationMessageProps) => {
    const motivationalMessage = getMotivationalMessage(streak, accuracy);

    return (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyber-cyan/10 to-cyber-purple/10 border border-cyber-cyan/20">
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                <span className={`font-bold ${motivationalMessage.highlightClass}`}>
                    {motivationalMessage.highlight}
                </span>{' '}
                {motivationalMessage.text.replace(motivationalMessage.highlight + '! ', '')}
            </p>
        </div>
    );
};
