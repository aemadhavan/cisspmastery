import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface CTAButtonsProps {
    isSignedIn: boolean;
    containerClassName?: string;
    buyNowButton: ReactNode;
}

export function CTAButtons({
    isSignedIn,
    containerClassName = "flex flex-col sm:flex-row gap-6 items-center justify-center",
    buyNowButton,
}: CTAButtonsProps) {
    return (
        <div className={containerClassName}>
            {isSignedIn ? (
                <Link
                    href="/dashboard"
                    className="group relative bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-400 hover:to-purple-500 text-white font-bold px-10 py-5 rounded-full transition-all duration-300 flex items-center gap-3 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105 text-lg"
                >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            ) : (
                buyNowButton
            )}
        </div>
    );
}