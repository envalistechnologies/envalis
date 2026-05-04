import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Key, ShieldCheck, Palette, Bell, ArrowRight, Sun, Moon, Desktop } from "@phosphor-icons/react";

import { useAuth } from "@/store/authStore";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Settings = () => {
    const { admin } = useAuth();
    const { theme, setTheme } = useTheme();

    const SettingRow = ({ icon: Icon, title, description, badge, to, action }) => (
        <Link to={to} className="group flex items-center justify-between gap-4 p-4 rounded-lg border hover:border-primary/40 hover:bg-muted/30 transition">
            <div className="flex items-start gap-3 min-w-0">
                <div className="size-10 rounded-md bg-primary/10 grid place-items-center shrink-0">
                    <Icon size={18} weight="duotone" className="text-primary" />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{title}</p>
                        {badge}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            {action || <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition shrink-0" />}
        </Link>
    );

    return (
        <div className="space-y-6">
            <PageHeader title="Settings" description="Customize your account, security, and preferences" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Protect your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <SettingRow
                            icon={Key}
                            title="Change Password"
                            description="Update your account password"
                            to="/settings/security"
                        />
                        <SettingRow
                            icon={ShieldCheck}
                            title="Two-Factor Authentication"
                            description="Add an extra layer of security"
                            badge={admin?.twoFactorEnabled
                                ? <Badge variant="success" className="text-[10px]">Enabled</Badge>
                                : <Badge variant="outline" className="text-[10px]">Disabled</Badge>
                            }
                            to="/settings/2fa"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Choose your preferred theme</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: "light", label: "Light", icon: Sun },
                                { value: "dark", label: "Dark", icon: Moon },
                                { value: "system", label: "System", icon: Desktop },
                            ].map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setTheme(t.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                                        theme === t.value ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                                    )}
                                >
                                    <t.icon size={20} weight="duotone" className={theme === t.value ? "text-primary" : "text-muted-foreground"} />
                                    <span className="text-xs font-medium">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Control how you receive updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { title: "New contact inquiries", description: "Get notified when leads submit the contact form" },
                            { title: "Career applications", description: "When someone applies to a job posting" },
                            { title: "Email send results", description: "Confirmations after bulk emails are dispatched" },
                            { title: "Audit alerts", description: "High-severity admin actions" },
                        ].map((n, i) => (
                            <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-md border">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">{n.title}</p>
                                    <p className="text-xs text-muted-foreground">{n.description}</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
