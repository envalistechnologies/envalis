import { getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeSlash, Key, ShieldCheck, Warning } from "@phosphor-icons/react";

import { authAPI } from "@/api/authApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const schema = z.object({
    currentPassword: z.string().min(1, "Required"),
    password: z.string().min(8, "At least 8 characters")
        .regex(/[A-Z]/, "Include uppercase")
        .regex(/[a-z]/, "Include lowercase")
        .regex(/[0-9]/, "Include a number"),
    passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});

const score = (pwd = "") => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
};

const SecuritySettings = () => {
    const [show, setShow] = useState({ current: false, next: false, confirm: false });

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { currentPassword: "", password: "", passwordConfirm: "" },
    });

    const pwd = watch("password");
    const s = score(pwd);
    const colors = ["bg-red-500", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"];

    const change = useMutation({
        mutationFn: (data) => authAPI.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.password,
        }),
        onSuccess: () => {
            toast.success("Password changed successfully");
            reset();
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Could not change password"),
            onError: (e) => toast.error(getApiErrorMessage(e, "Unable to change your password. Please try again.")),
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to change your password. Please try again.")),
    });

    return (
        <div className="space-y-6 max-w-3xl">
            <PageHeader title="Security" description="Update your password" showBack backPath="/settings" />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key size={18} weight="duotone" className="text-primary" /> Change Password
                    </CardTitle>
                    <CardDescription>Use a strong, unique password you don't reuse elsewhere</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit((d) => change.mutate(d))} className="space-y-4">
                        <FormField label="Current Password" required error={errors.currentPassword?.message}>
                            <div className="relative">
                                <Input type={show.current ? "text" : "password"} {...register("currentPassword")} />
                                <button type="button" onClick={() => setShow((p) => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {show.current ? <EyeSlash size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </FormField>

                        <FormField label="New Password" required error={errors.password?.message}>
                            <div className="relative">
                                <Input type={show.next ? "text" : "password"} {...register("password")} />
                                <button type="button" onClick={() => setShow((p) => ({ ...p, next: !p.next }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {show.next ? <EyeSlash size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {pwd && (
                                <div className="flex gap-1 mt-2">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i < s ? colors[s - 1] : "bg-muted")} />
                                    ))}
                                </div>
                            )}
                        </FormField>

                        <FormField label="Confirm New Password" required error={errors.passwordConfirm?.message}>
                            <div className="relative">
                                <Input type={show.confirm ? "text" : "password"} {...register("passwordConfirm")} />
                                <button type="button" onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {show.confirm ? <EyeSlash size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </FormField>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={change.isPending}>
                                <ShieldCheck size={15} className="mr-1.5" /> {change.isPending ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 flex items-start gap-3">
                    <Warning size={20} weight="duotone" className="text-amber-600 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium">Security tip</p>
                        <p className="text-muted-foreground">After changing your password, all other active sessions will be terminated and you'll need to sign in again on those devices.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SecuritySettings;
