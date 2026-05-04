import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Plus, Trash } from "@phosphor-icons/react";

import { portfoliosAPI } from "@/api/portfoliosApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { PageLoader } from "@/components/common/LoadingSpinner";
import ImageUploader, { MultiImageUploader } from "@/components/common/ImageUploader";
import TagInput from "@/components/common/TagInput";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { humanize, buildFormData, getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = ["web_development", "mobile_app", "ui_ux", "branding", "ecommerce", "saas", "enterprise", "other"];
const STATUSES = ["draft", "published", "archived"];

const schema = z.object({
    title: z.string().min(1, "Required"),
    shortDescription: z.string().max(300).optional(),
    description: z.string().min(1, "Required"),
    category: z.enum(CATEGORIES),
    client: z.object({
        name: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
    }).optional(),
    challenge: z.string().optional(),
    solution: z.string().optional(),
    results: z.array(z.object({
        metric: z.string().optional(),
        value: z.string().optional(),
        description: z.string().optional(),
    })).optional(),
    testimonial: z.object({
        quote: z.string().optional(),
        author: z.string().optional(),
        designation: z.string().optional(),
    }).optional(),
    projectUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    duration: z.string().optional(),
    teamSize: z.coerce.number().optional(),
    completionDate: z.string().optional(),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    status: z.enum(STATUSES),
    isFeatured: z.boolean().default(false),
    order: z.coerce.number().optional(),
});

const PortfolioForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [coverFile, setCoverFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["portfolio", id],
        queryFn: () => portfoliosAPI.getById(id).then((r) => r.data?.portfolio || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "", shortDescription: "", description: "", category: "web_development",
            client: { name: "", website: "", industry: "" },
            challenge: "", solution: "",
            results: [],
            testimonial: { quote: "", author: "", designation: "" },
            projectUrl: "", githubUrl: "", duration: "", teamSize: 0, completionDate: "",
            tags: [], technologies: [], services: [],
            status: "draft", isFeatured: false, order: 0,
        },
    });

    const results = useFieldArray({ control, name: "results" });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title || "",
                shortDescription: existing.shortDescription || "",
                description: existing.description || "",
                category: existing.category || "web_development",
                client: {
                    name: existing.client?.name || "",
                    website: existing.client?.website || "",
                    industry: existing.client?.industry || "",
                },
                challenge: existing.challenge || "",
                solution: existing.solution || "",
                results: existing.results || [],
                testimonial: {
                    quote: existing.testimonial?.quote || "",
                    author: existing.testimonial?.author || "",
                    designation: existing.testimonial?.designation || "",
                },
                projectUrl: existing.projectUrl || "",
                githubUrl: existing.githubUrl || "",
                duration: existing.duration || "",
                teamSize: existing.teamSize || 0,
                completionDate: existing.completionDate ? existing.completionDate.split("T")[0] : "",
                tags: existing.tags || [],
                technologies: existing.technologies || [],
                services: existing.services || [],
                status: existing.status || "draft",
                isFeatured: !!existing.isFeatured,
                order: existing.order || 0,
            });
            setGalleryFiles((existing.gallery || []).map((g) => ({ url: g.url, preview: g.url, alt: g.alt })));
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (payload) => {
            const fd = buildFormData(payload);
            if (coverFile) fd.append("coverImage", coverFile);
            galleryFiles.forEach((g) => { if (g.file) fd.append("gallery", g.file); });
            return isEdit ? portfoliosAPI.update(id, fd) : portfoliosAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Portfolio updated" : "Portfolio created");
            qc.invalidateQueries({ queryKey: ["portfolios"] });
            navigate("/portfolios");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Save failed"),
            onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the portfolio. Please check the form and try again.")),
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the portfolio. Please check the form and try again.")),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting portfolio form:", data);
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Portfolio" : "New Portfolio"}
                description={isEdit ? "Update project details and assets" : "Showcase a new project"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/portfolios")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            <FloppyDisk size={15} className="mr-1.5" /> {mutation.isPending ? "Saving..." : "Save"}
                        </Button>
                    </>
                }
            />

            <Tabs defaultValue="overview">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="client">Client</TabsTrigger>
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Info</CardTitle>
                            <CardDescription>Basic details and description</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Title" required error={errors.title?.message} className="md:col-span-2">
                                <Input {...register("title")} placeholder="Project name" />
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
                            <FormField label="Completion Date">
                                <Input type="date" {...register("completionDate")} />
                            </FormField>
                            <FormField label="Project URL">
                                <Input {...register("projectUrl")} placeholder="https://..." />
                            </FormField>
                            <FormField label="GitHub URL">
                                <Input {...register("githubUrl")} placeholder="https://github.com/..." />
                            </FormField>
                            <FormField label="Duration">
                                <Input {...register("duration")} placeholder="3 months" />
                            </FormField>
                            <FormField label="Team Size">
                                <Input type="number" {...register("teamSize")} />
                            </FormField>
                            <FormField label="Short Description" hint="Max 300 chars" className="md:col-span-2">
                                <Textarea rows={2} {...register("shortDescription")} placeholder="One paragraph summary..." />
                            </FormField>
                            <FormField label="Full Description" required error={errors.description?.message} className="md:col-span-2">
                                <Textarea rows={6} {...register("description")} placeholder="Detailed project description..." />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tags & Capabilities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller control={control} name="tags" render={({ field }) => <TagInput label="Tags" value={field.value || []} onChange={field.onChange} />} />
                            <Controller control={control} name="technologies" render={({ field }) => <TagInput label="Technologies" value={field.value || []} onChange={field.onChange} placeholder="React, Node.js..." />} />
                            <Controller control={control} name="services" render={({ field }) => <TagInput label="Services" value={field.value || []} onChange={field.onChange} placeholder="UX Design, API Integration..." />} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="client" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Client Name">
                                <Input {...register("client.name")} placeholder="Acme Corp" />
                            </FormField>
                            <FormField label="Industry">
                                <Input {...register("client.industry")} placeholder="FinTech" />
                            </FormField>
                            <FormField label="Website" className="md:col-span-2">
                                <Input {...register("client.website")} placeholder="https://acme.com" />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Testimonial</CardTitle>
                            <CardDescription>Optional client quote</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Quote">
                                <Textarea rows={3} {...register("testimonial.quote")} />
                            </FormField>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Author">
                                    <Input {...register("testimonial.author")} />
                                </FormField>
                                <FormField label="Designation">
                                    <Input {...register("testimonial.designation")} />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="story" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Challenge & Solution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Challenge">
                                <Textarea rows={4} {...register("challenge")} placeholder="What problem did the client face..." />
                            </FormField>
                            <FormField label="Solution">
                                <Textarea rows={4} {...register("solution")} placeholder="How did we solve it..." />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Results</CardTitle>
                                <CardDescription>Quantifiable wins</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => results.append({ metric: "", value: "", description: "" })}>
                                <Plus size={14} className="mr-1" /> Add Result
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {results.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No results added yet.</p>
                            )}
                            {results.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Result {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => results.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <FormField label="Metric">
                                            <Input {...register(`results.${idx}.metric`)} placeholder="Revenue Growth" />
                                        </FormField>
                                        <FormField label="Value">
                                            <Input {...register(`results.${idx}.value`)} placeholder="200%" />
                                        </FormField>
                                        <FormField label="Description">
                                            <Input {...register(`results.${idx}.description`)} placeholder="vs. previous year" />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cover Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                label=""
                                value={coverFile}
                                onChange={setCoverFile}
                                existingUrl={existing?.coverImage?.url}
                                aspect="16/9"
                                description="Recommended 1600x900"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery</CardTitle>
                            <CardDescription>Showcase screenshots</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MultiImageUploader value={galleryFiles} onChange={setGalleryFiles} maxFiles={12} />
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
                            <FormField label="Display Order" hint="Lower numbers appear first">
                                <Input type="number" {...register("order")} />
                            </FormField>
                            <Separator />
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div>
                                    <p className="text-sm font-medium">Featured</p>
                                    <p className="text-xs text-muted-foreground">Highlight on the homepage</p>
                                </div>
                                <Controller
                                    control={control}
                                    name="isFeatured"
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

export default PortfolioForm;
