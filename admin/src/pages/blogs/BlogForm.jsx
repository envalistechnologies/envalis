import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Star, BookmarkSimple } from "@phosphor-icons/react";

import { blogsAPI } from "@/api/blogsApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { PageLoader } from "@/components/common/LoadingSpinner";
import ImageUploader, { MultiImageUploader } from "@/components/common/ImageUploader";
import TagInput from "@/components/common/TagInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { humanize, buildFormData, getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = ["technology", "design", "business", "marketing", "development", "news", "tutorial", "insights", "other"];
const STATUSES = ["draft", "published", "scheduled", "archived"];

const slugify = (s = "") => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const schema = z.object({
    title: z.string().min(1, "Required").max(200),
    slug: z.string().optional(),
    excerpt: z.string().min(1, "Required").max(500),
    content: z.string().min(1, "Content is required"),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string()).default([]),
    status: z.enum(STATUSES),
    scheduledAt: z.string().optional().nullable(),
    isFeatured: z.boolean().default(false),
    isTopPick: z.boolean().default(false),
});

const BlogForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [coverFile, setCoverFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [coverExisting, setCoverExisting] = useState("");

    const { data: existing, isLoading } = useQuery({
        queryKey: ["blog", id],
        queryFn: () => blogsAPI.getById(id).then((r) => r.data?.blog || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "", slug: "", excerpt: "", content: "",
            category: "technology", tags: [],
            status: "draft", scheduledAt: "",
            isFeatured: false, isTopPick: false,
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title || "",
                slug: existing.slug || "",
                excerpt: existing.excerpt || "",
                content: existing.content || "",
                category: existing.category || "technology",
                tags: existing.tags || [],
                status: existing.status || "draft",
                scheduledAt: existing.scheduledAt ? new Date(existing.scheduledAt).toISOString().slice(0, 16) : "",
                isFeatured: !!existing.isFeatured,
                isTopPick: !!existing.isTopPick,
            });
            setCoverExisting(existing.coverImage?.url || "");
            setGalleryFiles((existing.gallery || []).map((g) => ({ url: g.url, preview: g.url, alt: g.alt })));
        }
    }, [existing, reset]);

    const title = watch("title");
    useEffect(() => {
        if (!isEdit && title) setValue("slug", slugify(title));
    }, [title, isEdit, setValue]);

    const mutation = useMutation({
        mutationFn: (payload) => {
            const fd = buildFormData(payload);
            if (coverFile) fd.append("coverImage", coverFile);
            galleryFiles.forEach((g) => { if (g.file) fd.append("gallery", g.file); });
            return isEdit ? blogsAPI.update(id, fd) : blogsAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Blog updated" : "Blog created");
            qc.invalidateQueries({ queryKey: ["blogs"] });
            navigate("/blogs");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the blog post. Please check the content and try again.")),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting blog form:", data);
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Blog" : "New Blog"}
                description={isEdit ? "Update content, media, and publishing settings" : "Compose a new blog post"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/blogs")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            <FloppyDisk size={15} className="mr-1.5" /> {mutation.isPending ? "Saving..." : "Save Blog"}
                        </Button>
                    </>
                }
            />

            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Headline</CardTitle>
                            <CardDescription>Title, slug and a short excerpt that summarises this post</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Title" required error={errors.title?.message} className="md:col-span-2">
                                <Input {...register("title")} placeholder="A bold, descriptive title..." />
                            </FormField>
                            <FormField label="Slug" hint="Auto-generated from title. Edit if needed." error={errors.slug?.message}>
                                <Input {...register("slug")} placeholder="my-awesome-blog" />
                            </FormField>
                            <FormField label="Category" required error={errors.category?.message}>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                            <FormField label="Excerpt" required hint="Short summary shown in lists (max 500)" error={errors.excerpt?.message} className="md:col-span-2">
                                <Textarea rows={3} {...register("excerpt")} placeholder="A teaser to convince readers to click through..." />
                            </FormField>
                            <div className="md:col-span-2">
                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field }) => (
                                        <TagInput value={field.value} onChange={field.onChange} label="Tags" placeholder="Add tag and press Enter" />
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Body</CardTitle>
                            <CardDescription>The main content of your post</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                control={control}
                                name="content"
                                render={({ field }) => (
                                    <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Start writing your blog..." minHeight={420} />
                                )}
                            />
                            {errors.content?.message && <p className="text-xs text-destructive mt-2">{errors.content.message}</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cover Image</CardTitle>
                            <CardDescription>Hero image displayed on listings and detail pages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                label=""
                                value={coverFile}
                                onChange={setCoverFile}
                                existingUrl={coverExisting}
                                aspect="16/9"
                                description="Recommended 1600x900 PNG/JPG up to 5MB"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery</CardTitle>
                            <CardDescription>Optional images to embed in the post</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MultiImageUploader value={galleryFiles} onChange={setGalleryFiles} maxFiles={12} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="publishing" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                            <CardDescription>Control visibility and scheduling</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Status" required>
                                <Controller
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                            <FormField label="Scheduled at" hint="Only used when status is scheduled">
                                <Input type="datetime-local" {...register("scheduledAt")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility flags</CardTitle>
                            <CardDescription>Control where this post is highlighted</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Star size={18} weight="duotone" className="text-amber-500" />
                                    <div>
                                        <p className="text-sm font-medium">Featured</p>
                                        <p className="text-xs text-muted-foreground">Show in the featured carousel on the blog index</p>
                                    </div>
                                </div>
                                <Controller
                                    control={control}
                                    name="isFeatured"
                                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <BookmarkSimple size={18} weight="duotone" className="text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">Top pick</p>
                                        <p className="text-xs text-muted-foreground">Pinned to the editor's picks rail</p>
                                    </div>
                                </div>
                                <Controller
                                    control={control}
                                    name="isTopPick"
                                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
};

export default BlogForm;
