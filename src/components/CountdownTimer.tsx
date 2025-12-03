"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set timer to end at midnight (start of next day)
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const difference = tomorrow.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
        Offer ends in:
      </div>
      <div className="flex gap-2">
        <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg px-3 py-2 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white tabular-nums">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          <div className="text-xs text-purple-200 uppercase tracking-wider">Hours</div>
        </div>
        <div className="text-2xl font-bold text-white flex items-center">:</div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-lg px-3 py-2 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white tabular-nums">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          <div className="text-xs text-cyan-200 uppercase tracking-wider">Mins</div>
        </div>
        <div className="text-2xl font-bold text-white flex items-center">:</div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg px-3 py-2 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white tabular-nums">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
          <div className="text-xs text-purple-200 uppercase tracking-wider">Secs</div>
        </div>
      </div>
    </div>
  );
}
