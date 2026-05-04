import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Plus, Trash } from "@phosphor-icons/react";

import { projectsAPI } from "@/api/projectsApi";
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
import { humanize, buildFormData, getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = ["web_development", "mobile_app", "ui_ux", "branding", "ecommerce", "saas", "enterprise", "consulting", "other"];
const STATUSES = ["planning", "in_progress", "review", "on_hold", "completed", "cancelled", "delivered"];
const PRIORITIES = ["low", "medium", "high", "critical"];
const MILESTONE_STATUSES = ["pending", "in_progress", "completed", "delayed"];

const schema = z.object({
    name: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    client: z.string().min(1, "Required"),
    clientContact: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
    category: z.enum(CATEGORIES),
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    startDate: z.string().min(1, "Required"),
    estimatedEndDate: z.string().optional(),
    actualEndDate: z.string().optional(),
    budget: z.object({
        estimated: z.coerce.number().optional(),
        actual: z.coerce.number().optional(),
        currency: z.string().optional(),
    }).optional(),
    technologies: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    progress: z.coerce.number().min(0).max(100),
    isPublic: z.boolean(),
    milestones: z.array(z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        status: z.enum(MILESTONE_STATUSES).optional(),
    })).optional(),
});

const ProjectForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: existing, isLoading } = useQuery({
        queryKey: ["project", id],
        queryFn: () => projectsAPI.getById(id).then((r) => r.data?.project || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "", description: "", client: "",
            clientContact: { name: "", email: "", phone: "" },
            category: "web_development", status: "planning", priority: "medium",
            startDate: "", estimatedEndDate: "", actualEndDate: "",
            budget: { estimated: 0, actual: 0, currency: "INR" },
            technologies: [], tags: [],
            progress: 0, isPublic: false,
            milestones: [],
        },
    });

    const milestones = useFieldArray({ control, name: "milestones" });

    useEffect(() => {
        if (existing) {
            reset({
                name: existing.name || "",
                description: existing.description || "",
                client: existing.client || "",
                clientContact: {
                    name: existing.clientContact?.name || "",
                    email: existing.clientContact?.email || "",
                    phone: existing.clientContact?.phone || "",
                },
                category: existing.category || "web_development",
                status: existing.status || "planning",
                priority: existing.priority || "medium",
                startDate: existing.startDate ? existing.startDate.split("T")[0] : "",
                estimatedEndDate: existing.estimatedEndDate ? existing.estimatedEndDate.split("T")[0] : "",
                actualEndDate: existing.actualEndDate ? existing.actualEndDate.split("T")[0] : "",
                budget: {
                    estimated: existing.budget?.estimated || 0,
                    actual: existing.budget?.actual || 0,
                    currency: existing.budget?.currency || "INR",
                },
                technologies: existing.technologies || [],
                tags: existing.tags || [],
                progress: existing.progress || 0,
                isPublic: !!existing.isPublic,
                milestones: (existing.milestones || []).map((m) => ({
                    ...m,
                    dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split("T")[0] : "",
                })),
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (data) => {
            const fd = buildFormData(data);
            return isEdit ? projectsAPI.update(id, fd) : projectsAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Project updated" : "Project created");
            qc.invalidateQueries({ queryKey: ["projects"] });
            navigate("/projects");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the project. Please check the form and try again.")),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting project form:", data);
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Project" : "New Project"}
                description={isEdit ? "Update project details" : "Kick off a new project"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/projects")}>
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
                    <TabsTrigger value="client">Client & Budget</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="meta">Meta</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>Name, description, and category</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Project Name" required error={errors.name?.message} className="md:col-span-2">
                                <Input {...register("name")} placeholder="Acme E-commerce Revamp" />
                            </FormField>
                            <FormField label="Description" required error={errors.description?.message} className="md:col-span-2">
                                <Textarea rows={4} {...register("description")} />
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
                            <FormField label="Priority" required>
                                <Controller
                                    control={control}
                                    name="priority"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{humanize(p)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
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
                            <FormField label="Progress %" hint="0–100">
                                <Input type="number" min={0} max={100} {...register("progress")} />
                            </FormField>
                            <FormField label="Start Date" required error={errors.startDate?.message}>
                                <Input type="date" {...register("startDate")} />
                            </FormField>
                            <FormField label="Estimated End Date">
                                <Input type="date" {...register("estimatedEndDate")} />
                            </FormField>
                            <FormField label="Actual End Date" className="md:col-span-2">
                                <Input type="date" {...register("actualEndDate")} />
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="client" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Client Name" required error={errors.client?.message} className="md:col-span-2">
                                <Input {...register("client")} placeholder="Acme Corporation" />
                            </FormField>
                            <FormField label="Contact Name">
                                <Input {...register("clientContact.name")} />
                            </FormField>
                            <FormField label="Contact Email">
                                <Input type="email" {...register("clientContact.email")} />
                            </FormField>
                            <FormField label="Contact Phone" className="md:col-span-2">
                                <Input {...register("clientContact.phone")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Estimated">
                                <Input type="number" {...register("budget.estimated")} />
                            </FormField>
                            <FormField label="Actual">
                                <Input type="number" {...register("budget.actual")} />
                            </FormField>
                            <FormField label="Currency">
                                <Input {...register("budget.currency")} placeholder="INR" />
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Milestones</CardTitle>
                                <CardDescription>Major checkpoints in the project</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => milestones.append({ title: "", description: "", dueDate: "", status: "pending" })}>
                                <Plus size={14} className="mr-1" /> Add Milestone
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {milestones.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No milestones added yet.</p>
                            )}
                            {milestones.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Milestone {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => milestones.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <FormField label="Title" className="md:col-span-2">
                                            <Input {...register(`milestones.${idx}.title`)} />
                                        </FormField>
                                        <FormField label="Status">
                                            <Controller
                                                control={control}
                                                name={`milestones.${idx}.status`}
                                                render={({ field: f }) => (
                                                    <Select value={f.value} onValueChange={f.onChange}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {MILESTONE_STATUSES.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>
                                        <FormField label="Due Date" className="md:col-span-3">
                                            <Input type="date" {...register(`milestones.${idx}.dueDate`)} />
                                        </FormField>
                                        <FormField label="Description" className="md:col-span-3">
                                            <Textarea rows={2} {...register(`milestones.${idx}.description`)} />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="meta" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags & Stack</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller control={control} name="technologies" render={({ field }) => <TagInput label="Technologies" value={field.value || []} onChange={field.onChange} placeholder="React, Node.js..." />} />
                            <Controller control={control} name="tags" render={({ field }) => <TagInput label="Tags" value={field.value || []} onChange={field.onChange} />} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-4" />
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div>
                                    <p className="text-sm font-medium">Public</p>
                                    <p className="text-xs text-muted-foreground">Visible on the public portfolio</p>
                                </div>
                                <Controller control={control} name="isPublic" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
};

export default ProjectForm;
