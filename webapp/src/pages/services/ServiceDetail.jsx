import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CaretDown, CheckCircle, ShareNetwork, Steps, CurrencyDollar, Question } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import HeroSection from "@/components/common/HeroSection";
import PageHeader from "@/components/common/PageHeader";
import Tags from "@/components/common/Tags";
import RichTextContent from "@/components/common/RichTextContent";

import { ErrorState, NotFoundState } from "@/components/common/LoadingStates";
import { formatDate } from "@/lib/utils";

const ServiceDetail = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => publicAPI.getService(slug).then((r) => r.data.service),
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
        title="Failed to load service"
        message="The service you're looking for could not be loaded."
      />
    );

  if (!service)
    return (
      <NotFoundState
        title="Service not found"
        message="The service you're looking for doesn't exist or has been removed."
      />
    );

  const hasFeatures = service.features && service.features.length > 0;
  const hasProcess = service.process && service.process.length > 0;
  const hasPricing = service.pricing && service.pricing.length > 0;
  const hasFaqs = service.faqs && service.faqs.length > 0;
  const hasTabs = hasFeatures || hasProcess || hasPricing || hasFaqs;
  const defaultTab = hasFeatures ? "features" : hasProcess ? "process" : hasPricing ? "pricing" : "faqs";

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={service.category}
        title={service.title}
        description={service.excerpt}
        contentClassName="max-w-none"
      />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            Back to Services
          </Link>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-4">
            {/* Image */}
            {service.coverImage?.url && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={service.coverImage.url}
                  alt={service.title}
                  className="w-full h-100 lg:h-125 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div>
              {/* eslint-disable-next-line react/no-danger */}
              <RichTextContent 
                html={service.content} 
                emptyHtml={service.description ? `<p>${service.description}</p>` : undefined}
                className="max-w-none" 
              />
            </div>

            {/* Technologies */}
            {service.technologies && service.technologies.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold mb-3">Technologies</h3>
                <Tags tags={service.technologies} variant="secondary" className="gap-1" />
              </div>
            )}

            {/* Feature / Process / Pricing / FAQs */}
            {hasTabs && (
              <Tabs defaultValue={defaultTab} className="mt-10">
                <TabsList variant="line" className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  {hasFeatures && <TabsTrigger value="features">Features</TabsTrigger>}
                  {hasProcess && <TabsTrigger value="process">Process</TabsTrigger>}
                  {hasPricing && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
                  {hasFaqs && <TabsTrigger value="faqs">FAQs</TabsTrigger>}
                </TabsList>

                {hasFeatures && (
                  <TabsContent value="features" className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={18} className="text-primary" />
                      <h3 className="text-lg font-semibold">Key Features</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {service.features.map((feature, idx) => (
                        <Card key={`${feature.title || "feature"}-${idx}`} className="border-border/60 bg-muted/20">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
                                <CheckCircle size={18} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm mb-1">{feature.title || "Feature"}</p>
                                {feature.description && (
                                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {hasProcess && (
                  <TabsContent value="process" className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Steps size={18} className="text-primary" />
                      <h3 className="text-lg font-semibold">Process</h3>
                    </div>
                    <div className="space-y-3">
                      {service.process.map((step, idx) => (
                        <Card key={`${step.title || "step"}-${idx}`} className="border-border/60">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
                                {step.step || idx + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-sm mb-1">{step.title || "Step"}</p>
                                {step.description && (
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {hasPricing && (
                  <TabsContent value="pricing" className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CurrencyDollar size={18} className="text-primary" />
                      <h3 className="text-lg font-semibold">Pricing Plans</h3>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {service.pricing.map((plan, idx) => (
                        <Card
                          key={`${plan.plan || "plan"}-${idx}`}
                          className={plan.isPopular ? "border-primary/60 bg-primary/5" : "border-border/60"}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="text-base">{plan.plan || "Plan"}</CardTitle>
                              {plan.isPopular && <Badge>Popular</Badge>}
                            </div>
                            {plan.price && (
                              <div className="mt-2">
                                <span className="text-3xl font-semibold">${plan.price}</span>
                                {plan.period && (
                                  <span className="text-xs text-muted-foreground ml-1">/{plan.period}</span>
                                )}
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            {plan.features && plan.features.length > 0 && (
                              <ul className="space-y-2">
                                {plan.features.map((item, i) => (
                                  <li key={`${item}-${i}`} className="text-xs flex items-start gap-2">
                                    <CheckCircle size={12} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {hasFaqs && (
                  <TabsContent value="faqs" className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Question size={18} className="text-primary" />
                      <h3 className="text-lg font-semibold">FAQs</h3>
                    </div>
                    <div className="space-y-3">
                      {service.faqs.map((faq, idx) => (
                        <Collapsible key={`${faq.question || "faq"}-${idx}`}>
                          <Card className="border-border/60">
                            <CollapsibleTrigger className="group w-full text-left">
                              <CardHeader className="p-2">
                                <div className="flex items-start justify-between gap-3">
                                  <CardTitle className="text-sm">
                                    {faq.question || "Question"}
                                  </CardTitle>
                                  <CaretDown size={16} className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in">
                              {faq.answer && (
                                <CardContent className="pt-0 px-4 pb-4">
                                  <p className="text-xs text-muted-foreground">{faq.answer}</p>
                                </CardContent>
                              )}
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="my-8">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <Tags tags={service.tags} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Category
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {service.category}
                  </Badge>
                </div>

                <Separator />

                {service.isFeatured && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <CheckCircle size={20} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">
                      Featured Service
                    </span>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Published
                  </p>
                  <p className="text-sm">
                    {formatDate(service.publishedAt)}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Views
                  </p>
                  <p className="text-sm font-medium">{service.views || 0}</p>
                </div>

                <Separator />

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

            {/* CTA */}
            <Card className="bg-linear-to-br from-brand-50 to-purple-50 border-brand-200">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">
                  Interested in this service?
                </p>
                <Link to="/contact">
                  <Button className="w-full gap-2">
                    Get in Touch <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* SEO Info */}
            {service.seo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SEO Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {service.seo.metaTitle && (
                    <div>
                      <p className="font-medium mb-1">Title</p>
                      <p className="text-muted-foreground text-xs">
                        {service.seo.metaTitle}
                      </p>
                    </div>
                  )}
                  {service.seo.keywords && service.seo.keywords.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Keywords</p>
                      <Tags
                        tags={service.seo.keywords}
                        variant="secondary"
                        className="gap-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto">
          <PageHeader
            title="Other Services"
            description="Explore more solutions we offer"
            className="mb-8 text-center"
          />
          <Link to="/services">
            <Button variant="outline">View All Services</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
