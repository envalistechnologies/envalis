import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ClipboardText, ArrowsClockwise, ShieldWarning, Warning, CheckCircle,
    Eye, User, Clock, PulseIcon,
} from "@phosphor-icons/react";

import { auditAPI } from "@/api/auditApi";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import SearchFilter from "@/components/common/SearchFilter";
import Pagination from "@/components/common/Pagination";
import StatsCard from "@/components/common/StatesCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, humanize } from "@/lib/utils";

const ACTIONS = [
    "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "LOGIN_FAILED",
    "PASSWORD_CHANGE", "EMAIL_SENT", "BULK_EMAIL_SENT", "FILE_UPLOADED", "FILE_DELETED",
    "PUBLISH", "UNPUBLISH", "ROLE_CHANGE", "PERMISSION_CHANGE",
    "ADMIN_CREATED", "ADMIN_DELETED", "EMPLOYEE_CREATED", "EMPLOYEE_UPDATED", "EMPLOYEE_DELETED",
    "TEMPLATE_CREATED", "TEMPLATE_UPDATED", "SETTINGS_CHANGED",
];
const ENTITIES = [
    "Admin", "Employee", "Blog", "Article", "Portfolio", "CaseStudy",
    "Testimonial", "Service", "Project", "Career", "Contact",
    "Resource", "EmailLog", "EmailTemplate", "System",
];
const SEVERITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["success", "failure", "warning"];

const severityBadge = (s) => {
    const map = { low: "secondary", medium: "warning", high: "destructive", critical: "destructive" };
    return <Badge variant={map[s] || "secondary"} className="capitalize">{s}</Badge>;
};

const statusBadge = (s) => {
    const map = {
        success: { variant: "success", Icon: CheckCircle },
        failure: { variant: "destructive", Icon: Warning },
        warning: { variant: "warning", Icon: ShieldWarning },
    };
    const cfg = map[s] || { variant: "secondary", Icon: CheckCircle };
    const { Icon } = cfg;
    return (
        <Badge variant={cfg.variant} className="gap-1 capitalize">
            <Icon size={11} weight="fill" /> {s}
        </Badge>
    );
};

const AuditLogsList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [action, setAction] = useState("");
    const [entity, setEntity] = useState("");
    const [severity, setSeverity] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const { data, isLoading } = useQuery({
        queryKey: ["audit-logs", { search, action, entity, severity, status, page, limit }],
        queryFn: () => auditAPI.getAll({ search, action, entity, severity, status, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["audit-logs", "stats"],
        queryFn: () => auditAPI.getStats().then((r) => r.data),
    });

    const statData = stats.data?.stats || {};
    const byStatus = (statData.byStatus || []).reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {});
    const bySeverity = (statData.bySeverity || []).reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {});

    const columns = [
        {
            key: "action",
            label: "Action",
            render: (l) => (
                <div className="flex items-center gap-2 min-w-0">
                    <div className="size-8 rounded-md bg-primary/10 grid place-items-center shrink-0">
                        <PulseIcon size={14} weight="duotone" className="text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold truncate max-w-48">{l.action}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-48">{l.entity} {l.entityName ? `· ${l.entityName}` : ""}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "description",
            label: "Description",
            render: (l) => (
                <p className="text-xs text-muted-foreground truncate max-w-72">
                    {l.description}
                </p>
            ),
        },
        { key: "severity", label: "Severity", render: (l) => severityBadge(l.severity) },
        { key: "status", label: "Status", render: (l) => statusBadge(l.status) },
        {
            key: "performedBy",
            label: "By",
            render: (l) => l.performedBy?.adminName
                ? (
                    <div className="flex items-center gap-1.5">
                        <User size={12} weight="duotone" className="text-muted-foreground" />
                        <span className="text-xs truncate max-w-36">{l.performedBy.adminName}</span>
                    </div>
                ) : <span className="text-xs text-muted-foreground">System</span>,
        },
        {
            key: "createdAt",
            label: "Time",
            render: (l) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock size={12} weight="duotone" />
                    {formatDateTime(l.createdAt)}
                </div>
            ),
        },
        {
            key: "actions",
            label: "",
            className: "w-10 text-right",
            render: (l) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => { e.stopPropagation(); navigate(`/audit-logs/${l._id}`); }}
                >
                    <Eye size={14} />
                </Button>
            ),
        },
    ];

    const reset = () => { setSearch(""); setAction(""); setEntity(""); setSeverity(""); setStatus(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Audit Logs"
                description="Immutable record of every admin action across the platform"
                actions={
                    <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["audit-logs"] })}>
                        <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                    </Button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Logs" value={statData.total ?? 0} icon={ClipboardText} loading={stats.isLoading} />
                <StatsCard title="Successful" value={byStatus.success ?? 0} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="Failures" value={byStatus.failure ?? 0} icon={Warning} iconColor="text-red-600" iconBg="bg-red-500/10" loading={stats.isLoading} />
                <StatsCard title="High / Critical" value={(bySeverity.high ?? 0) + (bySeverity.critical ?? 0)} icon={ShieldWarning} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by description, admin, or entity..."
                filters={[
                    {
                        key: "action",
                        value: action,
                        placeholder: "Action",
                        onChange: (v) => { setAction(v); setPage(1); },
                        options: ACTIONS.map((a) => ({ value: a, label: a })),
                    },
                    {
                        key: "entity",
                        value: entity,
                        placeholder: "Entity",
                        onChange: (v) => { setEntity(v); setPage(1); },
                        options: ENTITIES.map((e) => ({ value: e, label: e })),
                    },
                    {
                        key: "severity",
                        value: severity,
                        placeholder: "Severity",
                        onChange: (v) => { setSeverity(v); setPage(1); },
                        options: SEVERITIES.map((s) => ({ value: s, label: humanize(s) })),
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
                data={data?.logs}
                loading={isLoading}
                onRowClick={(l) => navigate(`/audit-logs/${l._id}`)}
                emptyTitle="No audit logs"
                emptyMessage="Actions taken by admins will appear here."
            />

            {data?.pagination && (
                <Pagination
                    pagination={data.pagination}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                />
            )}
        </div>
    );
};

export default AuditLogsList;
