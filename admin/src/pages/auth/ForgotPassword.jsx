import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Envelope, ArrowLeft, CheckCircle } from "@phosphor-icons/react";

import { authAPI } from "@/api/authApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
});

const ForgotPassword = () => {
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const { register, handleSubmit, formState: { errors }, getValues } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);
            await authAPI.forgotPassword(data);
            setSent(true);
            toast.success("Reset link sent if account exists");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not send reset email");
        } finally {
            setSubmitting(false);
        }
    };

    if (sent) {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto size-14 rounded-2xl bg-emerald-500/15 grid place-items-center">
                    <CheckCircle size={28} weight="duotone" className="text-emerald-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Check your inbox</h2>
                    <p className="text-sm text-slate-400">
                        If an account exists for <span className="text-white font-medium">{getValues("email")}</span>, you'll receive a password reset link in a few minutes.
                    </p>
                </div>
                <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <ArrowLeft size={14} /> Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white">Forgot password?</h2>
                <p className="text-sm text-slate-400">We'll email you a link to reset it</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-300 text-xs uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                        <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@envalis.com"
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:bg-white/10"
                            {...register("email")}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <Button type="submit" className="w-full h-11" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Reset Link"}
                </Button>

                <Link to="/auth/login" className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
                    <ArrowLeft size={14} /> Back to sign in
                </Link>
            </form>
        </div>
    );
};

export default ForgotPassword;
