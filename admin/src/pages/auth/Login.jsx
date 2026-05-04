import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Envelope, LockKey, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";

import { useAuth } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().optional(),
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const from = location.state?.from?.pathname || "/dashboard";

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "", remember: true },
    });

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);
            const result = await login({ email: data.email, password: data.password });
            if (result.requires2FA) {
                navigate("/auth/verify-2fa");
            } else {
                toast.success("Welcome back!");
                navigate(from, { replace: true });
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid credentials");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white">Welcome back</h2>
                <p className="text-sm text-slate-400">Sign in to access the control panel</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-300 text-xs uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                        <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="admin@enovalis.com"
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:bg-white/10"
                            {...register("email")}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-300 text-xs uppercase tracking-wider">Password</Label>
                        <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                        <LockKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:bg-white/10"
                            {...register("password")}
                        />
                        <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                            {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox id="remember" checked={watch("remember")} onCheckedChange={(v) => setValue("remember", !!v)} />
                    <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">Keep me signed in</Label>
                </div>

                <Button type="submit" className="w-full h-11" disabled={submitting}>
                    {submitting ? "Signing in..." : (
                        <>Sign In <ArrowRight size={16} className="ml-1.5" /></>
                    )}
                </Button>
            </form>

            <p className="text-xs text-center text-slate-500">
                Protected by industry-standard encryption. Unauthorized access will be logged.
            </p>
        </div>
    );
};

export default Login;
