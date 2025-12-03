"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const TrendingUp = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.TrendingUp }))
);

export default function FloatingBadge() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show badge after a short delay
    const timer = setTimeout(() => setIsVisible(true), 2000);

    // Handle scroll to hide/show badge
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show badge when user scrolls down a bit
      if (scrollPosition > 400) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="group relative bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-4 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all hover:scale-105 cursor-default border border-purple-400/50">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-cyan-500/50 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white leading-none mb-1">
              98.2%
            </div>
            <div className="text-sm text-purple-100 font-medium leading-none">
              Pass Rate
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors shadow-lg text-xs font-bold"
          aria-label="Close badge"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
