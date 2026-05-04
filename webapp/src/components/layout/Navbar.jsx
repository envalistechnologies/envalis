import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicAPI } from "@/api/publicApi";
import {
    List, X, MagnifyingGlass, CaretDown, ArrowRight,
    Briefcase, FileMagnifyingGlass, Article, FileText, Folder,
    Headset, Users, Phone, Star, Buildings
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Logo from "@/assets/envalis.svg";

const services = [
    { label: "Web Development", icon: Briefcase, href: "/services/web-development" },
    { label: "Mobile Apps", icon: Briefcase, href: "/services/mobile-apps" },
    { label: "UI/UX Design", icon: Briefcase, href: "/services/ui-ux-design" },
    { label: "Cloud Solutions", icon: Briefcase, href: "/services/cloud" },
    { label: "AI & ML", icon: Briefcase, href: "/services/ai-ml" },
    { label: "Consulting", icon: Headset, href: "/services/consulting" },
];

const resources = [
    { label: "Blog", icon: Article, href: "/blog", desc: "Tips & insights" },
    { label: "Articles", icon: FileText, href: "/articles", desc: "Deep-dive research" },
    { label: "Case Studies", icon: FileMagnifyingGlass, href: "/case-studies", desc: "Real project stories" },
    { label: "Resources", icon: Folder, href: "/resources", desc: "Free downloads" },
];

const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services", mega: "services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Resources", href: "#", mega: "resources" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
];

const MegaMenu = ({ type, onClose }) => {
    const { data: servicesData } = useQuery({
        queryKey: ["navbar-services"],
        queryFn: () => publicAPI.getServices({ limit: 6 }).then((r) => r.data.services),
        enabled: type === "services",
    });

    const displayServices = servicesData?.map(s => ({
        label: s.title,
        icon: Briefcase,
        href: `/services/${s.slug}`
    })) || services;

    if (type === "services") return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-120 bg-white rounded-2xl border border-border shadow-2xl shadow-black/10 p-6 animate-in fade-in-0 slide-in-from-top-2 duration-200 z-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Our Services</p>
            <div className="grid grid-cols-2 gap-2">
                {displayServices.map((s) => (
                    <Link key={s.href} to={s.href} onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 hover:text-brand-700 hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                            <s.icon size={16} weight="duotone" className="text-brand-600" />
                        </div>
                        <span className="text-sm font-medium">{s.label}</span>
                    </Link>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
                <Link to="/services" onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                    View all services <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );

    if (type === "resources") return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-100 bg-white rounded-2xl border border-border shadow-2xl shadow-black/10 p-6 animate-in fade-in-0 slide-in-from-top-2 duration-200 z-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Knowledge Hub</p>
            <div className="space-y-1">
                {resources.map((r) => (
                    <Link key={r.href} to={r.href} onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors shrink-0">
                            <r.icon size={18} weight="duotone" className="text-brand-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{r.label}</p>
                            <p className="text-xs text-muted-foreground">{r.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
    return null;
};

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeMega, setActiveMega] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const location = useLocation();
    const megaRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setActiveMega(null);
    }, [location]);

    useEffect(() => {
        const handleClick = (e) => {
            if (megaRef.current && !megaRef.current.contains(e.target)) setActiveMega(null);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled
                ? "bg-white/95 backdrop-blur-xl border-b border-border shadow-sm"
                : "bg-transparent"
        )}>
            <div className="container">
                <div className="flex items-center justify-between h-16 lg:h-18">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <img src={Logo} alt="Envalis Logo" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className={cn(
                                "text-xl font-black tracking-tight transition-colors duration-300",
                                scrolled ? "text-foreground" : "text-white"
                            )}>
                                Envalis
                            </span>
                            <span className={cn(
                                "text-[10px] font-semibold tracking-widest uppercase transition-colors duration-300",
                                scrolled ? "text-muted-foreground" : "text-white/40"
                            )}>
                                Technologies
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1" ref={megaRef}>
                        {navLinks.map((link) => (
                            <div key={link.label} className="relative">
                                {link.mega ? (
                                    <button
                                        onClick={() => setActiveMega(activeMega === link.mega ? null : link.mega)}
                                        className={cn(
                                            "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                            activeMega === link.mega
                                                ? scrolled
                                                    ? "text-brand-600 bg-brand-50"
                                                    : "text-white bg-white/20"
                                                : scrolled
                                                    ? "text-foreground hover:text-brand-600 hover:bg-accent hover:-translate-y-0.5"
                                                    : "text-white/90 hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
                                        )}
                                    >
                                        {link.label}
                                        <CaretDown
                                            size={13}
                                            weight="bold"
                                            className={cn(
                                                "transition-transform duration-200",
                                                activeMega === link.mega && "rotate-180"
                                            )}
                                        />
                                    </button>
                                ) : (
                                    <NavLink
                                        to={link.href}
                                        className={({ isActive }) => cn(
                                            "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-block",
                                            isActive
                                                ? scrolled
                                                    ? "text-brand-600 bg-brand-50"
                                                    : "text-white bg-white/20 font-semibold"
                                                : scrolled
                                                    ? "text-foreground hover:text-brand-600 hover:bg-accent hover:-translate-y-0.5"
                                                    : "text-white/90 hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
                                        )}
                                    >
                                        {link.label}
                                    </NavLink>
                                )}
                                {activeMega === link.mega && (
                                    <MegaMenu type={link.mega} onClose={() => setActiveMega(null)} />
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className={cn(
                                "hidden sm:flex w-9 h-9 rounded-lg items-center justify-center transition-colors",
                                scrolled
                                    ? "text-foreground hover:bg-accent"
                                    : "text-white/80 hover:bg-white/10"
                            )}
                        >
                            <MagnifyingGlass size={18} weight="bold" />
                        </button>

                        <Link to="/contact">
                            <Button
                                size="sm"
                                variant={scrolled ? "default" : "outline"}
                                className={cn(
                                    "hidden sm:flex transition-all",
                                    !scrolled && "bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm"
                                )}
                            >
                                Get Started
                            </Button>
                        </Link>

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className={cn(
                                "lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                scrolled
                                    ? "text-foreground hover:bg-accent"
                                    : "text-white hover:bg-white/10"
                            )}
                        >
                            {mobileOpen ? <X size={20} /> : <List size={20} />}
                        </button>
                    </div>
                </div>

                {/* Search bar */}
                {searchOpen && (
                    <div className="pb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="relative">
                            <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                autoFocus
                                placeholder="Search blogs, services, case studies..."
                                className="w-full h-12 pl-11 pr-4 bg-white rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-lg"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-border shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <nav className="container py-4 space-y-1">
                        {navLinks.map((link) => (
                            <div key={link.label}>
                                <NavLink
                                    to={link.href === "#" ? "/blog" : link.href}
                                    className={({ isActive }) => cn(
                                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-brand-50 text-brand-700"
                                            : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    {link.label}
                                    {link.mega && <CaretDown size={14} />}
                                </NavLink>
                                {link.mega === "services" && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {services.map((s) => (
                                            <Link
                                                key={s.href}
                                                to={s.href}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                            >
                                                <s.icon size={14} /> {s.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="pt-3 border-t border-border">
                            <Link to="/contact">
                                <Button variant="gradient" className="w-full">
                                    Get Started <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;