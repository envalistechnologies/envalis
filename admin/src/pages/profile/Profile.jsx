import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FloppyDisk, Camera, ShieldCheck, ShieldStar, Phone, Envelope, Buildings, Calendar } from "@phosphor-icons/react";

import { useAuth } from "@/store/authStore";
import { authAPI } from "@/api/authApi";
import PageHeader from "@/components/common/PageHeader";
import FormField from "@/components/common/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatDate, humanize, getFormErrorHandler } from "@/lib/utils";

const schema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    phone: z.string().optional(),
    department: z.string().optional(),
});

const Profile = () => {
    const { admin, updateAdmin } = useAuth();
    const [uploading, setUploading] = useState(false);

    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: admin?.firstName || "",
            lastName: admin?.lastName || "",
            phone: admin?.phone || "",
            department: admin?.department || "",
        },
    });

    const update = useMutation({
        mutationFn: (data) => authAPI.updateProfile(data),
        onSuccess: ({ data }) => {
            toast.success("Profile updated");
            updateAdmin(data.admin || { ...admin, ...data });
            reset(data.admin || data);
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Update failed"),
    });

    const onFormError = getFormErrorHandler(toast);
    const onSubmit = (data) => {
        console.log("Updating profile:", data);
        update.mutate(data);
    };

    const handleAvatar = async (file) => {
        if (!file || !admin?._id) return;
        try {
            setUploading(true);
            const fd = new FormData();
            fd.append("avatar", file);
            const { data } = await authAPI.updateAvatar(fd);
            updateAdmin(data.admin || { ...admin, avatar: data.avatar });
            toast.success("Avatar updated");
        } catch (e) {
            toast.error(e?.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="My Profile" description="Manage your personal information and account" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="relative inline-block">
                            <Avatar className="size-28 mx-auto ring-4 ring-primary/10">
                                <AvatarImage src={admin?.avatar?.url} />
                                <AvatarFallback className="text-3xl">{getInitials(`${admin?.firstName} ${admin?.lastName}`)}</AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-0 right-0 size-9 rounded-full bg-primary text-primary-foreground grid place-items-center cursor-pointer shadow-lg hover:scale-105 transition">
                                <Camera size={15} weight="bold" />
                                <input type="file" hidden accept="image/*" disabled={uploading} onChange={(e) => handleAvatar(e.target.files?.[0])} />
                            </label>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1.5">
                                <h3 className="text-lg font-bold">{admin?.firstName} {admin?.lastName}</h3>
                                {admin?.isSuperAdmin && <ShieldStar size={16} weight="fill" className="text-amber-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{admin?.email}</p>
                        </div>
                        <div className="flex justify-center gap-2 flex-wrap">
                            <Badge variant="default" className="capitalize">{humanize(admin?.role || "")}</Badge>
                            {admin?.twoFactorEnabled && (
                                <Badge variant="success" className="gap-1"><ShieldCheck size={11} weight="fill" /> 2FA</Badge>
                            )}
                        </div>
                        <Separator />
                        <div className="text-left space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Envelope size={14} weight="duotone" className="text-muted-foreground" />
                                <span>{admin?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} weight="duotone" className="text-muted-foreground" />
                                <span>{admin?.phone || "Not set"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Buildings size={14} weight="duotone" className="text-muted-foreground" />
                                <span>{admin?.department || "Not set"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={14} weight="duotone" className="text-muted-foreground" />
                                <span>Joined {formatDate(admin?.createdAt)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your contact details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="First Name" required error={errors.firstName?.message}>
                                    <Input {...register("firstName")} />
                                </FormField>
                                <FormField label="Last Name" required error={errors.lastName?.message}>
                                    <Input {...register("lastName")} />
                                </FormField>
                            </div>
                            <FormField label="Email" hint="Email cannot be changed. Contact a super admin.">
                                <Input value={admin?.email || ""} disabled />
                            </FormField>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Phone">
                                    <Input {...register("phone")} placeholder="+91 98765 43210" />
                                </FormField>
                                <FormField label="Department">
                                    <Input {...register("department")} placeholder="Engineering" />
                                </FormField>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={update.isPending || !isDirty}>
                                    <FloppyDisk size={15} className="mr-1.5" /> {update.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
