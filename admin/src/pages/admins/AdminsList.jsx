import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck, ShieldStar, DotsThreeVertical, Pencil, Trash, Power, ArrowsClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";

import { adminsAPI } from "@/api/adminsApi";
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
import { getInitials, formatDate, humanize, getApiErrorMessage } from "@/lib/utils";

const ROLES = ["super_admin", "admin", "hr", "manager", "editor", "viewer"];

const AdminsList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admins", { search, role, status, page, limit }],
        queryFn: () => adminsAPI.getAll({ search, role, isActive: status, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["admins", "stats"],
        queryFn: () => adminsAPI.getStats().then((r) => r.data),
    });

    const toggleStatus = useMutation({
        mutationFn: (id) => adminsAPI.toggleStatus(id),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to update the admin status.")),
    });

    const remove = useMutation({
        mutationFn: (id) => adminsAPI.delete(id),
        onSuccess: () => {
            toast.success("Admin deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: (e) => {
            toast.error(getApiErrorMessage(e, "Unable to delete the admin. Please try again."));
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "name",
            label: "Admin",
            render: (a) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        <AvatarImage src={a.avatar?.url} />
                        <AvatarFallback className="text-xs">{getInitials(`${a.firstName} ${a.lastName}`)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">{a.firstName} {a.lastName}</p>
                            {a.isSuperAdmin && <ShieldStar size={13} className="text-amber-500" weight="fill" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "role",
            label: "Role",
            render: (a) => (
                <Badge variant={a.role === "super_admin" ? "default" : "secondary"} className="capitalize">
                    {humanize(a.role)}
                </Badge>
            ),
        },
        { key: "department", label: "Department", render: (a) => a.department || "N/A" },
        {
            key: "twoFactorEnabled",
            label: "2FA",
            render: (a) => a.twoFactorEnabled
                ? <Badge variant="success" className="gap-1"><ShieldCheck size={11} weight="fill" /> Enabled</Badge>
                : <Badge variant="outline">Disabled</Badge>,
        },
        {
            key: "isActive",
            label: "Status",
            render: (a) => <StatusBadge status={a.isActive ? "active" : "archived"} />,
        },
        { key: "lastLogin", label: "Last login", render: (a) => formatDate(a.lastLogin) },
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
                        <DropdownMenuItem onClick={() => navigate(`/admins/${a._id}`)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admins/${a._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus.mutate(a._id)} disabled={a.isSuperAdmin}>
                            <Power size={14} className="mr-2" /> {a.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(a._id)}
                            disabled={a.isSuperAdmin}
                        >
                            <Trash size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const reset = () => { setSearch(""); setRole(""); setStatus(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Admins"
                description="Manage admin users, roles, and permissions"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["admins"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/admins/new"><Plus size={15} className="mr-1.5" /> New Admin</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Admins" value={stats.data?.total ?? 0} icon={ShieldCheck} loading={stats.isLoading} />
                <StatsCard title="Active" value={stats.data?.active ?? 0} icon={ShieldCheck} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="With 2FA" value={stats.data?.with2FA ?? 0} icon={ShieldStar} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
                <StatsCard title="Super Admins" value={stats.data?.superAdmins ?? 0} icon={ShieldStar} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search admins by name or email..."
                filters={[
                    {
                        key: "role",
                        value: role,
                        placeholder: "Role",
                        onChange: (v) => { setRole(v); setPage(1); },
                        options: ROLES.map((r) => ({ value: r, label: humanize(r) })),
                    },
                    {
                        key: "status",
                        value: status,
                        placeholder: "Status",
                        onChange: (v) => { setStatus(v); setPage(1); },
                        options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }],
                    },
                ]}
                onReset={reset}
            />

            <DataTable
                columns={columns}
                data={data?.admins}
                loading={isLoading}
                onRowClick={(a) => navigate(`/admins/${a._id}`)}
                emptyTitle="No admins found"
                emptyMessage="Adjust filters or add a new admin."
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
                        <AlertDialogTitle>Delete this admin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently revoke their access. Audit history is retained.
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

export default AdminsList;
