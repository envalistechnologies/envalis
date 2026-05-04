import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Eye, DownloadSimple, Calendar, Star, Globe, Buildings, Users,
    Lightbulb, Target, ChartLineUp, Quotes, ListChecks, CheckCircle, BroadcastIcon,
} from "@phosphor-icons/react";

import { caseStudiesAPI } from "@/api/caseStudiesApi";
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
import { formatDate, humanize, formatNumber } from "@/lib/utils";

const Stat = ({ icon: Icon, label, value, color = "text-primary" }) => (
    <div className="flex items-center gap-3 py-2.5">
        <div className={`size-9 rounded-lg bg-muted/60 grid place-items-center ${color}`}>
            <Icon size={16} weight="duotone" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">{value ?? "—"}</p>
        </div>
    </div>
);

const CaseStudyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["caseStudy", id],
        queryFn: () => caseStudiesAPI.getById(id).then((r) => r.data?.caseStudy || r.data),
    });

    const publish = useMutation({
        mutationFn: () => caseStudiesAPI.publish(id),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["caseStudy", id] });
            qc.invalidateQueries({ queryKey: ["caseStudies"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: () => caseStudiesAPI.delete(id),
        onSuccess: () => {
            toast.success("Case study deleted");
            qc.invalidateQueries({ queryKey: ["caseStudies"] });
            navigate("/case-studies");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    const c = data;
    if (!c) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={c.title}
                description={c.tagline || c.overview}
                showBack
                backPath="/case-studies"
                actions={
                    <>
                        <Button variant="outline" onClick={() => publish.mutate()}>
                            <BroadcastIcon size={15} className="mr-1.5" />
                            {c.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button asChild>
                            <Link to={`/case-studies/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            {(c.bannerImage?.url || c.coverImage?.url) && (
                <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-[21/9]">
                    <img src={c.bannerImage?.url || c.coverImage?.url} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">{humanize(c.category)}</Badge>
                            <StatusBadge status={c.status} />
                            {c.isFeatured && <Badge className="bg-amber-500 text-white border-amber-400 gap-1"><Star size={11} weight="fill" /> Featured</Badge>}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight max-w-3xl drop-shadow">{c.title}</h2>
                        {c.tagline && <p className="text-lg opacity-90 max-w-3xl">{c.tagline}</p>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.overview}</p>
                            {c.background && (
                                <>
                                    <Separator className="my-4" />
                                    <h4 className="font-semibold text-sm mb-2">Background</h4>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{c.background}</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {(c.challenge?.description || !!c.challenge?.points?.length) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Lightbulb size={18} weight="duotone" className="text-amber-500" /> The Challenge
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {c.challenge.description && <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.challenge.description}</p>}
                                {!!c.challenge.points?.length && (
                                    <ul className="space-y-1.5 text-sm">
                                        {c.challenge.points.map((pt, i) => (
                                            <li key={i} className="flex gap-2"><span className="text-amber-500">•</span> {pt}</li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {(c.solution?.description || c.solution?.approach) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target size={18} weight="duotone" className="text-emerald-500" /> The Solution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {c.solution.description && <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.solution.description}</p>}
                                {c.solution.approach && (
                                    <>
                                        <h4 className="font-semibold text-sm">Approach</h4>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{c.solution.approach}</p>
                                    </>
                                )}
                                {!!c.solution.points?.length && (
                                    <ul className="space-y-1.5 text-sm">
                                        {c.solution.points.map((pt, i) => (
                                            <li key={i} className="flex gap-2"><span className="text-emerald-500">✓</span> {pt}</li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!!c.implementation?.phases?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ListChecks size={18} weight="duotone" className="text-primary" /> Implementation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {c.implementation.phases.map((ph, i) => (
                                    <div key={i} className="rounded-lg border p-4 bg-muted/20">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                                <p className="text-sm font-semibold">{i + 1}. {ph.name}</p>
                                                {ph.duration && <p className="text-xs text-muted-foreground">{ph.duration}</p>}
                                            </div>
                                        </div>
                                        {ph.description && <p className="text-sm text-muted-foreground">{ph.description}</p>}
                                        {!!ph.deliverables?.length && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {ph.deliverables.map((d, j) => <Badge key={j} variant="outline" className="text-xs">{d}</Badge>)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {(c.results?.summary || !!c.results?.metrics?.length) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ChartLineUp size={18} weight="duotone" className="text-primary" /> Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {c.results.summary && <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.results.summary}</p>}
                                {!!c.results.metrics?.length && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {c.results.metrics.map((m, i) => (
                                            <div key={i} className="rounded-lg border p-4 bg-muted/30">
                                                <p className="text-2xl font-bold text-primary">{m.value}{m.unit}</p>
                                                <p className="text-sm font-medium mt-1">{m.label}</p>
                                                {m.improvement && <p className="text-xs text-muted-foreground mt-1">{m.improvement}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {c.testimonial?.quote && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Quotes size={18} weight="duotone" className="text-primary" /> Client Testimonial
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <blockquote className="border-l-4 border-primary pl-4 italic text-sm leading-relaxed">
                                    "{c.testimonial.quote}"
                                </blockquote>
                                <p className="text-sm font-medium mt-3">— {c.testimonial.author}</p>
                                <p className="text-xs text-muted-foreground">{c.testimonial.designation}{c.testimonial.company && ` • ${c.testimonial.company}`}</p>
                            </CardContent>
                        </Card>
                    )}

                    {!!c.gallery?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Gallery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {c.gallery.map((g, i) => (
                                        <a key={i} href={g.url} target="_blank" rel="noreferrer" className="group relative aspect-square rounded-lg overflow-hidden bg-muted ring-1 ring-border">
                                            <img src={g.url} alt={g.alt || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Project Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <Stat icon={Eye} label="Views" value={formatNumber(c.views)} color="text-blue-500" />
                            <Stat icon={DownloadSimple} label="Downloads" value={formatNumber(c.downloads)} color="text-emerald-500" />
                            <Stat icon={Calendar} label="Completed" value={formatDate(c.completionDate)} color="text-amber-500" />
                            <Stat icon={Users} label="Team Size" value={c.teamSize} color="text-purple-500" />
                        </CardContent>
                    </Card>

                    {c.client?.name && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Buildings size={16} weight="duotone" /> Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm font-semibold">{c.client.name}</p>
                                {c.client.industry && <p className="text-xs text-muted-foreground">{c.client.industry}</p>}
                                {c.client.size && <Badge variant="secondary">{c.client.size}</Badge>}
                                {c.client.location && <p className="text-xs text-muted-foreground">📍 {c.client.location}</p>}
                                {c.client.website && (
                                    <a href={c.client.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        <Globe size={12} /> {c.client.website}
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!!c.technologies?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Technologies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.technologies.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!c.services?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.services.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!c.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this case study?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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

export default CaseStudyDetail;
