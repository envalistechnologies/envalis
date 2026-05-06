import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, ShareNetwork } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <RichTextContent html={service.content || service.description} className="max-w-none" />
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="mb-8">
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
