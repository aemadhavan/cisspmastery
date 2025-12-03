import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Check, Shield, Sparkles } from "lucide-react";

const BuyNowButton = dynamic(() => import("@/components/BuyNowButton"), {
  loading: () => (
    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold px-10 py-5 rounded-full animate-pulse h-16 w-80" />
  ),
  ssr: true,
});

async function HeroCTAButtons() {
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
          priceId={process.env.STRIPE_LIFETIME_PRICE_ID!}
          text="Buy Lifetime Access – $60 (50% Off)"
          className="!bg-gradient-to-r !from-purple-600 !via-purple-500 !to-purple-600 hover:!from-purple-500 hover:!via-purple-400 hover:!to-purple-500 !text-white !font-bold !px-10 !py-5 !text-lg !shadow-2xl !shadow-purple-500/30 hover:!shadow-purple-500/50 !transform hover:!scale-105"
        />
      )}
    </div>
  );
}

function CTAPlaceholder() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold px-10 py-5 rounded-full animate-pulse h-16 w-80" />
    </div>
  );
}

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
            Ready to Pass CISSP on{" "}
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Your First Attempt?
            </span>
          </h2>

          <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
            Stop wasting time with outdated study materials. Join the smartest CISSP prep platform and get certified faster.
          </p>

          <Suspense fallback={<CTAPlaceholder />}>
            <HeroCTAButtons />
          </Suspense>

          <div className="pt-8 flex flex-wrap gap-6 justify-center items-center text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Secure Payment</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Instant Access</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm max-w-2xl mx-auto pt-8">
            By purchasing, you agree to our terms of service. We respect your privacy and will never share your information. Questions? Contact us anytime at support@cybermate.com
          </p>
        </div>
      </div>
    </section>
  );
}
