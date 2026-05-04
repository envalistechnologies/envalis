import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Sparkle, Tag } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "@/components/common/Pagination";
import { ErrorState, NoResults, SkeletonCard } from "@/components/common/LoadingStates";
import { formatDate, truncate } from "@/lib/utils";

const BLOG_CATEGORIES = [
    "technology",
    "design",
    "business",
    "marketing",
    "development",
    "news",
    "tutorial",
    "insights",
    "other",
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
        page,
        limit,
        sortBy: "publishedAt",
        sortOrder: "desc",
    }), [search, category, featured, page]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["public-blogs", params],
        queryFn: () => publicAPI.getBlogs(params).then((r) => r.data),
    });

    const blogs = data?.blogs || [];
    const pagination = data?.pagination;

    return (
        <div className="bg-background">
            <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-brand-950 to-purple-950 text-white">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="container mx-auto py-20 relative">
                    <div className="max-w-3xl">
                        <Badge className="mb-4 bg-white/10 text-white border-white/20">
                            <Sparkle size={14} weight="duotone" className="mr-2" /> Knowledge Hub
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                            Insights, ideas, and practical guides
                        </h1>
                        <p className="text-white/70 text-lg max-w-2xl">
                            Explore the latest in technology, design, and digital strategy from the Envalis Technologies team.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container mx-auto">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
                        <div className="relative w-full lg:max-w-md">
                            <Input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search blogs by title or tag"
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={category || "all"} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
                                <SelectTrigger className="h-11 min-w-40 rounded-xl text-sm">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {BLOG_CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={featured || "all"} onValueChange={(v) => { setFeatured(v === "all" ? "" : v); setPage(1); }}>
                                <SelectTrigger className="h-11 min-w-36 rounded-xl text-sm">
                                    <SelectValue placeholder="Featured" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All posts</SelectItem>
                                    <SelectItem value="true">Featured</SelectItem>
                                </SelectContent>
                            </Select>
                            {(search || category || featured) && (
                                <Button
                                    variant="outline"
                                    className="h-11 rounded-xl"
                                    onClick={() => { setSearch(""); setCategory(""); setFeatured(""); setPage(1); }}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
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
                                            className="group rounded-2xl border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                        >
                                            <div className="h-48 bg-muted overflow-hidden">
                                                {blog.coverImage?.url ? (
                                                    <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-linear-to-br from-brand-50 to-purple-50" />
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    <Badge variant="outline" className="text-xs capitalize">{blog.category}</Badge>
                                                    {blog.isFeatured && <Badge variant="default" className="text-xs">Featured</Badge>}
                                                </div>
                                                <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-3">{truncate(blog.excerpt, 150)}</p>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime || 5} min</span>
                                                    <span>{formatDate(blog.publishedAt)}</span>
                                                </div>
                                                {blog.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {blog.tags.slice(0, 3).map((tag) => (
                                                            <span key={tag} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
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

                            {pagination && (
                                <Pagination pagination={pagination} onPageChange={setPage} />
                            )}
                        </>
                    )}
                </div>
            </section>

            <section className="section-padding bg-muted/30">
                <div className="container mx-auto">
                    <div className="rounded-3xl border border-border bg-card p-8 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black mb-2">Ready for a deeper dive?</h2>
                            <p className="text-muted-foreground max-w-xl">Subscribe for curated insights, product updates, and case studies delivered monthly.</p>
                        </div>
                        <Button size="lg" variant="gradient" className="rounded-2xl">
                            Subscribe to updates <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogList;
