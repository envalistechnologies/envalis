import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Article as ArticleIcon, Eye, Star, FileText, DotsThreeVertical,
    Pencil, Trash, BroadcastIcon, BroadcastIcon, ArrowsClockwise, BookmarkSimple,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { blogsAPI } from "@/api/blogsApi";
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

const CATEGORIES = ["technology", "design", "business", "marketing", "development", "news", "tutorial", "insights", "other"];
const STATUSES = ["draft", "published", "scheduled", "archived"];

const BlogsList = () => {
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
        queryKey: ["blogs", { search, status, category, featured, page, limit }],
        queryFn: () => blogsAPI.getAll({ search, status, category, isFeatured: featured, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["blogs", "stats"],
        queryFn: () => blogsAPI.getStats().then((r) => r.data),
    });

    const publishMut = useMutation({
        mutationFn: ({ id, action }) => action === "publish" ? blogsAPI.publish(id) : blogsAPI.unpublish(id),
        onSuccess: (_, { action }) => {
            toast.success(action === "publish" ? "Blog published" : "Blog unpublished");
            qc.invalidateQueries({ queryKey: ["blogs"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: (id) => blogsAPI.delete(id),
        onSuccess: () => {
            toast.success("Blog deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["blogs"] });
        },
        onError: (e) => {
            toast.error(e?.response?.data?.message || "Could not delete");
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "title",
            label: "Blog",
            render: (b) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-12 rounded-md overflow-hidden bg-muted shrink-0 ring-1 ring-border">
                        {b.coverImage?.url ? (
                            <img src={b.coverImage.url} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full grid place-items-center"><FileText size={18} className="text-muted-foreground" weight="duotone" /></div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate max-w-65">{b.title}</p>
                            {b.isFeatured && <Star size={12} weight="fill" className="text-amber-500" />}
                            {b.isTopPick && <BookmarkSimple size={12} weight="fill" className="text-purple-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-65">{b.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (b) => <Badge variant="outline" className="capitalize">{humanize(b.category)}</Badge>,
        },
        { key: "status", label: "Status", render: (b) => <StatusBadge status={b.status} /> },
        {
            key: "author",
            label: "Author",
            render: (b) => (
                <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                        <AvatarImage src={b.author?.avatar?.url} />
                        <AvatarFallback className="text-[10px]">{getInitials(`${b.author?.firstName || ""} ${b.author?.lastName || ""}`)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate max-w-35">
                        {b.author ? `${b.author.firstName || ""} ${b.author.lastName || ""}`.trim() : "—"}
                    </span>
                </div>
            ),
        },
        {
            key: "views",
            label: "Views",
            render: (b) => (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye size={13} weight="duotone" /> {formatNumber(b.views)}
                </div>
            ),
        },
        { key: "publishedAt", label: "Published", render: (b) => formatDate(b.publishedAt) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (b) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/blogs/${b._id}`)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/blogs/${b._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        {b.status === "published" ? (
                            <DropdownMenuItem onClick={() => publishMut.mutate({ id: b._id, action: "unpublish" })}>
                                <BroadcastIcon size={14} className="mr-2" /> Unpublish
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => publishMut.mutate({ id: b._id, action: "publish" })}>
                                <BroadcastIcon size={14} className="mr-2" /> Publish
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(b._id)}
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
                title="Blogs"
                description="Author, schedule, and publish blog posts"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["blogs"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/blogs/new"><Plus size={15} className="mr-1.5" /> New Blog</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Blogs" value={stats.data?.total ?? 0} icon={ArticleIcon} loading={stats.isLoading} />
                <StatsCard title="Published" value={stats.data?.published ?? 0} icon={BroadcastIcon} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="Drafts" value={stats.data?.drafts ?? 0} icon={FileText} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
                <StatsCard title="Featured" value={stats.data?.featured ?? 0} icon={Star} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search blogs by title, slug, or tags..."
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
                data={data?.blogs}
                loading={isLoading}
                onRowClick={(b) => navigate(`/blogs/${b._id}`)}
                emptyTitle="No blogs found"
                emptyMessage="Adjust filters or create your first blog post."
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
                        <AlertDialogTitle>Delete this blog?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The post will be moved to trash. You can restore it from the archive.
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

export default BlogsList;
