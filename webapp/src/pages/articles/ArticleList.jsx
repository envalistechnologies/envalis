import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Crown, FileText, Sparkle } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "@/components/common/Pagination";
import { ErrorState, NoResults, SkeletonCard } from "@/components/common/LoadingStates";
import { formatDate, truncate } from "@/lib/utils";

const ARTICLE_CATEGORIES = [
    "whitepaper",
    "research",
    "thought_leadership",
    "industry_report",
    "case_analysis",
    "opinion",
    "guide",
    "other",
];

const ArticleList = () => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [featured, setFeatured] = useState("");
    const [premium, setPremium] = useState("");
    const [page, setPage] = useState(1);
    const limit = 9;

    const params = useMemo(() => ({
        search: search || undefined,
        category: category || undefined,
        featured: featured || undefined,
        premium: premium || undefined,
        page,
        limit,
    }), [search, category, featured, premium, page]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["public-articles", params],
        queryFn: () => publicAPI.getArticles(params).then((r) => r.data),
    });

    const articles = data?.articles || [];
    const pagination = data?.pagination;

    return (
        <div className="bg-background">
            <section className="relative overflow-hidden bg-linear-to-br from-brand-950 via-slate-950 to-indigo-950 text-white">
                <div className="absolute inset-0 bg-dots opacity-30" />
                <div className="container mx-auto py-20 relative">
                    <div className="max-w-3xl">
                        <Badge className="mb-4 bg-white/10 text-white border-white/20">
                            <Sparkle size={14} weight="duotone" className="mr-2" /> Research Library
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                            In-depth articles and thought leadership
                        </h1>
                        <p className="text-white/70 text-lg max-w-2xl">
                            Whitepapers, guides, and strategic research to help you plan your next move.
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
                                placeholder="Search articles by title or topic"
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={category || "all"} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
                                <SelectTrigger className="h-11 min-w-44 rounded-xl text-sm">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {ARTICLE_CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={featured || "all"} onValueChange={(v) => { setFeatured(v === "all" ? "" : v); setPage(1); }}>
                                <SelectTrigger className="h-11 min-w-32 rounded-xl text-sm">
                                    <SelectValue placeholder="Featured" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="true">Featured</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={premium || "all"} onValueChange={(v) => { setPremium(v === "all" ? "" : v); setPage(1); }}>
                                <SelectTrigger className="h-11 min-w-32 rounded-xl text-sm">
                                    <SelectValue placeholder="Access" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="true">Premium</SelectItem>
                                    <SelectItem value="false">Free</SelectItem>
                                </SelectContent>
                            </Select>
                            {(search || category || featured || premium) && (
                                <Button
                                    variant="outline"
                                    className="h-11 rounded-xl"
                                    onClick={() => { setSearch(""); setCategory(""); setFeatured(""); setPremium(""); setPage(1); }}
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
                                    : articles.map((article) => (
                                        <Link
                                            key={article._id}
                                            to={`/articles/${article.slug}`}
                                            className="group rounded-2xl border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                        >
                                            <div className="h-48 bg-muted overflow-hidden">
                                                {article.coverImage?.url ? (
                                                    <img src={article.coverImage.url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-linear-to-br from-brand-50 to-indigo-50" />
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    <Badge variant="outline" className="text-xs capitalize">{article.category?.replace(/_/g, " ")}</Badge>
                                                    {article.isPremium && (
                                                        <Badge variant="default" className="text-xs">
                                                            <Crown size={12} weight="fill" className="mr-1" /> Premium
                                                        </Badge>
                                                    )}
                                                    {article.isFeatured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                                                </div>
                                                <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-3">{truncate(article.excerpt, 150)}</p>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><FileText size={12} /> {article.readTime || 8} min</span>
                                                    <span>{formatDate(article.publishedAt)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                            </div>

                            {!isLoading && articles.length === 0 && <NoResults query={search} />}

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
                            <h2 className="text-2xl lg:text-3xl font-black mb-2">Need a tailored research brief?</h2>
                            <p className="text-muted-foreground max-w-xl">Talk with our strategists and get a custom report for your industry or product.</p>
                        </div>
                        <Link to="/contact">
                            <Button size="lg" variant="gradient" className="rounded-2xl">
                                Request a briefing <ArrowRight size={16} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ArticleList;
