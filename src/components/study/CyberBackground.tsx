"use client";

import { useEffect, useState } from "react";

interface CyberBackgroundProps {
  variant?: "matrix" | "grid" | "particles" | "none";
  intensity?: "low" | "medium" | "high";
}

export default function CyberBackground({
  variant = "grid",
  intensity = "low"
}: CyberBackgroundProps) {
  const [matrixChars, setMatrixChars] = useState<Array<{
    id: number;
    char: string;
    left: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (variant !== "matrix") return;

    // Generate matrix rain characters
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charCount = intensity === "high" ? 30 : intensity === "medium" ? 20 : 10;

    const generated = Array.from({ length: charCount }, (_, i) => ({
      id: i,
      char: chars[Math.floor(Math.random() * chars.length)],
      left: Math.random() * 100,
      duration: 8 + Math.random() * 4,
      delay: Math.random() * 5,
    }));

    setMatrixChars(generated);
  }, [variant, intensity]);

  if (variant === "none") return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid Background */}
      {variant === "grid" && (
        <div className="absolute inset-0 cyber-grid-bg opacity-30" />
      )}

      {/* Matrix Rain */}
      {variant === "matrix" && (
        <div className="matrix-rain">
          {matrixChars.map((item) => (
            <div
              key={item.id}
              className="matrix-char"
              style={{
                left: `${item.left}%`,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
              }}
            >
              {item.char}
            </div>
          ))}
        </div>
      )}

      {/* Particles (floating geometric shapes) */}
      {variant === "particles" && (
        <div className="absolute inset-0">
          {Array.from({ length: intensity === "high" ? 15 : intensity === "medium" ? 10 : 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            >
              <div
                className="w-2 h-2 bg-cyber-cyan/20 rounded-full blur-sm"
                style={{
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-cyber-bg/50" />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .bg-radial-gradient {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
