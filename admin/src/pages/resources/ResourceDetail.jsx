import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Eye, DownloadSimple, Clock, Calendar, Tag, Star, Lock,
    FileText, BookOpen, Link as LinkIcon, Folder, CheckCircle,
} from "@phosphor-icons/react";

import { resourcesAPI } from "@/api/resourcesApi";
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
import { formatDate, formatDateTime, humanize, formatNumber, getApiErrorMessage } from "@/lib/utils";

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

const ResourceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["resource", id],
        queryFn: () => resourcesAPI.getById(id).then((r) => r.data?.resource || r.data),
    });

    const remove = useMutation({
        mutationFn: () => resourcesAPI.delete(id),
        onSuccess: () => {
            toast.success("Resource deleted");
            qc.invalidateQueries({ queryKey: ["resources"] });
            navigate("/resources");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to delete the resource. Please try again.")),
    });

    if (isLoading) return <PageLoader />;
    const resource = data;
    if (!resource) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={resource.title}
                description={resource.description}
                showBack
                backPath="/resources"
                actions={
                    <>
                        <Button asChild>
                            <Link to={`/resources/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            {resource.coverImage?.url && (
                <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-21/9">
                    <img src={resource.coverImage.url} alt={resource.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">{humanize(resource.type)}</Badge>
                            <Badge variant="secondary" className="capitalize">{humanize(resource.category)}</Badge>
                            <StatusBadge status={resource.status} />
                            {resource.isFeatured && <Badge className="bg-amber-500 text-white border-amber-400 gap-1"><Star size={11} weight="fill" /> Featured</Badge>}
                            {!resource.isFree && <Badge className="bg-purple-500 text-white border-purple-400 gap-1"><Lock size={11} weight="fill" /> Premium</Badge>}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight max-w-3xl drop-shadow">{resource.title}</h2>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {resource.content && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText size={18} weight="duotone" className="text-primary" /> Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-img:rounded-md"
                                    dangerouslySetInnerHTML={{ __html: resource.content }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {resource.file && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Folder size={18} weight="duotone" className="text-primary" /> Download
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border p-4 bg-muted/30 flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm">{resource.file.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {humanize(resource.file.format)} • {formatNumber(resource.file.size || 0)} bytes
                                        </p>
                                    </div>
                                    {resource.file.url && (
                                        <a href={resource.file.url} target="_blank" rel="noreferrer" className="ml-4 shrink-0">
                                            <Button variant="outline" size="sm">
                                                <DownloadSimple size={14} className="mr-1.5" /> Download
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {resource.externalUrl && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <LinkIcon size={18} weight="duotone" className="text-primary" /> External Link
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a href={resource.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                                    <LinkIcon size={14} /> {resource.externalUrl}
                                </a>
                            </CardContent>
                        </Card>
                    )}

                    {resource.seo && (resource.seo.metaTitle || resource.seo.metaDescription || resource.seo.keywords?.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">SEO Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {resource.seo.metaTitle && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Meta Title</p>
                                        <p className="text-sm font-medium">{resource.seo.metaTitle}</p>
                                    </div>
                                )}
                                {resource.seo.metaDescription && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Meta Description</p>
                                        <p className="text-sm">{resource.seo.metaDescription}</p>
                                    </div>
                                )}
                                {resource.seo.keywords?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Keywords</p>
                                        <div className="flex flex-wrap gap-2">
                                            {resource.seo.keywords.map((k, i) => (
                                                <Badge key={i} variant="secondary">{k}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!!resource.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Tag size={18} weight="duotone" className="text-primary" /> Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {resource.tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Stat icon={CheckCircle} label="Status" value={humanize(resource.status)} color="text-primary" />
                            <Stat icon={Calendar} label="Published" value={resource.publishedAt ? formatDate(resource.publishedAt) : "Not published"} />
                            <Stat icon={Calendar} label="Created" value={formatDate(resource.createdAt)} />
                            <Stat icon={Clock} label="Updated" value={formatDateTime(resource.updatedAt)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Engagement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Stat icon={Eye} label="Views" value={formatNumber(resource.views || 0)} color="text-blue-600" />
                            <Stat icon={DownloadSimple} label="Downloads" value={formatNumber(resource.downloads || 0)} color="text-emerald-600" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Stat icon={Folder} label="Type" value={humanize(resource.type)} />
                            <Stat icon={Folder} label="Category" value={humanize(resource.category)} />
                            <Stat icon={Star} label="Featured" value={resource.isFeatured ? "Yes" : "No"} color={resource.isFeatured ? "text-amber-500" : "text-muted-foreground"} />
                            <Stat icon={Lock} label="Paid Resource" value={!resource.isFree ? "Yes" : "No"} color={!resource.isFree ? "text-purple-600" : "text-muted-foreground"} />
                            {resource.requiresEmail && <Stat icon={Lock} label="Email Required" value="Yes" color="text-orange-600" />}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this resource? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ResourceDetail;
