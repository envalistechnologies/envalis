import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LockKey, Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";

import { authAPI } from "@/api/authApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const schema = z.object({
    password: z.string().min(8, "At least 8 characters")
        .regex(/[A-Z]/, "Include an uppercase letter")
        .regex(/[a-z]/, "Include a lowercase letter")
        .regex(/[0-9]/, "Include a number"),
    passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});

const strengthFor = (pwd = "") => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
};

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { password: "", passwordConfirm: "" },
    });

    const pwd = watch("password");
    const score = strengthFor(pwd);
    const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = ["bg-red-500", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"];

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);
            await authAPI.resetPassword(token, { password: data.password, passwordConfirm: data.passwordConfirm });
            setDone(true);
            toast.success("Password reset successfully");
            setTimeout(() => navigate("/auth/login", { replace: true }), 1500);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Reset failed. Token may be invalid or expired.");
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className="space-y-4 text-center">
                <div className="mx-auto size-14 rounded-2xl bg-emerald-500/15 grid place-items-center">
                    <CheckCircle size={28} weight="duotone" className="text-emerald-400" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white">Password updated</h2>
                    <p className="text-sm text-slate-400">Redirecting you to sign in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white">Reset password</h2>
                <p className="text-sm text-slate-400">Choose a new strong password</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-300 text-xs uppercase tracking-wider">New Password</Label>
                    <div className="relative">
                        <LockKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input
                            id="password"
                            type={show ? "text" : "password"}
                            className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            {...register("password")}
                        />
                        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                            {show ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {pwd && (
                        <>
                            <div className="flex gap-1 mt-1">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i < score ? colors[score - 1] : "bg-white/10")} />
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-400">{labels[Math.min(score, 5)]}</p>
                        </>
                    )}
                    {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="passwordConfirm" className="text-slate-300 text-xs uppercase tracking-wider">Confirm Password</Label>
                    <div className="relative">
                        <LockKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input
                            id="passwordConfirm"
                            type={show ? "text" : "password"}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            {...register("passwordConfirm")}
                        />
                    </div>
                    {errors.passwordConfirm && <p className="text-xs text-red-400">{errors.passwordConfirm.message}</p>}
                </div>

                <Button type="submit" className="w-full h-11" disabled={submitting}>
                    {submitting ? "Updating..." : "Update Password"}
                </Button>

                <Link to="/auth/login" className="block text-center text-sm text-slate-400 hover:text-slate-200">
                    Back to sign in
                </Link>
            </form>
        </div>
    );
};

export default ResetPassword;
