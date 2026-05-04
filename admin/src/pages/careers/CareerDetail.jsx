import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Calendar, MapPin, Briefcase, Users, Star, FlagBanner,
    CheckCircle, ListChecks, Sparkle, Gift, Eye, FileMagnifyingGlass,
    BriefcaseMetal,
} from "@phosphor-icons/react";

import { careersAPI } from "@/api/careersApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, humanize, formatNumber, formatCurrency } from "@/lib/utils";

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

const ListSection = ({ icon: Icon, title, items, color }) => {
    if (!items?.length) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Icon size={18} weight="duotone" className={color} /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sm">
                    {items.map((item, i) => (
                        <li key={i} className="flex gap-2">
                            <span className={color}>•</span> {item}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const CareerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["career", id],
        queryFn: () => careersAPI.getById(id).then((r) => r.data?.job || r.data),
    });

    const remove = useMutation({
        mutationFn: () => careersAPI.delete(id),
        onSuccess: () => {
            toast.success("Job deleted");
            qc.invalidateQueries({ queryKey: ["careers"] });
            navigate("/careers");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    const j = data;
    if (!j) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={j.title}
                description={`${humanize(j.department)} • ${j.location}`}
                showBack
                backPath="/careers"
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <Link to={`/careers/${id}/applications`}>
                                <FileMagnifyingGlass size={15} className="mr-1.5" /> Applications ({j.applications?.length || 0})
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link to={`/careers/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
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
                                    <BriefcaseMetal size={18} weight="duotone" className="text-primary" /> {j.title}
                                </CardTitle>
                                <Badge variant="outline" className="font-mono">{j.jobId}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="capitalize">{humanize(j.department)}</Badge>
                                <Badge variant="outline" className="capitalize">{humanize(j.type)}</Badge>
                                <StatusBadge status={j.status === "active" ? "active-job" : j.status} />
                                {j.isRemote && <Badge variant="outline">🌍 Remote</Badge>}
                                {j.isFeatured && <Badge className="bg-amber-500 text-white border-amber-400 gap-1"><Star size={11} weight="fill" /> Featured</Badge>}
                                {j.isUrgent && <Badge className="bg-rose-500 text-white border-rose-400 gap-1"><FlagBanner size={11} weight="fill" /> Urgent</Badge>}
                            </div>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap leading-relaxed">{j.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <ListSection icon={ListChecks} title="Responsibilities" items={j.responsibilities} color="text-blue-500" />
                    <ListSection icon={CheckCircle} title="Requirements" items={j.requirements} color="text-emerald-500" />
                    <ListSection icon={Sparkle} title="Nice to Have" items={j.niceToHave} color="text-purple-500" />
                    <ListSection icon={Gift} title="Benefits" items={j.benefits} color="text-rose-500" />
                    <ListSection icon={Sparkle} title="Perks" items={j.perks} color="text-amber-500" />
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Job Info</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <Stat icon={MapPin} label="Location" value={j.location} color="text-rose-500" />
                            <Stat icon={Briefcase} label="Type" value={humanize(j.type)} color="text-blue-500" />
                            <Stat icon={Users} label="Openings" value={j.openings} color="text-emerald-500" />
                            <Stat icon={Calendar} label="Deadline" value={formatDate(j.applicationDeadline)} color="text-amber-500" />
                            <Stat icon={Eye} label="Views" value={formatNumber(j.views)} color="text-purple-500" />
                            <Stat icon={Users} label="Applications" value={j.applications?.length || 0} color="text-blue-500" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">Years:</span>{" "}
                                <span className="font-medium">{j.experience?.min ?? 0}{j.experience?.max ? ` – ${j.experience.max}` : "+"}</span>
                            </p>
                            {j.experience?.level && (
                                <p>
                                    <span className="text-muted-foreground">Level:</span>{" "}
                                    <Badge variant="secondary" className="capitalize">{humanize(j.experience.level)}</Badge>
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {j.salary?.isVisible && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Salary Range</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-bold text-emerald-600">
                                    {formatCurrency(j.salary.min, j.salary.currency)} – {formatCurrency(j.salary.max, j.salary.currency)}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {!!j.skills?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {j.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!j.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {j.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                        <AlertDialogDescription>
                            All applications will also be archived. This cannot be undone.
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

export default CareerDetail;
