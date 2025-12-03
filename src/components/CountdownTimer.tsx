"use client";

import { useCountdownTimer } from "@/hooks/useCountdownTimer";

interface TimeUnitProps {
  value: number;
  label: string;
  colorScheme: "purple" | "cyan";
}

function TimeUnit({ value, label, colorScheme }: TimeUnitProps) {
  const isPurple = colorScheme === "purple";
  const gradientFrom = isPurple ? "purple-600" : "cyan-500";
  const gradientTo = isPurple ? "purple-500" : "cyan-400";
  const textColor = isPurple ? "purple-200" : "cyan-200";

  return (
    <div className={`bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-lg px-3 py-2 min-w-[60px] text-center`}>
      <div className="text-2xl font-bold text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className={`text-xs text-${textColor} uppercase tracking-wider`}>{label}</div>
    </div>
  );
}

export default function CountdownTimer() {
  const timeLeft = useCountdownTimer();

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
        Offer ends in:
      </div>
      <div className="flex gap-2">
        <TimeUnit value={timeLeft.hours} label="Hours" colorScheme="purple" />
        <div className="text-2xl font-bold text-white flex items-center">:</div>
        <TimeUnit value={timeLeft.minutes} label="Mins" colorScheme="cyan" />
        <div className="text-2xl font-bold text-white flex items-center">:</div>
        <TimeUnit value={timeLeft.seconds} label="Secs" colorScheme="purple" />
      </div>
    </div>
  );
}
