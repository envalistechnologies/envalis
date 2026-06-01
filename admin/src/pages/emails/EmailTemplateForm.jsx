import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FloppyDisk, X, Eye, Tag, Code, ArrowsClockwise } from "@phosphor-icons/react";

import { emailsAPI } from "@/api/emailsApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { PageLoader } from "@/components/common/LoadingSpinner";
import TagInput from "@/components/common/TagInput";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { humanize, getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = ["welcome", "announcement", "newsletter", "hr_notice", "policy", "event", "recognition", "reminder", "other"];

const schema = z.object({
    name: z.string().min(1, "Required"),
    subject: z.string().min(1, "Required"),
    description: z.string().optional(),
    htmlContent: z.string().min(1, "HTML content is required"),
    textContent: z.string().optional(),
    category: z.enum(CATEGORIES),
    isActive: z.boolean(),
    tags: z.array(z.string()).optional(),
});

const extractVars = (html = "") => {
    const re = /\{\{\s*([\w.]+)\s*\}\}/g;
    const set = new Set();
    let m;
    while ((m = re.exec(html)) !== null) set.add(m[1]);
    return Array.from(set);
};

const buildPreviewDoc = (html = "", emptyMessage = "Start writing HTML to see a preview.") => {
        const trimmed = (html || "").trim();
        const content = trimmed || `<p style="color:#64748b;font-family:Arial, sans-serif;">${emptyMessage}</p>`;
        if (/<html[\s>]/i.test(content)) return content;
        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>html,body{margin:0;padding:0;}body{font-family:Arial, sans-serif;}</style>
</head>
<body>${content}</body>
</html>`;
};

const EmailTemplateForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [previewVars, setPreviewVars] = useState({});
    const [previewHtml, setPreviewHtml] = useState("");

    const { data: existing, isLoading } = useQuery({
        queryKey: ["email-template", id],
        queryFn: () => emailsAPI.getTemplateById(id).then((r) => r.data?.template || r.data),
        enabled: isEdit,
    });

    const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "", subject: "", description: "", htmlContent: "", textContent: "",
            category: "other", isActive: true, tags: [],
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                name: existing.name || "",
                subject: existing.subject || "",
                description: existing.description || "",
                htmlContent: existing.htmlContent || "",
                textContent: existing.textContent || "",
                category: existing.category || "other",
                isActive: existing.isActive !== false,
                tags: existing.tags || [],
            });
        }
    }, [existing, reset]);

    const htmlContent = watch("htmlContent");
    const subject = watch("subject");

    const variables = useMemo(() => extractVars(`${subject} ${htmlContent}`), [subject, htmlContent]);

    useEffect(() => {
        const init = {};
        variables.forEach((v) => { init[v] = previewVars[v] || ""; });
        setPreviewVars(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variables.join("|")]);

    const renderLocal = (html, vars) => {
        return (html || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
    };

    const previewMutation = useMutation({
        mutationFn: () => emailsAPI.previewTemplate(id, { variables: previewVars }),
        onSuccess: (res) => {
            setPreviewHtml(res.data?.preview || "");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to render the template preview. Please try again.")),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Saving email template:", data);
        mutation.mutate(data);
    };

    const mutation = useMutation({
        mutationFn: (payload) => isEdit ? emailsAPI.updateTemplate(id, payload) : emailsAPI.createTemplate(payload),
        onSuccess: () => {
            toast.success(isEdit ? "Template updated" : "Template created");
            qc.invalidateQueries({ queryKey: ["email-templates"] });
            navigate("/emails/templates");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to save the email template. Please check the form and try again.")),
    });

    const livePreview = renderLocal(htmlContent, previewVars);
    const previewDoc = useMemo(
        () => buildPreviewDoc(previewHtml || livePreview, "Start writing HTML to see a preview."),
        [previewHtml, livePreview]
    );

    if (isEdit && isLoading) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <PageHeader
                title={isEdit ? "Edit Template" : "New Template"}
                description={isEdit ? "Update template content and variables" : "Create a reusable email template"}
                showBack
                backPath="/emails/templates"
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => navigate("/emails/templates")}>
                            <X size={15} className="mr-1.5" /> Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            <FloppyDisk size={15} className="mr-1.5" /> {mutation.isPending ? "Saving..." : "Save"}
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basics</CardTitle>
                            <CardDescription>Identify the template and where it applies</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Name" required error={errors.name?.message}>
                                <Input {...register("name")} placeholder="welcome-email" />
                            </FormField>
                            <FormField label="Category" required error={errors.category?.message}>
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
                            <FormField label="Subject" required error={errors.subject?.message} className="md:col-span-2" hint="Supports {{variableName}}">
                                <Input {...register("subject")} placeholder="Welcome to {{companyName}}, {{firstName}}!" />
                            </FormField>
                            <FormField label="Description" className="md:col-span-2" hint="Internal note about when to use this template">
                                <Textarea rows={2} {...register("description")} placeholder="Sent to new employees on their first day" />
                            </FormField>
                            <FormField label="Tags" className="md:col-span-2">
                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field }) => (
                                        <TagInput value={field.value || []} onChange={field.onChange} placeholder="Add tag and press Enter" />
                                    )}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                            <CardDescription>
                                Use <code className="text-xs px-1 py-0.5 rounded bg-muted">{"{{variableName}}"}</code> to insert dynamic values, including <code className="text-xs px-1 py-0.5 rounded bg-muted">{"{{adminUrl}}"}</code> and <code className="text-xs px-1 py-0.5 rounded bg-muted">{"{{webappUrl}}"}</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs defaultValue="html">
                                <TabsList>
                                    <TabsTrigger value="html"><Code size={13} className="mr-1.5" /> HTML</TabsTrigger>
                                    <TabsTrigger value="text">Plain text</TabsTrigger>
                                    <TabsTrigger value="preview"><Eye size={13} className="mr-1.5" /> Preview</TabsTrigger>
                                </TabsList>

                                <TabsContent value="html" className="mt-3">
                                    <FormField error={errors.htmlContent?.message}>
                                        <Textarea
                                            rows={18}
                                            className="font-mono text-xs"
                                            {...register("htmlContent")}
                                            placeholder="<p>Hi {{firstName}},</p><p>Welcome aboard!</p>"
                                        />
                                    </FormField>
                                </TabsContent>

                                <TabsContent value="text" className="mt-3">
                                    <FormField hint="Optional plain-text fallback for clients that don't render HTML">
                                        <Textarea
                                            rows={12}
                                            {...register("textContent")}
                                            placeholder="Hi {{firstName}}, welcome aboard!"
                                        />
                                    </FormField>
                                </TabsContent>

                                <TabsContent value="preview" className="mt-3 space-y-3">
                                    {isEdit && (
                                        <div className="flex justify-end">
                                            <Button type="button" variant="outline" size="sm" onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending}>
                                                <ArrowsClockwise size={13} className="mr-1.5" /> Render via server
                                            </Button>
                                        </div>
                                    )}
                                    <div className="rounded-md border bg-background overflow-hidden">
                                        <div className="bg-muted/40 px-4 py-2 border-b">
                                            <p className="text-xs text-muted-foreground">Subject</p>
                                            <p className="text-sm font-medium">{renderLocal(subject, previewVars) || "N/A"}</p>
                                        </div>
                                        <ScrollArea className="h-100">
                                            <div className="p-4">
                                                <iframe
                                                    title="Email preview"
                                                    sandbox=""
                                                    className="w-full h-100 border-0"
                                                    srcDoc={previewDoc}
                                                />
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div>
                                    <p className="text-sm font-medium">Active</p>
                                    <p className="text-xs text-muted-foreground">Inactive templates can't be used to send emails</p>
                                </div>
                                <Controller
                                    control={control}
                                    name="isActive"
                                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-1.5">
                                <Tag size={14} /> Detected variables
                            </CardTitle>
                            <CardDescription>Auto-extracted from subject and HTML</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {variables.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No variables detected.</p>
                            ) : (
                                <>
                                    <div className="flex flex-wrap gap-1.5">
                                        {variables.map((v) => (
                                            <Badge key={v} variant="outline" className="font-mono">{v}</Badge>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Sample values for preview</p>
                                        {variables.map((v) => (
                                            <div key={v} className="space-y-1">
                                                <Label className="text-xs font-mono">{v}</Label>
                                                <Input
                                                    value={previewVars[v] || ""}
                                                    onChange={(e) => setPreviewVars((p) => ({ ...p, [v]: e.target.value }))}
                                                    placeholder={`Sample ${v}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
};

export default EmailTemplateForm;
