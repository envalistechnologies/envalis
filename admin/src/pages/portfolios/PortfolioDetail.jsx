import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Eye, Calendar, Tag, Star, Globe, GithubLogo, Users, Clock,
    Briefcase, Lightbulb, Target, ChartLineUp, Quotes,
} from "@phosphor-icons/react";

import { portfoliosAPI } from "@/api/portfoliosApi";
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
            <p className="text-sm font-semibold">{value ?? "N/A"}</p>
        </div>
    </div>
);

const PortfolioDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["portfolio", id],
        queryFn: () => portfoliosAPI.getById(id).then((r) => r.data?.portfolio || r.data),
    });

    const remove = useMutation({
        mutationFn: () => portfoliosAPI.delete(id),
        onSuccess: () => {
            toast.success("Portfolio deleted");
            qc.invalidateQueries({ queryKey: ["portfolios"] });
            navigate("/portfolios");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    const p = data;
    if (!p) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={p.title}
                description={p.shortDescription}
                showBack
                backPath="/portfolios"
                actions={
                    <>
                        <Button asChild>
                            <Link to={`/portfolios/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            {p.coverImage?.url && (
                <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-21/9">
                    <img src={p.coverImage.url} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">{humanize(p.category)}</Badge>
                            <StatusBadge status={p.status} />
                            {p.isFeatured && <Badge className="bg-amber-500 text-white border-amber-400 gap-1"><Star size={11} weight="fill" /> Featured</Badge>}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight max-w-3xl drop-shadow">{p.title}</h2>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Briefcase size={18} weight="duotone" className="text-primary" /> About
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{p.description}</p>
                        </CardContent>
                    </Card>

                    {p.challenge && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Lightbulb size={18} weight="duotone" className="text-amber-500" /> Challenge
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{p.challenge}</p>
                            </CardContent>
                        </Card>
                    )}

                    {p.solution && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target size={18} weight="duotone" className="text-emerald-500" /> Solution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{p.solution}</p>
                            </CardContent>
                        </Card>
                    )}

                    {!!p.results?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ChartLineUp size={18} weight="duotone" className="text-primary" /> Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {p.results.map((r, i) => (
                                        <div key={i} className="rounded-lg border p-4 bg-muted/30">
                                            <p className="text-2xl font-bold text-primary">{r.value}</p>
                                            <p className="text-sm font-medium mt-1">{r.metric}</p>
                                            {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {p.testimonial?.quote && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Quotes size={18} weight="duotone" className="text-primary" /> Testimonial
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <blockquote className="border-l-4 border-primary pl-4 italic text-sm leading-relaxed">
                                    "{p.testimonial.quote}"
                                </blockquote>
                                <p className="text-sm font-medium mt-3">— {p.testimonial.author}</p>
                                <p className="text-xs text-muted-foreground">{p.testimonial.designation}</p>
                            </CardContent>
                        </Card>
                    )}

                    {!!p.gallery?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Gallery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {p.gallery.map((g, i) => (
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
                            <CardTitle className="text-base">Project Info</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <Stat icon={Eye} label="Views" value={formatNumber(p.views)} color="text-blue-500" />
                            <Stat icon={Calendar} label="Completed" value={formatDate(p.completionDate)} color="text-emerald-500" />
                            <Stat icon={Clock} label="Duration" value={p.duration} color="text-amber-500" />
                            <Stat icon={Users} label="Team Size" value={p.teamSize} color="text-purple-500" />
                        </CardContent>
                    </Card>

                    {p.client?.name && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Client</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm font-semibold">{p.client.name}</p>
                                {p.client.industry && <Badge variant="secondary" className="capitalize">{p.client.industry}</Badge>}
                                {p.client.website && (
                                    <a href={p.client.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        <Globe size={12} /> {p.client.website}
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {(p.projectUrl || p.githubUrl) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {p.projectUrl && (
                                    <a href={p.projectUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                        <Globe size={14} /> Live Project
                                    </a>
                                )}
                                {p.githubUrl && (
                                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                        <GithubLogo size={14} /> Source Code
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!!p.technologies?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Technologies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.technologies.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!p.services?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.services.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!p.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Tag size={16} weight="duotone" /> Tags
                                </CardTitle>
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
                        <AlertDialogTitle>Delete this portfolio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the project from your portfolio.
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

export default PortfolioDetail;
