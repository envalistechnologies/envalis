import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Phone, EnvelopeSimple, LinkedinLogo, Globe, FilePdf, DownloadSimple,
    DotsThreeVertical, Calendar, ChatCircle, ArrowsClockwise, FileMagnifyingGlass,
} from "@phosphor-icons/react";

import { careersAPI } from "@/api/careersApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials, formatDate, humanize } from "@/lib/utils";

const APP_STATUSES = ["pending", "reviewing", "shortlisted", "interview", "selected", "rejected", "withdrawn"];

const CareerApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeApp, setActiveApp] = useState(null);
    const [notes, setNotes] = useState("");
    const [draftStatus, setDraftStatus] = useState("");

    const { data: career, isLoading } = useQuery({
        queryKey: ["career", id],
        queryFn: () => careersAPI.getById(id).then((r) => r.data?.job || r.data),
    });

    const updateStatus = useMutation({
        mutationFn: ({ appId, payload }) => careersAPI.updateApplicationStatus(id, appId, payload),
        onSuccess: () => {
            toast.success("Application updated");
            qc.invalidateQueries({ queryKey: ["career", id] });
            setActiveApp(null);
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
    });

    if (isLoading) return <PageLoader />;
    if (!career) return null;

    const allApps = career.applications || [];
    const apps = statusFilter === "all" ? allApps : allApps.filter((a) => a.status === statusFilter);

    const counts = APP_STATUSES.reduce((acc, s) => {
        acc[s] = allApps.filter((a) => a.status === s).length;
        return acc;
    }, {});

    const openApp = (app) => {
        setActiveApp(app);
        setNotes(app.notes || "");
        setDraftStatus(app.status || "pending");
    };

    const saveStatus = () => {
        if (!activeApp) return;
        updateStatus.mutate({
            appId: activeApp._id,
            payload: { status: draftStatus, notes },
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Applications · ${career.title}`}
                description={`${allApps.length} total · ${career.jobId}`}
                showBack
                backPath={`/careers/${id}`}
                actions={
                    <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["career", id] })}>
                        <ArrowsClockwise size={15} className="mr-1.5" /> Refresh
                    </Button>
                }
            />

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="all">All ({allApps.length})</TabsTrigger>
                    {APP_STATUSES.map((s) => (
                        <TabsTrigger key={s} value={s}>{humanize(s)} ({counts[s] || 0})</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {!apps.length ? (
                <EmptyState icon={FileMagnifyingGlass} title="No applications" message="No candidates have applied for this job yet." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {apps.map((app) => (
                        <Card key={app._id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openApp(app)}>
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="size-10">
                                            <AvatarFallback className="text-xs">{getInitials(app.applicantName)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{app.applicantName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{app.applicantEmail}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>
                                <Separator />
                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                    {app.applicantPhone && <p className="flex items-center gap-1.5"><Phone size={12} /> {app.applicantPhone}</p>}
                                    <p className="flex items-center gap-1.5"><Calendar size={12} /> Applied {formatDate(app.appliedAt)}</p>
                                </div>
                                <div className="flex items-center justify-between gap-2 pt-1">
                                    <div className="flex items-center gap-1">
                                        {app.resumeUrl && (
                                            <a onClick={(e) => e.stopPropagation()} href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                <FilePdf size={11} /> Resume
                                            </a>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">View</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Sheet open={!!activeApp} onOpenChange={(o) => !o && setActiveApp(null)}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {activeApp && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{activeApp.applicantName}</SheetTitle>
                                <SheetDescription>Applied {formatDate(activeApp.appliedAt)}</SheetDescription>
                            </SheetHeader>

                            <div className="space-y-5 py-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2"><EnvelopeSimple size={14} /> {activeApp.applicantEmail}</p>
                                        {activeApp.applicantPhone && <p className="flex items-center gap-2"><Phone size={14} /> {activeApp.applicantPhone}</p>}
                                        {activeApp.linkedinUrl && (
                                            <a href={activeApp.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                                <LinkedinLogo size={14} /> LinkedIn
                                            </a>
                                        )}
                                        {activeApp.portfolioUrl && (
                                            <a href={activeApp.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                                <Globe size={14} /> Portfolio
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>

                                {activeApp.resumeUrl && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Resume</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Button asChild variant="outline" size="sm">
                                                <a href={activeApp.resumeUrl} target="_blank" rel="noreferrer">
                                                    <DownloadSimple size={14} className="mr-1.5" /> Download Resume
                                                </a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {activeApp.coverLetter && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Cover Letter</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{activeApp.coverLetter}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <ChatCircle size={14} weight="duotone" /> Internal Review
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="text-xs">Status</Label>
                                            <Select value={draftStatus} onValueChange={setDraftStatus}>
                                                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {APP_STATUSES.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Notes</Label>
                                            <Textarea
                                                rows={4}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Reviewer notes, interview feedback..."
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <SheetFooter>
                                <Button variant="outline" onClick={() => setActiveApp(null)}>Cancel</Button>
                                <Button onClick={saveStatus} disabled={updateStatus.isPending}>
                                    {updateStatus.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default CareerApplications;
