import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

const BuyNowButton = dynamic(() => import("@/components/BuyNowButton"), {
    loading: () => (
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold px-10 py-5 rounded-full animate-pulse h-16 w-80" />
    ),
    ssr: true,
});

export async function FinalCTAButtons() {
    const { has } = await auth();
    const hasPaidPlan = has ? has({ plan: 'paid' }) : false;

    return (
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            {hasPaidPlan ? (
                <Link
                    href="/dashboard"
                    className="group relative bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-400 hover:to-purple-500 text-white font-bold px-10 py-5 rounded-full transition-all duration-300 flex items-center gap-3 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105 text-lg"
                >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            ) : (
                <BuyNowButton
                    priceId={process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID!}
                    text="Buy Lifetime Access – $60 (50% Off)"
                    className="!bg-gradient-to-r !from-purple-600 !via-purple-500 !to-purple-600 hover:!from-purple-500 hover:!via-purple-400 hover:!to-purple-500 !text-white !font-bold !px-10 !py-5 !text-lg !shadow-2xl !shadow-purple-500/30 hover:!shadow-purple-500/50 !transform hover:!scale-105"
                />
            )}
        </div>
    );
}
