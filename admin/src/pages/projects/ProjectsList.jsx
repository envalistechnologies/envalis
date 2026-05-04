import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, FolderOpen, DotsThreeVertical, Pencil, Trash, ArrowsClockwise,
    Clock, CheckCircle, Warning, FlagBanner,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { projectsAPI } from "@/api/projectsApi";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import SearchFilter from "@/components/common/SearchFilter";
import Pagination from "@/components/common/Pagination";
import StatsCard from "@/components/common/StatesCard";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, humanize, getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = ["web_development", "mobile_app", "ui_ux", "branding", "ecommerce", "saas", "enterprise", "consulting", "other"];
const STATUSES = ["planning", "in_progress", "review", "on_hold", "completed", "cancelled", "delivered"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const ProjectsList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["projects", { search, status, category, priority, page, limit }],
        queryFn: () => projectsAPI.getAll({ search, status, category, priority, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["projects", "stats"],
        queryFn: () => projectsAPI.getStats().then((r) => r.data),
    });

    const remove = useMutation({
        mutationFn: (id) => projectsAPI.delete(id),
        onSuccess: () => {
            toast.success("Project deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: (e) => {
            toast.error(getApiErrorMessage(e, "Unable to delete the project. Please try again."));
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "name",
            label: "Project",
            render: (p) => (
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <Badge variant="outline" className="font-mono text-[10px]">{p.projectId}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.client}</p>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (p) => <Badge variant="secondary" className="capitalize">{humanize(p.category)}</Badge>,
        },
        { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} /> },
        {
            key: "priority",
            label: "Priority",
            render: (p) => <StatusBadge status={p.priority} />,
        },
        {
            key: "progress",
            label: "Progress",
            render: (p) => (
                <div className="w-32">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span>{p.progress || 0}%</span>
                    </div>
                    <Progress value={p.progress || 0} className="h-1.5" />
                </div>
            ),
        },
        { key: "estimatedEndDate", label: "Due", render: (p) => formatDate(p.estimatedEndDate) },
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
                        <DropdownMenuItem onClick={() => navigate(`/projects/${p._id}`)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/projects/${p._id}/edit`)}>
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

    const reset = () => { setSearch(""); setStatus(""); setCategory(""); setPriority(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Projects"
                description="Track ongoing and delivered client projects"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["projects"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/projects/new"><Plus size={15} className="mr-1.5" /> New Project</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Projects" value={stats.data?.total ?? 0} icon={FolderOpen} loading={stats.isLoading} />
                <StatsCard title="In Progress" value={stats.data?.inProgress ?? 0} icon={Clock} iconColor="text-blue-600" iconBg="bg-blue-500/10" loading={stats.isLoading} />
                <StatsCard title="Completed" value={stats.data?.completed ?? 0} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="Critical" value={stats.data?.critical ?? 0} icon={Warning} iconColor="text-rose-600" iconBg="bg-rose-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by project name, client, or ID..."
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
                        key: "priority",
                        value: priority,
                        placeholder: "Priority",
                        onChange: (v) => { setPriority(v); setPage(1); },
                        options: PRIORITIES.map((p) => ({ value: p, label: humanize(p) })),
                    },
                ]}
                onReset={reset}
            />

            <DataTable
                columns={columns}
                data={data?.projects}
                loading={isLoading}
                onRowClick={(p) => navigate(`/projects/${p._id}`)}
                emptyTitle="No projects yet"
                emptyMessage="Kick off your first project to start tracking work."
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
                        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            All milestones, tasks, and notes will be archived.
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

export default ProjectsList;
