import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, GithubLogo, LinkedinLogo, TwitterLogo, InstagramLogo, EnvelopeSimple, Phone, MapPin, ArrowUpRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { publicAPI } from "@/api/publicApi";
import Logo from "@/assets/envalis.svg";

const staticFooterLinks = {
    Company: [
        { label: "About Us", href: "/about" },
        { label: "Our Team", href: "/about#team" },
        { label: "Careers", href: "/careers", badge: "Hiring" },
        { label: "Contact", href: "/contact" },
        { label: "Press Kit", href: "/press" },
    ],
    Resources: [
        { label: "Blog", href: "/blog" },
        { label: "Articles", href: "/articles" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Resource Center", href: "/resources" },
        { label: "Testimonials", href: "/testimonials" },
    ],
    Legal: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
        { label: "Cookie Policy", href: "/cookie-policy" },
        { label: "Sitemap", href: "/sitemap" },
    ],
};

const socials = [
    { icon: LinkedinLogo, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: TwitterLogo, href: "https://twitter.com", label: "Twitter" },
    { icon: GithubLogo, href: "https://github.com", label: "GitHub" },
    { icon: InstagramLogo, href: "https://instagram.com", label: "Instagram" },
];

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const { data: servicesData } = useQuery({
        queryKey: ["footer-services"],
        queryFn: () => publicAPI.getServices({ limit: 10, status: "published" }).then((r) => r.data),
        staleTime: 10 * 60 * 1000,
    });

    const services = servicesData?.services || [];

    const footerLinks = {
        ...staticFooterLinks,
        Services: services.length > 0
            ? services.map((s) => ({ label: s.title, href: `/services/${s.slug}` }))
            : [{ label: "View All Services", href: "/services" }],
    };

    return (
        <footer className="bg-slate-950 text-white">

            {/* CTA Banner */}
            <div className="border-b border-white/10">
                <div className="container mx-auto py-16">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-purple-700 to-brand-900 p-10 lg:p-14">
                        <div className="absolute inset-0 bg-grid opacity-20" />
                        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full" />
                        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                                    Let's Work Together
                                </Badge>
                                <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                                    Ready to build something <span className="text-yellow-300">extraordinary?</span>
                                </h2>
                                <p className="text-white/70 text-lg">
                                    Transform your ideas into powerful digital solutions. Let's start the conversation.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                                <Link to="/contact">
                                    <Button size="lg" variant="white" className="font-bold">
                                        Start a Project <ArrowRight size={18} />
                                    </Button>
                                </Link>
                                <Link to="/portfolio">
                                    <Button size="lg" variant="glass" className="font-bold">
                                        View Our Work <ArrowUpRight size={18} />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto py-16">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-10">

                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                                <img src={Logo} alt="Envalis Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-2xl font-black text-white">Envalis</span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            We craft cutting-edge digital solutions that transform businesses and create lasting impact. From startups to enterprises — we build what matters.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                            <a href="mailto:hello@envalis.com"
                                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                                <EnvelopeSimple size={16} weight="duotone" className="text-brand-400 shrink-0" />
                                hello@envalis.com
                            </a>
                            <a href="tel:+919876543210"
                                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                                <Phone size={16} weight="duotone" className="text-brand-400 shrink-0" />
                                +91 98765 43210
                            </a>
                            <p className="flex items-start gap-2.5 text-sm text-white/50">
                                <MapPin size={16} weight="duotone" className="text-brand-400 shrink-0 mt-0.5" />
                                Ahmedabad, Gujarat, India — 380001
                            </p>
                        </div>

                        {/* Socials */}
                        <div className="flex items-center gap-2">
                            {socials.map((s) => (
                                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                    aria-label={s.label}>
                                    <s.icon size={16} weight="duotone" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section}>
                            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">{section}</p>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link to={link.href}
                                            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                                            {link.label}
                                            {link.badge && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="mt-14 pt-10 border-t border-white/10">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Stay in the loop</h3>
                            <p className="text-sm text-white/50">
                                Get the latest insights, articles, and updates delivered to your inbox.
                            </p>
                        </div>
                        <form
                            className="flex gap-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setSubscribed(true);
                                setEmail("");
                                setTimeout(() => setSubscribed(false), 3000);
                            }}
                        >
                            <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-brand-500 rounded-xl"
                            />
                            <Button type="submit" variant="gradient" className="shrink-0">
                                {subscribed ? "✓ Done" : "Subscribe"} <ArrowRight size={16} />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <Separator className="mt-10 bg-white/10" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <p className="text-sm text-white/30">
                        © {new Date().getFullYear()} Envalis Technologies All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-sm text-white/30">
                        Built by the Envalis Team
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;