import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Download } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/common/HeroSection";
import PageHeader from "@/components/common/PageHeader";
import { CardGrid, ItemCard } from "@/components/common/CardGrid";
import FilterBar from "@/components/common/FilterBar";
import Tags from "@/components/common/Tags";

import { LoadingSkeleton, NoResults, ErrorState } from "@/components/common/LoadingStates";
import { truncate } from "@/lib/utils";

const ResourcesList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const params = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [search, page]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-resources", params],
    queryFn: () => publicAPI.getResources(params).then((r) => r.data),
  });

  const resources = data?.resources || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge="Knowledge Base"
        title="Free Resources & Tools"
        description="Download templates, guides, toolkits, and resources to help with your digital projects."
      />

      {/* Resources Section */}
      <section className="section-padding">
        <div className="container">
        {/* Search */}
        <div className="mb-12">
          <div className="max-w-md">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton count={limit} />
        ) : isError ? (
          <ErrorState
            title="Failed to load resources"
            message="Unable to fetch resources. Please try again."
            onRetry={refetch}
          />
        ) : resources.length === 0 ? (
          <NoResults
            title="No resources found"
            message="Try adjusting your search terms."
          />
        ) : (
          <>
            <CardGrid cols={4}>
              {resources.map((resource) => (
                <Link
                  key={resource._id}
                  to={`/resources/${resource.slug}`}
                  className="group"
                >
                  <ItemCard
                    image={resource.coverImage?.url}
                    imageAlt={resource.title}
                    title={resource.title}
                    description={truncate(resource.description, 80)}
                    meta={
                      <>
                        {resource.fileType && (
                          <Badge variant="outline" className="text-xs">
                            {resource.fileType.toUpperCase()}
                          </Badge>
                        )}
                      </>
                    }
                    footer={
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {resource.downloads || 0} downloads
                        </span>
                        <Download
                          size={16}
                          className="text-muted-foreground group-hover:text-primary transition-colors"
                        />
                      </div>
                    }
                  />
                </Link>
              ))}
            </CardGrid>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
        </div>
      </section>
    </div>
  );
};

export default ResourcesList;
