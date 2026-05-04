import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Briefcase, DotsThreeVertical, Pencil, Trash, ArrowsClockwise,
    Eye, Star, Image as ImageIcon, CheckCircle, PencilLine,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { portfoliosAPI } from "@/api/portfoliosApi";
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

const CATEGORIES = ["web_development", "mobile_app", "ui_ux", "branding", "ecommerce", "saas", "enterprise", "other"];
const STATUSES = ["draft", "published", "archived"];

const PortfoliosList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["portfolios", { search, status, category, page, limit }],
        queryFn: () => portfoliosAPI.getAll({ search, status, category, page, limit }).then((r) => r.data),
    });

    const list = data?.portfolios || data?.data || [];
    const pagination = data?.pagination;

    const total = pagination?.total ?? list.length;
    const published = list.filter((p) => p.status === "published").length;
    const drafts = list.filter((p) => p.status === "draft").length;
    const featured = list.filter((p) => p.isFeatured).length;

    const remove = useMutation({
        mutationFn: (id) => portfoliosAPI.delete(id),
        onSuccess: () => {
            toast.success("Portfolio deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["portfolios"] });
        },
        onError: (e) => {
            toast.error(e?.response?.data?.message || "Could not delete");
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "title",
            label: "Project",
            render: (p) => (
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-md overflow-hidden bg-muted shrink-0">
                        {p.coverImage?.url ? (
                            <img src={p.coverImage.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-muted-foreground">
                                <ImageIcon size={18} weight="duotone" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">{p.title}</p>
                            {p.isFeatured && <Star size={12} weight="fill" className="text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{truncate(p.shortDescription || p.description, 60)}</p>
                    </div>
                </div>
            ),
        },
        { key: "client", label: "Client", render: (p) => p.client?.name || "—" },
        {
            key: "category",
            label: "Category",
            render: (p) => <Badge variant="secondary" className="capitalize">{humanize(p.category)}</Badge>,
        },
        { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} /> },
        { key: "views", label: "Views", render: (p) => formatNumber(p.views) },
        { key: "completionDate", label: "Completed", render: (p) => formatDate(p.completionDate) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (p) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/portfolios/${p._id}`)}>
                            <Eye size={14} className="mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/portfolios/${p._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(p._id)}
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
                title="Portfolio"
                description="Showcase completed projects and client work"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["portfolios"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/portfolios/new"><Plus size={15} className="mr-1.5" /> New Project</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total" value={total} icon={Briefcase} loading={isLoading} />
                <StatsCard title="Published" value={published} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={isLoading} />
                <StatsCard title="Drafts" value={drafts} icon={PencilLine} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={isLoading} />
                <StatsCard title="Featured" value={featured} icon={Star} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by title, client, or technology..."
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
                onRowClick={(p) => navigate(`/portfolios/${p._id}`)}
                emptyTitle="No projects yet"
                emptyMessage="Add your first portfolio item to start showcasing work."
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
                        <AlertDialogTitle>Delete this portfolio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the project from your public portfolio.
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

export default PortfoliosList;
