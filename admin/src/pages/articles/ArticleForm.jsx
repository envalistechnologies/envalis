import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Star, Lock, Plus, Trash } from "@phosphor-icons/react";

import { articlesAPI } from "@/api/articlesApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { PageLoader } from "@/components/common/LoadingSpinner";
import ImageUploader from "@/components/common/ImageUploader";
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

const CATEGORIES = ["whitepaper", "research", "thought_leadership", "industry_report", "case_analysis", "opinion", "guide", "other"];
const STATUSES = ["draft", "published", "scheduled", "archived"];

const normalizeCategory = (value) => {
    if (!value) return "";
    const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
    return CATEGORIES.includes(normalized) ? normalized : "";
};

const schema = z.object({
    title: z.string().min(1, "Required").max(200),
    subtitle: z.string().max(300).optional(),
    excerpt: z.string().min(1, "Required").max(500),
    content: z.string().min(1, "Content is required"),
    category: z.preprocess((val) => normalizeCategory(val) || "other", z.enum(CATEGORIES)),
    tags: z.array(z.string()).default([]),
    status: z.enum(STATUSES),
    scheduledAt: z.string().optional().nullable(),
    isFeatured: z.boolean().default(false),
    isPremium: z.boolean().default(false),
    references: z.array(z.object({
        title: z.string().optional(),
        url: z.string().optional(),
        author: z.string().optional(),
    })).optional(),
});

const ArticleForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [coverFile, setCoverFile] = useState(null);
    const [removedCoverImage, setRemovedCoverImage] = useState(false);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["article", id],
        queryFn: () => articlesAPI.getById(id).then((r) => r.data?.article || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "", subtitle: "", excerpt: "", content: "",
            category: "whitepaper", tags: [],
            status: "draft", scheduledAt: "",
            isFeatured: false, isPremium: false,
            references: [],
        },
    });

    const references = useFieldArray({ control, name: "references" });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title || "",
                subtitle: existing.subtitle || "",
                excerpt: existing.excerpt || "",
                content: existing.content || "",
                category: normalizeCategory(existing.category) || "whitepaper",
                tags: existing.tags || [],
                status: existing.status || "draft",
                scheduledAt: existing.scheduledAt ? new Date(existing.scheduledAt).toISOString().slice(0, 16) : "",
                isFeatured: !!existing.isFeatured,
                isPremium: !!existing.isPremium,
                references: existing.references || [],
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (payload) => {
            const fd = buildFormData(payload);
            if (coverFile) fd.append("coverImage", coverFile);
            if (removedCoverImage && !coverFile) fd.append("removeCoverImage", "true");
            return isEdit ? articlesAPI.update(id, fd) : articlesAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Article updated" : "Article created");
            qc.invalidateQueries({ queryKey: ["articles"] });
            navigate("/articles");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the article. Please check the content and try again.")),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting article form:", data);
        const payload = {
            ...data,
            category: normalizeCategory(data.category) || "other",
        };
        mutation.mutate(payload);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Article" : "New Article"}
                description={isEdit ? "Update content, references, and visibility" : "Compose a long-form article or whitepaper"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/articles")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            <FloppyDisk size={15} className="mr-1.5" /> {mutation.isPending ? "Saving..." : "Save Article"}
                        </Button>
                    </>
                }
            />

            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="references">References</TabsTrigger>
                    <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Headline</CardTitle>
                            <CardDescription>Title, subtitle, and a short excerpt</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Title" required error={errors.title?.message} className="md:col-span-2">
                                <Input {...register("title")} placeholder="The next decade of enterprise AI..." />
                            </FormField>
                            <FormField label="Subtitle" hint="Optional supporting line" className="md:col-span-2">
                                <Input {...register("subtitle")} placeholder="A research perspective from our team" />
                            </FormField>
                            <FormField label="Category" required error={errors.category?.message}>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <Select value={normalizeCategory(field.value) || CATEGORIES[0]} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                            <div>
                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field }) => (
                                        <TagInput value={field.value} onChange={field.onChange} label="Tags" />
                                    )}
                                />
                            </div>
                            <FormField label="Excerpt" required hint="Max 500 characters" error={errors.excerpt?.message} className="md:col-span-2">
                                <Textarea rows={3} {...register("excerpt")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Body</CardTitle>
                            <CardDescription>The main content of your article</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                control={control}
                                name="content"
                                render={({ field }) => (
                                    <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Start writing..." minHeight={500} />
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
                            <CardDescription>Hero image for listings and detail pages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                label=""
                                value={coverFile}
                                onChange={(f) => { setCoverFile(f); if (f) setRemovedCoverImage(false); }}
                                existingUrl={existing?.coverImage?.url}
                                onRemoveExisting={() => setRemovedCoverImage(true)}
                                aspect="16/9"
                                description="Recommended 1600x900 PNG/JPG up to 5MB"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="references" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>References</CardTitle>
                                <CardDescription>Citations and sources</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => references.append({ title: "", url: "", author: "" })}>
                                <Plus size={14} className="mr-1" /> Add Reference
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {references.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No references added yet.</p>
                            )}
                            {references.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Reference {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => references.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <FormField label="Title" className="md:col-span-2">
                                            <Input {...register(`references.${idx}.title`)} placeholder="Source title" />
                                        </FormField>
                                        <FormField label="Author">
                                            <Input {...register(`references.${idx}.author`)} />
                                        </FormField>
                                        <FormField label="URL" className="md:col-span-3">
                                            <Input {...register(`references.${idx}.url`)} placeholder="https://..." />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="publishing" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Status" required error={errors.status?.message}>
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
                            <FormField label="Scheduled at" hint="Used when status is scheduled">
                                <Input type="datetime-local" {...register("scheduledAt")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility flags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Star size={18} weight="duotone" className="text-amber-500" />
                                    <div>
                                        <p className="text-sm font-medium">Featured</p>
                                        <p className="text-xs text-muted-foreground">Highlight on the article index</p>
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
                                    <Lock size={18} weight="duotone" className="text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">Premium</p>
                                        <p className="text-xs text-muted-foreground">Gate behind email signup</p>
                                    </div>
                                </div>
                                <Controller
                                    control={control}
                                    name="isPremium"
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

export default ArticleForm;
