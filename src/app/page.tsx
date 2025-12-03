"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load icons for better performance
const ArrowRight = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.ArrowRight })),
  { ssr: false }
);
const Check = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.Check })),
  { ssr: false }
);
const Brain = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.Brain })),
  { ssr: false }
);
const Target = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.Target })),
  { ssr: false }
);
const Activity = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.Activity })),
  { ssr: false }
);
const Zap = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.Zap })),
  { ssr: false }
);
const Shield = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.Shield })),
  { ssr: false }
);
const TrendingUp = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.TrendingUp })),
  { ssr: false }
);
const Sparkles = dynamic(
  () => import("lucide-react").then(mod => ({ default: mod.Sparkles })),
  { ssr: false }
);

const BuyNowButton = dynamic(() => import("@/components/BuyNowButton"), {
  loading: () => (
    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold px-10 py-5 rounded-full animate-pulse h-16 w-80" />
  ),
  ssr: false,
});

const CountdownTimer = dynamic(() => import("@/components/CountdownTimer"), {
  ssr: false,
});

const FloatingBadge = dynamic(() => import("@/components/FloatingBadge"), {
  ssr: false,
});

function HeroCTAButtons({ centered = false }: { centered?: boolean }) {
  const { isSignedIn } = useAuth();

  return (
    <div className={`flex flex-col sm:flex-row gap-6 items-center ${centered ? 'justify-center' : 'justify-center lg:justify-start'}`}>
      {isSignedIn ? (
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

function CTAPlaceholder() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center lg:justify-start">
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold px-10 py-5 rounded-full animate-pulse h-16 w-80" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1729] via-[#1a2235] to-[#0f1729]">
      {/* Floating Pass Rate Badge */}
      <FloatingBadge />

      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-32 pb-20 lg:pb-28 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8 text-center lg:text-left">
                {/* Trust badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-cyan-400">98.2% First-Time Pass Rate</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                  Stop Cramming.
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                    Master CISSP
                  </span>
                  <br />
                  in Half the Time.
                </h1>

                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Join 350+ certified professionals who passed on their first attempt using our AI-powered adaptive learning system. No rote memorization. Just deep understanding.
                </p>

                {/* Social proof counters */}
                <div className="flex flex-wrap gap-8 justify-center lg:justify-start items-center pt-4">
                  <div className="text-center lg:text-left">
                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">98.2%</div>
                    <div className="text-sm text-gray-400 font-medium">Pass Rate</div>
                  </div>
                  <div className="w-px h-12 bg-gray-700 hidden sm:block" />
                  <div className="text-center lg:text-left">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">350+</div>
                    <div className="text-sm text-gray-400 font-medium">Certified CISSPs</div>
                  </div>
                  <div className="w-px h-12 bg-gray-700 hidden sm:block" />
                  <div className="text-center lg:text-left">
                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">1000+</div>
                    <div className="text-sm text-gray-400 font-medium">Practice Questions</div>
                  </div>
                </div>

                <Suspense fallback={<CTAPlaceholder />}>
                  <HeroCTAButtons />
                </Suspense>

                <p className="text-sm text-gray-400">
                  One-time payment · Lifetime access · No subscription ever
                </p>
              </div>

              {/* Right Image/Visual */}
              <div className="relative lg:block hidden">
                <div className="relative w-full aspect-square">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-cyan-500/30 rounded-3xl blur-2xl" />
                  <div className="relative bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-purple-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-600/20 to-transparent border border-purple-500/30 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Domain 1: Security & Risk</div>
                          <div className="text-lg font-bold text-white">Mastered 94%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-500/20 to-transparent border border-cyan-500/30 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">AI Learning Path</div>
                          <div className="text-lg font-bold text-white">Actively Adapting</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-600/20 to-transparent border border-purple-500/30 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Progress This Week</div>
                          <div className="text-lg font-bold text-white">+28% Accuracy</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trusted by logos */}
            <div className="mt-20 pt-12 border-t border-gray-800">
              <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-wider font-semibold">
                Trusted by professionals at
              </p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
                <div className="text-2xl font-bold text-gray-600">Fortune 500</div>
                <div className="text-2xl font-bold text-gray-600">DoD</div>
                <div className="text-2xl font-bold text-gray-600">Big 4</div>
                <div className="text-2xl font-bold text-gray-600">FAANG</div>
                <div className="text-2xl font-bold text-gray-600">FinTech</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Pass First Try
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Stop wasting time on outdated study methods. Our AI-powered platform gives you exactly what you need to master all 8 CISSP domains.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="group relative bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 hover:border-purple-500/50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Smart Flashcards</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Concise, high-yield notes designed for spaced repetition. No fluff, just what you need to know.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-shadow">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">1000+ Realistic Questions</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Exam-quality practice questions with detailed explanations. Full mock exams included.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 hover:border-purple-500/50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Adaptive Learning</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Real-time difficulty adjustment. The AI identifies weak areas and creates your personalized path.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-shadow">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Performance Analytics</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Track mastery by domain. See exactly where you stand and what needs work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#0f1729] to-[#1a2235] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Real Results from{" "}
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Real Professionals
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Join hundreds of cybersecurity professionals who transformed their careers with CISSP certification.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold text-xl">
                    AJ
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">Alex Johnson</div>
                    <div className="text-sm text-gray-400">Security Architect, Fortune 500</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 text-yellow-400">★</div>
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed italic">
                  &quot;This was the only resource I needed. The practice questions were incredibly similar to the real exam, and the adaptive learning helped me focus exactly where I needed to.&quot;
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
                    MP
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">Maria Patel</div>
                    <div className="text-sm text-gray-400">InfoSec Manager, FinTech</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 text-yellow-400">★</div>
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed italic">
                  &quot;The AI adaptive system is a game-changer. It knew my weak spots before I did and forced me to address them. Passed with confidence on first attempt.&quot;
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold text-xl">
                    DK
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">David Kim</div>
                    <div className="text-sm text-gray-400">Cybersecurity Consultant</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 text-yellow-400">★</div>
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed italic">
                  &quot;Best $60 I ever spent on my career. No BS, just high-quality content that actually mirrors the exam. Lifetime access is the cherry on top.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Students Pass Section */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Students Pass on{" "}
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Their First Attempt
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/50">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">No Rote Memorization</h3>
                <p className="text-gray-400 leading-relaxed">
                  Focus on understanding concepts, not mindless cramming. The exam tests thinking, not recall.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/50">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Laser-Focused Practice</h3>
                <p className="text-gray-400 leading-relaxed">
                  AI identifies your weak domains and doubles down. No time wasted on what you already know.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/50">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Exam-Like Questions</h3>
                <p className="text-gray-400 leading-relaxed">
                  Practice with questions that mirror the real CISSP format, difficulty, and thinking style.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/50">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Lifetime Updates</h3>
                <p className="text-gray-400 leading-relaxed">
                  CISSP evolves. So does our content. You get every update, forever, at no extra cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust + Urgency Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-purple-500/50 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-purple-500/50 rounded-full">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-bold text-white">Limited Time Offer</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Join 350+ Certified Professionals
                </h2>

                <div className="grid sm:grid-cols-3 gap-8 py-8">
                  <div className="space-y-2">
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      $60
                    </div>
                    <div className="text-gray-400">One-time payment</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      ∞
                    </div>
                    <div className="text-gray-400">Lifetime access</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      $0
                    </div>
                    <div className="text-gray-400">No subscription</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-2xl font-bold text-white">
                    <span className="line-through text-gray-500">$120</span> → $60 USD (50% Off)
                  </p>
                  <CountdownTimer />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>30-Day Money-Back Guarantee</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Instant Access to All Content</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Free Lifetime Updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
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
              <HeroCTAButtons centered />
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
    </div>
  );
}
