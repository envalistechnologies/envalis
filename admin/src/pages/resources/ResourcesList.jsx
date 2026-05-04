import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, BookOpen, DotsThreeVertical, Pencil, Trash, ArrowsClockwise,
    Eye, DownloadSimple, Star, FileText, CheckCircle, PencilLine, Lock,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { resourcesAPI } from "@/api/resourcesApi";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import SearchFilter from "@/components/common/SearchFilter";
import Pagination from "@/components/common/Pagination";
import StatsCard from "@/components/common/StatesCard";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, humanize, formatNumber, truncate, getApiErrorMessage } from "@/lib/utils";

const TYPES = ["ebook", "whitepaper", "guide", "template", "checklist", "infographic", "video", "webinar", "tool", "other"];
const CATEGORIES = ["technology", "business", "design", "marketing", "development", "leadership", "productivity", "other"];
const STATUSES = ["draft", "published", "archived"];

const ResourcesList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["resources", { search, type, category, status, page, limit }],
        queryFn: () => resourcesAPI.getAll({ search, type, category, status, page, limit }).then((r) => r.data),
    });

    const list = data?.resources || data?.data || [];
    const pagination = data?.pagination;

    const total = pagination?.total ?? list.length;
    const published = list.filter((r) => r.status === "published").length;
    const drafts = list.filter((r) => r.status === "draft").length;
    const featured = list.filter((r) => r.isFeatured).length;

    const remove = useMutation({
        mutationFn: (id) => resourcesAPI.delete(id),
        onSuccess: () => {
            toast.success("Resource deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["resources"] });
        },
        onError: (e) => {
            toast.error(getApiErrorMessage(e, "Unable to delete the resource. Please try again."));
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "title",
            label: "Resource",
            render: (r) => (
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-md overflow-hidden bg-muted shrink-0">
                        {r.coverImage?.url ? (
                            <img src={r.coverImage.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-muted-foreground">
                                <FileText size={18} weight="duotone" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">{r.title}</p>
                            {r.isFeatured && <Star size={12} weight="fill" className="text-amber-500 shrink-0" />}
                            {!r.isFree && <Lock size={11} weight="fill" className="text-purple-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{truncate(r.description, 80)}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            label: "Type",
            render: (r) => <Badge variant="secondary" className="capitalize">{humanize(r.type)}</Badge>,
        },
        {
            key: "category",
            label: "Category",
            render: (r) => <Badge variant="outline" className="capitalize">{humanize(r.category)}</Badge>,
        },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        {
            key: "metrics",
            label: "Metrics",
            render: (r) => (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(r.views)}</span>
                    <span className="flex items-center gap-1"><DownloadSimple size={12} /> {formatNumber(r.downloads)}</span>
                </div>
            ),
        },
        { key: "publishedAt", label: "Published", render: (r) => formatDate(r.publishedAt) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (r) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/resources/${r._id}`)}>
                            <Eye size={14} className="mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/resources/${r._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        {r.file?.url && (
                            <DropdownMenuItem asChild>
                                <a href={r.file.url} target="_blank" rel="noreferrer">
                                    <DownloadSimple size={14} className="mr-2" /> Download File
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(r._id)}
                        >
                            <Trash size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const reset = () => { setSearch(""); setType(""); setCategory(""); setStatus(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Resources"
                description="Ebooks, whitepapers, templates, and other downloads"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["resources"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/resources/new"><Plus size={15} className="mr-1.5" /> New Resource</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total" value={total} icon={BookOpen} loading={isLoading} />
                <StatsCard title="Published" value={published} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={isLoading} />
                <StatsCard title="Drafts" value={drafts} icon={PencilLine} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={isLoading} />
                <StatsCard title="Featured" value={featured} icon={Star} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search resources..."
                filters={[
                    {
                        key: "type",
                        value: type,
                        placeholder: "Type",
                        onChange: (v) => { setType(v); setPage(1); },
                        options: TYPES.map((t) => ({ value: t, label: humanize(t) })),
                    },
                    {
                        key: "category",
                        value: category,
                        placeholder: "Category",
                        onChange: (v) => { setCategory(v); setPage(1); },
                        options: CATEGORIES.map((c) => ({ value: c, label: humanize(c) })),
                    },
                    {
                        key: "status",
                        value: status,
                        placeholder: "Status",
                        onChange: (v) => { setStatus(v); setPage(1); },
                        options: STATUSES.map((s) => ({ value: s, label: humanize(s) })),
                    },
                ]}
                onReset={reset}
            />

            <DataTable
                columns={columns}
                data={list}
                loading={isLoading}
                onRowClick={(r) => navigate(`/resources/${r._id}`)}
                emptyTitle="No resources yet"
                emptyMessage="Add your first downloadable resource."
            />

            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                />
            )}

            <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the file from public access.</AlertDialogDescription>
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

export default ResourcesList;
