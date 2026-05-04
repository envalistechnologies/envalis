import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Newspaper, DotsThreeVertical, Pencil, Trash, ArrowsClockwise, Eye, Star, FileText, CheckCircle, PencilLine } from "@phosphor-icons/react";
import { toast } from "sonner";

import { caseStudiesAPI } from "@/api/caseStudiesApi";
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
import { formatDate, humanize, formatNumber, truncate } from "@/lib/utils";

const CATEGORIES = ["digital_transformation", "product_development", "process_improvement", "cost_reduction", "growth", "other"];
const STATUSES = ["draft", "published", "archived"];

const CaseStudiesList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["caseStudies", { search, status, category, page, limit }],
        queryFn: () => caseStudiesAPI.getAll({ search, status, category, page, limit }).then((r) => r.data),
    });

    const list = data?.caseStudies || data?.data || [];
    const pagination = data?.pagination;

    const total = pagination?.total ?? list.length;
    const published = list.filter((c) => c.status === "published").length;
    const drafts = list.filter((c) => c.status === "draft").length;
    const featured = list.filter((c) => c.isFeatured).length;

    const remove = useMutation({
        mutationFn: (id) => caseStudiesAPI.delete(id),
        onSuccess: () => {
            toast.success("Case study deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["caseStudies"] });
        },
        onError: (e) => {
            toast.error(e?.response?.data?.message || "Could not delete");
            setDeletingId(null);
        },
    });

    const publish = useMutation({
        mutationFn: (id) => caseStudiesAPI.publish(id),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["caseStudies"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const columns = [
        {
            key: "title",
            label: "Case Study",
            render: (c) => (
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-md overflow-hidden bg-muted shrink-0">
                        {c.coverImage?.url ? (
                            <img src={c.coverImage.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-muted-foreground">
                                <Newspaper size={18} weight="duotone" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">{c.title}</p>
                            {c.isFeatured && <Star size={12} weight="fill" className="text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{truncate(c.tagline || c.overview, 60)}</p>
                    </div>
                </div>
            ),
        },
        { key: "client", label: "Client", render: (c) => c.client?.name || "—" },
        {
            key: "category",
            label: "Category",
            render: (c) => <Badge variant="secondary" className="capitalize">{humanize(c.category)}</Badge>,
        },
        { key: "status", label: "Status", render: (c) => <StatusBadge status={c.status} /> },
        { key: "views", label: "Views", render: (c) => formatNumber(c.views) },
        { key: "completionDate", label: "Completed", render: (c) => formatDate(c.completionDate) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (c) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/case-studies/${c._id}`)}>
                            <Eye size={14} className="mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/case-studies/${c._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => publish.mutate(c._id)}>
                            <CheckCircle size={14} className="mr-2" />
                            {c.status === "published" ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(c._id)}
                        >
                            <Trash size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const reset = () => { setSearch(""); setStatus(""); setCategory(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Case Studies"
                description="Showcase client success stories with detailed narratives"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["caseStudies"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/case-studies/new"><Plus size={15} className="mr-1.5" /> New Case Study</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total" value={total} icon={Newspaper} loading={isLoading} />
                <StatsCard title="Published" value={published} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={isLoading} />
                <StatsCard title="Drafts" value={drafts} icon={PencilLine} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={isLoading} />
                <StatsCard title="Featured" value={featured} icon={Star} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search case studies by title, client, or tag..."
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
                ]}
                onReset={reset}
            />

            <DataTable
                columns={columns}
                data={list}
                loading={isLoading}
                onRowClick={(c) => navigate(`/case-studies/${c._id}`)}
                emptyTitle="No case studies yet"
                emptyMessage="Start documenting your wins to attract more clients."
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
                        <AlertDialogTitle>Delete this case study?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the case study from your site. This action cannot be undone.
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

export default CaseStudiesList;
