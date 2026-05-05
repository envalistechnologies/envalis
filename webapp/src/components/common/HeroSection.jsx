import { Badge } from "@/components/ui/badge";

const HeroSection = ({ badge, title, description, subtitle, className = "", contentClassName = "max-w-3xl" }) => (
  <section className={`relative overflow-hidden bg-linear-to-br from-slate-950 via-brand-950 to-purple-950 text-white py-20 ${className}`}>
    {/* Grid Background */}
    <div className="absolute inset-0 bg-grid opacity-20" />

    {/* Glowing Orbs */}
    <div className="absolute top-1/3 left-1/4 w-100 h-100 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-75 h-75 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />

    <div className="container mx-auto relative z-10">
      <div className={contentClassName}>
        {badge && (
          <Badge className="mb-4 bg-white/10 text-white border-white/20">
            {badge}
          </Badge>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
        {subtitle && (
          <p className="text-white/50 text-base mt-4">{subtitle}</p>
        )}
      </div>
    </div>
  </section>
);

export default HeroSection;
