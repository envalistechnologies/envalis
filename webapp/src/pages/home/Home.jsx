import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Code, DeviceMobile, PaintBrush, Cloud, Robot, Handshake,
  Star, ArrowUpRight, Quotes, CheckCircle, Trophy, Users, Rocket, Globe,
  ClipboardText, ChatDots, TrendUp
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import HeroHeader from "@/components/sections/HeroHeader";
import Hero from "@/components/sections/Hero";
import { publicAPI } from "@/api/publicApi.js";
import { getInitials, truncate, formatDate } from "@/lib/utils";
import figmaLogo from "@/assets/figma.png";
import reactLogo from "@/assets/reactjs.png";
import nextLogo from "@/assets/nextjs.png";
import nodeLogo from "@/assets/nodejs.png";
import tailwindLogo from "@/assets/tailwindcss.png";
import canvaLogo from "@/assets/canva.png";
import vscodeLogo from "@/assets/vscode.png";
import gitLogo from "@/assets/git.png";

// Trusted by logos — horizontal brand strip
const trustedBrands = ["IRVIUM", "LoopSystem", "GGO", "LOCIO", "TechNova", "PixelForge"];
const TrustedSection = () => (
  <section className="py-10 bg-white border-b border-slate-100">
    <div className="container mx-auto">
      <p className="text-center text-[11px] text-muted-foreground font-medium mb-6 tracking-[0.15em]">
        Trusted by the globe's leading innovative enterprises
      </p>
      <div className="flex items-center justify-center flex-wrap gap-x-10 gap-y-4">
        {trustedBrands.map((name) => (
          <div key={name} className="text-base font-bold text-slate-300 tracking-tight hover:text-slate-500 transition-colors cursor-default px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/50">
            {name}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const defaultColors = [
  "from-blue-500 to-brand-600",
  "from-brand-500 to-purple-600",
  "from-purple-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-red-600",
];

// Process Steps — "Simple Steps, Big Creative Impact"
const processSteps = [
  {
    step: "Step 01",
    timeline: "Week 1",
    icon: ClipboardText,
    title: "Discover & Plan",
    desc: "We start with a deep-dive into your business goals, audience, and competitive landscape to craft a clear strategy and roadmap.",
    deliverables: ["Discovery workshop", "User insights", "Project roadmap"],
    color: "from-brand-500 to-blue-500",
    bgColor: "bg-brand-50",
  },
  {
    step: "Step 02",
    timeline: "Weeks 2-4",
    icon: ChatDots,
    title: "Design & Build",
    desc: "Our designers and engineers work in agile sprints, delivering pixel-perfect designs and clean, scalable code on a rapid timeline.",
    deliverables: ["UI/UX design", "Interactive prototype", "Sprint builds"],
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
  },
  {
    step: "Step 03",
    timeline: "Weeks 5+",
    icon: TrendUp,
    title: "Launch & Scale",
    desc: "We deploy, test, and optimize — then provide ongoing support to help your product grow with real users and real data.",
    deliverables: ["Go-live support", "Performance tuning", "Growth analytics"],
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
  },
];

const ProcessSection = () => (
  <section className="section-padding bg-white">
    <div className="container mx-auto">
      <HeroHeader
        title="Simple Steps,"
        highlight="Big Creative Impact"
        description="We follow a straightforward process, turning your ideas into impactful solutions with clear steps and creative collaboration every time."
        className="mb-16"
        size="lg"
      />
      <div className="grid md:grid-cols-3 gap-8">
        {processSteps.map((step, idx) => (
          <div key={step.title} className="group relative">
            {/* Step card */}
            <div className={`rounded-3xl ${step.bgColor} p-6 pb-8 hover:shadow-xl hover:shadow-brand-100/50 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-brand-100`}>
              <div className="flex items-center justify-between mb-4 text-xs font-semibold text-muted-foreground">
                <span className="uppercase tracking-widest">{step.step}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/70 border border-white/60">{step.timeline}</span>
              </div>
              {/* Visual mock area */}
              <div className="relative h-44 rounded-2xl bg-white shadow-sm border border-slate-100 mb-6 overflow-hidden flex items-center justify-center">
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon size={28} weight="duotone" className="text-white" />
                </div>
                {/* Floating mini elements */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center animate-float-slow">
                  <div className="w-3 h-3 rounded-full bg-linear-to-br from-brand-400 to-purple-400" />
                </div>
                <div className="absolute bottom-3 left-3 w-16 h-2 rounded-full bg-slate-100" />
                <div className="absolute bottom-3 left-3 mt-2 w-10 h-2 rounded-full bg-slate-100 translate-y-3" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              <div className="mt-4 space-y-2">
                {step.deliverables.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ServicesSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["featuredServices"],
    queryFn: () => publicAPI.getServices({ limit: 6, status: "published" }).then(r => r.data.services),
  });

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto">
        <HeroHeader
          badge="What We Do"
          title="Services Built for"
          highlight="Modern Businesses"
          description="From concept to launch, we offer end-to-end digital solutions tailored to your unique needs and growth ambitions."
          className="mb-14"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white p-6 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-2xl mb-4" />
                <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-1" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))
          ) : data?.length ? (
            data.map((s, idx) => {
              const color = defaultColors[idx % defaultColors.length];
              return (
                <Link key={s._id} to={`/services/${s.slug}`}
                  className="group relative p-6 rounded-2xl border border-border/60 bg-white hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Code size={24} weight="duotone" className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-brand-600 transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{s.shortDescription}</p>
                  <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground">No services found.</div>
          )}
        </div>
        <div className="text-center mt-10">
          <Link to="/services">
            <Button variant="outline" size="lg" className="rounded-full">View All Services <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Key Benefits — lavender/purple background section
const whyUs = [
  { icon: Trophy, title: "Award-Winning Quality", desc: "Recognized by industry leaders for exceptional design and development standards." },
  { icon: Rocket, title: "Fast Delivery", desc: "Agile sprints and dedicated teams ensure we ship on time, every time." },
  { icon: Users, title: "Expert Team", desc: "3+ seasoned professionals across design, engineering, and strategy." },
  { icon: Globe, title: "Global Reach", desc: "Serving clients across 20+ countries with round-the-clock support." },
];

const WhyUsSection = () => (
  <section className="section-padding relative overflow-hidden">
    {/* Lavender/purple gradient background */}
    <div className="absolute inset-0 bg-linear-to-b from-brand-50/60 via-purple-50/40 to-brand-100/50" />
    <div className="absolute inset-0 bg-dots opacity-20" />

    <div className="container mx-auto relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <HeroHeader
            badge="Why Envalis Technologies"
            title="Key Benefit we"
            highlight="Deliver to our Partners"
            description="Every project is a collaboration built on transparency, innovation, and a relentless pursuit of quality that exceeds expectations."
            align="left"
            className="mb-10"
            size="lg"
          />
          <div className="space-y-5">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-brand-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors">
                  <item.icon size={20} weight="duotone" className="text-brand-600" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/about">
              <Button size="lg" variant="gradient" className="rounded-full font-bold shadow-lg shadow-brand-500/20">
                Meet Our Team <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual element — tool icons grid */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden bg-white border border-brand-100/50 shadow-xl shadow-brand-100/30 p-8">
            {/* Tool icons grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { name: "Figma", icon: figmaLogo, bg: "#FEF2F2" },
                { name: "React", icon: reactLogo, bg: "#ECFEFF" },
                { name: "Next.js", icon: nextLogo, bg: "#F3F4F6" },
                { name: "Node", icon: nodeLogo, bg: "#ECFDF5" },
                { name: "Tailwind", icon: tailwindLogo, bg: "#EFF6FF" },
                { name: "Canva", icon: canvaLogo, bg: "#ECFDF5" },
                { name: "VS Code", icon: vscodeLogo, bg: "#EFF6FF" },
                { name: "Git", icon: gitLogo, bg: "#FEF2F2" },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="aspect-square rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 transition-transform cursor-default"
                  style={{ background: tool.bg }}
                >
                  <img
                    src={tool.icon}
                    alt={`${tool.name} logo`}
                    className="w-12 h-12 object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            {/* CTA card inside */}
            <div className="rounded-2xl bg-linear-to-br from-brand-600 via-brand-700 to-purple-700 p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                Transform Your Business with Expert Design & Development Solutions 🚀
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                We combine creativity with cutting-edge technology to deliver outstanding results.
              </p>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl shadow-brand-100/40 p-3 border border-brand-50 animate-float">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {["#6366f1", "#8b5cf6", "#ec4899"].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white" style={{ background: c }}>
                    {["A", "B", "C"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Happy Clients</div>
                <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} weight="fill" className="text-yellow-400" />)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Featured Work
const FeaturedWork = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["featuredPortfolios"],
    queryFn: () => publicAPI.getPortfolios({ featured: true, limit: 3 }).then(r => r.data.portfolios),
  });

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-12">
          <HeroHeader badge="Our Work" title="Selected" highlight="Projects" align="left" className="max-w-xl" />
          <Link to="/portfolio" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden animate-pulse">
                <div className="h-56 bg-muted" />
                <div className="p-5 space-y-3"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-6 bg-muted rounded w-3/4" /></div>
              </div>
            ))
            : data?.length
              ? data.map((p) => (
                <Link key={p._id} to={`/portfolio/${p.slug}`}
                  className="group rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 bg-card">
                  <div className="relative h-56 overflow-hidden bg-muted">
                    {p.coverImage?.url
                      ? <img src={p.coverImage.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full bg-linear-to-br from-brand-100 to-purple-100 flex items-center justify-center"><Code size={48} className="text-brand-300" /></div>
                    }
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow">
                        <ArrowUpRight size={16} className="text-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge variant="default" className="mb-3 text-xs capitalize">{p.category?.replace("_", " ")}</Badge>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.shortDescription}</p>
                    {p.technologies?.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {p.technologies.slice(0, 3).map(t => <span key={t} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{t}</span>)}
                      </div>
                    )}
                  </div>
                </Link>
              ))
              : (
                <div className="col-span-3 text-center py-16 text-muted-foreground">Portfolio coming soon</div>
              )
          }
        </div>
      </div>
    </section>
  );
};

// Testimonials
const TestimonialsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["featuredTestimonials"],
    queryFn: () => publicAPI.getFeaturedTestimonials().then(r => r.data.testimonials),
  });

  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <HeroHeader badge="Client Love" title="What Our Clients" highlight="Say About Us" description="Don't take our word for it, hear from the businesses we've helped transform." className="mb-14" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-2xl border p-6 animate-pulse space-y-4"><div className="h-4 bg-muted rounded w-full" /><div className="h-4 bg-muted rounded w-2/3" /><div className="flex items-center gap-3 mt-4"><div className="w-10 h-10 bg-muted rounded-full" /><div className="space-y-1 flex-1"><div className="h-3 bg-muted rounded w-1/2" /><div className="h-3 bg-muted rounded w-1/3" /></div></div></div>)
            : data?.length
              ? data.slice(0, 6).map((t) => (
                <Card key={t._id} className="p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-4 right-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                    <Quotes size={48} weight="fill" />
                  </div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={16} weight="fill" className="text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-4 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={t.clientAvatar?.url} />
                      <AvatarFallback>{getInitials(t.clientName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">{t.clientName}</p>
                      <p className="text-xs text-muted-foreground">{t.clientDesignation}, {t.clientCompany}</p>
                    </div>
                  </div>
                </Card>
              ))
              : null
          }
        </div>
        <div className="text-center mt-10">
          <Link to="/testimonials">
            <Button variant="outline" size="lg" className="rounded-full">Read All Reviews <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Latest Blogs
const BlogsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["latestBlogs"],
    queryFn: () => publicAPI.getBlogs({ limit: 3, sortBy: "publishedAt", sortOrder: "desc" }).then(r => r.data.blogs),
  });

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-12">
          <HeroHeader badge="Knowledge Hub" title="Latest" highlight="Insights" align="left" className="max-w-xl" />
          <Link to="/blog" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
            All articles <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="h-5 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))
            : data?.map((blog) => (
              <Link key={blog._id} to={`/blog/${blog.slug}`}
                className="group rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 bg-card">
                <div className="h-48 overflow-hidden bg-muted relative">
                  {blog.coverImage?.url
                    ? <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full bg-linear-to-br from-brand-50 to-purple-50" />
                  }
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default" className="text-xs capitalize">{blog.category}</Badge>
                    <span className="text-xs text-muted-foreground">{blog.readTime} min read</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{blog.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                    <span className="text-xs text-muted-foreground">{formatDate(blog.publishedAt)}</span>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">Read more <ArrowRight size={12} /></span>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => (
  <section className="section-padding bg-linear-to-br from-brand-900 via-brand-800 to-purple-900 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-20" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
    <div className="container mx-auto relative z-10 text-center">
      <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full">🚀 Let's Get Started</Badge>
      <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-6 max-w-3xl mx-auto leading-tight">
        Ready to Transform Your <span className="text-yellow-300">Business?</span>
      </h2>
      <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Join 50+ companies that have scaled their digital presence with Envalis Technologies. Let's build something remarkable together.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/contact">
          <Button size="xl" variant="white" className="font-bold">
            Start a Conversation <ArrowRight size={18} />
          </Button>
        </Link>
        <Link to="/case-studies">
          <Button size="xl" variant="glass" className="font-bold">
            See Success Stories
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

// HOME PAGE
const Home = () => (
  <div>
    <Hero />
    <TrustedSection />
    <ProcessSection />
    <ServicesSection />
    <WhyUsSection />
    <FeaturedWork />
    <TestimonialsSection />
    <BlogsSection />
    <CTASection />
  </div>
);

export default Home;