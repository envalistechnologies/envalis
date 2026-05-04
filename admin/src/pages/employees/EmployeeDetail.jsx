import { useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, Phone, EnvelopeSimple, MapPin, Calendar, Briefcase, IdentificationBadge,
    GraduationCap, FirstAid, FilePdf, UploadSimple, DownloadSimple, CurrencyInr, User,
} from "@phosphor-icons/react";

import { employeesAPI } from "@/api/employeesApi";
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
import { getInitials, formatDate, humanize, formatCurrency, getApiErrorMessage } from "@/lib/utils";

const InfoRow = ({ icon: Icon, label, value, color = "text-primary" }) => (
    <div className="flex items-start gap-3 py-2.5">
        <div className={`size-9 rounded-lg bg-muted/60 grid place-items-center ${color} shrink-0`}>
            <Icon size={16} weight="duotone" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium wrap-break-word">{value || "N/A"}</p>
        </div>
    </div>
);

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const fileRef = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deletingDoc, setDeletingDoc] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["employee", id],
        queryFn: () => employeesAPI.getById(id).then((r) => r.data?.employee || r.data),
    });

    const remove = useMutation({
        mutationFn: () => employeesAPI.delete(id),
        onSuccess: () => {
            toast.success("Employee deleted");
            qc.invalidateQueries({ queryKey: ["employees"] });
            navigate("/employees");
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to update the employee status.")),
    });

    const uploadDoc = useMutation({
        mutationFn: (file) => {
            const fd = new FormData();
            fd.append("document", file);
            fd.append("name", file.name);
            fd.append("type", "other");
            return employeesAPI.uploadDocument(id, fd);
        },
        onSuccess: () => {
            toast.success("Document uploaded");
            qc.invalidateQueries({ queryKey: ["employee", id] });
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Unable to upload the document. Please try again.")),
    });

    const removeDoc = useMutation({
        mutationFn: (docId) => employeesAPI.deleteDocument(id, docId),
        onSuccess: () => {
            toast.success("Document removed");
            setDeletingDoc(null);
            qc.invalidateQueries({ queryKey: ["employee", id] });
        },
        onError: (e) => {
            toast.error(getApiErrorMessage(e, "Unable to delete the document. Please try again."));
            setDeletingDoc(null);
        },
    });

    if (isLoading) return <PageLoader />;
    const emp = data;
    if (!emp) return null;

    const totalSalary = (emp.salary?.basic || 0) + (emp.salary?.hra || 0) + (emp.salary?.allowances || 0) - (emp.salary?.deductions || 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${emp.firstName} ${emp.lastName}`}
                description={emp.designation}
                showBack
                backPath="/employees"
                actions={
                    <>
                        <Button asChild>
                            <Link to={`/employees/${id}/edit`}><Pencil size={15} className="mr-1.5" /> Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardContent className="p-6 text-center space-y-4">
                        <Avatar className="size-24 mx-auto ring-2 ring-border">
                            <AvatarImage src={emp.avatar?.url} />
                            <AvatarFallback className="text-2xl">{getInitials(`${emp.firstName} ${emp.lastName}`)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">{emp.firstName} {emp.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{emp.designation}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <Badge variant="outline" className="font-mono">{emp.employeeId}</Badge>
                            <Badge variant="secondary" className="capitalize">{humanize(emp.department)}</Badge>
                            <StatusBadge status={emp.status} />
                        </div>
                        <Separator />
                        <div className="text-left space-y-1">
                            <InfoRow icon={EnvelopeSimple} label="Work Email" value={emp.email} color="text-blue-500" />
                            {emp.personalEmail && <InfoRow icon={EnvelopeSimple} label="Personal Email" value={emp.personalEmail} color="text-purple-500" />}
                            {emp.phone && <InfoRow icon={Phone} label="Phone" value={emp.phone} color="text-emerald-500" />}
                            {emp.alternatePhone && <InfoRow icon={Phone} label="Alternate" value={emp.alternatePhone} color="text-emerald-500" />}
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Briefcase size={18} weight="duotone" className="text-primary" /> Employment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 divide-y sm:divide-y-0">
                            <InfoRow icon={Briefcase} label="Type" value={humanize(emp.employmentType || "")} color="text-blue-500" />
                            <InfoRow icon={Calendar} label="Joined" value={formatDate(emp.joiningDate)} color="text-emerald-500" />
                            <InfoRow icon={Calendar} label="Probation End" value={formatDate(emp.probationEndDate)} color="text-amber-500" />
                            <InfoRow icon={Calendar} label="Confirmation" value={formatDate(emp.confirmationDate)} color="text-emerald-500" />
                            {emp.exitDate && <InfoRow icon={Calendar} label="Exit Date" value={formatDate(emp.exitDate)} color="text-rose-500" />}
                            <InfoRow icon={User} label="Gender" value={humanize(emp.gender || "")} color="text-purple-500" />
                            {emp.dateOfBirth && <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(emp.dateOfBirth)} color="text-pink-500" />}
                        </CardContent>
                    </Card>

                    {emp.address && (emp.address.street || emp.address.city) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin size={18} weight="duotone" className="text-primary" /> Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed">
                                    {[emp.address.street, emp.address.city, emp.address.state, emp.address.country, emp.address.pincode].filter(Boolean).join(", ")}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {emp.emergencyContact?.name && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FirstAid size={18} weight="duotone" className="text-primary" /> Emergency Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <InfoRow icon={User} label="Name" value={emp.emergencyContact.name} color="text-blue-500" />
                                <InfoRow icon={IdentificationBadge} label="Relation" value={emp.emergencyContact.relation} color="text-purple-500" />
                                <InfoRow icon={Phone} label="Phone" value={emp.emergencyContact.phone} color="text-emerald-500" />
                            </CardContent>
                        </Card>
                    )}

                    {emp.salary?.basic > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CurrencyInr size={18} weight="duotone" className="text-primary" /> Compensation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div className="rounded-md border p-3 bg-muted/30">
                                        <p className="text-xs text-muted-foreground">Basic</p>
                                        <p className="font-semibold">{formatCurrency(emp.salary.basic, emp.salary.currency)}</p>
                                    </div>
                                    <div className="rounded-md border p-3 bg-muted/30">
                                        <p className="text-xs text-muted-foreground">HRA</p>
                                        <p className="font-semibold">{formatCurrency(emp.salary.hra, emp.salary.currency)}</p>
                                    </div>
                                    <div className="rounded-md border p-3 bg-muted/30">
                                        <p className="text-xs text-muted-foreground">Allowances</p>
                                        <p className="font-semibold">{formatCurrency(emp.salary.allowances, emp.salary.currency)}</p>
                                    </div>
                                    <div className="rounded-md border p-3 bg-muted/30">
                                        <p className="text-xs text-muted-foreground">Deductions</p>
                                        <p className="font-semibold text-rose-600">- {formatCurrency(emp.salary.deductions, emp.salary.currency)}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Net Monthly</p>
                                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalSalary, emp.salary.currency)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!emp.skills?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {emp.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!!emp.education?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap size={18} weight="duotone" className="text-primary" /> Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {emp.education.map((ed, i) => (
                                    <div key={i} className="rounded-md border p-3 bg-muted/20">
                                        <p className="text-sm font-medium">{ed.degree} {ed.year && `(${ed.year})`}</p>
                                        <p className="text-xs text-muted-foreground">{ed.institution} {ed.grade && `• ${ed.grade}`}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FilePdf size={18} weight="duotone" className="text-primary" /> Documents
                            </CardTitle>
                            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadDoc.isPending}>
                                <UploadSimple size={14} className="mr-1.5" /> {uploadDoc.isPending ? "Uploading..." : "Upload"}
                            </Button>
                            <input
                                ref={fileRef}
                                type="file"
                                hidden
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) uploadDoc.mutate(f);
                                    e.target.value = "";
                                }}
                            />
                        </CardHeader>
                        <CardContent>
                            {!emp.documents?.length ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded.</p>
                            ) : (
                                <div className="divide-y">
                                    {emp.documents.map((doc) => (
                                        <div key={doc._id} className="flex items-center justify-between gap-3 py-2.5">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-9 rounded-md bg-muted/60 grid place-items-center text-rose-500">
                                                    <FilePdf size={18} weight="duotone" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{doc.name}</p>
                                                    <p className="text-xs text-muted-foreground">{humanize(doc.type || "other")} • {formatDate(doc.uploadedAt)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button asChild size="icon" variant="ghost" className="size-8">
                                                    <a href={doc.url} target="_blank" rel="noreferrer"><DownloadSimple size={14} /></a>
                                                </Button>
                                                <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeletingDoc(doc._id)}>
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {emp.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Internal Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{emp.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this employee?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The record will be archived and marked as resigned. Audit history is preserved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate()} disabled={remove.isPending}>
                            {remove.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deletingDoc} onOpenChange={(o) => !o && setDeletingDoc(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this document?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeDoc.mutate(deletingDoc)} disabled={removeDoc.isPending}>
                            {removeDoc.isPending ? "Removing..." : "Remove"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EmployeeDetail;
