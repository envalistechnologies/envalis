import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Pencil, Power, ShieldCheck, ShieldStar, Phone, Envelope, Buildings,
    Calendar, Globe, DeviceMobile, Clock, Check, X as XIcon,
} from "@phosphor-icons/react";

import { adminsAPI } from "@/api/adminsApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatDate, formatDateTime, humanize } from "@/lib/utils";

const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5">
        <Icon size={16} weight="duotone" className="text-muted-foreground mt-0.5" />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium truncate">{value || "N/A"}</p>
        </div>
    </div>
);

const PERMS = [
    { key: "blogs", label: "Blogs" },
    { key: "articles", label: "Articles" },
    { key: "portfolios", label: "Portfolios" },
    { key: "caseStudies", label: "Case Studies" },
    { key: "testimonials", label: "Testimonials" },
    { key: "employees", label: "Employees" },
    { key: "projects", label: "Projects" },
    { key: "careers", label: "Careers" },
    { key: "services", label: "Services" },
    { key: "resources", label: "Resources" },
    { key: "emails", label: "Emails" },
    { key: "contacts", label: "Contacts" },
    { key: "auditLogs", label: "Audit Logs" },
];

const AdminDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["admin", id],
        queryFn: () => adminsAPI.getById(id).then((r) => r.data?.admin || r.data),
    });

    if (isLoading) return <PageLoader />;
    const admin = data;
    if (!admin) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${admin.firstName} ${admin.lastName}`}
                description={admin.email}
                showBack
                backPath="/admins"
                actions={
                    <Button asChild>
                        <Link to={`/admins/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardContent className="p-6 text-center space-y-4">
                        <Avatar className="size-24 mx-auto ring-4 ring-primary/10">
                            <AvatarImage src={admin.avatar?.url} />
                            <AvatarFallback className="text-2xl">{getInitials(`${admin.firstName} ${admin.lastName}`)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center justify-center gap-1.5">
                                <h3 className="text-lg font-bold">{admin.firstName} {admin.lastName}</h3>
                                {admin.isSuperAdmin && <ShieldStar size={16} weight="fill" className="text-amber-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                        <div className="flex justify-center gap-2 flex-wrap">
                            <Badge variant={admin.role === "super_admin" ? "default" : "secondary"} className="capitalize">
                                {humanize(admin.role)}
                            </Badge>
                            <StatusBadge status={admin.isActive ? "active" : "archived"} />
                            {admin.twoFactorEnabled && (
                                <Badge variant="success" className="gap-1"><ShieldCheck size={11} weight="fill" /> 2FA</Badge>
                            )}
                        </div>
                        <Separator />
                        <div className="text-left">
                            <Row icon={Envelope} label="Email" value={admin.email} />
                            <Row icon={Phone} label="Phone" value={admin.phone} />
                            <Row icon={Buildings} label="Department" value={admin.department} />
                            <Row icon={Calendar} label="Joined" value={formatDate(admin.createdAt)} />
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    <Tabs defaultValue="permissions">
                        <TabsList>
                            <TabsTrigger value="permissions">Permissions</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="sessions">Sessions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="permissions" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Resource Access</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40">
                                                <tr>
                                                    <th className="text-left font-medium p-3">Resource</th>
                                                    <th className="font-medium p-3">Create</th>
                                                    <th className="font-medium p-3">Read</th>
                                                    <th className="font-medium p-3">Update</th>
                                                    <th className="font-medium p-3">Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {PERMS.map((p) => {
                                                    const perms = admin.permissions?.[p.key] || {};
                                                    return (
                                                        <tr key={p.key}>
                                                            <td className="p-3 font-medium">{p.label}</td>
                                                            {["create", "read", "update", "delete"].map((a) => (
                                                                <td key={a} className="p-3 text-center">
                                                                    {p.key === "emails" && a !== "send" ? (
                                                                        <span className="text-muted-foreground/30">—</span>
                                                                    ) : perms[a] || (p.key === "emails" && perms.send) ? (
                                                                        <Check size={14} className="text-emerald-500 inline" weight="bold" />
                                                                    ) : (
                                                                        <XIcon size={14} className="text-muted-foreground/40 inline" />
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="mt-4 space-y-4">
                            <Card>
                                <CardHeader><CardTitle className="text-base">Account Security</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <Row icon={ShieldCheck} label="Two-Factor Authentication" value={admin.twoFactorEnabled ? "Enabled" : "Disabled"} />
                                    <Row icon={Clock} label="Last password change" value={formatDateTime(admin.passwordChangedAt)} />
                                    <Row icon={Power} label="Failed login attempts" value={admin.loginAttempts ?? 0} />
                                    <Row icon={Calendar} label="Account locked until" value={admin.lockUntil ? formatDateTime(admin.lockUntil) : "Not locked"} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-base">Last Activity</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <Row icon={Clock} label="Last login" value={formatDateTime(admin.lastLogin)} />
                                    <Row icon={Globe} label="Last IP" value={admin.lastLoginIP} />
                                    <Row icon={DeviceMobile} label="Last device" value={admin.lastLoginDevice} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sessions" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Active Sessions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!admin.activeSessions?.length ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">No active sessions</p>
                                    ) : (
                                        <div className="divide-y">
                                            {admin.activeSessions.map((s, i) => (
                                                <div key={i} className="py-3 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <DeviceMobile size={20} weight="duotone" className="text-primary shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate">{s.device || "Unknown device"}</p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {s.ip} · expires {formatDateTime(s.expiresAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">{formatDate(s.createdAt)}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AdminDetail;
