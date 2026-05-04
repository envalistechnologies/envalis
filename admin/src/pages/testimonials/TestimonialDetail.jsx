import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Star, CheckCircle, XCircle, Clock, Quotes, Building,
    Globe, Tag, User, MapPin, Calendar, SealCheckIcon as BadgeIcon,
} from "@phosphor-icons/react";

import { testimonialsAPI } from "@/api/testimonialsApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, formatDateTime, humanize, getInitials } from "@/lib/utils";

const RatingStars = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} weight={i < rating ? "fill" : "regular"} className={i < rating ? "text-amber-500" : "text-muted-foreground"} />
        ))}
    </div>
);

const Stat = ({ icon: Icon, label, value, color = "text-primary" }) => (
    <div className="flex items-center gap-3 py-2.5">
        <div className={`size-9 rounded-lg bg-muted/60 grid place-items-center ${color}`}>
            <Icon size={16} weight="duotone" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold wrap-break-word">{value ?? "—"}</p>
        </div>
    </div>
);

const TestimonialDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["testimonial", id],
        queryFn: () => testimonialsAPI.getById(id).then((r) => r.data?.testimonial || r.data),
    });

    const approve = useMutation({
        mutationFn: () => testimonialsAPI.approve(id),
        onSuccess: () => {
            toast.success("Testimonial approved");
            qc.invalidateQueries({ queryKey: ["testimonial", id] });
            qc.invalidateQueries({ queryKey: ["testimonials"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const reject = useMutation({
        mutationFn: () => testimonialsAPI.reject(id),
        onSuccess: () => {
            toast.success("Testimonial rejected");
            qc.invalidateQueries({ queryKey: ["testimonial", id] });
            qc.invalidateQueries({ queryKey: ["testimonials"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const toggleFeatured = useMutation({
        mutationFn: () => testimonialsAPI.toggleFeatured(id),
        onSuccess: () => {
            toast.success("Featured status updated");
            qc.invalidateQueries({ queryKey: ["testimonial", id] });
            qc.invalidateQueries({ queryKey: ["testimonials"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: () => testimonialsAPI.delete(id),
        onSuccess: () => {
            toast.success("Testimonial deleted");
            qc.invalidateQueries({ queryKey: ["testimonials"] });
            navigate("/testimonials");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    const testimonial = data;
    if (!testimonial) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={testimonial.clientName}
                description={testimonial.clientDesignation}
                showBack
                backPath="/testimonials"
                actions={
                    <>
                        {testimonial.status === "pending" && (
                            <>
                                <Button variant="outline" onClick={() => approve.mutate()}>
                                    <CheckCircle size={15} className="mr-1.5" /> Approve
                                </Button>
                                <Button variant="outline" onClick={() => reject.mutate()}>
                                    <XCircle size={15} className="mr-1.5" /> Reject
                                </Button>
                            </>
                        )}
                        <Button variant="outline" onClick={() => toggleFeatured.mutate()}>
                            <Star size={15} className={`mr-1.5 ${testimonial.isFeatured ? "fill-current" : ""}`} />
                            {testimonial.isFeatured ? "Unfeature" : "Feature"}
                        </Button>
                        <Button asChild>
                            <Link to={`/testimonials/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Quote */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Quotes size={18} weight="duotone" className="text-primary" /> Testimonial
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-1">
                                <RatingStars rating={testimonial.rating} />
                                <span className="text-xs text-muted-foreground ml-2">({testimonial.rating}/5)</span>
                            </div>
                            <blockquote className="text-base italic border-l-4 border-primary pl-4 py-2">
                                "{testimonial.quote}"
                            </blockquote>
                            {testimonial.shortQuote && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Short Quote</p>
                                    <p className="text-sm">"{testimonial.shortQuote}"</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Client Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User size={18} weight="duotone" className="text-primary" /> Client Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="size-16">
                                    <AvatarImage src={testimonial.clientAvatar?.url} />
                                    <AvatarFallback>{getInitials(testimonial.clientName)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm">{testimonial.clientName}</p>
                                    <p className="text-xs text-muted-foreground">{testimonial.clientDesignation}</p>
                                    {testimonial.clientCompany && (
                                        <p className="text-sm font-medium text-primary mt-1">{testimonial.clientCompany}</p>
                                    )}
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                {testimonial.clientLocation && (
                                    <Stat icon={MapPin} label="Location" value={testimonial.clientLocation} />
                                )}
                                {testimonial.clientWebsite && (
                                    <div className="flex items-center gap-3 py-2.5">
                                        <div className="size-9 rounded-lg bg-muted/60 grid place-items-center text-primary">
                                            <Globe size={16} weight="duotone" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Website</p>
                                            <a href={testimonial.clientWebsite} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline truncate">
                                                {testimonial.clientWebsite}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Testimonial */}
                    {testimonial.videoTestimonial?.url && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Video Testimonial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full bg-muted rounded-lg overflow-hidden aspect-video">
                                    <video
                                        src={testimonial.videoTestimonial.url}
                                        controls
                                        poster={testimonial.videoTestimonial.thumbnail}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!testimonial.tags?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Tag size={18} weight="duotone" className="text-primary" /> Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {testimonial.tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary">{tag}</Badge>
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
                                <StatusBadge status={testimonial.status} />
                            </div>
                            <Stat icon={Calendar} label="Created" value={formatDate(testimonial.createdAt)} />
                            <Stat icon={Clock} label="Updated" value={formatDateTime(testimonial.updatedAt)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Verification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Stat 
                                icon={CheckCircle} 
                                label="Verified" 
                                value={testimonial.isVerified ? "Yes" : "No"} 
                                color={testimonial.isVerified ? "text-emerald-600" : "text-muted-foreground"}
                            />
                            <Stat 
                                icon={Star} 
                                label="Featured" 
                                value={testimonial.isFeatured ? "Yes" : "No"} 
                                color={testimonial.isFeatured ? "text-amber-500" : "text-muted-foreground"}
                            />
                            <Stat 
                                icon={BadgeIcon} 
                                label="Top Rated" 
                                value={testimonial.isTopRated ? "Yes" : "No"} 
                                color={testimonial.isTopRated ? "text-purple-600" : "text-muted-foreground"}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Stat icon={Building} label="Category" value={humanize(testimonial.category)} />
                            <Stat icon={Globe} label="Source" value={humanize(testimonial.source)} />
                            {testimonial.sourceUrl && (
                                <div className="flex items-center gap-3 py-2.5">
                                    <div className="size-9 rounded-lg bg-muted/60 grid place-items-center text-primary">
                                        <Globe size={16} weight="duotone" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Source URL</p>
                                        <a href={testimonial.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline truncate">
                                            {testimonial.sourceUrl}
                                        </a>
                                    </div>
                                </div>
                            )}
                            <Stat icon={Star} label="Rating" value={`${testimonial.rating}/5`} color="text-amber-500" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this testimonial? This action cannot be undone.
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

export default TestimonialDetail;
