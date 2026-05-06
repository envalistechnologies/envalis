import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ShareNetwork,
  Globe,
  GithubLogo,
  Clock,
  Users,
  Briefcase,
  CheckCircle,
} from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import HeroSection from "@/components/common/HeroSection";
import Tags from "@/components/common/Tags";
import RichTextContent from "@/components/common/RichTextContent";
import { ErrorState, NotFoundState } from "@/components/common/LoadingStates";

/* Sticky section anchor helper */
const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-3">
    <span className="inline-block w-1 h-5 rounded-full bg-primary shrink-0" />
    {children}
  </h2>
);

/* Sidebar info row */
const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-3">
    <div className="mt-0.5 size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon size={15} className="text-primary" weight="bold" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
        {label}
      </p>
      {children}
    </div>
  </div>
);

/* Gallery image card */
const GalleryCard = ({ image }) => (
  <div className="group relative rounded-xl overflow-hidden border border-border bg-muted/30 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="overflow-hidden aspect-video">
      <img
        src={image.url}
        alt={image.alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </div>
    {image.caption && (
      <p className="text-xs text-muted-foreground px-3 py-2 border-t border-border bg-background/80 backdrop-blur-sm">
        {image.caption}
      </p>
    )}
  </div>
);

/* Main Component */
const PortfolioDetail = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const {
    data: portfolio,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["portfolio", slug],
    queryFn: () => publicAPI.getPortfolio(slug).then((r) => r.data.portfolio),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );

  if (isError)
    return (
      <ErrorState
        title="Failed to load project"
        message="The project you're looking for could not be loaded."
      />
    );

  if (!portfolio)
    return (
      <NotFoundState
        title="Project not found"
        message="The project you're looking for doesn't exist or has been removed."
      />
    );

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <HeroSection
        badge={portfolio.category?.replace(/_/g, " ")}
        title={portfolio.title}
        description={portfolio.description}
        contentClassName="max-w-none"
      />

      {/* Breadcrumb bar */}
      <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={15} weight="bold" />
              Back to Portfolio
            </Link>

            <div className="flex items-center gap-2">
              {portfolio.projectUrl && (
                <a href={portfolio.projectUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                    <Globe size={13} weight="bold" />
                    Live
                  </Button>
                </a>
              )}
              {portfolio.githubUrl && (
                <a href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                    <GithubLogo size={13} weight="bold" />
                    GitHub
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={handleShare}
              >
                <ShareNetwork size={13} weight="bold" />
                {copied ? "Copied!" : "Share"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">

            {/* MAIN CONTENT */}
            <div className="space-y-12 min-w-0">

              {/* Gallery */}
              {portfolio.gallery?.length > 0 && (
                <div>
                  <SectionTitle>Project Gallery</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolio.gallery.map((image, idx) => (
                      <GalleryCard key={idx} image={image} />
                    ))}
                  </div>
                </div>
              )}

              {/* Challenge */}
              {portfolio.challenge && (
                <div>
                  <SectionTitle>The Challenge</SectionTitle>
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    <RichTextContent html={portfolio.challenge} />
                  </div>
                </div>
              )}

              {/* Solution */}
              {portfolio.solution && (
                <div>
                  <SectionTitle>Our Solution</SectionTitle>
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    <RichTextContent html={portfolio.solution} />
                  </div>
                </div>
              )}

              {/* Results */}
              {portfolio.results?.length > 0 && (
                <div>
                  <SectionTitle>Results & Impact</SectionTitle>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {portfolio.results.map((result, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl border border-border bg-card p-5 overflow-hidden group hover:border-primary/30 transition-colors"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
                        <p className="text-3xl font-bold text-primary mb-1 pl-3">
                          {result.value}
                        </p>
                        <p className="font-semibold text-sm text-foreground pl-3 mb-0.5">
                          {result.metric}
                        </p>
                        <p className="text-xs text-muted-foreground pl-3">
                          {result.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonial */}
              {portfolio.testimonial && (
                <div>
                  <SectionTitle>Client Feedback</SectionTitle>
                  <div className="relative rounded-xl border border-border bg-linear-to-br from-primary/5 via-background to-purple-500/5 p-6 overflow-hidden">
                    {/* decorative quote mark */}
                    <span
                      aria-hidden
                      className="absolute top-3 right-5 text-[80px] font-serif leading-none text-primary/10 select-none"
                    >
                      "
                    </span>
                    <p className="text-base font-medium italic text-foreground mb-5 relative z-10 leading-relaxed">
                      "{portfolio.testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 ring-2 ring-border">
                        <AvatarImage src={portfolio.testimonial.avatar} />
                        <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                          {portfolio.testimonial.author?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {portfolio.testimonial.author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {portfolio.testimonial.designation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="space-y-5 lg:sticky lg:top-20">

              {/* Project Details Card */}
              <Card className="overflow-hidden shadow-sm">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 divide-y divide-border">
                  {portfolio.client?.name && (
                    <InfoRow icon={Briefcase} label="Client">
                      <p className="text-sm font-medium text-foreground">
                        {portfolio.client.name}
                      </p>
                    </InfoRow>
                  )}

                  {portfolio.category && (
                    <InfoRow icon={CheckCircle} label="Category">
                      <Badge variant="secondary" className="capitalize text-xs mt-0.5">
                        {portfolio.category.replace(/_/g, " ")}
                      </Badge>
                    </InfoRow>
                  )}

                  {portfolio.duration && (
                    <InfoRow icon={Clock} label="Duration">
                      <p className="text-sm text-foreground">{portfolio.duration}</p>
                    </InfoRow>
                  )}

                  {portfolio.teamSize && (
                    <InfoRow icon={Users} label="Team Size">
                      <p className="text-sm text-foreground">
                        {portfolio.teamSize} people
                      </p>
                    </InfoRow>
                  )}
                </CardContent>
              </Card>

              {/* Technologies */}
              {portfolio.technologies?.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <Tags tags={portfolio.technologies} />
                  </CardContent>
                </Card>
              )}

              {/* Services */}
              {portfolio.services?.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <Tags tags={portfolio.services} variant="secondary" />
                  </CardContent>
                </Card>
              )}

              {/* Links */}
              {(portfolio.projectUrl || portfolio.githubUrl) && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-2">
                    {portfolio.projectUrl && (
                      <a
                        href={portfolio.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          variant="outline"
                          className="w-full gap-2 justify-start text-sm"
                        >
                          <Globe size={15} weight="bold" />
                          View Live Project
                        </Button>
                      </a>
                    )}
                    {portfolio.githubUrl && (
                      <a
                        href={portfolio.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          variant="outline"
                          className="w-full gap-2 justify-start text-sm"
                        >
                          <GithubLogo size={15} weight="bold" />
                          View on GitHub
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full gap-2 justify-start text-sm text-muted-foreground"
                      onClick={handleShare}
                    >
                      <ShareNetwork size={15} weight="bold" />
                      {copied ? "Link Copied!" : "Copy Link"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* CTA Card */}
              <div className="rounded-xl border border-primary/20 bg-linear-to-br from-primary/8 via-background to-purple-500/8 p-5">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Like what you see?
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Let's build something amazing together.
                </p>
                <Link to="/contact">
                  <Button className="w-full gap-2 text-sm" size="sm">
                    Get in Touch
                    <ArrowRight size={14} weight="bold" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioDetail;