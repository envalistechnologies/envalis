import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Tag } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/common/HeroSection";
import FilterBar from "@/components/common/FilterBar";
import Pagination from "@/components/common/Pagination";
import { ErrorState, NoResults, SkeletonCard } from "@/components/common/LoadingStates";
import { formatDate, truncate } from "@/lib/utils";

const BLOG_CATEGORIES = [
    "technology", "design", "business", "marketing",
    "development", "news", "tutorial", "insights", "other",
];

const BlogList = () => {
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
        sortBy: "publishedAt", sortOrder: "desc",
    }), [search, category, featured, page]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["public-blogs", params],
        queryFn: () => publicAPI.getBlogs(params).then((r) => r.data),
    });

    const blogs = data?.blogs || [];
    const pagination = data?.pagination;

    return (
        <div className="bg-white">
            {/* Clean white hero */}
            <HeroSection
                badge="📝 Our Blogs"
                title="Insights and Inspiration, Explore Our Blog"
                description="Dive into our blog for expert insights, tips, and industry trends to elevate your project management journey."
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                searchPlaceholder="Search for Blogs..."
            />

            <section className="section-padding pt-8">
                <div className="container mx-auto">
                    {/* Category pills + filters */}
                    <div className="mb-10">
                        <p className="text-center text-sm font-medium text-muted-foreground mb-4">Top Picks</p>
                        <FilterBar
                            searchValue={search}
                            onSearchChange={(v) => { setSearch(v); setPage(1); }}
                            searchPlaceholder="Search blogs..."
                            categories={BLOG_CATEGORIES}
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
                                    : blogs.map((blog) => (
                                        <Link
                                            key={blog._id}
                                            to={`/blog/${blog.slug}`}
                                            className="group rounded-2xl border border-slate-100 overflow-hidden bg-white hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="h-48 bg-slate-50 overflow-hidden">
                                                {blog.coverImage?.url ? (
                                                    <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-indigo-50" />
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{truncate(blog.excerpt, 120)}</p>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                                                            {blog.author?.avatar?.url
                                                                ? <img src={blog.author.avatar.url} alt="" className="w-full h-full object-cover" />
                                                                : (blog.author?.firstName?.[0] || "E")}
                                                        </div>
                                                        <span className="font-medium text-foreground">{[blog.author?.firstName, blog.author?.lastName].filter(Boolean).join(' ') || "Envalis"}</span>
                                                    </div>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime || 5} Min Read</span>
                                                </div>
                                                {blog.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {blog.tags.slice(0, 2).map((tag) => (
                                                            <span key={tag} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                                                <Tag size={10} /> {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                            </div>

                            {!isLoading && blogs.length === 0 && <NoResults query={search} />}
                            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
                        </>
                    )}
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="container mx-auto">
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black mb-2">Ready for a deeper dive?</h2>
                            <p className="text-muted-foreground max-w-xl">Subscribe for curated insights, product updates, and case studies delivered monthly.</p>
                        </div>
                        <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                            Subscribe to updates <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogList;
