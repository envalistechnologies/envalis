import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft, CheckCircle, Warning, ShieldWarning, Clock,
    User, Globe, DeviceMobile, Tag, PulseIcon, Buildings,
} from "@phosphor-icons/react";

import { auditAPI } from "@/api/auditApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime, humanize } from "@/lib/utils";

const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <Icon size={15} weight="duotone" className="text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium wrap-break-word">{value != null && value !== "" ? String(value) : "—"}</p>
        </div>
    </div>
);

const severityBadge = (s) => {
    const map = { low: "secondary", medium: "warning", high: "destructive", critical: "destructive" };
    return <Badge variant={map[s] || "secondary"} className="capitalize">{s || "—"}</Badge>;
};

const statusBadge = (s) => {
    const cfg = {
        success: { variant: "success", Icon: CheckCircle },
        failure: { variant: "destructive", Icon: Warning },
        warning: { variant: "warning", Icon: ShieldWarning },
    }[s] || { variant: "secondary", Icon: CheckCircle };
    const { Icon } = cfg;
    return (
        <Badge variant={cfg.variant} className="gap-1 capitalize">
            <Icon size={11} weight="fill" /> {s || "—"}
        </Badge>
    );
};

const JsonBlock = ({ data }) => {
    if (!data) return <p className="text-xs text-muted-foreground italic">No data</p>;
    return (
        <ScrollArea className="h-40 rounded-md border bg-muted/30">
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap wrap-break-word">
                {JSON.stringify(data, null, 2)}
            </pre>
        </ScrollArea>
    );
};

const AuditLogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["audit-log", id],
        queryFn: () => auditAPI.getById(id).then((r) => r.data?.log || r.data),
    });

    if (isLoading) return <PageLoader />;
    const log = data;
    if (!log) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={log.action}
                description={log.description}
                showBack
                backPath="/audit-logs"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left sidebar — core info */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-base">Event</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {statusBadge(log.status)}
                            {severityBadge(log.severity)}
                        </div>
                        <Separator />
                        <Row icon={PulseIcon} label="Action" value={log.action} />
                        <Row icon={Tag} label="Entity" value={log.entity} />
                        <Row icon={Buildings} label="Entity name" value={log.entityName} />
                        <Row icon={Clock} label="Timestamp" value={formatDateTime(log.createdAt)} />
                        {log.errorMessage && (
                            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
                                <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                                    <Warning size={12} weight="fill" /> Error message
                                </p>
                                <p className="text-xs text-destructive/90 mt-1 wrap-break-word">{log.errorMessage}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Performed by */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Performed By</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                            <Row icon={User} label="Name" value={log.performedBy?.adminName} />
                            <Row icon={User} label="Email" value={log.performedBy?.adminEmail} />
                            <Row icon={Tag} label="Role" value={humanize(log.performedBy?.adminRole || "")} />
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    {log.metadata && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Request Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                                <Row icon={Globe} label="IP address" value={log.metadata.ip} />
                                <Row icon={Globe} label="Location" value={log.metadata.location} />
                                <Row icon={DeviceMobile} label="Device" value={log.metadata.device} />
                                <Row icon={DeviceMobile} label="Browser" value={log.metadata.browser} />
                                <Row icon={DeviceMobile} label="OS" value={log.metadata.os} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Changes */}
                    {(log.changes?.before || log.changes?.after) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Changes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-red-400 inline-block" /> Before
                                        </p>
                                        <JsonBlock data={log.changes.before} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-emerald-400 inline-block" /> After
                                        </p>
                                        <JsonBlock data={log.changes.after} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogDetail;
