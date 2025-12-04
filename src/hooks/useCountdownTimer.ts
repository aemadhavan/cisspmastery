import { useState, useEffect } from "react";

export interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;

function getTimeLeftUntilMidnight(now: Date = new Date()): TimeLeft {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const difference = tomorrow.getTime() - now.getTime();

    if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(difference / MS_IN_HOUR);
    const minutes = Math.floor((difference % MS_IN_HOUR) / MS_IN_MINUTE);
    const seconds = Math.floor((difference % MS_IN_MINUTE) / MS_IN_SECOND);

    return { hours, minutes, seconds };
}

export function useCountdownTimer() {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeftUntilMidnight());

    useEffect(() => {
        setMounted(true);
        setTimeLeft(getTimeLeftUntilMidnight());

        const timer = setInterval(() => {
            setTimeLeft(getTimeLeftUntilMidnight());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Return placeholder values during SSR to avoid hydration mismatch
    if (!mounted) {
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    return timeLeft;
}
