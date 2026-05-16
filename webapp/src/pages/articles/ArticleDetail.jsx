import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowDown, ShareNetwork, Clock, Download } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/common/HeroSection";
import Tags from "@/components/common/Tags";
import RichTextContent from "@/components/common/RichTextContent";

import { ErrorState, NotFoundState } from "@/components/common/LoadingStates";
import { formatDate, getInitials } from "@/lib/utils";

const ArticleDetail = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => publicAPI.getArticle(slug).then((r) => r.data.article),
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
        title="Failed to load article"
        message="The article you're looking for could not be loaded."
      />
    );

  if (!article)
    return (
      <NotFoundState
        title="Article not found"
        message="The article you're looking for doesn't exist or has been removed."
      />
    );

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={article.category.replace(/_/g, " ")}
        title={article.title}
        description={article.excerpt}
        contentClassName="max-w-none"
      />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Articles
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
            {article.coverImage?.url && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={article.coverImage.url}
                  alt={article.title}
                  className="w-full h-100 lg:h-125 object-cover"
                />
              </div>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
              {article.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    {article.author.avatar?.url && <AvatarImage src={article.author.avatar.url} />}
                    <AvatarFallback>
                      {getInitials(`${article.author.firstName || ''} ${article.author.lastName || ''}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {[article.author.firstName, article.author.lastName].filter(Boolean).join(' ') || 'Author'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(article.publishedAt)}
                    </p>
                  </div>
                </div>
              )}
              {article.readTime && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={16} />
                  {article.readTime} min read
                </div>
              )}
            </div>

            {/* Table of Contents */}
            {article.tableOfContents && article.tableOfContents.length > 0 && (
              <Card className="mb-8 bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {article.tableOfContents.map((item, idx) => (
                      <li
                        key={idx}
                        className={`text-sm ${
                          item.level > 1
                            ? "ml-" + (item.level - 1) * 4
                            : "font-medium"
                        } text-muted-foreground hover:text-primary cursor-pointer`}
                        style={{ marginLeft: `${(item.level - 1) * 16}px` }}
                      >
                        {item.title}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <div>
              {/* eslint-disable-next-line react/no-danger */}
              <RichTextContent html={article.content} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8 pt-8 border-t">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <Tags tags={article.tags} />
              </div>
            )}

            {/* References */}
            {article.references && article.references.length > 0 && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">References</h3>
                <ul className="space-y-3">
                  {article.references.map((ref, idx) => (
                    <li key={idx} className="text-sm">
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {ref.title}
                      </a>
                      {ref.author && (
                        <p className="text-xs text-muted-foreground mt-1">
                          by {ref.author}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
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
                  <span className="font-medium">{article.views || 0}</span> views •{" "}
                  <span className="font-medium">{article.downloads || 0}</span> downloads
                </div>
              </div>
            </div>
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
                    {article.category.replace(/_/g, " ")}
                  </Badge>
                </div>

                <Separator />

                {article.readTime && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Reading Time
                      </p>
                      <p className="text-sm font-medium">{article.readTime} minutes</p>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Published
                  </p>
                  <p className="text-sm">{formatDate(article.publishedAt)}</p>
                </div>

                <Separator />

                {article.isFeatured && (
                  <>
                    <Badge className="w-full justify-center">Featured</Badge>
                    <Separator />
                  </>
                )}

                {article.isPremium && (
                  <>
                    <Badge variant="secondary" className="w-full justify-center">
                      Premium Content
                    </Badge>
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

            {/* Attachments */}
            {article.attachments && article.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Downloads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {article.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      download={attachment.name}
                      className="block"
                    >
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Download size={16} />
                        <span className="truncate text-left">{attachment.name}</span>
                      </Button>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sidebar author removed — author is shown under the cover image above */}

            {/* CTA */}
            <Card className="bg-linear-to-br from-brand-50 to-purple-50 border-brand-200">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">
                  Found this helpful?
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

export default ArticleDetail;
