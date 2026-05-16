import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, FilePdf, UploadSimple, Star, Lock, EnvelopeSimple } from "@phosphor-icons/react";

import { resourcesAPI } from "@/api/resourcesApi";
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
import { Separator } from "@/components/ui/separator";
import { humanize, buildFormData, formatBytes, getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";

const TYPES = ["ebook", "whitepaper", "guide", "template", "checklist", "infographic", "video", "webinar", "tool", "other"];
const CATEGORIES = ["technology", "business", "design", "marketing", "development", "leadership", "productivity", "other"];
const STATUSES = ["draft", "published", "archived"];

const schema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    content: z.string().optional(),
    type: z.enum(TYPES),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string()).default([]),
    externalUrl: z.string().optional(),
    isFree: z.boolean().default(true),
    requiresEmail: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    status: z.enum(STATUSES),
    order: z.coerce.number().optional(),
});

const ResourceForm = () => {
    const { id } = useParams();
    const isEdit = !!id && id !== "new";
    const navigate = useNavigate();
    const qc = useQueryClient();
    const fileRef = useRef(null);

    const [coverFile, setCoverFile] = useState(null);
    const [resourceFile, setResourceFile] = useState(null);
    const [removedCoverImage, setRemovedCoverImage] = useState(false);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["resource", id],
        queryFn: () => resourcesAPI.getById(id).then((r) => r.data?.resource || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "", description: "", content: "",
            type: "ebook", category: "technology", tags: [],
            externalUrl: "", isFree: true, requiresEmail: false,
            isFeatured: false, status: "draft", order: 0,
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title || "",
                description: existing.description || "",
                content: existing.content || "",
                type: existing.type || "ebook",
                category: existing.category || "technology",
                tags: existing.tags || [],
                externalUrl: existing.externalUrl || "",
                isFree: existing.isFree !== false,
                requiresEmail: !!existing.requiresEmail,
                isFeatured: !!existing.isFeatured,
                status: existing.status || "draft",
                order: existing.order || 0,
                seo: {
                    metaTitle: existing.seo?.metaTitle || "",
                    metaDescription: existing.seo?.metaDescription || "",
                    keywords: existing.seo?.keywords || [],
                },
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (payload) => {
            const fd = buildFormData(payload);
            if (coverFile) fd.append("coverImage", coverFile);
            if (removedCoverImage && !coverFile) fd.append("removeCoverImage", "true");
            if (resourceFile) fd.append("file", resourceFile);
            return isEdit ? resourcesAPI.update(id, fd) : resourcesAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Resource updated" : "Resource created");
            qc.invalidateQueries({ queryKey: ["resources"] });
            navigate("/resources");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the resource. Please check the form and try again.")),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting resource form:", data);
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Resource" : "New Resource"}
                description={isEdit ? "Update resource details" : "Add a new downloadable resource"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/resources")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            <FloppyDisk size={15} className="mr-1.5" /> {mutation.isPending ? "Saving..." : "Save"}
                        </Button>
                    </>
                }
            />

            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="access">Access</TabsTrigger>
                    <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resource Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Title" required error={errors.title?.message} className="md:col-span-2">
                                <Input {...register("title")} placeholder="The Complete Guide to..." />
                            </FormField>
                            <FormField label="Type" required>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {TYPES.map((t) => <SelectItem key={t} value={t}>{humanize(t)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                            <FormField label="Category" required>
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
                            <FormField label="Description" required error={errors.description?.message} className="md:col-span-2">
                                <Textarea rows={4} {...register("description")} placeholder="What's inside this resource..." />
                            </FormField>
                            <div className="md:col-span-2">
                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field }) => (
                                        <TagInput label="Tags" value={field.value || []} onChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Long-form Content</CardTitle>
                            <CardDescription>Optional preview content shown on the resource page</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                control={control}
                                name="content"
                                render={({ field }) => (
                                    <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Optional rich content..." minHeight={300} />
                                )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="files" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cover Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader value={coverFile} onChange={(f) => { setCoverFile(f); if (f) setRemovedCoverImage(false); }} existingUrl={existing?.coverImage?.url} onRemoveExisting={() => setRemovedCoverImage(true)} aspect="3/4" description="Recommended portrait cover" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Downloadable File</CardTitle>
                            <CardDescription>PDF, ZIP, or other resource file</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer p-6 text-center"
                            >
                                {resourceFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="size-12 rounded-lg bg-primary/10 grid place-items-center text-primary">
                                            <FilePdf size={20} weight="duotone" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">{resourceFile.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatBytes(resourceFile.size)}</p>
                                        </div>
                                    </div>
                                ) : existing?.file?.url ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="size-12 rounded-lg bg-emerald-500/10 grid place-items-center text-emerald-600">
                                                <FilePdf size={20} weight="duotone" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium">{existing.file.name || "Current file"}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {existing.file.format?.toUpperCase()} {existing.file.size && `• ${formatBytes(existing.file.size)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Click to replace</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="size-12 rounded-full bg-primary/10 grid place-items-center mx-auto">
                                            <UploadSimple size={20} weight="duotone" className="text-primary" />
                                        </div>
                                        <p className="text-sm font-medium">Click to upload file</p>
                                        <p className="text-xs text-muted-foreground">PDF, ZIP, DOCX, etc. up to 50MB</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                hidden
                                onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                            />
                            <Separator />
                            <FormField label="External URL" hint="Link to external resource (used if no file is uploaded)">
                                <Input {...register("externalUrl")} placeholder="https://..." />
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="access" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Control</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Lock size={18} weight="duotone" className="text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">Free</p>
                                        <p className="text-xs text-muted-foreground">Anyone can download without payment</p>
                                    </div>
                                </div>
                                <Controller control={control} name="isFree" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <EnvelopeSimple size={18} weight="duotone" className="text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Requires Email</p>
                                        <p className="text-xs text-muted-foreground">Capture email before download</p>
                                    </div>
                                </div>
                                <Controller control={control} name="requiresEmail" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="publishing" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Status">
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
                            <FormField label="Display Order">
                                <Input type="number" {...register("order")} />
                            </FormField>
                            <Separator />
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Star size={18} weight="duotone" className="text-amber-500" />
                                    <div>
                                        <p className="text-sm font-medium">Featured</p>
                                        <p className="text-xs text-muted-foreground">Highlight on the resources page</p>
                                    </div>
                                </div>
                                <Controller control={control} name="isFeatured" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
};

export default ResourceForm;
