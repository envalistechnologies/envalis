import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
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

const CASE_STUDY_CATEGORIES = [
  "digital_transformation",
  "product_development",
  "process_improvement",
  "cost_reduction",
  "growth",
  "other",
];

const CaseStudiesList = () => {
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
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [search, category, featured, page]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-case-studies", params],
    queryFn: () => publicAPI.getCaseStudies(params).then((r) => r.data),
  });

  const caseStudies = data?.caseStudies || [];
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
        badge="Success Stories"
        title="Real-World Case Studies"
        description="Discover how we've solved complex business challenges and delivered measurable results for our clients."
      />

      {/* Case Studies Section */}
      <section className="section-padding">
        <div className="container">
        {/* Filters */}
        <div className="mb-12">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search case studies..."
            filters={[
              {
                id: "category",
                label: "Category",
                value: category,
                options: CASE_STUDY_CATEGORIES,
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
            title="Failed to load case studies"
            message="Unable to fetch case studies. Please try again."
            onRetry={refetch}
          />
        ) : caseStudies.length === 0 ? (
          <NoResults
            title="No case studies found"
            message="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <>
            <CardGrid cols={3}>
              {caseStudies.map((caseStudy) => (
                <Link
                  key={caseStudy._id}
                  to={`/case-studies/${caseStudy.slug}`}
                  className="group"
                >
                  <ItemCard
                    image={caseStudy.coverImage?.url}
                    imageAlt={caseStudy.title}
                    badge={
                      caseStudy.isFeatured && (
                        <Badge className="bg-blue-500/20 text-blue-600 border-blue-200">
                          Featured
                        </Badge>
                      )
                    }
                    title={caseStudy.title}
                    description={truncate(caseStudy.overview, 100)}
                    meta={
                      <>
                        <span className="text-xs font-medium text-primary capitalize">
                          {caseStudy.category.replace(/_/g, " ")}
                        </span>
                        {caseStudy.client?.name && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {caseStudy.client.name}
                            </span>
                          </>
                        )}
                      </>
                    }
                    footer={
                      <div className="flex items-center justify-between">
                        {caseStudy.results && caseStudy.results.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {caseStudy.results.length} Results
                          </Badge>
                        )}
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
            title="Ready to be our next success story?"
            description="Let's collaborate and achieve your business goals."
            className="mb-8"
          />
          <Link to="/contact">
            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
              Get Started <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CaseStudiesList;
