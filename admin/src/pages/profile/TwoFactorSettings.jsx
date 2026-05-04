import { getFormErrorHandler, getApiErrorMessage } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ShieldStar, Copy, Check, Warning, Power } from "@phosphor-icons/react";

import { useAuth } from "@/store/authStore";
import { authAPI } from "@/api/authApi";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TwoFactorSettings = () => {
    const { admin, refreshAdmin } = useAuth();
    const [setup, setSetup] = useState(null);
    const [token, setToken] = useState("");
    const [copied, setCopied] = useState(false);
    const [confirmDisable, setConfirmDisable] = useState(false);
    const [disableToken, setDisableToken] = useState("");

    const beginSetup = useMutation({
        mutationFn: () => authAPI.setup2FA().then((r) => r.data),
        onSuccess: (data) => setSetup(data),
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to start two-factor setup. Please try again.")),
    });

    const enable = useMutation({
        mutationFn: (data) => authAPI.enable2FA(data),
        onSuccess: async ({ data }) => {
            toast.success("Two-factor authentication enabled");
            await refreshAdmin();
            setSetup({ ...setup, backupCodes: data.backupCodes || setup.backupCodes });
            setToken("");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to verify the code. Please try again.")),
    });

    const disable = useMutation({
        mutationFn: (data) => authAPI.disable2FA(data),
        onSuccess: async () => {
            toast.success("Two-factor authentication disabled");
            await refreshAdmin();
            setSetup(null);
            setConfirmDisable(false);
            setDisableToken("");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to disable two-factor authentication. Please try again.")),
    });

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <PageHeader title="Two-Factor Authentication" description="Add an extra layer of security with TOTP" showBack backPath="/settings" />

            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldStar size={20} weight="duotone" className="text-amber-500" /> Authenticator App
                        </CardTitle>
                        <CardDescription>Scan a QR code with Google Authenticator, Authy, or 1Password</CardDescription>
                    </div>
                    {admin?.twoFactorEnabled
                        ? <Badge variant="success" className="gap-1"><ShieldCheck size={11} weight="fill" /> Active</Badge>
                        : <Badge variant="outline">Inactive</Badge>}
                </CardHeader>

                <CardContent className="space-y-4">
                    {!admin?.twoFactorEnabled && !setup && (
                        <div className="flex items-start gap-3 p-4 rounded-md border bg-muted/30">
                            <Warning size={20} weight="duotone" className="text-amber-600 shrink-0" />
                            <div className="text-sm flex-1">
                                <p className="font-medium">Account is not protected by 2FA</p>
                                <p className="text-muted-foreground">We strongly recommend enabling 2FA for all admin accounts.</p>
                            </div>
                            <Button onClick={() => beginSetup.mutate()} disabled={beginSetup.isPending}>
                                {beginSetup.isPending ? "Loading..." : "Enable 2FA"}
                            </Button>
                        </div>
                    )}

                    {!admin?.twoFactorEnabled && setup && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="space-y-2 text-center">
                                    <p className="text-sm font-medium">1. Scan this QR code</p>
                                    <div className="inline-block p-3 bg-white rounded-lg border">
                                        {setup.qrCode ? (
                                            <img src={setup.qrCode} alt="2FA QR" className="size-48" />
                                        ) : (
                                            <div className="size-48 grid place-items-center text-xs text-muted-foreground">QR not available</div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Or enter this secret manually</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 rounded-md bg-muted text-xs break-all">{setup.secret}</code>
                                        <Button variant="outline" size="icon" onClick={() => copyText(setup.secret)}>
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                        </Button>
                                    </div>
                                    <Separator />
                                    <p className="text-sm font-medium">2. Enter the 6-digit code</p>
                                    <div className="flex gap-2">
                                        <Input
                                            value={token}
                                            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder="000000"
                                            inputMode="numeric"
                                            className="text-center font-mono tracking-widest text-base"
                                        />
                                        <Button onClick={() => enable.mutate({ token })} disabled={token.length !== 6 || enable.isPending}>
                                            {enable.isPending ? "Verifying..." : "Verify & Enable"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {admin?.twoFactorEnabled && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                <ShieldCheck size={20} weight="duotone" className="text-emerald-600 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium">2FA is active</p>
                                    <p className="text-muted-foreground">You'll be asked for a code each time you sign in.</p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button variant="destructive" onClick={() => setConfirmDisable(true)}>
                                    <Power size={15} className="mr-1.5" /> Disable 2FA
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {setup?.backupCodes?.length ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Backup Codes</CardTitle>
                        <CardDescription>Save these codes somewhere safe. Each code can be used once if you lose your authenticator.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {setup.backupCodes.map((code, i) => (
                                <code key={i} className="px-3 py-2 rounded-md bg-muted text-xs text-center font-mono">{code}</code>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => copyText(setup.backupCodes.join("\n"))}>
                            {copied ? <Check size={13} className="mr-1" /> : <Copy size={13} className="mr-1" />}
                            Copy all
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            <AlertDialog open={confirmDisable} onOpenChange={setConfirmDisable}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disable two-factor authentication?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your account will rely only on your password. To confirm, enter a current 2FA code.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label className="text-xs">Verification code</Label>
                        <Input
                            value={disableToken}
                            onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000000"
                            inputMode="numeric"
                            className="text-center font-mono tracking-widest"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => disable.mutate({ token: disableToken })}
                            disabled={disableToken.length !== 6 || disable.isPending}
                        >
                            {disable.isPending ? "Disabling..." : "Disable 2FA"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TwoFactorSettings;
