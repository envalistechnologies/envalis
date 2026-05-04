import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Clock, Calendar, Tag, Star, Lightning, CheckCircle,
    GraduationCap, CurrencyDollar, Lightbulb, Steps,
} from "@phosphor-icons/react";

import { servicesAPI } from "@/api/servicesApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, formatDateTime, humanize, getApiErrorMessage } from "@/lib/utils";

const Stat = ({ icon: Icon, label, value, color = "text-primary" }) => (
    <div className="flex items-center gap-3 py-2.5">
        <div className={`size-9 rounded-lg bg-muted/60 grid place-items-center ${color}`}>
            <Icon size={16} weight="duotone" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">{value ?? "N/A"}</p>
        </div>
    </div>
);

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["service", id],
        queryFn: () => servicesAPI.getById(id).then((r) => r.data?.service || r.data),
    });

    const remove = useMutation({
        mutationFn: () => servicesAPI.delete(id),
        onSuccess: () => {
            toast.success("Service deleted");
            qc.invalidateQueries({ queryKey: ["services"] });
            navigate("/services");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to update the service status.")),
    });

    if (isLoading) return <PageLoader />;
    const service = data;
    if (!service) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={service.title}
                description={service.shortDescription || service.description}
                showBack
                backPath="/services"
                actions={
                    <>
                        <Button asChild>
                            <Link to={`/services/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            {service.coverImage?.url && (
                <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-21/9">
                    <img src={service.coverImage.url} alt={service.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">{humanize(service.category)}</Badge>
                            <StatusBadge status={service.status} />
                            {service.isFeatured && <Badge className="bg-amber-500 text-white border-amber-400 gap-1"><Star size={11} weight="fill" /> Featured</Badge>}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight max-w-3xl drop-shadow">{service.title}</h2>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Lightbulb size={18} weight="duotone" className="text-primary" /> Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{service.description}</p>
                        </CardContent>
                    </Card>

                    {/* Content */}
                    {service.content && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-img:rounded-md"
                                    dangerouslySetInnerHTML={{ __html: service.content }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Features */}
                    {!!service.features?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle size={18} weight="duotone" className="text-primary" /> Features
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {service.features.map((f, i) => (
                                        <div key={i} className="rounded-lg border p-3 bg-muted/30">
                                            {f.icon && <span className="text-2xl mb-2 block">{f.icon}</span>}
                                            {f.title && <p className="font-semibold text-sm mb-1">{f.title}</p>}
                                            {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Process */}
                    {!!service.process?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Steps size={18} weight="duotone" className="text-primary" /> Process
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {service.process.map((p, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="size-8 rounded-full bg-primary text-white grid place-items-center text-sm font-bold shrink-0">
                                                    {i + 1}
                                                </div>
                                                {i < service.process.length - 1 && (
                                                    <div className="w-0.5 h-12 bg-primary/20 mt-2" />
                                                )}
                                            </div>
                                            <div className="pb-6">
                                                {p.title && <p className="font-semibold text-sm mb-1">{p.title}</p>}
                                                {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pricing */}
                    {!!service.pricing?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CurrencyDollar size={18} weight="duotone" className="text-primary" /> Pricing Plans
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {service.pricing.map((plan, i) => (
                                        <div key={i} className={`rounded-lg border p-4 ${plan.isPopular ? "border-primary bg-primary/5" : "bg-muted/30"}`}>
                                            {plan.isPopular && <Badge className="mb-2">Popular</Badge>}
                                            {plan.plan && <p className="font-semibold text-sm mb-2">{plan.plan}</p>}
                                            {plan.price && (
                                                <div className="mb-3">
                                                    <span className="text-2xl font-bold">${plan.price}</span>
                                                    {plan.period && <span className="text-xs text-muted-foreground ml-1">/{plan.period}</span>}
                                                </div>
                                            )}
                                            {plan.features && plan.features.length > 0 && (
                                                <ul className="space-y-1.5">
                                                    {plan.features.map((feature, j) => (
                                                        <li key={j} className="text-xs flex items-start gap-2">
                                                            <CheckCircle size={12} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Status</p>
                                <StatusBadge status={service.status} />
                            </div>
                            <Stat icon={Calendar} label="Created" value={formatDate(service.createdAt)} />
                            <Stat icon={Clock} label="Updated" value={formatDateTime(service.updatedAt)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Stat icon={Lightning} label="Category" value={humanize(service.category)} />
                            {service.icon && <Stat icon={GraduationCap} label="Icon" value={service.icon} />}
                            <Stat 
                                icon={Star} 
                                label="Featured" 
                                value={service.isFeatured ? "Yes" : "No"} 
                                color={service.isFeatured ? "text-amber-500" : "text-muted-foreground"}
                            />
                            {service.order !== undefined && (
                                <Stat icon={CheckCircle} label="Order" value={service.order} />
                            )}
                        </CardContent>
                    </Card>

                    {service.tagline && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tagline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm italic">{service.tagline}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this service? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ServiceDetail;
