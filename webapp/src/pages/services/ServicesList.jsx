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

const SERVICE_CATEGORIES = [
  "development",
  "design",
  "marketing",
  "consulting",
  "support",
  "analytics",
  "automation",
  "other",
];

const ServicesList = () => {
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
    queryKey: ["public-services", params],
    queryFn: () => publicAPI.getServices(params).then((r) => r.data),
  });

  const services = data?.services || [];
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
        badge="What We Offer"
        title="Comprehensive Digital Solutions"
        description="From web development to AI-powered automation, we deliver cutting-edge services tailored to your business needs."
      />

      {/* Services Section */}
      <section className="section-padding">
        <div className="container">
        {/* Filters */}
        <div className="mb-12">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search services..."
            filters={[
              {
                id: "category",
                label: "Category",
                value: category,
                options: SERVICE_CATEGORIES,
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
            title="Failed to load services"
            message="Unable to fetch services. Please try again."
            onRetry={refetch}
          />
        ) : services.length === 0 ? (
          <NoResults
            title="No services found"
            message="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <>
            <CardGrid cols={3}>
              {services.map((service) => (
                <Link
                  key={service._id}
                  to={`/services/${service.slug}`}
                  className="group"
                >
                  <ItemCard
                    image={service.coverImage?.url}
                    imageAlt={service.title}
                    badge={
                      service.isFeatured && (
                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-200">
                          <Sparkle size={12} weight="fill" className="mr-1" />
                          Featured
                        </Badge>
                      )
                    }
                    title={service.title}
                    description={truncate(service.excerpt, 100)}
                    meta={
                      <>
                        <span className="text-xs font-medium text-primary capitalize">
                          {service.category}
                        </span>
                      </>
                    }
                    footer={
                      <div className="flex items-center justify-between">
                        <Tags tags={service.tags?.slice(0, 2)} variant="outline" />
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

      {/* CTA Section */}
      <section className="bg-linear-to-br from-brand-50 to-purple-50 py-16">
        <div className="container mx-auto text-center">
          <PageHeader
            title="Ready to get started?"
            description="Let's discuss which services are perfect for your project."
            className="mb-8"
          />
          <Link to="/contact">
            <Button size="lg" className="gap-2">
              Contact Us <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServicesList;
