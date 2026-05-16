import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Briefcase } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/common/HeroSection";
import PageHeader from "@/components/common/PageHeader";
import { CardGrid, ItemCard } from "@/components/common/CardGrid";
import FilterBar from "@/components/common/FilterBar";

import { LoadingSkeleton, NoResults, ErrorState } from "@/components/common/LoadingStates";

const DEPARTMENTS = [
  "engineering",
  "design",
  "marketing",
  "hr",
  "finance",
  "operations",
  "sales",
  "management",
];

const JOB_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "remote",
  "hybrid",
];

const CareersList = () => {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jobType, setJobType] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const params = useMemo(
    () => ({
      search: search || undefined,
      department: department || undefined,
      type: jobType || undefined,
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [search, department, jobType, page]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-jobs", params],
    queryFn: () => publicAPI.getJobs(params).then((r) => r.data),
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const handleReset = () => {
    setSearch("");
    setDepartment("");
    setJobType("");
    setPage(1);
  };

  const handleFilterChange = (filterId, value) => {
    if (filterId === "department") setDepartment(value);
    else if (filterId === "type") setJobType(value);
    setPage(1);
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge="Join Our Team"
        title="We're Hiring Talented People"
        description="Explore open positions and join a team of passionate innovators creating digital excellence."
      />

      {/* Jobs Section */}
      <section className="section-padding">
        <div className="container">
        {/* Filters */}
        <div className="mb-12">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search jobs..."
            filters={[
              {
                id: "department",
                label: "Department",
                value: department,
                options: DEPARTMENTS,
              },
              {
                id: "type",
                label: "Type",
                value: jobType,
                options: JOB_TYPES,
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
            title="Failed to load jobs"
            message="Unable to fetch job listings. Please try again."
            onRetry={refetch}
          />
        ) : jobs.length === 0 ? (
          <NoResults
            title="No jobs found"
            message="Try adjusting your search or filters. Check back soon for more opportunities."
          />
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/careers/${job.slug}`}
                  className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        {job.isFeatured && (
                          <Badge className="bg-yellow-500/20 text-yellow-600">
                            Featured
                          </Badge>
                        )}
                        {job.isUrgent && (
                          <Badge className="bg-red-500/20 text-red-600">Urgent</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1 capitalize">
                          <Briefcase size={16} />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <MapPin size={16} />
                          {job.location}
                          {job.isRemote && " (Remote)"}
                        </span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {job.type.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {job.salary?.isVisible && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Salary</p>
                          <p className="font-semibold">
                            {job.salary.min && `${job.salary.currency} ${job.salary.min / 100000}L`}
                            {job.salary.max && ` - ${job.salary.max / 100000}L`}
                          </p>
                        </div>
                      )}
                      <ArrowRight
                        size={20}
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

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
            title="Didn't find the right position?"
            description="Send us your profile and let's chat about opportunities."
            className="mb-8"
          />
          <Link to="/contact">
            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
              Get in Touch <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CareersList;
