import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Trophy, Rocket, Users, Globe, Star,
  CheckCircle, Heart, Lightbulb, ShieldCheck, Handshake,
  LinkedinLogo, TwitterLogo, GithubLogo, ArrowUpRight,
  Code, DeviceMobile, PaintBrush, Cloud, Robot,
  MapPin, Envelope, Phone
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import HeroHeader from "@/components/sections/HeroHeader";
import { publicAPI } from "@/api/publicApi";
import { getInitials } from "@/lib/utils";

const AboutHero = () => (
  <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-purple-900">
    {/* Background layers */}
    <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-[#0d0a1f] to-brand-950" />
    <div className="absolute inset-0 bg-grid opacity-10" />
    <div className="absolute inset-0 bg-dots opacity-[0.07]" />

    {/* Glow orbs */}
    <div className="absolute top-0 right-0 w-150 h-150 bg-brand-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
    <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-600/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
    <div className="absolute top-1/2 left-1/2 w-100 h-100 bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

    <div className="container mx-auto relative z-10 text-center pt-32 pb-20">
      <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full text-sm">
        About Envalis
      </Badge>
      <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight max-w-4xl mx-auto">
        We Build Digital{" "}
        <span className="text-yellow-300">Futures</span>{" "}
        That Last
      </h1>
      <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
        Since 2024, Envalis has been at the intersection of design and technology crafting experiences that move businesses forward and delight the people who use them.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/contact">
          <Button size="lg" variant="white" className="font-bold">
            Work With Us <ArrowRight size={18} />
          </Button>
        </Link>
        <Link to="/portfolio">
          <Button size="lg" variant="glass" className="font-bold">
            View Our Work
          </Button>
        </Link>
      </div>

      {/* Floating stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
        {[
          { n: "8+", l: "Projects Delivered" },
          { n: "7+", l: "Global Clients" },
          { n: "99%", l: "Satisfaction Rate" },
          { n: "2", l: "Years of Excellence" },
        ].map((s) => (
          <div key={s.l} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
            <div className="text-3xl font-black text-white">{s.n}</div>
            <div className="text-white/60 text-sm mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Our Story
const OurStory = () => (
  <section className="section-padding">
    <div className="container mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: timeline */}
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-linear-to-b from-brand-200 via-brand-400 to-transparent" />
          <div className="space-y-10 pl-14">
            {[
              { year: "2024", title: "The Beginning", desc: "Envalis was founded by two friends with a bold idea: build digital products that actually solve real problems for real people." },
              { year: "2025", title: "First 8 Clients", desc: "We grew from a two-person studio to a 12-member team, picking up our first enterprise clients and shipping products across three continents." },
              { year: "2026", title: "AI & Cloud Expansion", desc: "We launched our AI/ML and Cloud practices to meet soaring demand for intelligent, scalable digital infrastructure." },
            ].map((item, i) => (
              <div key={item.year} className="relative">
                <div className="absolute -left-14 w-10 h-10 rounded-full bg-linear-to-br from-brand-100 to-purple-100 border-4 border-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <div className="w-3 h-3 rounded-full bg-brand-600" />
                </div>
                <div className="group p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card">
                  <Badge variant="secondary" className="mb-2 text-xs">{item.year}</Badge>
                  <h4 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: text */}
        <div>
          <HeroHeader
            badge="Our Story"
            title="Two Years of"
            highlight="Crafting Excellence"
            description="What started as a two-person design studio in a cramped co-working space has grown into a full-service digital agency trusted by startups and Fortune 500 companies alike."
            align="left"
            className="mb-8"
          />
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              We believe the best digital products are born at the intersection of deep craft and genuine empathy. Every pixel, every line of code, every interaction is designed with intention because the details are what separate good from unforgettable.
            </p>
            <p>
              Our team of designers, engineers, and strategists work as one unified studio. No silos. No hand-offs lost in translation. Just collaborative, transparent execution from discovery to deployment and beyond.
            </p>
            <p>
              Whether you're a scrappy startup looking to launch fast or an enterprise navigating digital transformation, we bring the same relentless focus on quality and outcomes.
            </p>
          </div>
          <div className="mt-8">
            <Link to="/contact">
              <Button size="lg" variant="gradient">
                Start Your Journey <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Mission & Vision
const MissionVision = () => (
  <section className="section-padding bg-muted/30">
    <div className="container mx-auto">
      <HeroHeader
        badge="What Drives Us"
        title="Mission, Vision &"
        highlight="Values"
        description="Three pillars that guide every decision we make, every product we ship, and every relationship we build."
        className="mb-14"
      />
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Rocket,
            color: "from-brand-500 to-purple-600",
            label: "Mission",
            title: "Empower Through Technology",
            desc: "To deliver exceptional digital experiences that empower businesses to grow, compete, and thrive in a rapidly evolving landscape. We do this by blending world-class craft with strategic thinking.",
          },
          {
            icon: Lightbulb,
            color: "from-yellow-500 to-orange-500",
            label: "Vision",
            title: "A World Better Connected",
            desc: "We envision a world where every business regardless of size has access to the same quality of digital innovation once reserved for tech giants. Democratizing great software is our north star.",
          },
          {
            icon: Heart,
            color: "from-pink-500 to-rose-600",
            label: "Purpose",
            title: "People First, Always",
            desc: "Behind every product is a human being. We design and build with empathy at the core understanding the real problems people face and creating solutions that feel intuitive, delightful, and meaningful.",
          },
        ].map((item) => (
          <div key={item.label}
            className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <item.icon size={24} weight="duotone" className="text-white" />
            </div>
            <Badge variant="secondary" className="mb-3 text-xs">{item.label}</Badge>
            <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Core Values
const values = [
  { icon: ShieldCheck, title: "Integrity", desc: "We say what we mean and deliver what we promise. Transparency is the foundation of every client relationship." },
  { icon: Lightbulb, title: "Innovation", desc: "We're always exploring what's next pushing the boundaries of what's possible with technology and design." },
  { icon: Users, title: "Collaboration", desc: "The best outcomes happen when clients and our team think together as a single, unified creative force." },
  { icon: Trophy, title: "Excellence", desc: "We hold ourselves to the highest standards. Good enough never is. Every detail matters." },
  { icon: Heart, title: "Empathy", desc: "We listen deeply to understand the real needs behind every request, designing with humans at the center." },
  { icon: Globe, title: "Impact", desc: "We measure success not just in metrics but in the real-world change our work creates for people and businesses." },
];

const ValuesSection = () => (
  <section className="section-padding">
    <div className="container mx-auto">
      <HeroHeader
        badge="How We Work"
        title="The Values We"
        highlight="Live By"
        description="Our culture is our product. These aren't words on a wall they're the principles that shape how we show up every single day."
        className="mb-14"
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {values.map((v) => (
          <div key={v.title} className="flex items-start gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
              <v.icon size={20} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-1.5 group-hover:text-primary transition-colors">{v.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Services We Offer
const aboutServices = [
  { icon: Code, label: "Web Development", color: "from-blue-500 to-brand-600", href: "/services/web-development" },
  { icon: DeviceMobile, label: "Mobile Apps", color: "from-brand-500 to-purple-600", href: "/services/mobile-apps" },
  { icon: PaintBrush, label: "UI/UX Design", color: "from-purple-500 to-pink-600", href: "/services/ui-ux-design" },
  { icon: Cloud, label: "Cloud Solutions", color: "from-cyan-500 to-blue-600", href: "/services/cloud" },
  { icon: Robot, label: "AI & ML", color: "from-green-500 to-emerald-600", href: "/services/ai-ml" },
  { icon: Handshake, label: "Consulting", color: "from-orange-500 to-red-600", href: "/services/consulting" },
];

const ServicesStrip = () => (
  <section className="section-padding bg-muted/30">
    <div className="container mx-auto">
      <HeroHeader
        badge="What We Do"
        title="Our Full Range of"
        highlight="Capabilities"
        description="End-to-end digital expertise under one roof so your project never loses momentum through handoffs."
        className="mb-12"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {aboutServices.map((s) => (
          <Link key={s.href} to={s.href}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 text-center">
            <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${s.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <s.icon size={22} weight="duotone" className="text-white" />
            </div>
            <span className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight">{s.label}</span>
          </Link>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link to="/services">
          <Button variant="outline" size="lg">Explore All Services <ArrowRight size={16} /></Button>
        </Link>
      </div>
    </div>
  </section>
);

// Team Section
const TeamSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-employees"],
    queryFn: () => publicAPI.getEmployees().then(r => r.data.employees),
  });

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <HeroHeader
          badge="The People"
          title="Meet the Team Behind"
          highlight="Envalis"
          description="A diverse group of designers, engineers, and strategists united by a shared obsession: building things that matter."
          className="mb-14"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse space-y-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-full" />
              </Card>
            ))
          ) : data?.length > 0 ? (
            data.map((member) => (
              <Card key={member._id}
                className="group p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border border-border hover:border-primary/30 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary/30 transition-colors">
                    <AvatarImage src={member.avatar?.url} />
                    <AvatarFallback className="bg-linear-to-br from-brand-100 to-purple-100 text-brand-700 font-bold text-sm">
                      {getInitials(`${member.firstName} ${member.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold group-hover:text-primary transition-colors">{member.firstName} {member.lastName}</h4>
                    <p className="text-xs text-primary font-semibold mt-0.5">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">{member.bio}</p>
                <div className="flex items-center gap-2">
                  {member.socials?.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-brand-100 hover:text-brand-600 transition-colors">
                      <LinkedinLogo size={15} weight="fill" />
                    </a>
                  )}
                  {member.socials?.twitter && (
                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-brand-100 hover:text-brand-600 transition-colors">
                      <TwitterLogo size={15} weight="fill" />
                    </a>
                  )}
                  {member.socials?.github && (
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-brand-100 hover:text-brand-600 transition-colors">
                      <GithubLogo size={15} weight="fill" />
                    </a>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Our team is growing! Check back soon.
            </div>
          )}
        </div>
        <div className="text-center mt-10">
          <Link to="/careers">
            <Button variant="outline" size="lg">Join Our Team <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// CTA
const AboutCTA = () => (
  <section className="section-padding bg-linear-to-br from-brand-900 via-brand-800 to-purple-900 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-20" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
    <div className="container mx-auto relative z-10 text-center">
      <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full">
        🤝 Let's Collaborate
      </Badge>
      <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-6 max-w-3xl mx-auto leading-tight">
        Ready to Build Something <span className="text-yellow-300">Remarkable?</span>
      </h2>
      <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Whether you have a clear vision or just an idea on a napkin — we're the team to make it real. Let's start a conversation today.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/contact">
          <Button size="xl" variant="white" className="font-bold">
            Get In Touch <ArrowRight size={18} />
          </Button>
        </Link>
        <Link to="/case-studies">
          <Button size="xl" variant="glass" className="font-bold">
            Read Case Studies
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

// Main About Component
const About = () => (
  <div>
    <AboutHero />
    <OurStory />
    <MissionVision />
    <ValuesSection />
    <ServicesStrip />
    <TeamSection />
    <AboutCTA />
  </div>
);

export default About;