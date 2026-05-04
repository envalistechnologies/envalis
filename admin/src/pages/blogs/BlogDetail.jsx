import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Eye, Heart, Clock, Calendar, Tag, BookmarkSimple, Star,
    BroadcastIcon, Article as ArticleIcon, ShareNetwork,
} from "@phosphor-icons/react";

import { blogsAPI } from "@/api/blogsApi";
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

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["blog", id],
        queryFn: () => blogsAPI.getById(id).then((r) => r.data?.blog || r.data),
    });

    const publishMut = useMutation({
        mutationFn: ({ action }) => action === "publish" ? blogsAPI.publish(id) : blogsAPI.unpublish(id),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["blog", id] });
            qc.invalidateQueries({ queryKey: ["blogs"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: () => blogsAPI.delete(id),
        onSuccess: () => {
            toast.success("Blog deleted");
            qc.invalidateQueries({ queryKey: ["blogs"] });
            navigate("/blogs");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    const blog = data;
    if (!blog) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={blog.title}
                description={blog.excerpt}
                showBack
                backPath="/blogs"
                actions={
                    <>
                        {blog.status === "published" ? (
                            <Button variant="outline" onClick={() => publishMut.mutate({ action: "unpublish" })}>
                                <BroadcastIcon size={15} className="mr-1.5" /> Unpublish
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => publishMut.mutate({ action: "publish" })}>
                                <BroadcastIcon size={15} className="mr-1.5" /> Publish
                            </Button>
                        )}
                        <Button asChild>
                            <Link to={`/blogs/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            {blog.coverImage?.url && (
                <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-21/9">
                    <img src={blog.coverImage.url} alt={blog.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">{humanize(blog.category)}</Badge>
                            <StatusBadge status={blog.status} />
                            {blog.isFeatured && <Badge className="bg-amber-500 text-white border-amber-400 gap-1"><Star size={11} weight="fill" /> Featured</Badge>}
                            {blog.isTopPick && <Badge className="bg-purple-500 text-white border-purple-400 gap-1"><BookmarkSimple size={11} weight="fill" /> Top Pick</Badge>}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight max-w-3xl drop-shadow">{blog.title}</h2>
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
                                dangerouslySetInnerHTML={{ __html: blog.content || "<p class='text-muted-foreground'>No content yet.</p>" }}
                            />
                        </CardContent>
                    </Card>

                    {!!blog.gallery?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Gallery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {blog.gallery.map((g, i) => (
                                        <a key={i} href={g.url} target="_blank" rel="noreferrer" className="group relative aspect-square rounded-lg overflow-hidden bg-muted ring-1 ring-border">
                                            <img src={g.url} alt={g.alt || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!blog.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Tag size={16} weight="duotone" className="text-primary" /> Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map((t) => (
                                        <Badge key={t} variant="secondary" className="text-sm">#{t}</Badge>
                                    ))}
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
                                    <AvatarImage src={blog.author?.avatar?.url} />
                                    <AvatarFallback>{getInitials(`${blog.author?.firstName || ""} ${blog.author?.lastName || ""}`)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {blog.author ? `${blog.author.firstName || ""} ${blog.author.lastName || ""}`.trim() : "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{blog.author?.email || ""}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <Stat icon={Eye} label="Views" value={formatNumber(blog.views)} color="text-blue-500" />
                            <Stat icon={Heart} label="Likes" value={formatNumber(blog.likes)} color="text-rose-500" />
                            <Stat icon={Clock} label="Read time" value={`${blog.readTime || 1} min`} color="text-emerald-500" />
                            <Stat icon={ShareNetwork} label="Slug" value={blog.slug} color="text-purple-500" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-3" />
                            <Stat icon={Calendar} label="Published at" value={formatDateTime(blog.publishedAt)} color="text-emerald-500" />
                            <Stat icon={Calendar} label="Scheduled at" value={blog.scheduledAt ? formatDateTime(blog.scheduledAt) : "—"} color="text-amber-500" />
                            <Stat icon={Calendar} label="Created" value={formatDate(blog.createdAt)} color="text-muted-foreground" />
                            <Stat icon={Calendar} label="Updated" value={formatDate(blog.updatedAt)} color="text-muted-foreground" />
                        </CardContent>
                    </Card>

                    {(blog.seo?.metaTitle || blog.seo?.metaDescription) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">SEO Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-sm font-medium text-blue-600 truncate">{blog.seo?.metaTitle || blog.title}</p>
                                <p className="text-xs text-emerald-700 truncate">/blog/{blog.slug}</p>
                                <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                                    {blog.seo?.metaDescription || blog.excerpt}
                                </p>
                                {!!blog.seo?.keywords?.length && (
                                    <div className="flex flex-wrap gap-1 pt-2">
                                        {blog.seo.keywords.map((k) => <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this blog?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will move the post to trash. You can restore it from the archive later.
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

export default BlogDetail;
