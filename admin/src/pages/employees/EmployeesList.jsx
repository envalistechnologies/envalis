import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, UsersThree, DotsThreeVertical, Pencil, Trash, ArrowsClockwise,
    Briefcase, UserCheck, UserMinus, IdentificationBadge,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { employeesAPI } from "@/api/employeesApi";
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
import { getInitials, formatDate, humanize } from "@/lib/utils";

const DEPARTMENTS = ["engineering", "design", "marketing", "hr", "finance", "operations", "sales", "management", "other"];
const STATUSES = ["active", "on_leave", "resigned", "terminated", "retired"];
const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "intern"];

const EmployeesList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [status, setStatus] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["employees", { search, department, status, employmentType, page, limit }],
        queryFn: () => employeesAPI.getAll({ search, department, status, employmentType, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["employees", "stats"],
        queryFn: () => employeesAPI.getStats().then((r) => r.data?.stats),
    });

    const remove = useMutation({
        mutationFn: (id) => employeesAPI.delete(id),
        onSuccess: () => {
            toast.success("Employee deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["employees"] });
        },
        onError: (e) => {
            toast.error(e?.response?.data?.message || "Could not delete");
            setDeletingId(null);
        },
    });

    const activeCount = stats.data?.byStatus?.find((s) => s._id === "active")?.count ?? 0;
    const onLeaveCount = stats.data?.byStatus?.find((s) => s._id === "on_leave")?.count ?? 0;
    const fullTimeCount = stats.data?.byEmploymentType?.find((s) => s._id === "full_time")?.count ?? 0;

    const columns = [
        {
            key: "employee",
            label: "Employee",
            render: (e) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                        <AvatarImage src={e.avatar?.url} />
                        <AvatarFallback className="text-xs">{getInitials(`${e.firstName} ${e.lastName}`)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{e.firstName} {e.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "employeeId",
            label: "ID",
            render: (e) => (
                <Badge variant="outline" className="font-mono text-xs">{e.employeeId || "—"}</Badge>
            ),
        },
        {
            key: "department",
            label: "Department",
            render: (e) => <Badge variant="secondary" className="capitalize">{humanize(e.department)}</Badge>,
        },
        { key: "designation", label: "Designation", render: (e) => e.designation || "—" },
        {
            key: "employmentType",
            label: "Type",
            render: (e) => <span className="text-sm capitalize text-muted-foreground">{humanize(e.employmentType || "")}</span>,
        },
        { key: "status", label: "Status", render: (e) => <StatusBadge status={e.status} /> },
        { key: "joiningDate", label: "Joined", render: (e) => formatDate(e.joiningDate) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (e) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" onClick={(ev) => ev.stopPropagation()}>
                            <DotsThreeVertical size={16} weight="bold" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(ev) => ev.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/employees/${e._id}`)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/employees/${e._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(e._id)}
                        >
                            <Trash size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const reset = () => { setSearch(""); setDepartment(""); setStatus(""); setEmploymentType(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Employees"
                description="Manage staff records, departments, and employment details"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["employees"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/employees/new"><Plus size={15} className="mr-1.5" /> New Employee</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Employees" value={stats.data?.total ?? 0} icon={UsersThree} loading={stats.isLoading} />
                <StatsCard title="Active" value={activeCount} icon={UserCheck} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="On Leave" value={onLeaveCount} icon={UserMinus} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
                <StatsCard title="Full Time" value={fullTimeCount} icon={Briefcase} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name, email, designation, or ID..."
                filters={[
                    {
                        key: "department",
                        value: department,
                        placeholder: "Department",
                        onChange: (v) => { setDepartment(v); setPage(1); },
                        options: DEPARTMENTS.map((d) => ({ value: d, label: humanize(d) })),
                    },
                    {
                        key: "status",
                        value: status,
                        placeholder: "Status",
                        onChange: (v) => { setStatus(v); setPage(1); },
                        options: STATUSES.map((s) => ({ value: s, label: humanize(s) })),
                    },
                    {
                        key: "type",
                        value: employmentType,
                        placeholder: "Type",
                        onChange: (v) => { setEmploymentType(v); setPage(1); },
                        options: EMPLOYMENT_TYPES.map((t) => ({ value: t, label: humanize(t) })),
                    },
                ]}
                onReset={reset}
            />

            <DataTable
                columns={columns}
                data={data?.employees}
                loading={isLoading}
                onRowClick={(e) => navigate(`/employees/${e._id}`)}
                emptyTitle="No employees found"
                emptyMessage="Adjust filters or onboard your first employee."
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
                        <AlertDialogTitle>Delete this employee?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The record will be archived. Audit history is retained for compliance.
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

export default EmployeesList;
