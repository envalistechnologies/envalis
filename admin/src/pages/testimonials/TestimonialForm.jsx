import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Star, ShieldCheck, Trophy } from "@phosphor-icons/react";

import { testimonialsAPI } from "@/api/testimonialsApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { PageLoader } from "@/components/common/LoadingSpinner";
import ImageUploader from "@/components/common/ImageUploader";
import TagInput from "@/components/common/TagInput";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { humanize, buildFormData, getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = ["general", "web_development", "mobile_app", "design", "consulting", "support", "other"];
const STATUSES = ["pending", "approved", "rejected", "archived"];
const SOURCES = ["direct", "google", "linkedin", "clutch", "goodfirms", "other"];

const normalizeEnum = (value, allowed) => {
    if (!value) return "";
    const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
    return allowed.includes(normalized) ? normalized : "";
};

const schema = z.object({
    clientName: z.string().min(1, "Required"),
    clientDesignation: z.string().min(1, "Required"),
    clientCompany: z.string().min(1, "Required"),
    clientWebsite: z.string().optional(),
    clientLocation: z.string().optional(),
    rating: z.coerce.number().min(1).max(5),
    quote: z.string().min(1, "Required").max(1000),
    shortQuote: z.string().max(200).optional(),
    category: z.preprocess((val) => normalizeEnum(val, CATEGORIES) || "general", z.enum(CATEGORIES)),
    source: z.preprocess((val) => normalizeEnum(val, SOURCES) || "direct", z.enum(SOURCES)),
    sourceUrl: z.string().optional(),
    status: z.preprocess((val) => normalizeEnum(val, STATUSES) || "pending", z.enum(STATUSES)),
    isVerified: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isTopRated: z.boolean().default(false),
    order: z.coerce.number().optional(),
    tags: z.array(z.string()).default([]),
});

const RatingPicker = ({ value, onChange }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => onChange(i)} className="hover:scale-110 transition-transform">
                <Star size={28} weight={i <= value ? "fill" : "regular"} className={i <= value ? "text-amber-500" : "text-muted-foreground"} />
            </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
    </div>
);

const TestimonialForm = () => {
    const { id } = useParams();
    const isEdit = !!id && id !== "new";
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [avatarFile, setAvatarFile] = useState(null);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["testimonial", id],
        queryFn: () => testimonialsAPI.getById(id).then((r) => r.data?.testimonial || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            clientName: "", clientDesignation: "", clientCompany: "",
            clientWebsite: "", clientLocation: "",
            rating: 5, quote: "", shortQuote: "",
            category: "general", source: "direct", sourceUrl: "",
            status: "pending",
            isVerified: false, isFeatured: false, isTopRated: false,
            order: 0, tags: [],
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                clientName: existing.clientName || "",
                clientDesignation: existing.clientDesignation || "",
                clientCompany: existing.clientCompany || "",
                clientWebsite: existing.clientWebsite || "",
                clientLocation: existing.clientLocation || "",
                rating: existing.rating || 5,
                quote: existing.quote || "",
                shortQuote: existing.shortQuote || "",
                category: normalizeEnum(existing.category, CATEGORIES) || "general",
                source: normalizeEnum(existing.source, SOURCES) || "direct",
                sourceUrl: existing.sourceUrl || "",
                status: normalizeEnum(existing.status, STATUSES) || "pending",
                isVerified: !!existing.isVerified,
                isFeatured: !!existing.isFeatured,
                isTopRated: !!existing.isTopRated,
                order: existing.order || 0,
                tags: existing.tags || [],
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (payload) => {
            const fd = buildFormData(payload);
            if (avatarFile) fd.append("clientAvatar", avatarFile);
            return isEdit ? testimonialsAPI.update(id, fd) : testimonialsAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Testimonial updated" : "Testimonial created");
            qc.invalidateQueries({ queryKey: ["testimonials"] });
            if (isEdit) qc.invalidateQueries({ queryKey: ["testimonial", id] });
            navigate("/testimonials");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Save failed"),
            onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the testimonial. Please check the form and try again.")),
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the testimonial. Please check the form and try again.")),
    });

    const getFirstErrorMessage = (errs) => {
        const queue = [errs];
        while (queue.length) {
            const cur = queue.shift();
            if (!cur) continue;
            if (cur.message) return cur.message;
            if (Array.isArray(cur)) {
                queue.push(...cur);
            } else if (typeof cur === "object") {
                queue.push(...Object.values(cur));
            }
        }
        return "Please check required fields.";
    };

    const onSubmit = (data) => {
        const payload = {
            ...data,
            category: normalizeEnum(data.category, CATEGORIES) || "general",
            source: normalizeEnum(data.source, SOURCES) || "direct",
            status: normalizeEnum(data.status, STATUSES) || "pending",
        };
        mutation.mutate(payload);
    };

    const onInvalid = (errs) => toast.error(getFirstErrorMessage(errs));

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Testimonial" : "New Testimonial"}
                description={isEdit ? "Update client review" : "Capture a new client review"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/testimonials")}>
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
                    <TabsTrigger value="client">Client</TabsTrigger>
                    <TabsTrigger value="meta">Meta & Visibility</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>The Review</CardTitle>
                            <CardDescription>Quote and rating from the client</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Rating" required error={errors.rating?.message}>
                                <Controller
                                    control={control}
                                    name="rating"
                                    render={({ field }) => <RatingPicker value={field.value} onChange={field.onChange} />}
                                />
                            </FormField>
                            <FormField label="Full Quote" required hint="Max 1000 characters" error={errors.quote?.message}>
                                <Textarea rows={5} {...register("quote")} placeholder="What did the client say..." />
                            </FormField>
                            <FormField label="Short Quote" hint="Max 200 characters — used in carousels" error={errors.shortQuote?.message}>
                                <Textarea rows={2} {...register("shortQuote")} placeholder="A condensed version..." />
                            </FormField>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Category">
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
                                <FormField label="Source">
                                    <Controller
                                        control={control}
                                        name="source"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {SOURCES.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </FormField>
                                <FormField label="Source URL" className="md:col-span-2">
                                    <Input {...register("sourceUrl")} placeholder="https://..." />
                                </FormField>
                            </div>
                            <Controller
                                control={control}
                                name="tags"
                                render={({ field }) => <TagInput label="Tags" value={field.value || []} onChange={field.onChange} />}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="client" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <ImageUploader
                                    label="Avatar"
                                    value={avatarFile}
                                    onChange={setAvatarFile}
                                    existingUrl={existing?.clientAvatar?.url}
                                    aspect="1/1"
                                    description="Square image"
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Full Name" required error={errors.clientName?.message}>
                                    <Input {...register("clientName")} placeholder="Jane Doe" />
                                </FormField>
                                <FormField label="Designation" required error={errors.clientDesignation?.message}>
                                    <Input {...register("clientDesignation")} placeholder="CTO" />
                                </FormField>
                                <FormField label="Company" required error={errors.clientCompany?.message} className="md:col-span-2">
                                    <Input {...register("clientCompany")} placeholder="Acme Corp" />
                                </FormField>
                                <FormField label="Website">
                                    <Input {...register("clientWebsite")} placeholder="https://acme.com" />
                                </FormField>
                                <FormField label="Location">
                                    <Input {...register("clientLocation")} placeholder="San Francisco, USA" />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="meta" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
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
                            <FormField label="Display Order">
                                <Input type="number" {...register("order")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Flags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} weight="duotone" className="text-emerald-500" />
                                    <div>
                                        <p className="text-sm font-medium">Verified</p>
                                        <p className="text-xs text-muted-foreground">Confirmed via direct contact</p>
                                    </div>
                                </div>
                                <Controller control={control} name="isVerified" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Star size={18} weight="duotone" className="text-amber-500" />
                                    <div>
                                        <p className="text-sm font-medium">Featured</p>
                                        <p className="text-xs text-muted-foreground">Show on homepage carousel</p>
                                    </div>
                                </div>
                                <Controller control={control} name="isFeatured" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Trophy size={18} weight="duotone" className="text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">Top Rated</p>
                                        <p className="text-xs text-muted-foreground">Promote in 'best of' selections</p>
                                    </div>
                                </div>
                                <Controller control={control} name="isTopRated" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
};

export default TestimonialForm;
