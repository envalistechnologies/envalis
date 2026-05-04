import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Calendar, User, Phone, EnvelopeSimple, CurrencyInr, Users,
    FlagBanner, ListChecks, Clock, FolderOpen, FilePdf, Buildings,
} from "@phosphor-icons/react";

import { projectsAPI } from "@/api/projectsApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInitials, formatDate, humanize, formatCurrency } from "@/lib/utils";

const Stat = ({ icon: Icon, label, value, color = "text-primary" }) => (
    <div className="flex items-center gap-3 py-2.5">
        <div className={`size-9 rounded-lg bg-muted/60 grid place-items-center ${color}`}>
            <Icon size={16} weight="duotone" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">{value ?? "N/A"}</p>
        </div>
    </div>
);

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["project", id],
        queryFn: () => projectsAPI.getById(id).then((r) => r.data?.project || r.data),
    });

    const remove = useMutation({
        mutationFn: () => projectsAPI.delete(id),
        onSuccess: () => {
            toast.success("Project deleted");
            qc.invalidateQueries({ queryKey: ["projects"] });
            navigate("/projects");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    const p = data;
    if (!p) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={p.name}
                description={p.client}
                showBack
                backPath="/projects"
                actions={
                    <>
                        <Button asChild>
                            <Link to={`/projects/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FolderOpen size={18} weight="duotone" className="text-primary" /> {p.name}
                                </CardTitle>
                                <Badge variant="outline" className="font-mono">{p.projectId}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="capitalize">{humanize(p.category)}</Badge>
                                <StatusBadge status={p.status} />
                                <StatusBadge status={p.priority} />
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{p.description}</p>
                            <Separator />
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="font-medium">Progress</span>
                                    <span className="text-muted-foreground">{p.progress || 0}%</span>
                                </div>
                                <Progress value={p.progress || 0} />
                            </div>
                        </CardContent>
                    </Card>

                    {!!p.milestones?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FlagBanner size={18} weight="duotone" className="text-primary" /> Milestones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {p.milestones.map((m, i) => (
                                    <div key={i} className="rounded-lg border p-4 bg-muted/20 space-y-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold">{m.title}</p>
                                                {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                                            </div>
                                            <StatusBadge status={m.status} />
                                        </div>
                                        {m.dueDate && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                                <Calendar size={11} /> Due {formatDate(m.dueDate)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {!!p.tasks?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ListChecks size={18} weight="duotone" className="text-primary" /> Tasks
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {p.tasks.map((t, i) => (
                                    <div key={i} className="py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{t.title}</p>
                                            {t.dueDate && <p className="text-xs text-muted-foreground">Due {formatDate(t.dueDate)}</p>}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <StatusBadge status={t.priority} />
                                            <Badge variant="outline" className="capitalize">{humanize(t.status || "todo")}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {!!p.documents?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FilePdf size={18} weight="duotone" className="text-primary" /> Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {p.documents.map((d, i) => (
                                    <a key={i} href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2.5 hover:bg-muted/40 rounded-md px-2 -mx-2 transition">
                                        <FilePdf size={18} weight="duotone" className="text-rose-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{d.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(d.uploadedAt)}</p>
                                        </div>
                                    </a>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <Stat icon={Calendar} label="Start" value={formatDate(p.startDate)} color="text-blue-500" />
                            <Stat icon={Calendar} label="Estimated End" value={formatDate(p.estimatedEndDate)} color="text-amber-500" />
                            <Stat icon={Calendar} label="Actual End" value={formatDate(p.actualEndDate)} color="text-emerald-500" />
                        </CardContent>
                    </Card>

                    {p.budget && (p.budget.estimated || p.budget.actual) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CurrencyInr size={16} weight="duotone" /> Budget
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                <Stat icon={CurrencyInr} label="Estimated" value={formatCurrency(p.budget.estimated, p.budget.currency)} color="text-blue-500" />
                                <Stat icon={CurrencyInr} label="Actual" value={formatCurrency(p.budget.actual, p.budget.currency)} color="text-emerald-500" />
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Buildings size={16} weight="duotone" /> Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm font-semibold">{p.client}</p>
                            {p.clientContact?.name && <p className="text-sm text-muted-foreground flex items-center gap-2"><User size={13} /> {p.clientContact.name}</p>}
                            {p.clientContact?.email && <p className="text-xs flex items-center gap-2"><EnvelopeSimple size={13} /> {p.clientContact.email}</p>}
                            {p.clientContact?.phone && <p className="text-xs flex items-center gap-2"><Phone size={13} /> {p.clientContact.phone}</p>}
                        </CardContent>
                    </Card>

                    {!!p.teamMembers?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users size={16} weight="duotone" /> Team ({p.teamMembers.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {p.teamMembers.map((tm, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Avatar className="size-8">
                                            <AvatarImage src={tm.employee?.avatar?.url} />
                                            <AvatarFallback className="text-[10px]">{getInitials(`${tm.employee?.firstName || ""} ${tm.employee?.lastName || ""}`)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {tm.employee ? `${tm.employee.firstName || ""} ${tm.employee.lastName || ""}`.trim() : "Unknown"}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{tm.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {!!p.technologies?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tech Stack</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.technologies.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!p.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            All milestones, tasks, and documents will be archived.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate()} disabled={remove.isPending}>
                            {remove.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProjectDetail;
