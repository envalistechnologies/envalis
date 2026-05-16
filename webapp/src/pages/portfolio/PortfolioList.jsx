import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
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

const PORTFOLIO_CATEGORIES = [
  "web_development",
  "mobile_app",
  "ui_ux",
  "branding",
  "ecommerce",
  "saas",
  "enterprise",
  "other",
];

const PortfolioList = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const params = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      featured: featured || undefined,
      page,
      limit,
      sortBy: "completionDate",
      sortOrder: "desc",
    }),
    [search, category, featured, page]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-portfolios", params],
    queryFn: () => publicAPI.getPortfolios(params).then((r) => r.data),
  });

  const portfolios = data?.portfolios || [];
  const pagination = data?.pagination;

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setFeatured("");
    setPage(1);
  };

  const handleFilterChange = (filterId, value) => {
    if (filterId === "category") setCategory(value);
    else if (filterId === "featured") setFeatured(value);
    setPage(1);
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge="Our Work"
        title="Portfolio Showcase"
        description="Explore our latest projects and see how we've helped businesses achieve their digital goals."
      />

      {/* Portfolios Section */}
      <section className="section-padding">
        <div className="container">
        {/* Filters */}
        <div className="mb-12">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search projects..."
            filters={[
              {
                id: "category",
                label: "Category",
                value: category,
                options: PORTFOLIO_CATEGORIES,
              },
              {
                id: "featured",
                label: "Featured",
                value: featured,
                options: ["true"],
              },
            ]}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            showReset={true}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton count={limit} />
        ) : isError ? (
          <ErrorState
            title="Failed to load portfolio"
            message="Unable to fetch projects. Please try again."
            onRetry={refetch}
          />
        ) : portfolios.length === 0 ? (
          <NoResults
            title="No projects found"
            message="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <>
            <CardGrid cols={3}>
              {portfolios.map((portfolio) => (
                <Link
                  key={portfolio._id}
                  to={`/portfolio/${portfolio.slug}`}
                  className="group"
                >
                  <ItemCard
                    image={portfolio.coverImage?.url}
                    imageAlt={portfolio.title}
                    badge={
                      portfolio.isFeatured && (
                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-200">
                          <Sparkle size={12} weight="fill" className="mr-1" />
                          Featured
                        </Badge>
                      )
                    }
                    title={portfolio.title}
                    description={truncate(portfolio.shortDescription, 100)}
                    meta={
                      <>
                        <span className="text-xs font-medium text-primary capitalize">
                          {portfolio.category.replace(/_/g, " ")}
                        </span>
                        {portfolio.client?.name && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {portfolio.client.name}
                            </span>
                          </>
                        )}
                      </>
                    }
                    footer={
                      <div className="flex items-center justify-between">
                        <Tags
                          tags={portfolio.technologies?.slice(0, 2)}
                          variant="outline"
                        />
                        <ArrowRight
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

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto text-center">
          <PageHeader
            title="Impressed by our work?"
            description="Let's create something amazing together."
            className="mb-8"
          />
          <Link to="/contact">
            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
              Start Your Project <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PortfolioList;
