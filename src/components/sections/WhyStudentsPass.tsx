import {
  Brain,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function WhyStudentsPass() {
  return (
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
  );
}
