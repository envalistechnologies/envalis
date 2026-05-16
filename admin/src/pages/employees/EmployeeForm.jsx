import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Plus, Trash } from "@phosphor-icons/react";

import { employeesAPI } from "@/api/employeesApi";
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
import { Separator } from "@/components/ui/separator";
import { humanize, buildFormData, getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";

const DEPARTMENTS = ["engineering", "design", "marketing", "hr", "finance", "operations", "sales", "management", "other"];
const STATUSES = ["active", "on_leave", "resigned", "terminated", "retired"];
const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "intern"];
const GENDERS = ["male", "female", "other", "prefer_not_to_say"];

const schema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    personalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    alternatePhone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    department: z.enum(DEPARTMENTS),
    designation: z.string().min(1, "Required"),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    joiningDate: z.string().min(1, "Required"),
    probationEndDate: z.string().optional(),
    confirmationDate: z.string().optional(),
    exitDate: z.string().optional(),
    isActive: z.boolean(),
    status: z.enum(STATUSES),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        pincode: z.string().optional(),
    }).optional(),
    emergencyContact: z.object({
        name: z.string().optional(),
        relation: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
    salary: z.object({
        basic: z.coerce.number().optional(),
        hra: z.coerce.number().optional(),
        allowances: z.coerce.number().optional(),
        deductions: z.coerce.number().optional(),
        currency: z.string().optional(),
    }).optional(),
    skills: z.array(z.string()).optional(),
    education: z.array(z.object({
        degree: z.string().optional(),
        institution: z.string().optional(),
        year: z.coerce.number().optional(),
        grade: z.string().optional(),
    })).optional(),
    notes: z.string().optional(),
});

const EmployeeForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [avatarFile, setAvatarFile] = useState(null);
    const [removedAvatar, setRemovedAvatar] = useState(false);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["employee", id],
        queryFn: () => employeesAPI.getById(id).then((r) => r.data?.employee || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "", lastName: "", email: "", personalEmail: "", phone: "", alternatePhone: "",
            dateOfBirth: "", gender: "",
            department: "engineering", designation: "", employmentType: "full_time",
            joiningDate: "", probationEndDate: "", confirmationDate: "", exitDate: "",
            isActive: true, status: "active",
            address: { street: "", city: "", state: "", country: "", pincode: "" },
            emergencyContact: { name: "", relation: "", phone: "" },
            salary: { basic: 0, hra: 0, allowances: 0, deductions: 0, currency: "INR" },
            skills: [],
            education: [],
            notes: "",
        },
    });

    const education = useFieldArray({ control, name: "education" });

    useEffect(() => {
        if (existing) {
            reset({
                firstName: existing.firstName || "",
                lastName: existing.lastName || "",
                email: existing.email || "",
                personalEmail: existing.personalEmail || "",
                phone: existing.phone || "",
                alternatePhone: existing.alternatePhone || "",
                dateOfBirth: existing.dateOfBirth ? existing.dateOfBirth.split("T")[0] : "",
                gender: existing.gender || "",
                department: existing.department || "engineering",
                designation: existing.designation || "",
                employmentType: existing.employmentType || "full_time",
                joiningDate: existing.joiningDate ? existing.joiningDate.split("T")[0] : "",
                probationEndDate: existing.probationEndDate ? existing.probationEndDate.split("T")[0] : "",
                confirmationDate: existing.confirmationDate ? existing.confirmationDate.split("T")[0] : "",
                exitDate: existing.exitDate ? existing.exitDate.split("T")[0] : "",
                isActive: existing.isActive !== false,
                status: existing.status || "active",
                address: {
                    street: existing.address?.street || "",
                    city: existing.address?.city || "",
                    state: existing.address?.state || "",
                    country: existing.address?.country || "",
                    pincode: existing.address?.pincode || "",
                },
                emergencyContact: {
                    name: existing.emergencyContact?.name || "",
                    relation: existing.emergencyContact?.relation || "",
                    phone: existing.emergencyContact?.phone || "",
                },
                salary: {
                    basic: existing.salary?.basic || 0,
                    hra: existing.salary?.hra || 0,
                    allowances: existing.salary?.allowances || 0,
                    deductions: existing.salary?.deductions || 0,
                    currency: existing.salary?.currency || "INR",
                },
                skills: existing.skills || [],
                education: existing.education || [],
                notes: existing.notes || "",
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: (payload) => {
            const fd = buildFormData(payload);
            if (avatarFile) fd.append("avatar", avatarFile);
            if (removedAvatar && !avatarFile) fd.append("removeAvatar", "true");
            return isEdit ? employeesAPI.update(id, fd) : employeesAPI.create(fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Employee updated" : "Employee created");
            qc.invalidateQueries({ queryKey: ["employees"] });
            navigate("/employees");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Save failed"),
            onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the employee. Please check the form and try again.")),
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the employee. Please check the form and try again.")),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Submitting employee form:", data);
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Employee" : "New Employee"}
                description={isEdit ? "Update profile, role, and compensation" : "Onboard a new employee"}
                showBack
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/employees")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            <FloppyDisk size={15} className="mr-1.5" /> {mutation.isPending ? "Saving..." : "Save"}
                        </Button>
                    </>
                }
            />

            <Tabs defaultValue="personal">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="job">Job</TabsTrigger>
                    <TabsTrigger value="address">Address & Emergency</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Education</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Personal details and avatar</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <ImageUploader
                                    label="Avatar"
                                    value={avatarFile}
                                    onChange={(f) => { setAvatarFile(f); if (f) setRemovedAvatar(false); }}
                                    existingUrl={existing?.avatar?.url}
                                    onRemoveExisting={() => setRemovedAvatar(true)}
                                    aspect="1/1"
                                    description="Square image, up to 5MB"
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="First Name" required error={errors.firstName?.message}>
                                    <Input {...register("firstName")} placeholder="John" />
                                </FormField>
                                <FormField label="Last Name" required error={errors.lastName?.message}>
                                    <Input {...register("lastName")} placeholder="Doe" />
                                </FormField>
                                <FormField label="Work Email" required error={errors.email?.message}>
                                    <Input type="email" {...register("email")} placeholder="john@envalis.com" disabled={isEdit} />
                                </FormField>
                                <FormField label="Personal Email" error={errors.personalEmail?.message}>
                                    <Input type="email" {...register("personalEmail")} placeholder="john@gmail.com" />
                                </FormField>
                                <FormField label="Phone">
                                    <Input {...register("phone")} placeholder="+91 98765 43210" />
                                </FormField>
                                <FormField label="Alternate Phone">
                                    <Input {...register("alternatePhone")} placeholder="Optional" />
                                </FormField>
                                <FormField label="Date of Birth">
                                    <Input type="date" {...register("dateOfBirth")} />
                                </FormField>
                                <FormField label="Gender">
                                    <Controller
                                        control={control}
                                        name="gender"
                                        render={({ field }) => (
                                            <Select value={field.value || ""} onValueChange={field.onChange}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {GENDERS.map((g) => <SelectItem key={g} value={g}>{humanize(g)}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="job" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <CardDescription>Department, role, and employment timeline</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <FormField label="Designation" required error={errors.designation?.message}>
                                <Input {...register("designation")} placeholder="Senior Software Engineer" />
                            </FormField>
                            <FormField label="Employment Type" required>
                                <Controller
                                    control={control}
                                    name="employmentType"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{humanize(t)}</SelectItem>)}
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
                            <FormField label="Joining Date" required error={errors.joiningDate?.message}>
                                <Input type="date" {...register("joiningDate")} />
                            </FormField>
                            <FormField label="Probation End">
                                <Input type="date" {...register("probationEndDate")} />
                            </FormField>
                            <FormField label="Confirmation Date">
                                <Input type="date" {...register("confirmationDate")} />
                            </FormField>
                            <FormField label="Exit Date">
                                <Input type="date" {...register("exitDate")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div>
                                    <p className="text-sm font-medium">Active</p>
                                    <p className="text-xs text-muted-foreground">Inactive employees are excluded from rosters</p>
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

                <TabsContent value="address" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Address</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Street" className="md:col-span-2">
                                <Input {...register("address.street")} />
                            </FormField>
                            <FormField label="City">
                                <Input {...register("address.city")} />
                            </FormField>
                            <FormField label="State">
                                <Input {...register("address.state")} />
                            </FormField>
                            <FormField label="Country">
                                <Input {...register("address.country")} />
                            </FormField>
                            <FormField label="Pincode">
                                <Input {...register("address.pincode")} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Name">
                                <Input {...register("emergencyContact.name")} />
                            </FormField>
                            <FormField label="Relation">
                                <Input {...register("emergencyContact.relation")} placeholder="Spouse, Parent..." />
                            </FormField>
                            <FormField label="Phone">
                                <Input {...register("emergencyContact.phone")} />
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compensation" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Components</CardTitle>
                            <CardDescription>Monthly compensation breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Basic">
                                <Input type="number" {...register("salary.basic")} />
                            </FormField>
                            <FormField label="HRA">
                                <Input type="number" {...register("salary.hra")} />
                            </FormField>
                            <FormField label="Allowances">
                                <Input type="number" {...register("salary.allowances")} />
                            </FormField>
                            <FormField label="Deductions">
                                <Input type="number" {...register("salary.deductions")} />
                            </FormField>
                            <FormField label="Currency">
                                <Input {...register("salary.currency")} placeholder="INR" />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Internal Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea rows={4} {...register("notes")} placeholder="Internal HR notes..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                control={control}
                                name="skills"
                                render={({ field }) => (
                                    <TagInput value={field.value || []} onChange={field.onChange} placeholder="Add a skill and press Enter" />
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Education</CardTitle>
                                <CardDescription>Academic qualifications</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => education.append({ degree: "", institution: "", year: "", grade: "" })}>
                                <Plus size={14} className="mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {education.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No education records added.</p>
                            )}
                            {education.fields.map((field, idx) => (
                                <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Entry {idx + 1}</p>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => education.remove(idx)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <FormField label="Degree">
                                            <Input {...register(`education.${idx}.degree`)} placeholder="B.Tech, M.Sc..." />
                                        </FormField>
                                        <FormField label="Institution">
                                            <Input {...register(`education.${idx}.institution`)} />
                                        </FormField>
                                        <FormField label="Year">
                                            <Input type="number" {...register(`education.${idx}.year`)} />
                                        </FormField>
                                        <FormField label="Grade">
                                            <Input {...register(`education.${idx}.grade`)} placeholder="8.5 CGPA / First Class" />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
};

export default EmployeeForm;
