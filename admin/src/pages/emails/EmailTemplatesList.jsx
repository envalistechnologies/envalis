import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, FileText, DotsThreeVertical, Pencil, Trash, Copy, Eye,
    ArrowsClockwise, CheckCircle, XCircle, Star,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { emailsAPI } from "@/api/emailsApi";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import SearchFilter from "@/components/common/SearchFilter";
import Pagination from "@/components/common/Pagination";
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

const CATEGORIES = ["welcome", "announcement", "newsletter", "hr_notice", "policy", "event", "recognition", "reminder", "other"];

const EmailTemplatesList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [active, setActive] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["email-templates", { search, category, active, page, limit }],
        queryFn: () => emailsAPI.getTemplates({ search, category, isActive: active, page, limit }).then((r) => r.data),
    });

    const remove = useMutation({
        mutationFn: (id) => emailsAPI.deleteTemplate(id),
        onSuccess: () => {
            toast.success("Template deleted");
            setDeletingId(null);
            qc.invalidateQueries({ queryKey: ["email-templates"] });
        },
        onError: (e) => {
            toast.error(getApiErrorMessage(e, "Unable to delete the email template. Please try again."));
            setDeletingId(null);
        },
    });

    const columns = [
        {
            key: "name",
            label: "Template",
            render: (t) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-md bg-primary/10 grid place-items-center shrink-0">
                        <FileText size={16} weight="duotone" className="text-primary" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate max-w-65">{t.name}</p>
                            {t.isDefault && <Star size={12} weight="fill" className="text-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-65">{truncate(t.subject, 60)}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (t) => <Badge variant="outline" className="capitalize">{humanize(t.category)}</Badge>,
        },
        {
            key: "isActive",
            label: "Status",
            render: (t) => t.isActive
                ? <Badge variant="success" className="gap-1"><CheckCircle size={11} weight="fill" /> Active</Badge>
                : <Badge variant="outline" className="gap-1"><XCircle size={11} weight="fill" /> Inactive</Badge>,
        },
        {
            key: "usageCount",
            label: "Uses",
            render: (t) => formatNumber(t.usageCount || 0),
        },
        { key: "createdAt", label: "Created", render: (t) => formatDate(t.createdAt) },
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
                        <DropdownMenuItem onClick={() => navigate(`/emails/templates/${t._id}/edit`)}>
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/emails/send?templateId=${t._id}`)}>
                            <Eye size={14} className="mr-2" /> Use template
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(t._id)}
                            disabled={t.isDefault}
                        >
                            <Trash size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const reset = () => { setSearch(""); setCategory(""); setActive(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Email Templates"
                description="Reusable templates for notifications, announcements, and more"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["email-templates"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/emails/templates/new"><Plus size={15} className="mr-1.5" /> New Template</Link>
                        </Button>
                    </>
                }
            />

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name or subject..."
                filters={[
                    {
                        key: "category",
                        value: category,
                        placeholder: "Category",
                        onChange: (v) => { setCategory(v); setPage(1); },
                        options: CATEGORIES.map((c) => ({ value: c, label: humanize(c) })),
                    },
                    {
                        key: "active",
                        value: active,
                        placeholder: "Status",
                        onChange: (v) => { setActive(v); setPage(1); },
                        options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }],
                    },
                ]}
                onReset={reset}
            />

            <DataTable
                columns={columns}
                data={data?.templates}
                loading={isLoading}
                onRowClick={(t) => navigate(`/emails/templates/${t._id}/edit`)}
                emptyTitle="No templates yet"
                emptyMessage="Create your first email template to streamline outbound communication."
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
                        <AlertDialogTitle>Delete this template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Existing email logs that reference this template will keep their snapshot, but the template itself will be removed.
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

export default EmailTemplatesList;
