export default function Testimonials() {
  return (
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
  );
}
