import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Star, FlagBanner, Eye, EyeSlash } from "@phosphor-icons/react";

import { careersAPI } from "@/api/careersApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { PageLoader } from "@/components/common/LoadingSpinner";
import TagInput from "@/components/common/TagInput";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { humanize, getFormErrorHandler } from "@/lib/utils";

const DEPARTMENTS = ["engineering", "design", "marketing", "hr", "finance", "operations", "sales", "management", "other"];
const TYPES = ["full_time", "part_time", "contract", "internship", "remote", "hybrid"];
const STATUSES = ["draft", "active", "paused", "closed", "filled"];
const LEVELS = ["entry", "junior", "mid", "senior", "lead", "principal", "executive"];

const schema = z.object({
    title: z.string().min(1, "Required"),
    department: z.enum(DEPARTMENTS),
    type: z.enum(TYPES),
    location: z.string().min(1, "Required"),
    isRemote: z.boolean(),
    experience: z.object({
        min: z.coerce.number().min(0),
        max: z.coerce.number().optional(),
        level: z.enum(LEVELS).optional(),
    }),
    salary: z.object({
        min: z.coerce.number().optional(),
        max: z.coerce.number().optional(),
        currency: z.string().optional(),
        isVisible: z.boolean(),
    }).optional(),
    description: z.string().min(1, "Required"),
    responsibilities: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    niceToHave: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    perks: z.array(z.string()).default([]),
    applicationDeadline: z.string().optional(),
    openings: z.coerce.number().min(1).default(1),
    status: z.enum(STATUSES),
    isFeatured: z.boolean().default(false),
    isUrgent: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
});

const CareerForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: existing, isLoading } = useQuery({
        queryKey: ["career", id],
        queryFn: () => careersAPI.getById(id).then((r) => r.data?.job || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "", department: "engineering", type: "full_time",
            location: "", isRemote: false,
            experience: { min: 0, max: 0, level: "mid" },
            salary: { min: 0, max: 0, currency: "INR", isVisible: false },
            description: "",
            responsibilities: [], requirements: [], niceToHave: [],
            skills: [], benefits: [], perks: [],
            applicationDeadline: "",
            openings: 1,
            status: "draft", isFeatured: false, isUrgent: false,
            tags: [],
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title || "",
                department: existing.department || "engineering",
                type: existing.type || "full_time",
                location: existing.location || "",
                isRemote: !!existing.isRemote,
                experience: {
                    min: existing.experience?.min || 0,
                    max: existing.experience?.max || 0,
                    level: existing.experience?.level || "mid",
                },
                salary: {
                    min: existing.salary?.min || 0,
                    max: existing.salary?.max || 0,
                    currency: existing.salary?.currency || "INR",
                    isVisible: !!existing.salary?.isVisible,
                },
                description: existing.description || "",
                responsibilities: existing.responsibilities || [],
                requirements: existing.requirements || [],
                niceToHave: existing.niceToHave || [],
                skills: existing.skills || [],
                benefits: existing.benefits || [],
                perks: existing.perks || [],
                applicationDeadline: existing.applicationDeadline ? existing.applicationDeadline.split("T")[0] : "",
                openings: existing.openings || 1,
                status: existing.status || "draft",
                isFeatured: !!existing.isFeatured,
                isUrgent: !!existing.isUrgent,
                tags: existing.tags || [],
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (payload) => isEdit ? careersAPI.update(id, payload) : careersAPI.create(payload),
        onSuccess: () => {
            toast.success(isEdit ? "Job updated" : "Job created");
            qc.invalidateQueries({ queryKey: ["careers"] });
            navigate("/careers");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Save failed"),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => mutation.mutate(data);

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Job" : "New Job"}
                description={isEdit ? "Update job posting details" : "Post a new opening"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/careers")}>
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
                    <TabsTrigger value="role">Role</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                    <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Basics</CardTitle>
                            <CardDescription>Title, department, location</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Title" required error={errors.title?.message} className="md:col-span-2">
                                <Input {...register("title")} placeholder="Senior Frontend Engineer" />
                            </FormField>
                            <FormField label="Department" required>
                                <Controller
                                    control={control}
                                    name="department"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{humanize(d)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
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
                            <FormField label="Location" required error={errors.location?.message}>
                                <Input {...register("location")} placeholder="Bengaluru, IN / Remote" />
                            </FormField>
                            <FormField label="Openings">
                                <Input type="number" {...register("openings")} min={1} />
                            </FormField>
                            <div className="md:col-span-2 flex items-center justify-between rounded-md border p-3">
                                <p className="text-sm">Remote-friendly</p>
                                <Controller control={control} name="isRemote" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                            <FormField label="Application Deadline" className="md:col-span-2">
                                <Input type="date" {...register("applicationDeadline")} />
                            </FormField>
                            <FormField label="Description" required error={errors.description?.message} className="md:col-span-2">
                                <Textarea rows={6} {...register("description")} placeholder="About the role..." />
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="role" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Min Years" required>
                                <Input type="number" {...register("experience.min")} min={0} />
                            </FormField>
                            <FormField label="Max Years">
                                <Input type="number" {...register("experience.max")} min={0} />
                            </FormField>
                            <FormField label="Seniority">
                                <Controller
                                    control={control}
                                    name="experience.level"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {LEVELS.map((l) => <SelectItem key={l} value={l}>{humanize(l)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Responsibilities & Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller control={control} name="responsibilities" render={({ field }) => <TagInput label="Responsibilities" value={field.value || []} onChange={field.onChange} placeholder="Add a responsibility and press Enter" max={20} />} />
                            <Controller control={control} name="requirements" render={({ field }) => <TagInput label="Requirements" value={field.value || []} onChange={field.onChange} placeholder="Add a requirement" max={20} />} />
                            <Controller control={control} name="niceToHave" render={({ field }) => <TagInput label="Nice to Have" value={field.value || []} onChange={field.onChange} placeholder="Add a bonus skill" max={20} />} />
                            <Controller control={control} name="skills" render={({ field }) => <TagInput label="Skills" value={field.value || []} onChange={field.onChange} placeholder="React, TypeScript..." />} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Benefits & Perks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller control={control} name="benefits" render={({ field }) => <TagInput label="Benefits" value={field.value || []} onChange={field.onChange} placeholder="Health insurance, PTO..." max={20} />} />
                            <Controller control={control} name="perks" render={({ field }) => <TagInput label="Perks" value={field.value || []} onChange={field.onChange} placeholder="Gym, Snacks, Stock options..." max={20} />} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller control={control} name="tags" render={({ field }) => <TagInput label="Tags" value={field.value || []} onChange={field.onChange} placeholder="Add a tag and press Enter" />} />
                        </CardContent>
                    </Card>                </TabsContent>

                <TabsContent value="compensation" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Range</CardTitle>
                            <CardDescription>Hide or show on the public listing</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Min">
                                <Input type="number" {...register("salary.min")} />
                            </FormField>
                            <FormField label="Max">
                                <Input type="number" {...register("salary.max")} />
                            </FormField>
                            <FormField label="Currency">
                                <Input {...register("salary.currency")} placeholder="INR" />
                            </FormField>
                            <div className="md:col-span-3 flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Eye size={18} weight="duotone" className="text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Show salary publicly</p>
                                        <p className="text-xs text-muted-foreground">Display the range on the job page</p>
                                    </div>
                                </div>
                                <Controller control={control} name="salary.isVisible" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
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
                            <Separator />
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <Star size={18} weight="duotone" className="text-amber-500" />
                                    <div>
                                        <p className="text-sm font-medium">Featured</p>
                                        <p className="text-xs text-muted-foreground">Pin to the top of careers page</p>
                                    </div>
                                </div>
                                <Controller control={control} name="isFeatured" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-3">
                                    <FlagBanner size={18} weight="duotone" className="text-rose-500" />
                                    <div>
                                        <p className="text-sm font-medium">Urgent</p>
                                        <p className="text-xs text-muted-foreground">Highlight as immediate hiring</p>
                                    </div>
                                </div>
                                <Controller control={control} name="isUrgent" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
};

export default CareerForm;
