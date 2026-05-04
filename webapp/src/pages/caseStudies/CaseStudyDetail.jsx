import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ShareNetwork } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/common/HeroSection";
import PageHeader from "@/components/common/PageHeader";
import Tags from "@/components/common/Tags";

import { ErrorState, NotFoundState } from "@/components/common/LoadingStates";

const CaseStudyDetail = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: caseStudy, isLoading, isError } = useQuery({
    queryKey: ["case-study", slug],
    queryFn: () => publicAPI.getCaseStudy(slug).then((r) => r.data.caseStudy),
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
        title="Failed to load case study"
        message="The case study you're looking for could not be loaded."
      />
    );

  if (!caseStudy)
    return (
      <NotFoundState
        title="Case Study not found"
        message="The case study you're looking for doesn't exist or has been removed."
      />
    );

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={caseStudy.category.replace(/_/g, " ")}
        title={caseStudy.title}
        description={caseStudy.tagline || caseStudy.overview}
      />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Case Studies
          </Link>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Banner Image */}
            {caseStudy.bannerImage?.url && (
              <div className="rounded-xl overflow-hidden">
                <img
                  src={caseStudy.bannerImage.url}
                  alt={caseStudy.title}
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
              </div>
            )}

            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none prose-neutral">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {caseStudy.overview}
                </p>
              </div>
            </div>

            {/* Background */}
            {caseStudy.background && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Background</h2>
                <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none prose-neutral">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {caseStudy.background}
                  </p>
                </div>
              </div>
            )}

            {/* Challenge */}
            {caseStudy.challenge && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <h2 className="text-xl font-bold mb-4 text-red-900">
                  The Challenge
                </h2>
                <p className="text-red-700 leading-relaxed mb-4">
                  {caseStudy.challenge.description}
                </p>
                {caseStudy.challenge.points &&
                  caseStudy.challenge.points.length > 0 && (
                    <ul className="space-y-2">
                      {caseStudy.challenge.points.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-red-700"
                        >
                          <span className="text-red-900 font-bold mt-1">
                            •
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            )}

            {/* Solution */}
            {caseStudy.solution && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                <h2 className="text-xl font-bold mb-4 text-green-900">
                  Our Solution
                </h2>
                <p className="text-green-700 leading-relaxed mb-4">
                  {caseStudy.solution.description}
                </p>
                {caseStudy.solution.points &&
                  caseStudy.solution.points.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {caseStudy.solution.points.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-green-700"
                        >
                          <span className="text-green-900 font-bold mt-1">
                            ✓
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                {caseStudy.solution.approach && (
                  <div>
                    <p className="font-semibold text-green-900 mb-2">
                      Approach:
                    </p>
                    <p className="text-green-700 leading-relaxed">
                      {caseStudy.solution.approach}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Implementation */}
            {caseStudy.implementation?.phases &&
              caseStudy.implementation.phases.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Implementation Timeline
                  </h2>
                  <div className="space-y-4">
                    {caseStudy.implementation.phases.map((phase, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {phase.name}
                              </CardTitle>
                              {phase.duration && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Duration: {phase.duration}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">Phase {idx + 1}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {phase.description && (
                            <p className="text-sm text-muted-foreground">
                              {phase.description}
                            </p>
                          )}
                          {phase.deliverables &&
                            phase.deliverables.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  Deliverables:
                                </p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                  {phase.deliverables.map((deliverable, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                                      {deliverable}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            {/* Results */}
            {caseStudy.results && caseStudy.results.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {caseStudy.results.map((result, idx) => (
                    <Card
                      key={idx}
                      className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200"
                    >
                      <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-primary mb-2">
                          {result.value}
                        </p>
                        <p className="font-medium mb-1">{result.metric}</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {caseStudy.gallery && caseStudy.gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Project Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseStudy.gallery.map((image, idx) => (
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Case Study Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Study Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseStudy.client?.name && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Client
                      </p>
                      <p className="text-sm font-medium">{caseStudy.client.name}</p>
                      {caseStudy.client.industry && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {caseStudy.client.industry}
                        </p>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {caseStudy.category && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Category
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {caseStudy.category.replace(/_/g, " ")}
                      </Badge>
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
            {caseStudy.technologies && caseStudy.technologies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tags tags={caseStudy.technologies} />
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {caseStudy.services && caseStudy.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tags tags={caseStudy.services} variant="secondary" />
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-linear-to-br from-brand-50 to-purple-50 border-brand-200">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">
                  Interested in similar results?
                </p>
                <Link to="/contact">
                  <Button className="w-full gap-2">
                    Let's Talk <ArrowRight size={16} />
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

export default CaseStudyDetail;
