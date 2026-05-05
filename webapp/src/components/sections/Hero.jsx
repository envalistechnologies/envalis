import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkle, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const highlights = ["Award-winning designs", "On-time delivery", "24/7 support", "99% client satisfaction"];

const Hero = () => (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-gray-950 via-brand-950 to-purple-950">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Glowing orbs */}
        <div className="absolute top-1/3 left-1/4 w-150 h-150 bg-brand-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-purple-600/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-brand-800/10 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10 pt-24 pb-16">
            <div className="max-w-5xl mx-auto text-center">
                {/* Announcement badge */}
                <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-full px-4 py-2 mb-8 animate-fade-in">
                    <Sparkle size={14} weight="duotone" className="text-yellow-400" />
                    <span className="text-white/70 text-sm">Award-Winning Digital Agency</span>
                    <span className="text-brand-400 text-sm font-semibold flex items-center gap-1">Learn more <ArrowRight size={12} /></span>
                </div>

                {/* Heading */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.05] mb-6 animate-slide-up">
                    We Build Digital
                    <span className="block mt-2 bg-linear-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Experiences That
                    </span>
                    <span className="block">Matter.</span>
                </h1>

                <p className="text-white/50 text-xl lg:text-xl max-w-3xl mx-auto leading-relaxed mb-10 animate-slide-up [animation-delay:0.2s]">
                    We're a full-service digital agency specializing in web development, mobile apps, AI solutions, and strategic consulting, helping businesses grow 10x faster.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-slide-up [animation-delay:0.3s]">
                    <Link to="/contact">
                        <Button size="xl" variant="gradient" className="font-bold text-base w-full sm:w-auto">
                            Start Your Project <ArrowRight size={20} />
                        </Button>
                    </Link>
                    <Link to="/portfolio">
                        <Button size="xl" variant="glass" className="font-bold text-base w-full sm:w-auto">
                            <Play size={18} weight="fill" className="mr-1" /> View Our Work
                        </Button>
                    </Link>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap justify-center gap-6 animate-fade-in [animation-delay:0.5s]">
                    {highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2 text-white/60 text-sm">
                            <CheckCircle size={16} weight="duotone" className="text-green-400" />
                            {h}
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
                {[
                    { number: "8+", label: "Projects Delivered" },
                    { number: "7+", label: "Global Clients" },
                    { number: "99%", label: "Satisfaction Rate" },
                    { number: "2", label: "Years of Excellence" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
                        <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                        <div className="text-white/50 text-sm">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
);

export default Hero;