import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Eye, DownloadSimple, Clock, Calendar, Tag, Star, Lock,
    Broadcast, Article as ArticleIcon, Link as LinkIcon, BookOpen,
} from "@phosphor-icons/react";

import { articlesAPI } from "@/api/articlesApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInitials, formatDate, formatDateTime, humanize, formatNumber } from "@/lib/utils";

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

const ArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["article", id],
        queryFn: () => articlesAPI.getById(id).then((r) => r.data?.article || r.data),
    });

    const publishMut = useMutation({
        mutationFn: () => articlesAPI.publish(id),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["article", id] });
            qc.invalidateQueries({ queryKey: ["articles"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: () => articlesAPI.delete(id),
        onSuccess: () => {
            toast.success("Article deleted");
            qc.invalidateQueries({ queryKey: ["articles"] });
            navigate("/articles");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    const article = data;
    if (!article) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={article.title}
                description={article.subtitle || article.excerpt}
                showBack
                backPath="/articles"
                actions={
                    <>
                        <Button variant="outline" onClick={() => publishMut.mutate()}>
                            <Broadcast size={15} className="mr-1.5" />
                            {article.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button asChild>
                            <Link to={`/articles/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            {article.coverImage?.url && (
                <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-21/9">
                    <img src={article.coverImage.url} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">{humanize(article.category)}</Badge>
                            <StatusBadge status={article.status} />
                            {article.isFeatured && <Badge className="bg-amber-500 text-white border-amber-400 gap-1"><Star size={11} weight="fill" /> Featured</Badge>}
                            {article.isPremium && <Badge className="bg-purple-500 text-white border-purple-400 gap-1"><Lock size={11} weight="fill" /> Premium</Badge>}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight max-w-3xl drop-shadow">{article.title}</h2>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ArticleIcon size={18} weight="duotone" className="text-primary" /> Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-img:rounded-md"
                                dangerouslySetInnerHTML={{ __html: article.content || "<p class='text-muted-foreground'>No content yet.</p>" }}
                            />
                        </CardContent>
                    </Card>

                    {!!article.references?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen size={18} weight="duotone" className="text-primary" /> References
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {article.references.map((ref, i) => (
                                    <div key={i} className="rounded-md border p-3 bg-muted/20">
                                        <p className="text-sm font-medium">{ref.title}</p>
                                        {ref.author && <p className="text-xs text-muted-foreground">by {ref.author}</p>}
                                        {ref.url && (
                                            <a href={ref.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                                                <LinkIcon size={11} /> {ref.url}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {!!article.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Tag size={16} weight="duotone" className="text-primary" /> Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Author</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar className="size-12">
                                    <AvatarImage src={article.author?.avatar?.url} />
                                    <AvatarFallback>{getInitials(`${article.author?.firstName || ""} ${article.author?.lastName || ""}`)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {article.author ? `${article.author.firstName || ""} ${article.author.lastName || ""}`.trim() : "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{article.author?.email || ""}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <Stat icon={Eye} label="Views" value={formatNumber(article.views)} color="text-blue-500" />
                            <Stat icon={DownloadSimple} label="Downloads" value={formatNumber(article.downloads)} color="text-emerald-500" />
                            <Stat icon={Clock} label="Read time" value={`${article.readTime || 1} min`} color="text-amber-500" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-3" />
                            <Stat icon={Calendar} label="Published at" value={formatDateTime(article.publishedAt)} color="text-emerald-500" />
                            <Stat icon={Calendar} label="Scheduled at" value={article.scheduledAt ? formatDateTime(article.scheduledAt) : "—"} color="text-amber-500" />
                            <Stat icon={Calendar} label="Created" value={formatDate(article.createdAt)} color="text-muted-foreground" />
                            <Stat icon={Calendar} label="Updated" value={formatDate(article.updatedAt)} color="text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will move the article to trash. You can restore from the archive later.
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

export default ArticleDetail;
