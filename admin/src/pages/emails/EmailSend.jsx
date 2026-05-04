import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
    PaperPlaneTilt, X, Users, User, FileText, Eye, Code, Tag,
} from "@phosphor-icons/react";

import { emailsAPI } from "@/api/emailsApi";
import { employeesAPI } from "@/api/employeesApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import TagInput from "@/components/common/TagInput";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { humanize } from "@/lib/utils";

const CATEGORIES = ["welcome", "announcement", "newsletter", "hr_notice", "policy", "event", "recognition", "reminder", "other"];
const DEPARTMENTS = ["engineering", "design", "marketing", "hr", "finance", "operations", "sales", "management", "other"];
const MODES = [
    { value: "direct", label: "Direct email", Icon: User, description: "Send a one-off email to specific addresses" },
    { value: "bulk", label: "Bulk to employees", Icon: Users, description: "Send to all or a department of employees" },
    { value: "template", label: "From template", Icon: FileText, description: "Use a saved template with variables" },
];

const directSchema = z.object({
    to: z.array(z.string().email("Invalid email")).min(1, "At least one recipient"),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    subject: z.string().min(1, "Required"),
    html: z.string().min(1, "Body is required"),
    text: z.string().optional(),
    category: z.enum(CATEGORIES),
});

const extractVars = (html = "") => {
    const re = /\{\{\s*([\w.]+)\s*\}\}/g;
    const set = new Set();
    let m;
    while ((m = re.exec(html)) !== null) set.add(m[1]);
    return Array.from(set);
};
const renderLocal = (html, vars) =>
    (html || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);

const EmailSend = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const initialTemplateId = params.get("templateId");

    const [mode, setMode] = useState(initialTemplateId ? "template" : "direct");
    const [templateId, setTemplateId] = useState(initialTemplateId || "");
    const [templateVars, setTemplateVars] = useState({});
    const [bulkScope, setBulkScope] = useState("all");
    const [bulkDepartment, setBulkDepartment] = useState("");
    const [bulkEmployeeIds, setBulkEmployeeIds] = useState([]);
    const [bulkUseTemplate, setBulkUseTemplate] = useState(false);

    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
        resolver: zodResolver(directSchema),
        defaultValues: { to: [], cc: [], bcc: [], subject: "", html: "", text: "", category: "other" },
    });

    const html = watch("html");
    const subject = watch("subject");

    const templatesQ = useQuery({
        queryKey: ["email-templates", "all-active"],
        queryFn: () => emailsAPI.getTemplates({ isActive: "true", limit: 100 }).then((r) => r.data),
    });

    const templateQ = useQuery({
        queryKey: ["email-template", templateId],
        queryFn: () => emailsAPI.getTemplateById(templateId).then((r) => r.data?.template || r.data),
        enabled: !!templateId,
    });

    const employeesQ = useQuery({
        queryKey: ["employees", "for-email", bulkDepartment],
        queryFn: () => employeesAPI.getAll({ limit: 200, department: bulkDepartment, isActive: "true" }).then((r) => r.data),
        enabled: mode === "bulk" && bulkScope === "selected",
    });

    const tplVariables = useMemo(() => {
        if (!templateQ.data) return [];
        const fromMeta = (templateQ.data.variables || []).map((v) => v.key);
        if (fromMeta.length) return fromMeta;
        return extractVars(`${templateQ.data.subject || ""} ${templateQ.data.htmlContent || ""}`);
    }, [templateQ.data]);

    useEffect(() => {
        if (templateQ.data) {
            const init = {};
            tplVariables.forEach((k) => { init[k] = templateVars[k] || ""; });
            setTemplateVars(init);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateQ.data?._id, tplVariables.join("|")]);

    const directMutation = useMutation({
        mutationFn: (data) => emailsAPI.sendDirect(data),
        onSuccess: () => {
            toast.success("Email sent successfully");
            navigate("/emails/logs");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Send failed"),
    });

    const templateMutation = useMutation({
        mutationFn: (data) => emailsAPI.sendTemplate(data),
        onSuccess: () => {
            toast.success("Template email sent successfully");
            navigate("/emails/logs");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Send failed"),
    });

    const bulkMutation = useMutation({
        mutationFn: (data) => emailsAPI.sendBulk(data),
        onSuccess: (res) => {
            toast.success(res?.data?.message || "Bulk email sent");
            navigate("/emails/logs");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Bulk send failed"),
    });

    const onDirectSubmit = (data) => directMutation.mutate(data);

    const onTemplateSubmit = (data) => {
        if (!templateId) return toast.error("Pick a template first");
        if (!data.to?.length) return toast.error("Add at least one recipient");
        templateMutation.mutate({
            templateId,
            to: data.to,
            cc: data.cc,
            bcc: data.bcc,
            variables: templateVars,
        });
    };

    const onBulkSubmit = () => {
        const payload = { category: watch("category") };
        if (bulkScope === "department") {
            if (!bulkDepartment) return toast.error("Pick a department");
            payload.department = bulkDepartment;
        } else if (bulkScope === "selected") {
            if (!bulkEmployeeIds.length) return toast.error("Select at least one employee");
            payload.employeeIds = bulkEmployeeIds;
        }

        if (bulkUseTemplate) {
            if (!templateId) return toast.error("Pick a template");
            payload.templateId = templateId;
            payload.variables = templateVars;
        } else {
            const subj = watch("subject");
            const body = watch("html");
            if (!subj || !body) return toast.error("Subject and body are required");
            payload.subject = subj;
            payload.html = body;
            payload.text = watch("text");
        }
        bulkMutation.mutate(payload);
    };

    const isPending = directMutation.isPending || templateMutation.isPending || bulkMutation.isPending;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Send Email"
                description="Compose and dispatch direct, bulk, or template-based emails"
                showBack
                backPath="/emails/logs"
                actions={
                    <Button variant="outline" onClick={() => navigate("/emails/templates")}>
                        <FileText size={15} className="mr-1.5" /> Manage templates
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MODES.map((m) => {
                    const Icon = m.Icon;
                    const isActive = mode === m.value;
                    return (
                        <button
                            type="button"
                            key={m.value}
                            onClick={() => setMode(m.value)}
                            className={`text-left rounded-lg border p-4 transition-colors ${isActive ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/40"}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`size-9 rounded-md grid place-items-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                                    <Icon size={16} weight="duotone" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">{m.label}</p>
                                    <p className="text-xs text-muted-foreground">{m.description}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {mode === "direct" && (
                <form onSubmit={handleSubmit(onDirectSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipients</CardTitle>
                            <CardDescription>Add one or more email addresses</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="To" required error={errors.to?.message}>
                                <Controller
                                    control={control}
                                    name="to"
                                    render={({ field }) => (
                                        <TagInput value={field.value || []} onChange={field.onChange} placeholder="recipient@example.com" />
                                    )}
                                />
                            </FormField>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="CC">
                                    <Controller
                                        control={control}
                                        name="cc"
                                        render={({ field }) => (
                                            <TagInput value={field.value || []} onChange={field.onChange} placeholder="cc@example.com" />
                                        )}
                                    />
                                </FormField>
                                <FormField label="BCC">
                                    <Controller
                                        control={control}
                                        name="bcc"
                                        render={({ field }) => (
                                            <TagInput value={field.value || []} onChange={field.onChange} placeholder="bcc@example.com" />
                                        )}
                                    />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Subject" required error={errors.subject?.message} className="md:col-span-2">
                                    <Input {...register("subject")} placeholder="Important update" />
                                </FormField>
                                <FormField label="Category" required>
                                    <Controller
                                        control={control}
                                        name="category"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
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
                            </div>

                            <Tabs defaultValue="html">
                                <TabsList>
                                    <TabsTrigger value="html"><Code size={13} className="mr-1.5" /> HTML</TabsTrigger>
                                    <TabsTrigger value="text">Plain text</TabsTrigger>
                                    <TabsTrigger value="preview"><Eye size={13} className="mr-1.5" /> Preview</TabsTrigger>
                                </TabsList>
                                <TabsContent value="html" className="mt-3">
                                    <FormField error={errors.html?.message}>
                                        <Textarea rows={14} className="font-mono text-xs" {...register("html")} placeholder="<p>Hello team,</p>" />
                                    </FormField>
                                </TabsContent>
                                <TabsContent value="text" className="mt-3">
                                    <FormField hint="Optional plain-text fallback">
                                        <Textarea rows={10} {...register("text")} placeholder="Hello team," />
                                    </FormField>
                                </TabsContent>
                                <TabsContent value="preview" className="mt-3">
                                    <div className="rounded-md border bg-background overflow-hidden">
                                        <div className="bg-muted/40 px-4 py-2 border-b">
                                            <p className="text-xs text-muted-foreground">Subject</p>
                                            <p className="text-sm font-medium">{subject || "—"}</p>
                                        </div>
                                        <ScrollArea className="h-100">
                                            <div className="p-4 text-sm" dangerouslySetInnerHTML={{ __html: html || "<p class='text-muted-foreground'>Nothing to preview yet.</p>" }} />
                                        </ScrollArea>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate("/emails/logs")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            <PaperPlaneTilt size={15} className="mr-1.5" /> {directMutation.isPending ? "Sending..." : "Send Email"}
                        </Button>
                    </div>
                </form>
            )}

            {mode === "template" && (
                <form onSubmit={handleSubmit(onTemplateSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Template</CardTitle>
                                    <CardDescription>Pick an active template</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField label="Template" required>
                                        <Select value={templateId} onValueChange={setTemplateId}>
                                            <SelectTrigger><SelectValue placeholder="Choose template" /></SelectTrigger>
                                            <SelectContent>
                                                {(templatesQ.data?.templates || []).map((t) => (
                                                    <SelectItem key={t._id} value={t._id}>
                                                        {t.name} <span className="text-muted-foreground">· {humanize(t.category)}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                    <FormField label="To" required error={errors.to?.message}>
                                        <Controller
                                            control={control}
                                            name="to"
                                            render={({ field }) => (
                                                <TagInput value={field.value || []} onChange={field.onChange} placeholder="recipient@example.com" />
                                            )}
                                        />
                                    </FormField>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="CC">
                                            <Controller control={control} name="cc" render={({ field }) => <TagInput value={field.value || []} onChange={field.onChange} placeholder="cc@example.com" />} />
                                        </FormField>
                                        <FormField label="BCC">
                                            <Controller control={control} name="bcc" render={({ field }) => <TagInput value={field.value || []} onChange={field.onChange} placeholder="bcc@example.com" />} />
                                        </FormField>
                                    </div>
                                </CardContent>
                            </Card>

                            {templateQ.data && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Live Preview</CardTitle>
                                        <CardDescription>{renderLocal(templateQ.data.subject, templateVars)}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="h-100">
                                            <div className="p-4 text-sm" dangerouslySetInnerHTML={{ __html: renderLocal(templateQ.data.htmlContent || "", templateVars) }} />
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-1.5">
                                        <Tag size={14} /> Variables
                                    </CardTitle>
                                    <CardDescription>Values used to render the template</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {!templateId ? (
                                        <p className="text-sm text-muted-foreground">Pick a template to populate variables.</p>
                                    ) : tplVariables.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">This template has no variables.</p>
                                    ) : (
                                        tplVariables.map((v) => (
                                            <div key={v} className="space-y-1">
                                                <Label className="text-xs font-mono">{v}</Label>
                                                <Input
                                                    value={templateVars[v] || ""}
                                                    onChange={(e) => setTemplateVars((p) => ({ ...p, [v]: e.target.value }))}
                                                    placeholder={`Sample ${v}`}
                                                />
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate("/emails/logs")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !templateId}>
                            <PaperPlaneTilt size={15} className="mr-1.5" /> {templateMutation.isPending ? "Sending..." : "Send Template"}
                        </Button>
                    </div>
                </form>
            )}

            {mode === "bulk" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audience</CardTitle>
                            <CardDescription>Choose who receives this email</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Scope">
                                <Select value={bulkScope} onValueChange={setBulkScope}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All active employees</SelectItem>
                                        <SelectItem value="department">By department</SelectItem>
                                        <SelectItem value="selected">Specific employees</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>

                            {bulkScope === "department" && (
                                <FormField label="Department">
                                    <Select value={bulkDepartment} onValueChange={setBulkDepartment}>
                                        <SelectTrigger><SelectValue placeholder="Pick a department" /></SelectTrigger>
                                        <SelectContent>
                                            {DEPARTMENTS.map((d) => (
                                                <SelectItem key={d} value={d}>{humanize(d)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            )}

                            {bulkScope === "selected" && (
                                <FormField label="Employees" hint={`${bulkEmployeeIds.length} selected`}>
                                    <ScrollArea className="h-60 rounded-md border">
                                        <div className="p-2 space-y-1">
                                            {(employeesQ.data?.employees || []).map((emp) => {
                                                const checked = bulkEmployeeIds.includes(emp._id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={emp._id}
                                                        onClick={() => setBulkEmployeeIds((arr) =>
                                                            checked ? arr.filter((x) => x !== emp._id) : [...arr, emp._id]
                                                        )}
                                                        className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center justify-between ${checked ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                                                    >
                                                        <span className="truncate">{emp.firstName} {emp.lastName} <span className="text-muted-foreground text-xs">· {emp.email}</span></span>
                                                        {checked && <Badge variant="success" className="ml-2">Selected</Badge>}
                                                    </button>
                                                );
                                            })}
                                            {!employeesQ.data?.employees?.length && (
                                                <p className="text-sm text-muted-foreground p-3 text-center">No employees match.</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </FormField>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                            <CardDescription>Choose between template or custom content</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant={!bulkUseTemplate ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setBulkUseTemplate(false)}
                                >
                                    Custom content
                                </Button>
                                <Button
                                    type="button"
                                    variant={bulkUseTemplate ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setBulkUseTemplate(true)}
                                >
                                    Use template
                                </Button>
                            </div>

                            {bulkUseTemplate ? (
                                <>
                                    <FormField label="Template" required>
                                        <Select value={templateId} onValueChange={setTemplateId}>
                                            <SelectTrigger><SelectValue placeholder="Choose template" /></SelectTrigger>
                                            <SelectContent>
                                                {(templatesQ.data?.templates || []).map((t) => (
                                                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                    {tplVariables.length > 0 && (
                                        <>
                                            <Separator />
                                            <p className="text-xs font-medium text-muted-foreground">Template variables</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {tplVariables.map((v) => (
                                                    <div key={v} className="space-y-1">
                                                        <Label className="text-xs font-mono">{v}</Label>
                                                        <Input
                                                            value={templateVars[v] || ""}
                                                            onChange={(e) => setTemplateVars((p) => ({ ...p, [v]: e.target.value }))}
                                                            placeholder={`Sample ${v}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField label="Subject" required className="md:col-span-2">
                                            <Input {...register("subject")} placeholder="Quarterly all-hands recap" />
                                        </FormField>
                                        <FormField label="Category" required>
                                            <Controller
                                                control={control}
                                                name="category"
                                                render={({ field }) => (
                                                    <Select value={field.value} onValueChange={field.onChange}>
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
                                    </div>
                                    <FormField label="HTML body" required>
                                        <Textarea rows={12} className="font-mono text-xs" {...register("html")} placeholder="<p>Hi team,</p>" />
                                    </FormField>
                                    <FormField label="Plain text" hint="Optional fallback">
                                        <Textarea rows={6} {...register("text")} placeholder="Hi team," />
                                    </FormField>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate("/emails/logs")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="button" onClick={onBulkSubmit} disabled={isPending}>
                            <PaperPlaneTilt size={15} className="mr-1.5" /> {bulkMutation.isPending ? "Sending..." : "Send Bulk Email"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailSend;
