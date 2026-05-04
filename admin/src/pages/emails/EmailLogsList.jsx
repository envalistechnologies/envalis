import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Envelope, EnvelopeSimple, EnvelopeOpen, Warning, CheckCircle,
    PaperPlaneTilt, Clock, ArrowsClockwise, Eye,
} from "@phosphor-icons/react";

import { emailsAPI } from "@/api/emailsApi";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import SearchFilter from "@/components/common/SearchFilter";
import Pagination from "@/components/common/Pagination";
import StatsCard from "@/components/common/StatesCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, humanize, truncate } from "@/lib/utils";

const STATUSES = ["sent", "delivered", "queued", "failed", "bounced"];
const CATEGORIES = ["welcome", "announcement", "newsletter", "hr_notice", "policy", "event", "recognition", "reminder", "other"];

const statusBadge = (status) => {
    const map = {
        sent: { label: "Sent", variant: "info", Icon: PaperPlaneTilt },
        delivered: { label: "Delivered", variant: "success", Icon: CheckCircle },
        queued: { label: "Queued", variant: "warning", Icon: Clock },
        failed: { label: "Failed", variant: "destructive", Icon: Warning },
        bounced: { label: "Bounced", variant: "destructive", Icon: Warning },
    };
    const cfg = map[status] || { label: status, variant: "secondary", Icon: EnvelopeSimple };
    const { Icon } = cfg;
    return (
        <Badge variant={cfg.variant} className="gap-1">
            <Icon size={11} weight="fill" /> {cfg.label}
        </Badge>
    );
};

const EmailLogsList = () => {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data, isLoading } = useQuery({
        queryKey: ["email-logs", { search, status, category, page, limit }],
        queryFn: () => emailsAPI.getLogs({ search, status, category, page, limit }).then((r) => r.data),
    });

    const stats = useQuery({
        queryKey: ["email-logs", "stats"],
        queryFn: () => emailsAPI.getStats().then((r) => r.data),
    });

    const statTotals = (() => {
        const s = stats.data?.stats || {};
        const byStatus = (s.byStatus || []).reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {});
        return {
            total: s.total ?? 0,
            sent: (byStatus.sent || 0) + (byStatus.delivered || 0),
            failed: (byStatus.failed || 0) + (byStatus.bounced || 0),
            queued: byStatus.queued || 0,
        };
    })();

    const columns = [
        {
            key: "subject",
            label: "Subject",
            render: (l) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-md bg-primary/10 grid place-items-center shrink-0">
                        <Envelope size={16} weight="duotone" className="text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-80">{l.subject}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-80">
                            {Array.isArray(l.to) ? l.to.slice(0, 2).join(", ") : l.to}
                            {Array.isArray(l.to) && l.to.length > 2 ? ` +${l.to.length - 2} more` : ""}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (l) => <Badge variant="outline" className="capitalize">{humanize(l.category)}</Badge>,
        },
        {
            key: "type",
            label: "Type",
            render: (l) => (
                <Badge variant="secondary" className="capitalize">
                    {l.type === "bulk" ? `Bulk · ${l.recipientCount}` : humanize(l.type)}
                </Badge>
            ),
        },
        { key: "status", label: "Status", render: (l) => statusBadge(l.status) },
        {
            key: "sentBy",
            label: "Sent by",
            render: (l) => l.sentByName || (l.sentBy ? `${l.sentBy.firstName || ""} ${l.sentBy.lastName || ""}`.trim() : "—"),
        },
        { key: "sentAt", label: "Sent", render: (l) => formatDateTime(l.sentAt || l.createdAt) },
        {
            key: "actions",
            label: "",
            className: "w-12 text-right",
            render: (l) => (
                <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); navigate(`/emails/logs/${l._id}`); }}>
                    <Eye size={15} />
                </Button>
            ),
        },
    ];

    const reset = () => { setSearch(""); setStatus(""); setCategory(""); setPage(1); };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Email Logs"
                description="Track every email sent from the platform"
                actions={
                    <>
                        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["email-logs"] })}>
                            <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                        </Button>
                        <Button onClick={() => navigate("/emails/send")}>
                            <PaperPlaneTilt size={15} className="mr-1.5" /> Send Email
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Emails" value={statTotals.total} icon={Envelope} loading={stats.isLoading} />
                <StatsCard title="Delivered" value={statTotals.sent} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={stats.isLoading} />
                <StatsCard title="Queued" value={statTotals.queued} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={stats.isLoading} />
                <StatsCard title="Failed" value={statTotals.failed} icon={Warning} iconColor="text-red-600" iconBg="bg-red-500/10" loading={stats.isLoading} />
            </div>

            <SearchFilter
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by subject, recipient, or sender..."
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
                data={data?.logs}
                loading={isLoading}
                onRowClick={(l) => navigate(`/emails/logs/${l._id}`)}
                emptyTitle="No emails sent yet"
                emptyMessage="Sent emails will appear here for auditing and review."
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

export default EmailLogsList;
