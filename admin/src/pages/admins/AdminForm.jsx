import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, ShieldCheck } from "@phosphor-icons/react";

import { adminsAPI } from "@/api/adminsApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { humanize, getFormErrorHandler } from "@/lib/utils";

const ROLES = ["admin", "hr", "manager", "editor", "viewer"];

const PERMISSION_RESOURCES = [
    { key: "blogs", label: "Blogs", actions: ["create", "read", "update", "delete"] },
    { key: "articles", label: "Articles", actions: ["create", "read", "update", "delete"] },
    { key: "portfolios", label: "Portfolios", actions: ["create", "read", "update", "delete"] },
    { key: "caseStudies", label: "Case Studies", actions: ["create", "read", "update", "delete"] },
    { key: "testimonials", label: "Testimonials", actions: ["create", "read", "update", "delete"] },
    { key: "employees", label: "Employees", actions: ["create", "read", "update", "delete"] },
    { key: "projects", label: "Projects", actions: ["create", "read", "update", "delete"] },
    { key: "careers", label: "Careers", actions: ["create", "read", "update", "delete"] },
    { key: "services", label: "Services", actions: ["create", "read", "update", "delete"] },
    { key: "resources", label: "Resources", actions: ["create", "read", "update", "delete"] },
    { key: "emails", label: "Emails", actions: ["send"] },
    { key: "contacts", label: "Contacts", actions: ["read", "delete"] },
    { key: "auditLogs", label: "Audit Logs", actions: ["read"] },
];

const buildEmpty = () => {
    const out = {};
    PERMISSION_RESOURCES.forEach((r) => {
        out[r.key] = {};
        r.actions.forEach((a) => (out[r.key][a] = false));
    });
    return out;
};

const schema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    department: z.string().optional(),
    role: z.enum(["admin", "hr", "manager", "editor", "viewer"]),
    isActive: z.boolean(),
    permissions: z.any(),
});

const AdminForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: existing, isLoading } = useQuery({
        queryKey: ["admin", id],
        queryFn: () => adminsAPI.getById(id).then((r) => r.data?.admin || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "", lastName: "", email: "", phone: "", department: "",
            role: "admin", isActive: true, permissions: buildEmpty(),
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                firstName: existing.firstName || "",
                lastName: existing.lastName || "",
                email: existing.email || "",
                phone: existing.phone || "",
                department: existing.department || "",
                role: existing.role || "admin",
                isActive: existing.isActive !== false,
                permissions: { ...buildEmpty(), ...(existing.permissions || {}) },
            });
        }
    }, [existing, reset]);

    const role = watch("role");
    const permissions = watch("permissions");

    const mutation = useMutation({
        mutationFn: (payload) => isEdit ? adminsAPI.update(id, payload) : adminsAPI.create(payload),
        onSuccess: (res) => {
            const data = res.data;
            toast.success(data.message || (isEdit ? "Admin updated" : "Admin created"));
            
            if (data.emailSent === false && data.tempPassword) {
                // If email failed, show a persistent alert or stay on page
                alert(`IMPORTANT: Welcome email could not be sent. \n\nPlease provide this temporary password to the user: ${data.tempPassword}`);
            }

            qc.invalidateQueries({ queryKey: ["admins"] });
            navigate("/admins");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Save failed"),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting admin form:", data);
        mutation.mutate({ ...data });
    };

    const setAll = (resource, value) => {
        const current = { ...permissions };
        const r = PERMISSION_RESOURCES.find((x) => x.key === resource);
        r?.actions.forEach((a) => {
            current[resource] = { ...current[resource], [a]: value };
        });
        setValue("permissions", current, { shouldDirty: true });
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Admin" : "New Admin"}
                description={isEdit ? "Update profile, role, and permissions" : "Create a new admin account"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/admins")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            <FloppyDisk size={15} className="mr-1.5" /> {mutation.isPending ? "Saving..." : "Save"}
                        </Button>
                    </>
                }
            />

            <Tabs defaultValue="profile">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="access">Role & Access</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="First Name" required error={errors.firstName?.message}>
                                <Input {...register("firstName")} placeholder="John" />
                            </FormField>
                            <FormField label="Last Name" required error={errors.lastName?.message}>
                                <Input {...register("lastName")} placeholder="Doe" />
                            </FormField>
                            <FormField label="Email" required error={errors.email?.message}>
                                <Input type="email" {...register("email")} placeholder="admin@enovalis.com" disabled={isEdit} />
                            </FormField>
                            <FormField label="Phone" error={errors.phone?.message}>
                                <Input {...register("phone")} placeholder="+91 98765 43210" />
                            </FormField>
                            <FormField label="Department" hint="e.g. Engineering, HR" className="md:col-span-2">
                                <Input {...register("department")} placeholder="Engineering" />
                            </FormField>
                        </CardContent>
                    </Card>

                </TabsContent>

                <TabsContent value="access" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role</CardTitle>
                            <CardDescription>Determines default permissions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Role" required>
                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {ROLES.map((r) => (
                                                    <SelectItem key={r} value={r}>{humanize(r)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <div className="rounded-md border bg-muted/30 p-4">
                                <p className="text-sm font-medium capitalize mb-1">{humanize(role)} default permissions</p>
                                <p className="text-xs text-muted-foreground">
                                    Switching role does not auto-update individual permissions below — adjust them manually if needed.
                                </p>
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div>
                                    <p className="text-sm font-medium">Active</p>
                                    <p className="text-xs text-muted-foreground">Inactive admins cannot sign in</p>
                                </div>
                                <Controller
                                    control={control}
                                    name="isActive"
                                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Granular Permissions</CardTitle>
                            <CardDescription>Override role defaults per resource</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {PERMISSION_RESOURCES.map((res) => (
                                    <div key={res.key} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={18} weight="duotone" className="text-primary" />
                                            <div>
                                                <p className="text-sm font-medium">{res.label}</p>
                                                <button type="button" onClick={() => setAll(res.key, true)} className="text-[11px] text-primary hover:underline mr-2">
                                                    Allow all
                                                </button>
                                                <button type="button" onClick={() => setAll(res.key, false)} className="text-[11px] text-muted-foreground hover:underline">
                                                    Revoke all
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {res.actions.map((action) => (
                                                <label key={action} className="inline-flex items-center gap-1.5 cursor-pointer">
                                                    <Checkbox
                                                        checked={!!permissions?.[res.key]?.[action]}
                                                        onCheckedChange={(v) => {
                                                            const next = { ...permissions };
                                                            next[res.key] = { ...(next[res.key] || {}), [action]: !!v };
                                                            setValue("permissions", next, { shouldDirty: true });
                                                        }}
                                                    />
                                                    <Label className="text-xs capitalize cursor-pointer">{action}</Label>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
};

export default AdminForm;
