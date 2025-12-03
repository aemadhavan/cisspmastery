import React from 'react';

export interface Testimonial {
    initials: string;
    name: string;
    role: string;
    quote: string;
    gradientFrom: string;
    gradientTo: string;
    borderHover: string;
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
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
