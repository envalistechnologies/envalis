import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Crown, FileText } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/common/HeroSection";
import FilterBar from "@/components/common/FilterBar";
import Pagination from "@/components/common/Pagination";
import { ErrorState, NoResults, SkeletonCard } from "@/components/common/LoadingStates";
import { formatDate, truncate } from "@/lib/utils";

const ARTICLE_CATEGORIES = [
    "whitepaper", "research", "thought_leadership", "industry_report",
    "case_analysis", "opinion", "guide", "other",
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
        page, limit,
    }), [search, category, featured, premium, page]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["public-articles", params],
        queryFn: () => publicAPI.getArticles(params).then((r) => r.data),
    });

    const articles = data?.articles || [];
    const pagination = data?.pagination;

    return (
        <div className="bg-white">
            <HeroSection
                badge="📚 Research Library"
                title="In-depth Articles and Thought Leadership"
                description="Whitepapers, guides, and strategic research to help you plan your next move."
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                searchPlaceholder="Search articles by title or topic"
            />

            <section className="section-padding pt-8">
                <div className="container mx-auto">
                    <div className="mb-10">
                        <FilterBar
                            searchValue={search}
                            onSearchChange={(v) => { setSearch(v); setPage(1); }}
                            searchPlaceholder="Search articles..."
                            categories={ARTICLE_CATEGORIES}
                            activeCategory={category}
                            onCategoryChange={(c) => { setCategory(c); setPage(1); }}
                            filters={[
                                { id: "featured", label: "Featured", value: featured, options: ["true"] },
                                { id: "premium", label: "Access", value: premium, options: ["true", "false"] },
                            ]}
                            onFilterChange={(id, v) => {
                                if (id === "featured") setFeatured(v);
                                if (id === "premium") setPremium(v);
                                setPage(1);
                            }}
                            onReset={() => { setSearch(""); setCategory(""); setFeatured(""); setPremium(""); setPage(1); }}
                        />
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
                                            className="group rounded-2xl border border-slate-100 overflow-hidden bg-white hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="h-48 bg-slate-50 overflow-hidden">
                                                {article.coverImage?.url ? (
                                                    <img src={article.coverImage.url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-indigo-50" />
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    <Badge variant="outline" className="text-xs capitalize rounded-full border-slate-200">{article.category?.replace(/_/g, " ")}</Badge>
                                                    {article.isPremium && (
                                                        <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                                            <Crown size={12} weight="fill" className="mr-1" /> Premium
                                                        </Badge>
                                                    )}
                                                    {article.isFeatured && <Badge variant="secondary" className="text-xs rounded-full">Featured</Badge>}
                                                </div>
                                                <h3 className="font-bold text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{truncate(article.excerpt, 120)}</p>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><FileText size={12} /> {article.readTime || 8} min read</span>
                                                    <span>{formatDate(article.publishedAt)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                            </div>

                            {!isLoading && articles.length === 0 && <NoResults query={search} />}
                            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
                        </>
                    )}
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="container mx-auto">
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black mb-2">Need a tailored research brief?</h2>
                            <p className="text-muted-foreground max-w-xl">Talk with our strategists and get a custom report for your industry or product.</p>
                        </div>
                        <Link to="/contact">
                            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
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
