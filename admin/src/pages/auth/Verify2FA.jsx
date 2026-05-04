import { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, Key, ArrowLeft } from "@phosphor-icons/react";

import { useAuth } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Verify2FA = () => {
    const { tempToken, requires2FA, verify2FA, logout } = useAuth();
    const navigate = useNavigate();
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [useBackup, setUseBackup] = useState(false);
    const [backupCode, setBackupCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const inputs = useRef([]);

    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    if (!requires2FA || !tempToken) return <Navigate to="/auth/login" replace />;

    const handleDigit = (i, val) => {
        const v = val.replace(/\D/g, "").slice(-1);
        const next = [...code];
        next[i] = v;
        setCode(next);
        if (v && i < 5) inputs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
        if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!text) return;
        const next = ["", "", "", "", "", ""];
        for (let i = 0; i < text.length; i++) next[i] = text[i];
        setCode(next);
        inputs.current[Math.min(text.length, 5)]?.focus();
    };

    const handleVerify = async (e) => {
        e?.preventDefault();
        const token = code.join("");
        if (!useBackup && token.length !== 6) {
            toast.error("Enter the 6-digit code");
            return;
        }
        if (useBackup && !backupCode.trim()) {
            toast.error("Enter your backup code");
            return;
        }
        try {
            setSubmitting(true);
            await verify2FA(useBackup ? null : token, useBackup ? backupCode.trim() : null);
            toast.success("Verified successfully");
            navigate("/dashboard", { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid code");
            setCode(["", "", "", "", "", ""]);
            inputs.current[0]?.focus();
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        await logout();
        navigate("/auth/login", { replace: true });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
                <div className="size-14 rounded-2xl bg-primary/15 grid place-items-center">
                    <ShieldCheck size={28} weight="duotone" className="text-primary" />
                </div>
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-white">Two-Factor Verification</h2>
                    <p className="text-sm text-slate-400">
                        {useBackup
                            ? "Enter one of your backup codes to continue"
                            : "Enter the 6-digit code from your authenticator app"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
                {!useBackup ? (
                    <div onPaste={handlePaste} className="flex justify-center gap-2">
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputs.current[i] = el)}
                                value={digit}
                                onChange={(e) => handleDigit(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                inputMode="numeric"
                                maxLength={1}
                                className="size-12 rounded-md border border-white/10 bg-white/5 text-center text-xl font-bold text-white outline-none focus:border-primary focus:bg-white/10"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <Label className="text-slate-300 text-xs uppercase tracking-wider">Backup Code</Label>
                        <Input
                            value={backupCode}
                            onChange={(e) => setBackupCode(e.target.value)}
                            placeholder="XXXX-XXXX"
                            className="bg-white/5 border-white/10 text-white text-center font-mono tracking-wider"
                        />
                    </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={submitting}>
                    {submitting ? "Verifying..." : "Verify & Continue"}
                </Button>

                <div className="flex items-center justify-between text-xs">
                    <button type="button" onClick={handleCancel} className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1">
                        <ArrowLeft size={12} /> Cancel
                    </button>
                    <button type="button" onClick={() => setUseBackup((b) => !b)} className="text-primary hover:underline inline-flex items-center gap-1">
                        <Key size={12} /> {useBackup ? "Use authenticator code" : "Use backup code instead"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Verify2FA;
