import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Pencil, Trash, ChatsCircle, Calendar, Envelope, Phone, Building, Tag,
    FolderOpen, MapPin, CheckCircle, WarningCircleIcon, Clock,
} from "@phosphor-icons/react";

import { contactsAPI } from "@/api/contactsApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInitials, formatDate, formatDateTime, humanize } from "@/lib/utils";

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

const ContactDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [statusUpdate, setStatusUpdate] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["contact", id],
        queryFn: () => contactsAPI.getById(id).then((r) => r.data?.contact || r.data),
    });

    const updateStatus = useMutation({
        mutationFn: (payload) => contactsAPI.updateStatus(id, payload),
        onSuccess: () => {
            toast.success("Contact updated");
            qc.invalidateQueries({ queryKey: ["contact", id] });
            qc.invalidateQueries({ queryKey: ["contacts"] });
            setStatusUpdate("");
            setNewNote("");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const remove = useMutation({
        mutationFn: () => contactsAPI.delete(id),
        onSuccess: () => {
            toast.success("Contact deleted");
            qc.invalidateQueries({ queryKey: ["contacts"] });
            navigate("/contacts");
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    const handleAddNote = () => {
        if (!newNote.trim()) {
            toast.error("Please enter a note");
            return;
        }
        updateStatus.mutate({ notes: { content: newNote } });
    };

    const handleStatusChange = (newStatus) => {
        if (!newStatus) return;
        const payload = { status: newStatus };
        if (newStatus === "read" || newStatus === "in_progress" || newStatus === "replied") {
            payload.isRead = true;
        }
        updateStatus.mutate(payload);
        setStatusUpdate(newStatus);
    };

    if (isLoading) return <PageLoader />;
    const contact = data;
    if (!contact) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={contact.name}
                description={contact.email}
                showBack
                backPath="/contacts"
                actions={
                    <>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash size={15} className="mr-1.5" /> Delete
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin size={18} weight="duotone" className="text-primary" /> Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Stat icon={Envelope} label="Email" value={contact.email} />
                                <Stat icon={Phone} label="Phone" value={contact.phone} />
                                <Stat icon={Building} label="Company" value={contact.company} />
                                <Stat icon={Tag} label="Service Interest" value={humanize(contact.service || "—")} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ChatsCircle size={18} weight="duotone" className="text-primary" /> Message
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                                <p className="text-sm font-medium">{contact.subject}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Message</p>
                                <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    {(contact.budget || contact.timeline) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Project Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {contact.budget && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Budget</p>
                                        <Badge variant="secondary" className="capitalize">
                                            {contact.budget}
                                        </Badge>
                                    </div>
                                )}
                                {contact.timeline && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                                        <Badge variant="secondary" className="capitalize">
                                            {contact.timeline}
                                        </Badge>
                                    </div>
                                )}
                                {contact.source && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Source</p>
                                        <Badge variant="outline" className="capitalize">
                                            {humanize(contact.source)}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contact.notes && contact.notes.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                    {contact.notes.map((note, i) => (
                                        <div key={i} className="bg-muted/50 p-3 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {formatDateTime(note.addedAt)}
                                            </p>
                                            <p className="text-sm">{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No notes yet</p>
                            )}
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Add a note</p>
                                <Textarea
                                    placeholder="Type your note here..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="min-h-20"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleAddNote}
                                    disabled={updateStatus.isPending || !newNote.trim()}
                                >
                                    Add Note
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Current Status</p>
                                <StatusBadge status={contact.status} />
                            </div>
                            <Select value={statusUpdate || contact.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="replied">Replied</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="spam">Spam</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Priority</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge
                                variant={
                                    contact.priority === "high" ? "destructive" :
                                    contact.priority === "medium" ? "secondary" :
                                    "outline"
                                }
                                className="capitalize"
                            >
                                {contact.priority || "medium"}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Stat icon={Calendar} label="Submitted" value={formatDate(contact.createdAt)} />
                            {contact.readAt && <Stat icon={CheckCircle} label="Read" value={formatDate(contact.readAt)} />}
                            {contact.repliedAt && <Stat icon={Envelope} label="Replied" value={formatDate(contact.repliedAt)} />}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this contact? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => remove.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ContactDetail;
