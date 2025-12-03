interface SectionHeaderProps {
  title: string;
  highlightedText: string;
  subtitle?: string;
}

export default function SectionHeader({ title, highlightedText, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
        {title}{" "}
        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {highlightedText}
        </span>
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
