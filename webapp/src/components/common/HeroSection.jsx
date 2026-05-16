import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, CheckCircle } from "@phosphor-icons/react";

const HeroSection = ({
  badge,
  title,
  description,
  subtitle,
  className = "",
  contentClassName = "",
  search,
  onSearchChange,
  searchPlaceholder,
  image, // optional right-side image URL or JSX
  rightContent, // optional JSX to render on the right side
  actions, // optional actions JSX (buttons)
  layout = "split", // 'center' or 'split'
}) => {
  if (layout === "center") {
    return (
      <section className={`relative overflow-hidden bg-white pt-28 pb-14 ${className}`}>
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-linear-to-b from-slate-50 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className={`${contentClassName} mx-auto text-center`}>
            {badge && (
              <Badge className="mb-4 bg-slate-100 text-foreground border-slate-200 text-xs font-medium">
                {badge}
              </Badge>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
                {description}
              </p>
            )}
            {subtitle && <p className="text-muted-foreground text-sm mt-3">{subtitle}</p>}
            {onSearchChange && (
              <div className="relative max-w-md mx-auto mt-8">
                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder || "Search..."}
                  className="h-12 pl-11 rounded-xl border-slate-200 bg-white shadow-sm text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Split / detailed layout
  return (
    <section className={`relative overflow-hidden bg-white pt-24 pb-16 ${className}`}>
      <div className="absolute inset-0 bg-dots opacity-10" />
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <div className={`${contentClassName} lg:pr-8`}>
              {badge && (
                <Badge className="mb-4 bg-slate-100 text-foreground border-slate-200 text-xs font-medium">
                  {badge}
                </Badge>
              )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-foreground">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-3xl">
                    {description}
                  </p>
                )}
                {subtitle && <p className="text-muted-foreground text-sm mt-4">{subtitle}</p>}

                {/* Feature bullets */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3">
                    <div className="text-brand-600 mt-1"><CheckCircle size={18} /></div>
                    <div>
                      <p className="font-medium">Proven Process</p>
                      <p className="text-sm text-muted-foreground">Discovery → Design → Deliver</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-brand-600 mt-1"><CheckCircle size={18} /></div>
                    <div>
                      <p className="font-medium">High Performance</p>
                      <p className="text-sm text-muted-foreground">Fast, accessible, and scalable</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-brand-600 mt-1"><CheckCircle size={18} /></div>
                    <div>
                      <p className="font-medium">Design-Led Engineering</p>
                      <p className="text-sm text-muted-foreground">Beautiful UI that converts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-brand-600 mt-1"><CheckCircle size={18} /></div>
                    <div>
                      <p className="font-medium">Dedicated Support</p>
                      <p className="text-sm text-muted-foreground">From MVP to scale</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {actions ? (
                    actions
                  ) : (
                    <>
                      <Button variant="gradient" className="rounded-full px-6 py-3">Start Your Project</Button>
                      <Button variant="outline" className="rounded-full px-6 py-3">View Our Work</Button>
                    </>
                  )}
                </div>

                {onSearchChange && (
                  <div className="relative max-w-md mt-8">
                    <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search || ""}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder={searchPlaceholder || "Search..."}
                      className="h-12 pl-11 rounded-xl border-border bg-white shadow-sm text-sm"
                    />
                  </div>
                )}
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-end">
            <div className="w-full h-full flex items-center justify-center lg:justify-end">
              {rightContent ? (
                <div className="w-full lg:max-w-2xl">{rightContent}</div>
              ) : image ? (
                <div className="rounded-2xl overflow-hidden shadow-lg lg:max-w-2xl">
                  {typeof image === "string" ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={image} alt="hero" className="w-full h-auto object-cover" />
                  ) : (
                    image
                  )}
                </div>
              ) : (
                // richer default illustration: layered mockup cards with floating badge
                <div className="relative w-full lg:max-w-2xl">
                  <div className="absolute -right-8 -top-12 w-48 h-48 bg-linear-to-br from-brand-100 to-purple-100 rounded-full blur-3xl opacity-40 transform rotate-12" />

                  <div className="relative">
                    <div className="absolute -left-6 -top-6 w-44 h-56 rounded-2xl bg-white/5 shadow-lg transform rotate-6" />
                    <div className="absolute -right-6 top-12 w-44 h-56 rounded-2xl bg-white/5 shadow-lg transform -rotate-3" />

                    <div className="relative bg-white rounded-2xl p-4 shadow-2xl border border-border">
                      <div className="w-full h-44 bg-linear-to-br from-brand-50 to-purple-50 rounded-lg overflow-hidden" />
                      <div className="mt-4 grid gap-2">
                        <div className="h-3 bg-muted-foreground/10 rounded w-5/6" />
                        <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
                      </div>
                    </div>

                    <div className="absolute -bottom-6 left-6 bg-card rounded-xl p-3 shadow-lg border border-border w-44">
                      <p className="text-xs text-muted-foreground">envalis.com/dashboard</p>
                      <div className="mt-2 h-2 bg-muted-foreground/10 rounded" />
                    </div>

                    <div className="absolute -top-6 right-6 bg-white rounded-full p-2 shadow-sm border border-border">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                    </div>
                  </div>

                  {/* small stats below */}
                  <div className="mt-6 flex items-center gap-6 justify-start lg:justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-sm text-muted-foreground">Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sky-400 rounded-full" />
                      <span className="text-sm text-muted-foreground">Pageview</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
