import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, ChatCircleText, DotsThreeVertical, Pencil, Trash, ArrowsClockwise,
    Star, CheckCircle, XCircle, Clock,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { testimonialsAPI } from "@/api/testimonialsApi";
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
import { getInitials, formatDate, humanize, truncate } from "@/lib/utils";

const CATEGORIES = ["general", "web_development", "mobile_app", "design", "consulting", "support", "other"];
const STATUSES = ["pending", "approved", "rejected", "archived"];

const RatingStars = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} weight={i < rating ? "fill" : "regular"} className={i < rating ? "text-amber-500" : "text-muted-foreground"} />
        ))}
    </div>
);

const TestimonialsList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["testimonials", { search, status, category, page, limit }],
        queryFn: () => testimonialsAPI.getAll({ search, status, category, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["testimonials", "stats"],
        queryFn: () => testimonialsAPI.getStats().then((r) => r.data),
    });

    const list = data?.testimonials || data?.data || [];

    const approve = useMutation({
        mutationFn: (id) => testimonialsAPI.approve(id),
        onSuccess: () => { toast.success("Approved"); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const reject = useMutation({
        mutationFn: (id) => testimonialsAPI.reject(id),
        onSuccess: () => { toast.success("Rejected"); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const toggleFeatured = useMutation({
        mutationFn: (id) => testimonialsAPI.toggleFeatured(id),
        onSuccess: () => { toast.success("Featured updated"); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: (id) => testimonialsAPI.delete(id),
        onSuccess: () => {
            toast.success("Testimonial deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["testimonials"] });
        },
        onError: (e) => {
            toast.error(e?.response?.data?.message || "Could not delete");
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "client",
            label: "Client",
            render: (t) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                        <AvatarImage src={t.clientAvatar?.url} />
                        <AvatarFallback className="text-xs">{getInitials(t.clientName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">{t.clientName}</p>
                            {t.isFeatured && <Star size={12} weight="fill" className="text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{t.clientDesignation} • {t.clientCompany}</p>
                    </div>
                </div>
            ),
        },
        { key: "rating", label: "Rating", render: (t) => <RatingStars rating={t.rating} /> },
        {
            key: "quote",
            label: "Quote",
            render: (t) => <p className="text-sm text-muted-foreground max-w-xs truncate" title={t.quote}>{truncate(t.quote, 80)}</p>,
        },
        {
            key: "category",
            label: "Category",
            render: (t) => <Badge variant="outline" className="capitalize">{humanize(t.category)}</Badge>,
        },
        { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} /> },
        { key: "createdAt", label: "Submitted", render: (t) => formatDate(t.createdAt) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (t) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/testimonials/${t._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        {t.status !== "approved" && (
                            <DropdownMenuItem onClick={() => approve.mutate(t._id)}>
                                <CheckCircle size={14} className="mr-2" /> Approve
                            </DropdownMenuItem>
                        )}
                        {t.status !== "rejected" && (
                            <DropdownMenuItem onClick={() => reject.mutate(t._id)}>
                                <XCircle size={14} className="mr-2" /> Reject
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => toggleFeatured.mutate(t._id)}>
                            <Star size={14} className="mr-2" /> {t.isFeatured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(t._id)}
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
                title="Testimonials"
                description="Manage client reviews and ratings"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["testimonials"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/testimonials/new"><Plus size={15} className="mr-1.5" /> New Testimonial</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total" value={stats.data?.total ?? 0} icon={ChatCircleText} loading={stats.isLoading} />
                <StatsCard title="Approved" value={stats.data?.approved ?? 0} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="Pending" value={stats.data?.pending ?? 0} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
                <StatsCard title="Avg Rating" value={(stats.data?.averageRating || 0).toFixed(1)} icon={Star} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by client name, company, or quote..."
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
                onRowClick={(t) => navigate(`/testimonials/${t._id}/edit`)}
                emptyTitle="No testimonials yet"
                emptyMessage="Add your first testimonial to start building social proof."
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
                        <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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

export default TestimonialsList;
