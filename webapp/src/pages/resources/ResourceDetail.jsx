import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, ShareNetwork } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroSection from "@/components/common/HeroSection";
import Tags from "@/components/common/Tags";

import { ErrorState, NotFoundState } from "@/components/common/LoadingStates";
import { formatDate } from "@/lib/utils";

const ResourceDetail = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: resource, isLoading, isError } = useQuery({
    queryKey: ["resource", slug],
    queryFn: () => publicAPI.getResource(slug).then((r) => r.data.resource),
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
        title="Failed to load resource"
        message="The resource you're looking for could not be loaded."
      />
    );

  if (!resource)
    return (
      <NotFoundState
        title="Resource not found"
        message="The resource you're looking for doesn't exist or has been removed."
      />
    );

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={resource.resourceType || "Resource"}
        title={resource.title}
        description={resource.description}
      />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Resources
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
            {resource.coverImage?.url && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={resource.coverImage.url}
                  alt={resource.title}
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none prose-neutral prose-a:text-brand-600 prose-img:rounded-xl mb-8">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {resource.content}
              </p>
            </div>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">What's Included:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {resource.highlights?.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {highlight}
                      </li>
                    )) || (
                      <li>Comprehensive resource guide</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <Tags tags={resource.tags} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Download Card */}
            <Card className="bg-linear-to-br from-brand-50 to-purple-50 border-brand-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Download Resource</h3>
                {resource.fileUrl && (
                  <a href={resource.fileUrl} download={resource.title}>
                    <Button className="w-full gap-2 mb-4">
                      <Download size={16} />
                      Download Now
                    </Button>
                  </a>
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

            {/* Resource Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {resource.fileType && (
                  <>
                    <div>
                      <p className="font-medium mb-1">File Type</p>
                      <Badge variant="outline" className="text-xs">
                        {resource.fileType.toUpperCase()}
                      </Badge>
                    </div>
                    <Separator />
                  </>
                )}

                {resource.fileSize && (
                  <>
                    <div>
                      <p className="font-medium mb-1">File Size</p>
                      <p className="text-muted-foreground">
                        {(resource.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <p className="font-medium mb-1">Downloads</p>
                  <p className="text-muted-foreground">
                    {resource.downloads || 0} downloads
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-1">Published</p>
                  <p className="text-muted-foreground">
                    {formatDate(resource.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">Need more resources?</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Us
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

export default ResourceDetail;
