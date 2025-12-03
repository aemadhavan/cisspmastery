import SectionHeader from "../ui/SectionHeader";

interface Testimonial {
  initials: string;
  name: string;
  role: string;
  quote: string;
  gradientFrom: string;
  gradientTo: string;
  borderHover: string;
}

const testimonials: Testimonial[] = [
  {
    initials: "AJ",
    name: "Alex Johnson",
    role: "Security Architect, Fortune 500",
    quote: "This was the only resource I needed. The practice questions were incredibly similar to the real exam, and the adaptive learning helped me focus exactly where I needed to.",
    gradientFrom: "purple-600",
    gradientTo: "purple-400",
    borderHover: "purple-500/50"
  },
  {
    initials: "MP",
    name: "Maria Patel",
    role: "InfoSec Manager, FinTech",
    quote: "The AI adaptive system is a game-changer. It knew my weak spots before I did and forced me to address them. Passed with confidence on first attempt.",
    gradientFrom: "cyan-500",
    gradientTo: "cyan-400",
    borderHover: "cyan-500/50"
  },
  {
    initials: "DK",
    name: "David Kim",
    role: "Cybersecurity Consultant",
    quote: "Best $60 I ever spent on my career. No BS, just high-quality content that actually mirrors the exam. Lifetime access is the cherry on top.",
    gradientFrom: "purple-600",
    gradientTo: "purple-400",
    borderHover: "purple-500/50"
  }
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className={`bg-gradient-to-br from-[#1a2235] to-[#0f1729] border border-gray-800 rounded-2xl p-8 hover:border-${testimonial.borderHover} transition-all`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-${testimonial.gradientFrom} to-${testimonial.gradientTo} flex items-center justify-center text-white font-bold text-xl`}>
          {testimonial.initials}
        </div>
        <div>
          <div className="font-bold text-white text-lg">{testimonial.name}</div>
          <div className="text-sm text-gray-400">{testimonial.role}</div>
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 text-yellow-400">★</div>
        ))}
      </div>
      <p className="text-gray-300 leading-relaxed italic">
        &quot;{testimonial.quote}&quot;
      </p>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-[#0f1729] to-[#1a2235] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Real Results from"
            highlightedText="Real Professionals"
            subtitle="Join hundreds of cybersecurity professionals who transformed their careers with CISSP certification."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
