import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ShareNetwork, Globe, GithubLogo } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import HeroSection from "@/components/common/HeroSection";
import PageHeader from "@/components/common/PageHeader";
import Tags from "@/components/common/Tags";
import RichTextContent from "@/components/common/RichTextContent";

import { ErrorState, NotFoundState } from "@/components/common/LoadingStates";

const PortfolioDetail = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: portfolio, isLoading, isError } = useQuery({
    queryKey: ["portfolio", slug],
    queryFn: () => publicAPI.getPortfolio(slug).then((r) => r.data.portfolio),
  });

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
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
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={portfolio.category?.replace(/_/g, " ")}
        title={portfolio.title}
        description={portfolio.description}
        contentClassName="max-w-none"
      />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Portfolio
          </Link>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Gallery */}
            {portfolio.gallery && portfolio.gallery.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Project Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.gallery.map((image, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-64 object-cover"
                      />
                      {image.caption && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge */}
            {portfolio.challenge && (
              <div>
                <h2 className="text-2xl font-bold mb-4">The Challenge</h2>
                <RichTextContent html={portfolio.challenge} />
              </div>
            )}

            {/* Solution */}
            {portfolio.solution && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Solution</h2>
                <RichTextContent html={portfolio.solution} />
              </div>
            )}

            {/* Results */}
            {portfolio.results && portfolio.results.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {portfolio.results.map((result, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-primary mb-2">
                          {result.value}
                        </p>
                        <p className="font-medium mb-1">{result.metric}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonial */}
            {portfolio.testimonial && (
              <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-lg font-semibold italic mb-4">
                    "{portfolio.testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    {portfolio.testimonial.avatar && (
                      <Avatar>
                        <AvatarImage src={portfolio.testimonial.avatar} />
                        <AvatarFallback>
                          {portfolio.testimonial.author?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="font-semibold text-sm">
                        {portfolio.testimonial.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {portfolio.testimonial.designation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolio.client?.name && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Client
                      </p>
                      <p className="text-sm font-medium">{portfolio.client.name}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {portfolio.category && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Category
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {portfolio.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <Separator />
                  </>
                )}

                {portfolio.duration && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Duration
                      </p>
                      <p className="text-sm">{portfolio.duration}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {portfolio.teamSize && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Team Size
                      </p>
                      <p className="text-sm">{portfolio.teamSize} people</p>
                    </div>
                    <Separator />
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleShare}
                >
                  <ShareNetwork size={16} />
                  {copied ? "Copied!" : "Share"}
                </Button>
              </CardContent>
            </Card>

            {/* Technologies */}
            {portfolio.technologies && portfolio.technologies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tags tags={portfolio.technologies} />
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {portfolio.services && portfolio.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tags tags={portfolio.services} variant="secondary" />
                </CardContent>
              </Card>
            )}

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {portfolio.projectUrl && (
                  <a
                    href={portfolio.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <Globe size={16} /> View Live
                    </Button>
                  </a>
                )}
                {portfolio.githubUrl && (
                  <a
                    href={portfolio.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <GithubLogo size={16} /> View on GitHub
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-linear-to-br from-brand-50 to-purple-50 border-brand-200">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">
                  Want to build something like this?
                </p>
                <Link to="/contact">
                  <Button className="w-full gap-2">
                    Get in Touch <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioDetail;
