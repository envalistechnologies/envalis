import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Plus, Trash } from "@phosphor-icons/react";

import { caseStudiesAPI } from "@/api/caseStudiesApi";
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
import { humanize, buildFormData, getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = ["digital_transformation", "product_development", "process_improvement", "cost_reduction", "growth", "other"];
const STATUSES = ["draft", "published", "archived"];

const normalizeEnum = (value, allowed) => {
    if (!value) return "";
    const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
    return allowed.includes(normalized) ? normalized : "";
};

const schema = z.object({
    title: z.string().min(1, "Required"),
    tagline: z.string().optional(),
    overview: z.string().min(1, "Required"),
    category: z.preprocess((val) => normalizeEnum(val, CATEGORIES) || "digital_transformation", z.enum(CATEGORIES)),
    background: z.string().optional(),
    timeline: z.string().optional(),
    teamSize: z.coerce.number().optional(),
    projectValue: z.string().optional(),
    completionDate: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
    isFeatured: z.boolean(),
    order: z.coerce.number().optional(),
    client: z.object({
        name: z.string().min(1, "Client name required"),
        industry: z.string().optional(),
        size: z.string().optional(),
        location: z.string().optional(),
        website: z.string().optional(),
    }),
    challenge: z.object({
        description: z.string().optional(),
        points: z.array(z.string()).optional(),
    }).optional(),
    solution: z.object({
        description: z.string().optional(),
        approach: z.string().optional(),
        points: z.array(z.string()).optional(),
    }).optional(),
    implementation: z.object({
        phases: z.array(z.object({
            name: z.string().optional(),
            duration: z.string().optional(),
            description: z.string().optional(),
            deliverables: z.array(z.string()).optional(),
        })).optional(),
    }).optional(),
    results: z.object({
        summary: z.string().optional(),
        metrics: z.array(z.object({
            label: z.string().optional(),
            value: z.string().optional(),
            unit: z.string().optional(),
            improvement: z.string().optional(),
        })).optional(),
    }).optional(),
    testimonial: z.object({
        quote: z.string().optional(),
        author: z.string().optional(),
        designation: z.string().optional(),
        company: z.string().optional(),
    }).optional(),
    tags: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
});

const CaseStudyForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: existing, isLoading } = useQuery({
        queryKey: ["caseStudy", id],
        queryFn: () => caseStudiesAPI.getById(id).then((r) => r.data?.caseStudy || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "", tagline: "", overview: "", category: "digital_transformation",
            background: "", timeline: "", teamSize: 0, projectValue: "", completionDate: "",
            status: "draft", isFeatured: false, order: 0,
            client: { name: "", industry: "", size: "", location: "", website: "" },
            challenge: { description: "", points: [] },
            solution: { description: "", approach: "", points: [] },
            implementation: { phases: [] },
            results: { summary: "", metrics: [] },
            testimonial: { quote: "", author: "", designation: "", company: "" },
            tags: [], services: [], technologies: [],
            seo: { metaTitle: "", metaDescription: "", keywords: [] },
        },
    });

    const phases = useFieldArray({ control, name: "implementation.phases" });
    const metrics = useFieldArray({ control, name: "results.metrics" });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title || "",
                tagline: existing.tagline || "",
                overview: existing.overview || "",
                category: normalizeEnum(existing.category, CATEGORIES) || "digital_transformation",
                background: existing.background || "",
                timeline: existing.timeline || "",
                teamSize: existing.teamSize || 0,
                projectValue: existing.projectValue || "",
                completionDate: existing.completionDate ? existing.completionDate.split("T")[0] : "",
                status: existing.status || "draft",
                isFeatured: !!existing.isFeatured,
                order: existing.order || 0,
                client: {
                    name: existing.client?.name || "",
                    industry: existing.client?.industry || "",
                    size: existing.client?.size || "",
                    location: existing.client?.location || "",
                    website: existing.client?.website || "",
                },
                challenge: { description: existing.challenge?.description || "", points: existing.challenge?.points || [] },
                solution: { description: existing.solution?.description || "", approach: existing.solution?.approach || "", points: existing.solution?.points || [] },
                implementation: { phases: existing.implementation?.phases || [] },
                results: { summary: existing.results?.summary || "", metrics: existing.results?.metrics || [] },
                testimonial: {
                    quote: existing.testimonial?.quote || "",
                    author: existing.testimonial?.author || "",
                    designation: existing.testimonial?.designation || "",
                    company: existing.testimonial?.company || "",
                },
                tags: existing.tags || [], services: existing.services || [], technologies: existing.technologies || [],
                seo: {
                    metaTitle: existing.seo?.metaTitle || "",
                    metaDescription: existing.seo?.metaDescription || "",
                    keywords: existing.seo?.keywords || [],
                },
            });
        }
    }, [existing, reset]);

    const coverImage = watch("_coverImage");
    const bannerImage = watch("_bannerImage");
    const gallery = watch("_gallery") || [];
    const [removedCoverImage, setRemovedCoverImage] = useState(false);
    const [removedBannerImage, setRemovedBannerImage] = useState(false);
    const [removedGalleryIds, setRemovedGalleryIds] = useState([]);

    const mutation = useMutation({
        mutationFn: (payload) => isEdit ? caseStudiesAPI.update(id, payload) : caseStudiesAPI.create(payload),
        onSuccess: () => {
            toast.success(isEdit ? "Case study updated" : "Case study created");
            qc.invalidateQueries({ queryKey: ["caseStudies"] });
            navigate("/case-studies");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the case study. Please check the form and try again.")),
    });

    const onSubmit = (data) => {
        const payload = {
            ...data,
            category: normalizeEnum(data.category, CATEGORIES) || "digital_transformation",
        };
        const fd = new FormData();
        if (coverImage instanceof File) fd.append("coverImage", coverImage);
        if (removedCoverImage && !(coverImage instanceof File)) fd.append("removeCoverImage", "true");
        if (bannerImage instanceof File) fd.append("bannerImage", bannerImage);
        if (removedBannerImage && !(bannerImage instanceof File)) fd.append("removeBannerImage", "true");
        gallery.forEach((g) => { if (g.file instanceof File) fd.append("gallery", g.file); });
        if (removedGalleryIds.length > 0) fd.append("removeGalleryIds", JSON.stringify(removedGalleryIds));
        delete payload._coverImage;
        delete payload._bannerImage;
        delete payload._gallery;
        buildFormData(payload, fd);
        mutation.mutate(fd);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Case Study" : "New Case Study"}
                description={isEdit ? "Update the story, results, and assets" : "Document a client success story end-to-end"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/case-studies")}>
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
                    <TabsTrigger value="implementation">Implementation</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Headline</CardTitle>
                            <CardDescription>Title, tagline, and overview shown on listings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Title" required error={errors.title?.message}>
                                <Input {...register("title")} placeholder="How Acme increased revenue by 200%" />
                            </FormField>
                            <FormField label="Tagline" hint="One sentence hook">
                                <Input {...register("tagline")} placeholder="A digital transformation success story" />
                            </FormField>
                            <FormField label="Overview" required error={errors.overview?.message}>
                                <Textarea rows={4} {...register("overview")} placeholder="Brief overview of the case study..." />
                            </FormField>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Category" required>
                                    <Controller
                                        control={control}
                                        name="category"
                                        render={({ field }) => (
                                            <Select value={normalizeEnum(field.value, CATEGORIES) || CATEGORIES[0]} onValueChange={field.onChange}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map((c) => (
                                                        <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </FormField>
                                <FormField label="Completion Date">
                                    <Input type="date" {...register("completionDate")} />
                                </FormField>
                                <FormField label="Timeline">
                                    <Input {...register("timeline")} placeholder="6 months" />
                                </FormField>
                                <FormField label="Team Size">
                                    <Input type="number" {...register("teamSize")} placeholder="8" />
                                </FormField>
                                <FormField label="Project Value" className="md:col-span-2">
                                    <Input {...register("projectValue")} placeholder="$250,000" />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visuals</CardTitle>
                            <CardDescription>Cover, banner, and gallery imagery</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Controller
                                    control={control}
                                    name="_coverImage"
                                    render={({ field }) => (
                                        <ImageUploader
                                            label="Cover Image"
                                            existingUrl={existing?.coverImage?.url}
                                            value={field.value}
                                            onChange={(f) => { field.onChange(f); if (f) setRemovedCoverImage(false); }}
                                            onRemoveExisting={() => setRemovedCoverImage(true)}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="_bannerImage"
                                    render={({ field }) => (
                                        <ImageUploader
                                            label="Banner Image"
                                            existingUrl={existing?.bannerImage?.url}
                                            value={field.value}
                                            onChange={(f) => { field.onChange(f); if (f) setRemovedBannerImage(false); }}
                                            onRemoveExisting={() => setRemovedBannerImage(true)}
                                        />
                                    )}
                                />
                            </div>
                            <Controller
                                control={control}
                                name="_gallery"
                                render={({ field }) => (
                                    <MultiImageUploader value={field.value || []} onChange={field.onChange} onRemoveExisting={(item) => { if (item.publicId) setRemovedGalleryIds((prev) => [...prev, item.publicId]); }} />
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tags & Capabilities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller control={control} name="tags" render={({ field }) => <TagInput label="Tags" value={field.value || []} onChange={field.onChange} />} />
                            <Controller control={control} name="services" render={({ field }) => <TagInput label="Services" value={field.value || []} onChange={field.onChange} placeholder="UX Design, API Integration..." />} />
                            <Controller control={control} name="technologies" render={({ field }) => <TagInput label="Technologies" value={field.value || []} onChange={field.onChange} placeholder="React, Node.js..." />} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="client" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Profile</CardTitle>
                            <CardDescription>Who they are and what industry they operate in</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Client Name" required error={errors.client?.name?.message}>
                                <Input {...register("client.name")} placeholder="Acme Corporation" />
                            </FormField>
                            <FormField label="Industry">
                                <Input {...register("client.industry")} placeholder="FinTech" />
                            </FormField>
                            <FormField label="Company Size">
                                <Input {...register("client.size")} placeholder="500-1000 employees" />
                            </FormField>
                            <FormField label="Location">
                                <Input {...register("client.location")} placeholder="San Francisco, USA" />
                            </FormField>
                            <FormField label="Website" className="md:col-span-2">
                                <Input {...register("client.website")} placeholder="https://acme.com" />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Background</CardTitle>
                            <CardDescription>Context before the engagement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea rows={5} {...register("background")} placeholder="Describe the client's situation before the project..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="story" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>The Challenge</CardTitle>
                            <CardDescription>Pain points and what needed solving</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Description">
                                <Textarea rows={4} {...register("challenge.description")} placeholder="What problem did the client face..." />
                            </FormField>
                            <Controller
                                control={control}
                                name="challenge.points"
                                render={({ field }) => (
                                    <TagInput label="Key Pain Points" value={field.value || []} onChange={field.onChange} placeholder="Add a pain point and press Enter" />
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>The Solution</CardTitle>
                            <CardDescription>How we approached and solved it</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Description">
                                <Textarea rows={4} {...register("solution.description")} placeholder="The solution we delivered..." />
                            </FormField>
                            <FormField label="Approach">
                                <Textarea rows={3} {...register("solution.approach")} placeholder="Our methodology and approach..." />
                            </FormField>
                            <Controller
                                control={control}
                                name="solution.points"
                                render={({ field }) => (
                                    <TagInput label="Solution Highlights" value={field.value || []} onChange={field.onChange} />
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Testimonial</CardTitle>
                            <CardDescription>A quote from the client</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Quote">
                                <Textarea rows={3} {...register("testimonial.quote")} placeholder="What they said about working with us..." />
                            </FormField>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Author">
                                    <Input {...register("testimonial.author")} placeholder="Jane Doe" />
                                </FormField>
                                <FormField label="Designation">
                                    <Input {...register("testimonial.designation")} placeholder="CTO" />
                                </FormField>
                                <FormField label="Company">
                                    <Input {...register("testimonial.company")} placeholder="Acme Corp" />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Implementation Phases</CardTitle>
                                <CardDescription>Break down the project into ordered phases</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => phases.append({ name: "", duration: "", description: "", deliverables: [] })}>
                                <Plus size={14} className="mr-1" /> Add Phase
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {phases.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No phases added yet.</p>
                            )}
                            {phases.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Phase {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => phases.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <FormField label="Name">
                                            <Input {...register(`implementation.phases.${idx}.name`)} placeholder="Discovery" />
                                        </FormField>
                                        <FormField label="Duration">
                                            <Input {...register(`implementation.phases.${idx}.duration`)} placeholder="2 weeks" />
                                        </FormField>
                                    </div>
                                    <FormField label="Description">
                                        <Textarea rows={2} {...register(`implementation.phases.${idx}.description`)} placeholder="What happened in this phase..." />
                                    </FormField>
                                    <Controller
                                        control={control}
                                        name={`implementation.phases.${idx}.deliverables`}
                                        render={({ field: f }) => (
                                            <TagInput label="Deliverables" value={f.value || []} onChange={f.onChange} placeholder="Add a deliverable" />
                                        )}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Outcome Summary</CardTitle>
                            <CardDescription>What changed after delivery</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea rows={4} {...register("results.summary")} placeholder="High-level results summary..." />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Key Metrics</CardTitle>
                                <CardDescription>Quantifiable wins to display in cards</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => metrics.append({ label: "", value: "", unit: "", improvement: "" })}>
                                <Plus size={14} className="mr-1" /> Add Metric
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {metrics.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No metrics added yet.</p>
                            )}
                            {metrics.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Metric {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => metrics.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <FormField label="Label" className="md:col-span-2">
                                            <Input {...register(`results.metrics.${idx}.label`)} placeholder="Revenue Growth" />
                                        </FormField>
                                        <FormField label="Value">
                                            <Input {...register(`results.metrics.${idx}.value`)} placeholder="200" />
                                        </FormField>
                                        <FormField label="Unit">
                                            <Input {...register(`results.metrics.${idx}.unit`)} placeholder="%" />
                                        </FormField>
                                        <FormField label="Improvement Note" className="md:col-span-4">
                                            <Input {...register(`results.metrics.${idx}.improvement`)} placeholder="vs. previous year" />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>


                <TabsContent value="publishing" className="space-y-6 mt-4\">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility</CardTitle>
                            <CardDescription>Status, ordering, and feature flag</CardDescription>
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
                                                {STATUSES.map((s) => (
                                                    <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                            <FormField label="Display Order" hint="Lower numbers appear first">
                                <Input type="number" {...register("order")} placeholder="0" />
                            </FormField>
                            <Separator />
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div>
                                    <p className="text-sm font-medium">Featured</p>
                                    <p className="text-xs text-muted-foreground">Highlight this case study on the homepage</p>
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

export default CaseStudyForm;
