import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShareNetwork, Clock } from "@phosphor-icons/react";
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
import ReadMore from "@/components/common/ReadMore";
import { formatDate, getInitials } from "@/lib/utils";

const BlogDetail = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => publicAPI.getBlog(slug).then((r) => r.data.blog),
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
        title="Failed to load blog"
        message="The blog you're looking for could not be loaded."
      />
    );

  if (!blog)
    return (
      <NotFoundState
        title="Blog not found"
        message="The blog you're looking for doesn't exist or has been removed."
      />
    );

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={blog.category}
        title={blog.title}
        description={blog.excerpt}
        contentClassName="max-w-none"
      />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-4">
            {/* Featured Image */}
            {blog.coverImage?.url && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={blog.coverImage.url}
                  alt={blog.title}
                  className="w-full h-100 lg:h-125 object-cover"
                />
              </div>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
              {blog.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {getInitials(blog.author.name || "Author")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {blog.author.name || "Author"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(blog.publishedAt)}
                    </p>
                  </div>
                </div>
              )}
              {blog.readTime && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={16} />
                  {blog.readTime} min read
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              {/* Render rich HTML content */}
              {/* eslint-disable-next-line react/no-danger */}
              <RichTextContent html={blog.content} />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-8 pt-8 border-t">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <Tags tags={blog.tags} />
              </div>
            )}

            {/* Share & Engagement */}
            <div className="py-8 border-t">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleShare}
                  >
                    <ShareNetwork size={16} />
                    {copied ? "Copied!" : "Share"}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{blog.views || 0}</span> views
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {blog.relatedPosts && blog.relatedPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blog.relatedPosts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="group p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all"
                    >
                      <p className="text-xs text-muted-foreground mb-2 capitalize">
                        {post.category}
                      </p>
                      <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Article Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Article Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Category
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {blog.category}
                  </Badge>
                </div>

                <Separator />

                {blog.readTime && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Reading Time
                      </p>
                      <p className="text-sm font-medium">{blog.readTime} minutes</p>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Published
                  </p>
                  <p className="text-sm">{formatDate(blog.publishedAt)}</p>
                </div>

                <Separator />

                {blog.isFeatured && (
                  <>
                    <Badge className="w-full justify-center">Featured</Badge>
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

            {/* Sidebar author removed — author is shown under the cover image above */}

            {/* CTA */}
            <Card className="bg-linear-to-br from-brand-50 to-purple-50 border-brand-200">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">
                  Want to share your thoughts?
                </p>
                <Link to="/contact">
                  <Button className="w-full">Get in Touch</Button>
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

export default BlogDetail;
