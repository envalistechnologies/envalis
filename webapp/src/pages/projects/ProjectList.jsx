import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Buildings, Wrench } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/common/HeroSection";
import FilterBar from "@/components/common/FilterBar";
import Pagination from "@/components/common/Pagination";
import { ErrorState, NoResults, SkeletonCard } from "@/components/common/LoadingStates";
import { formatDate, truncate } from "@/lib/utils";

const PROJECT_CATEGORIES = [
    "web_development", "mobile_app", "ui_ux", "branding",
    "ecommerce", "saas", "enterprise", "other",
];

const ProjectList = () => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [featured, setFeatured] = useState("");
    const [page, setPage] = useState(1);
    const limit = 9;

    const params = useMemo(() => ({
        search: search || undefined,
        category: category || undefined,
        featured: featured || undefined,
        page, limit,
    }), [search, category, featured, page]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["public-projects", params],
        queryFn: () => publicAPI.getPortfolios(params).then((r) => r.data),
    });

    const portfolios = data?.portfolios || [];
    const pagination = data?.pagination;

    return (
        <div className="bg-white">
            <HeroSection
                badge="🚀 Client Showcases"
                title="Projects That Move the Needle"
                description="Discover digital experiences we have delivered for ambitious brands and teams."
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                searchPlaceholder="Search by project or client"
            />

            <section className="section-padding pt-8">
                <div className="container mx-auto">
                    <div className="mb-10">
                        <FilterBar
                            searchValue={search}
                            onSearchChange={(v) => { setSearch(v); setPage(1); }}
                            searchPlaceholder="Search projects..."
                            categories={PROJECT_CATEGORIES}
                            activeCategory={category}
                            onCategoryChange={(c) => { setCategory(c); setPage(1); }}
                            filters={[
                                { id: "featured", label: "Featured", value: featured, options: ["true"] },
                            ]}
                            onFilterChange={(id, v) => { if (id === "featured") setFeatured(v); setPage(1); }}
                            onReset={() => { setSearch(""); setCategory(""); setFeatured(""); setPage(1); }}
                        />
                    </div>

                    {isError && <ErrorState onRetry={refetch} />}

                    {!isError && (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {isLoading
                                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                                    : portfolios.map((project) => (
                                        <Link
                                            key={project._id}
                                            to={`/portfolio/${project.slug}`}
                                            className="group rounded-2xl border border-slate-100 overflow-hidden bg-white hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="h-52 bg-slate-50 overflow-hidden">
                                                {project.coverImage?.url ? (
                                                    <img src={project.coverImage.url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-indigo-50" />
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    <Badge variant="outline" className="text-xs capitalize rounded-full border-slate-200">{project.category?.replace(/_/g, " ")}</Badge>
                                                    {project.isFeatured && <Badge variant="secondary" className="text-xs rounded-full">Featured</Badge>}
                                                </div>
                                                <h3 className="font-bold text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                    {project.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {truncate(project.shortDescription || project.description, 120)}
                                                </p>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Buildings size={12} /> {project.client?.name || "Client"}</span>
                                                    {project.completionDate && <span>{formatDate(project.completionDate)}</span>}
                                                </div>
                                                {project.technologies?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {project.technologies.slice(0, 3).map((tech) => (
                                                            <span key={tech} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                                                <Wrench size={10} /> {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                            </div>

                            {!isLoading && portfolios.length === 0 && <NoResults query={search} />}
                            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
                        </>
                    )}
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="container mx-auto">
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black mb-2">Have a project in mind?</h2>
                            <p className="text-muted-foreground max-w-xl">Let us build a plan, scope, and timeline tailored to your goals.</p>
                        </div>
                        <Link to="/contact">
                            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                Start a project <ArrowRight size={16} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProjectList;
