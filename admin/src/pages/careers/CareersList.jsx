import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, BriefcaseMetal, DotsThreeVertical, Pencil, Trash, ArrowsClockwise,
    Star, MapPin, Clock, Users, FlagBanner, FileMagnifyingGlass,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { careersAPI } from "@/api/careersApi";
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
import { formatDate, humanize, formatNumber, getApiErrorMessage } from "@/lib/utils";

const DEPARTMENTS = ["engineering", "design", "marketing", "hr", "finance", "operations", "sales", "management", "other"];
const TYPES = ["full_time", "part_time", "contract", "internship", "remote", "hybrid"];
const STATUSES = ["draft", "active", "paused", "closed", "filled"];

const CareersList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["careers", { search, department, type, status, page, limit }],
        queryFn: () => careersAPI.getAll({ search, department, type, status, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["careers", "stats"],
        queryFn: () => careersAPI.getStats().then((r) => r.data?.stats),
    });

    const remove = useMutation({
        mutationFn: (id) => careersAPI.delete(id),
        onSuccess: () => {
            toast.success("Job deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["careers"] });
        },
        onError: (e) => {
            toast.error(getApiErrorMessage(e, "Unable to delete the job posting. Please try again."));
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "title",
            label: "Position",
            render: (j) => (
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm truncate">{j.title}</p>
                        {j.isFeatured && <Star size={12} weight="fill" className="text-amber-500 shrink-0" />}
                        {j.isUrgent && <FlagBanner size={12} weight="fill" className="text-rose-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="font-mono text-[10px]">{j.jobId}</Badge>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {j.location}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "department",
            label: "Department",
            render: (j) => <Badge variant="secondary" className="capitalize">{humanize(j.department)}</Badge>,
        },
        {
            key: "type",
            label: "Type",
            render: (j) => <span className="text-sm capitalize text-muted-foreground">{humanize(j.type)}</span>,
        },
        {
            key: "experience",
            label: "Experience",
            render: (j) => (
                <span className="text-sm text-muted-foreground">
                    {j.experience?.min ?? 0}{j.experience?.max ? `–${j.experience.max}` : "+"} yrs
                </span>
            ),
        },
        {
            key: "applications",
            label: "Applications",
            render: (j) => (
                <Badge variant="outline" className="font-mono">{j.applications?.length || 0}</Badge>
            ),
        },
        { key: "status", label: "Status", render: (j) => <StatusBadge status={j.status === "active" ? "active-job" : j.status} /> },
        { key: "applicationDeadline", label: "Deadline", render: (j) => formatDate(j.applicationDeadline) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (j) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/careers/${j._id}`)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/careers/${j._id}/applications`)}>
                            <FileMagnifyingGlass size={14} className="mr-2" /> Applications
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/careers/${j._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(j._id)}
                        >
                            <Trash size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const reset = () => { setSearch(""); setDepartment(""); setType(""); setStatus(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Careers"
                description="Manage open positions and applications"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["careers"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/careers/new"><Plus size={15} className="mr-1.5" /> New Job</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Jobs" value={stats.data?.totalJobs ?? 0} icon={BriefcaseMetal} loading={stats.isLoading} />
                <StatsCard title="Active" value={stats.data?.byStatus?.find((s) => s._id === "active")?.count ?? 0} icon={Clock} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="Applications" value={formatNumber(stats.data?.totalApplications?.reduce((a, c) => a + c.count, 0) ?? 0)} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-500/10" loading={stats.isLoading} />
                <StatsCard title="Featured" value={stats.data?.byStatus?.find((s) => s._id === "featured")?.count ?? 0} icon={Star} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by title, location, or skills..."
                filters={[
                    {
                        key: "department",
                        value: department,
                        placeholder: "Department",
                        onChange: (v) => { setDepartment(v); setPage(1); },
                        options: DEPARTMENTS.map((d) => ({ value: d, label: humanize(d) })),
                    },
                    {
                        key: "type",
                        value: type,
                        placeholder: "Type",
                        onChange: (v) => { setType(v); setPage(1); },
                        options: TYPES.map((t) => ({ value: t, label: humanize(t) })),
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
                data={data?.jobs || data?.careers}
                loading={isLoading}
                onRowClick={(j) => navigate(`/careers/${j._id}`)}
                emptyTitle="No openings yet"
                emptyMessage="Post your first job to start receiving applications."
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
                        <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                        <AlertDialogDescription>
                            All applications for this job will also be archived.
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

export default CareersList;
