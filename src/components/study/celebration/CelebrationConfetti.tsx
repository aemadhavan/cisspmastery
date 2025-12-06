import React from 'react';

// Helper function to generate confetti pieces
const generateConfettiPieces = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
    }));
};

interface CelebrationConfettiProps {
    show: boolean;
}

export const CelebrationConfetti = ({ show }: CelebrationConfettiProps) => {
    const confettiPieces = show ? generateConfettiPieces(50) : [];

    return (
        <>
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
        </>
    );
};
