import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Newspaper, Eye, Star, FileText, DotsThreeVertical,
    Pencil, Trash, Broadcast, ArrowsClockwise, Crown, DownloadSimple, Paperclip,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { articlesAPI } from "@/api/articlesApi";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import SearchFilter from "@/components/common/SearchFilter";
import Pagination from "@/components/common/Pagination";
import StatsCard from "@/components/common/StatesCard";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInitials, formatDate, humanize, formatNumber } from "@/lib/utils";

const CATEGORIES = ["whitepaper", "research", "thought_leadership", "industry_report", "case_analysis", "opinion", "guide", "other"];
const STATUSES = ["draft", "published", "scheduled", "archived"];

const ArticlesList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [featured, setFeatured] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["articles", { search, status, category, featured, page, limit }],
        queryFn: () => articlesAPI.getAll({ search, status, category, isFeatured: featured, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["articles", "stats"],
        queryFn: () => articlesAPI.getStats().then((r) => r.data),
    });

    const publishMut = useMutation({
        mutationFn: (id) => articlesAPI.publish(id),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["articles"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: (id) => articlesAPI.delete(id),
        onSuccess: () => {
            toast.success("Article deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["articles"] });
        },
        onError: (e) => {
            toast.error(e?.response?.data?.message || "Could not delete");
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "title",
            label: "Article",
            render: (a) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-12 rounded-md overflow-hidden bg-muted shrink-0 ring-1 ring-border">
                        {a.coverImage?.url ? (
                            <img src={a.coverImage.url} alt={a.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full grid place-items-center"><Newspaper size={18} className="text-muted-foreground" weight="duotone" /></div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate max-w-65">{a.title}</p>
                            {a.isFeatured && <Star size={12} weight="fill" className="text-amber-500" />}
                            {a.isPremium && <Crown size={12} weight="fill" className="text-yellow-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-65">{a.subtitle || a.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (a) => <Badge variant="outline" className="capitalize">{humanize(a.category)}</Badge>,
        },
        { key: "status", label: "Status", render: (a) => <StatusBadge status={a.status} /> },
        {
            key: "authors",
            label: "Authors",
            render: (a) => {
                const all = [a.author, ...(a.coAuthors || [])].filter(Boolean);
                return (
                    <div className="flex items-center -space-x-2">
                        {all.slice(0, 3).map((u, i) => (
                            <Avatar key={i} className="size-6 ring-2 ring-background">
                                <AvatarImage src={u.avatar?.url} />
                                <AvatarFallback className="text-[10px]">{getInitials(`${u.firstName || ""} ${u.lastName || ""}`)}</AvatarFallback>
                            </Avatar>
                        ))}
                        {all.length > 3 && <div className="size-6 grid place-items-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-background">+{all.length - 3}</div>}
                    </div>
                );
            },
        },
        {
            key: "stats",
            label: "Engagement",
            render: (a) => (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Eye size={12} weight="duotone" /> {formatNumber(a.views)}</span>
                    <span className="inline-flex items-center gap-1"><DownloadSimple size={12} weight="duotone" /> {formatNumber(a.downloads)}</span>
                    {!!a.attachments?.length && <span className="inline-flex items-center gap-1"><Paperclip size={12} weight="duotone" /> {a.attachments.length}</span>}
                </div>
            ),
        },
        { key: "publishedAt", label: "Published", render: (a) => formatDate(a.publishedAt) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (a) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/articles/${a._id}`)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/articles/${a._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => publishMut.mutate(a._id)}>
                            <Broadcast size={14} className="mr-2" /> {a.status === "published" ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(a._id)}
                        >
                            <Trash size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const reset = () => { setSearch(""); setStatus(""); setCategory(""); setFeatured(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Articles"
                description="Whitepapers, research, and long-form thought leadership"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["articles"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/articles/new"><Plus size={15} className="mr-1.5" /> New Article</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Articles" value={stats.data?.total ?? 0} icon={Newspaper} loading={stats.isLoading} />
                <StatsCard title="Published" value={stats.data?.published ?? 0} icon={Broadcast} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="Drafts" value={stats.data?.drafts ?? 0} icon={FileText} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
                <StatsCard title="Premium" value={stats.data?.premium ?? 0} icon={Crown} iconColor="text-yellow-600" iconBg="bg-yellow-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search articles by title, slug, or tags..."
                filters={[
                    {
                        key: "status",
                        value: status,
                        placeholder: "Status",
                        onChange: (v) => { setStatus(v); setPage(1); },
                        options: STATUSES.map((s) => ({ value: s, label: humanize(s) })),
                    },
                    {
                        key: "category",
                        value: category,
                        placeholder: "Category",
                        onChange: (v) => { setCategory(v); setPage(1); },
                        options: CATEGORIES.map((c) => ({ value: c, label: humanize(c) })),
                    },
                    {
                        key: "featured",
                        value: featured,
                        placeholder: "Featured",
                        onChange: (v) => { setFeatured(v); setPage(1); },
                        options: [{ value: "true", label: "Featured" }, { value: "false", label: "Not featured" }],
                    },
                ]}
                onReset={reset}
            />

            <DataTable
                columns={columns}
                data={data?.articles}
                loading={isLoading}
                onRowClick={(a) => navigate(`/articles/${a._id}`)}
                emptyTitle="No articles found"
                emptyMessage="Adjust filters or publish your first article."
            />

            {data?.pagination && (
                <Pagination
                    pagination={data.pagination}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                />
            )}

            <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The article will be moved to trash and unpublished from the site.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate(deletingId)} disabled={remove.isPending}>
                            {remove.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ArticlesList;
