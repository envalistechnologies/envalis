import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicAPI } from "@/api/publicApi";
import {
    List, X, CaretDown, ArrowRight,
    Briefcase, FileMagnifyingGlass, Article, FileText, Folder
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "@/assets/envalis.svg";

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

const MegaMenu = ({ type, onClose, services = [], isServicesLoading = false }) => {
    const displayServices = services.map((s) => ({
        label: s.title,
        icon: Briefcase,
        href: `/services/${s.slug}`
    }));

    if (type === "services") return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-120 bg-white rounded-2xl border border-border shadow-2xl shadow-black/10 p-6 animate-in fade-in-0 slide-in-from-top-2 duration-200 z-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Our Services</p>
            {isServicesLoading ? (
                <div className="py-6 text-sm text-muted-foreground">Loading services...</div>
            ) : displayServices.length > 0 ? (
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
            ) : (
                <div className="py-6 text-sm text-muted-foreground">No published services found.</div>
            )}
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
    const [mobileSection, setMobileSection] = useState(null);
    const location = useLocation();
    const megaRef = useRef(null);
    // Treat header as light by default so links are visible on light heroes
    const lightHero = true;
    const { data: navbarServices = [], isLoading: isServicesLoading } = useQuery({
        queryKey: ["navbar-services"],
        queryFn: () => publicAPI.getServices({ limit: 12, sortBy: "createdAt", sortOrder: "desc" }).then((r) => r.data.services),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setActiveMega(null);
        setMobileSection(null);
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
                : lightHero ? "bg-transparent" : "bg-transparent"
        )}>
            <div className="container">
                <div className="flex items-center justify-between h-16 lg:h-18">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <img src={Logo} alt="Envalis Logo" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className={cn(
                                "text-xl font-black tracking-tight transition-colors duration-300",
                                scrolled ? "text-foreground" : lightHero ? "text-foreground" : "text-white"
                            )}>
                                Envalis
                            </span>
                            <span className={cn(
                                "text-[10px] font-semibold tracking-widest uppercase transition-colors duration-300",
                                scrolled ? "text-muted-foreground" : lightHero ? "text-muted-foreground" : "text-white/40"
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
                                                    : lightHero ? "text-brand-600 bg-brand-50" : "text-white bg-white/20"
                                                : scrolled
                                                    ? "text-foreground hover:text-brand-600 hover:bg-accent hover:-translate-y-0.5"
                                                    : lightHero
                                                        ? "text-foreground/80 hover:text-brand-600 hover:bg-accent hover:-translate-y-0.5"
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
                                                    : lightHero ? "text-brand-600 bg-brand-50 font-semibold" : "text-white bg-white/20 font-semibold"
                                                : scrolled
                                                    ? "text-foreground hover:text-brand-600 hover:bg-accent hover:-translate-y-0.5"
                                                    : lightHero
                                                        ? "text-foreground/80 hover:text-brand-600 hover:bg-accent hover:-translate-y-0.5"
                                                        : "text-white/90 hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
                                        )}
                                    >
                                        {link.label}
                                    </NavLink>
                                )}
                                {activeMega === link.mega && (
                                    <MegaMenu
                                        type={link.mega}
                                        onClose={() => setActiveMega(null)}
                                        services={navbarServices}
                                        isServicesLoading={isServicesLoading}
                                    />
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        <Link to="/contact">
                            <Button
                                size="sm"
                                variant={scrolled ? "default" : lightHero ? "outline" : "outline"}
                                className={cn(
                                    "hidden sm:flex transition-all rounded-full",
                                    !scrolled && !lightHero && "bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm",
                                    !scrolled && lightHero && "border-border text-foreground hover:bg-accent"
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
                                    : lightHero ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"
                            )}
                        >
                            {mobileOpen ? <X size={20} /> : <List size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-[min(88vw,20rem)] p-0 bg-white">
                    <div className="flex h-full flex-col">
                        <div className="flex items-center gap-3 border-b border-border px-5 py-4 pr-14">
                            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                                    <img src={Logo} alt="Envalis Logo" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-base font-black tracking-tight text-foreground">Envalis</span>
                                    <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Technologies</span>
                                </div>
                            </Link>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <div key={link.label} className="space-y-1">
                                    {link.mega ? (
                                        <button
                                            type="button"
                                            onClick={() => setMobileSection(mobileSection === link.mega ? null : link.mega)}
                                            className={cn(
                                                "flex w-full items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                mobileSection === link.mega
                                                    ? "bg-brand-50 text-brand-700"
                                                    : "text-foreground hover:bg-accent"
                                            )}
                                        >
                                            {link.label}
                                            <CaretDown
                                                size={14}
                                                weight="bold"
                                                className={cn("transition-transform duration-200", mobileSection === link.mega && "rotate-180")}
                                            />
                                        </button>
                                    ) : (
                                        <SheetClose asChild>
                                            <NavLink
                                                to={link.href}
                                                className={({ isActive }) => cn(
                                                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-brand-50 text-brand-700"
                                                        : "text-foreground hover:bg-accent"
                                                )}
                                            >
                                                {link.label}
                                            </NavLink>
                                        </SheetClose>
                                    )}

                                    {link.mega === "services" && mobileSection === "services" && (
                                        <div className="ml-4 space-y-1 border-l border-border/80 pl-3 pb-2 animate-in slide-in-from-top-1 duration-200">
                                            {isServicesLoading ? (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">Loading services...</div>
                                            ) : navbarServices.length > 0 ? (
                                                navbarServices.map((service) => (
                                                    <SheetClose asChild key={service._id}>
                                                        <Link
                                                            to={`/services/${service.slug}`}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                                        >
                                                            <Briefcase size={14} /> {service.title}
                                                        </Link>
                                                    </SheetClose>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">No published services found.</div>
                                            )}
                                        </div>
                                    )}

                                    {link.mega === "resources" && mobileSection === "resources" && (
                                        <div className="ml-4 space-y-1 border-l border-border/80 pl-3 pb-2 animate-in slide-in-from-top-1 duration-200">
                                            {resources.map((resource) => (
                                                <SheetClose asChild key={resource.href}>
                                                    <Link
                                                        to={resource.href}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                                    >
                                                        <resource.icon size={14} />
                                                        <span>{resource.label}</span>
                                                    </Link>
                                                </SheetClose>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        <div className="border-t border-border p-4">
                            <SheetClose asChild>
                                <Link to="/contact">
                                    <Button variant="gradient" className="w-full">
                                        Get Started <ArrowRight size={16} />
                                    </Button>
                                </Link>
                            </SheetClose>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
};

export default Navbar;