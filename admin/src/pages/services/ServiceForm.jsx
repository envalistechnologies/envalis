import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Plus, Trash, Star } from "@phosphor-icons/react";

import { servicesAPI } from "@/api/servicesApi";
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
import { humanize, buildFormData, getFormErrorHandler } from "@/lib/utils";

const CATEGORIES = ["consulting", "development", "design", "marketing", "support", "training", "other"];
const STATUSES = ["draft", "published", "archived"];

const schema = z.object({
    title: z.string().min(1, "Required"),
    tagline: z.string().optional(),
    shortDescription: z.string().max(300).optional(),
    description: z.string().min(1, "Required"),
    content: z.string().optional(),
    category: z.enum(CATEGORIES),
    icon: z.string().optional(),
    features: z.array(z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
    })).optional(),
    pricing: z.array(z.object({
        plan: z.string().optional(),
        price: z.string().optional(),
        period: z.string().optional(),
        features: z.array(z.string()).optional(),
        isPopular: z.boolean().optional(),
    })).optional(),
    process: z.array(z.object({
        step: z.coerce.number().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
    })).optional(),
    faqs: z.array(z.object({
        question: z.string().optional(),
        answer: z.string().optional(),
    })).optional(),
    technologies: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    status: z.enum(STATUSES),
    isFeatured: z.boolean().default(false),
    order: z.coerce.number().optional(),
});

const ServiceForm = () => {
    const { id } = useParams();
    const isEdit = !!id && id !== "new";
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [coverFile, setCoverFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["service", id],
        queryFn: () => servicesAPI.getById(id).then((r) => r.data?.service || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "", tagline: "", shortDescription: "", description: "", content: "",
            category: "consulting", icon: "",
            features: [], pricing: [], process: [], faqs: [],
            technologies: [], tags: [],
            status: "draft", isFeatured: false, order: 0,
        },
    });

    const features = useFieldArray({ control, name: "features" });
    const pricing = useFieldArray({ control, name: "pricing" });
    const processSteps = useFieldArray({ control, name: "process" });
    const faqs = useFieldArray({ control, name: "faqs" });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title || "",
                tagline: existing.tagline || "",
                shortDescription: existing.shortDescription || "",
                description: existing.description || "",
                content: existing.content || "",
                category: existing.category || "consulting",
                icon: existing.icon || "",
                features: existing.features || [],
                pricing: existing.pricing || [],
                process: existing.process || [],
                faqs: existing.faqs || [],
                technologies: existing.technologies || [],
                tags: existing.tags || [],
                status: existing.status || "draft",
                isFeatured: !!existing.isFeatured,
                order: existing.order || 0,
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (data) => {
            const fd = buildFormData(data);
            if (coverFile) fd.append("coverImage", coverFile);
            if (bannerFile) fd.append("bannerImage", bannerFile);
            return isEdit ? servicesAPI.update(id, fd) : servicesAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Service updated" : "Service created");
            qc.invalidateQueries({ queryKey: ["services"] });
            if (isEdit) qc.invalidateQueries({ queryKey: ["service", id] });
            navigate("/services");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Save failed"),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting service form:", data);
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Service" : "New Service"}
                description={isEdit ? "Update offering details" : "Define a new service offering"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/services")}>
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
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="process">Process</TabsTrigger>
                    <TabsTrigger value="faqs">FAQs</TabsTrigger>
                    <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Details</CardTitle>
                            <CardDescription>Headline, summary, and description</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Title" required error={errors.title?.message} className="md:col-span-2">
                                <Input {...register("title")} placeholder="Web Application Development" />
                            </FormField>
                            <FormField label="Tagline" className="md:col-span-2">
                                <Input {...register("tagline")} placeholder="Build modern web apps that scale" />
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
                            <FormField label="Icon" hint="Phosphor icon name">
                                <Input {...register("icon")} placeholder="Code" />
                            </FormField>
                            <FormField label="Short Description" hint="Max 300 chars" className="md:col-span-2">
                                <Textarea rows={2} {...register("shortDescription")} />
                            </FormField>
                            <FormField label="Full Description" required error={errors.description?.message} className="md:col-span-2">
                                <Textarea rows={5} {...register("description")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rich Content</CardTitle>
                            <CardDescription>Optional long-form content</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                control={control}
                                name="content"
                                render={({ field }) => (
                                    <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Detailed service explanation..." minHeight={300} />
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visuals</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUploader label="Cover Image" value={coverFile} onChange={setCoverFile} existingUrl={existing?.coverImage?.url} />
                            <ImageUploader label="Banner Image" value={bannerFile} onChange={setBannerFile} existingUrl={existing?.bannerImage?.url} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tags & Stack</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller control={control} name="tags" render={({ field }) => <TagInput label="Tags" value={field.value || []} onChange={field.onChange} />} />
                            <Controller control={control} name="technologies" render={({ field }) => <TagInput label="Technologies" value={field.value || []} onChange={field.onChange} />} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Features</CardTitle>
                                <CardDescription>Highlight what's included</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => features.append({ title: "", description: "", icon: "" })}>
                                <Plus size={14} className="mr-1" /> Add Feature
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {features.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No features added yet.</p>
                            )}
                            {features.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Feature {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => features.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <FormField label="Title" className="md:col-span-2">
                                            <Input {...register(`features.${idx}.title`)} />
                                        </FormField>
                                        <FormField label="Icon">
                                            <Input {...register(`features.${idx}.icon`)} placeholder="CheckCircle" />
                                        </FormField>
                                        <FormField label="Description" className="md:col-span-3">
                                            <Textarea rows={2} {...register(`features.${idx}.description`)} />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pricing Tiers</CardTitle>
                                <CardDescription>Optional plans for this service</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => pricing.append({ plan: "", price: "", period: "", features: [], isPopular: false })}>
                                <Plus size={14} className="mr-1" /> Add Plan
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pricing.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No pricing plans added yet.</p>
                            )}
                            {pricing.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Plan {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => pricing.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <FormField label="Plan Name">
                                            <Input {...register(`pricing.${idx}.plan`)} placeholder="Starter" />
                                        </FormField>
                                        <FormField label="Price">
                                            <Input {...register(`pricing.${idx}.price`)} placeholder="$999" />
                                        </FormField>
                                        <FormField label="Period">
                                            <Input {...register(`pricing.${idx}.period`)} placeholder="per month" />
                                        </FormField>
                                    </div>
                                    <Controller
                                        control={control}
                                        name={`pricing.${idx}.features`}
                                        render={({ field: f }) => (
                                            <TagInput label="Plan Features" value={f.value || []} onChange={f.onChange} placeholder="Add a feature" />
                                        )}
                                    />
                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div className="flex items-center gap-2">
                                            <Star size={14} weight="duotone" className="text-amber-500" />
                                            <p className="text-sm">Mark as popular</p>
                                        </div>
                                        <Controller
                                            control={control}
                                            name={`pricing.${idx}.isPopular`}
                                            render={({ field: f }) => <Switch checked={!!f.value} onCheckedChange={f.onChange} />}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="process" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Our Process</CardTitle>
                                <CardDescription>Steps you take to deliver this service</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => processSteps.append({ step: processSteps.fields.length + 1, title: "", description: "" })}>
                                <Plus size={14} className="mr-1" /> Add Step
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {processSteps.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No process steps added yet.</p>
                            )}
                            {processSteps.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Step {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => processSteps.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <FormField label="Title">
                                        <Input {...register(`process.${idx}.title`)} placeholder="Discovery" />
                                    </FormField>
                                    <FormField label="Description">
                                        <Textarea rows={2} {...register(`process.${idx}.description`)} />
                                    </FormField>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="faqs" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>FAQs</CardTitle>
                                <CardDescription>Answer common questions about this service</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => faqs.append({ question: "", answer: "" })}>
                                <Plus size={14} className="mr-1" /> Add FAQ
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {faqs.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No FAQs added yet.</p>
                            )}
                            {faqs.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">FAQ {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => faqs.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <FormField label="Question">
                                        <Input {...register(`faqs.${idx}.question`)} />
                                    </FormField>
                                    <FormField label="Answer">
                                        <Textarea rows={3} {...register(`faqs.${idx}.answer`)} />
                                    </FormField>
                                </div>
                            ))}
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
                                <div>
                                    <p className="text-sm font-medium">Featured</p>
                                    <p className="text-xs text-muted-foreground">Highlight in homepage services grid</p>
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

export default ServiceForm;
