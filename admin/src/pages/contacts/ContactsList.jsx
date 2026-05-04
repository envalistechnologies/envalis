import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Envelope, DotsThreeVertical, Pencil, Trash, ArrowsClockwise,
    CheckCircle, Clock, WarningCircleIcon, User, Phone,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { contactsAPI } from "@/api/contactsApi";
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

const STATUSES = ["new", "read", "in_progress", "replied", "closed", "spam"];
const PRIORITIES = ["low", "medium", "high"];

const ContactsList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["contacts", { search, status, priority, page, limit }],
        queryFn: () => contactsAPI.getAll({ search, status, priority, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["contacts", "stats"],
        queryFn: () => contactsAPI.getStats().then((r) => r.data),
    });

    const list = data?.contacts || data?.data || [];
    const pagination = data?.pagination;
    const statsData = stats.data || {};

    const total = pagination?.total ?? list.length;
    const newContacts = statsData?.new || list.filter((c) => c.status === "new").length;
    const unread = statsData?.unread || list.filter((c) => !c.isRead).length;
    const highPriority = list.filter((c) => c.priority === "high").length;

    const remove = useMutation({
        mutationFn: (id) => contactsAPI.delete(id),
        onSuccess: () => {
            toast.success("Contact deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["contacts"] });
        },
        onError: (e) => {
            toast.error(getApiErrorMessage(e, "Unable to delete the contact. Please try again."));
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "name",
            label: "Contact",
            render: (c) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                        <AvatarFallback className="text-xs">{getInitials(c.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "subject",
            label: "Subject",
            render: (c) => (
                <div className="min-w-0">
                    <p className="text-sm truncate">{c.subject}</p>
                    {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (c) => <StatusBadge status={c.status} />,
        },
        {
            key: "priority",
            label: "Priority",
            render: (c) => (
                <Badge variant={
                    c.priority === "high" ? "destructive" :
                    c.priority === "medium" ? "secondary" :
                    "outline"
                } className="capitalize">{c.priority}</Badge>
            ),
        },
        {
            key: "phone",
            label: "Phone",
            render: (c) => (
                <span className="text-xs text-muted-foreground">{c.phone || "N/A"}</span>
            ),
        },
        {
            key: "createdAt",
            label: "Date",
            render: (c) => <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>,
        },
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
                        <DropdownMenuItem onClick={() => navigate(`/contacts/${c._id}`)}>
                            <Pencil size={14} className="mr-2" /> View Details
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

    const reset = () => { setSearch(""); setStatus(""); setPriority(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Contact Messages"
                description="Manage incoming contact form submissions"
                actions={
                    <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["contacts"] })}>
                        <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                    </Button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total" value={total} icon={Envelope} loading={isLoading} />
                <StatsCard title="New" value={newContacts} icon={WarningCircleIcon} iconColor="text-red-600" iconBg="bg-red-500/10" loading={isLoading} />
                <StatsCard title="Unread" value={unread} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={isLoading} />
                <StatsCard title="High Priority" value={highPriority} icon={User} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name, email, or subject..."
                filters={[
                    {
                        key: "status",
                        value: status,
                        placeholder: "Status",
                        onChange: (v) => { setStatus(v); setPage(1); },
                        options: STATUSES.map((s) => ({ value: s, label: humanize(s) })),
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
                data={list}
                loading={isLoading}
                onRowClick={(c) => navigate(`/contacts/${c._id}`)}
                emptyTitle="No contacts yet"
                emptyMessage="Contact messages will appear here when someone fills out your contact form."
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
                        <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this contact? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => remove.mutate(deletingId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ContactsList;
