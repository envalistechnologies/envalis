import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Envelope, EnvelopeOpen, PaperPlaneTilt, CheckCircle, Warning, Clock,
  User, Tag, Paperclip, Calendar, Hash, EnvelopeSimple,
} from "@phosphor-icons/react";

import { emailsAPI } from "@/api/emailsApi";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime, humanize } from "@/lib/utils";

const Row = ({ icon: Icon, label, value, valueClassName }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon size={16} weight="duotone" className="text-muted-foreground mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={`text-sm font-medium wrap-break-word ${valueClassName || ""}`}>{value || "N/A"}</div>
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    sent: { label: "Sent", variant: "info", Icon: PaperPlaneTilt },
    delivered: { label: "Delivered", variant: "success", Icon: CheckCircle },
    queued: { label: "Queued", variant: "warning", Icon: Clock },
    failed: { label: "Failed", variant: "destructive", Icon: Warning },
    bounced: { label: "Bounced", variant: "destructive", Icon: Warning },
  };
  const cfg = map[status] || { label: status, variant: "secondary", Icon: EnvelopeSimple };
  const { Icon } = cfg;
  return (
    <Badge variant={cfg.variant} className="gap-1">
      <Icon size={11} weight="fill" /> {cfg.label}
    </Badge>
  );
};

const Recipients = ({ list, label }) => {
  if (!list?.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label} ({list.length})</p>
      <div className="flex flex-wrap gap-1.5">
        {list.map((email, i) => (
          <Badge key={`${email}-${i}`} variant="outline" className="font-mono text-[11px]">{email}</Badge>
        ))}
      </div>
    </div>
  );
};

const EmailLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["email-log", id],
    queryFn: () => emailsAPI.getLogById(id).then((r) => r.data?.log || r.data),
  });

  if (isLoading) return <PageLoader />;
  const log = data;
  if (!log) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={log.subject}
        description={`Email log · ${formatDateTime(log.sentAt || log.createdAt)}`}
        showBack
        backPath="/emails/logs"
        actions={
          <Button variant="outline" onClick={() => navigate("/emails/send")}>
            <PaperPlaneTilt size={15} className="mr-1.5" /> New Email
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {statusBadge(log.status)}
              <Badge variant="outline" className="capitalize">{humanize(log.type || "individual")}</Badge>
              <Badge variant="secondary" className="capitalize">{humanize(log.category || "other")}</Badge>
            </div>
            <Separator />
            <Row icon={Calendar} label="Sent at" value={formatDateTime(log.sentAt)} />
            <Row icon={Calendar} label="Delivered at" value={log.deliveredAt ? formatDateTime(log.deliveredAt) : "N/A"} />
            <Row icon={Hash} label="Recipient count" value={log.recipientCount ?? (Array.isArray(log.to) ? log.to.length : 1)} />
            <Row icon={User} label="Sent by" value={log.sentByName || (log.sentBy ? `${log.sentBy.firstName || ""} ${log.sentBy.lastName || ""}`.trim() : "System")} />
            {log.template && (
              <Row icon={Tag} label="Template" value={log.templateName || log.template?.name} />
            )}
            {log.failedReason && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                  <Warning size={13} weight="fill" /> Failure reason
                </p>
                <p className="text-xs text-destructive/90 mt-1 wrap-break-word">{log.failedReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Row icon={EnvelopeOpen} label="From" value={log.from} valueClassName="font-mono text-xs" />
              <Recipients list={log.to} label="To" />
              <Recipients list={log.cc} label="CC" />
              <Recipients list={log.bcc} label="BCC" />
              {log.tags?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.tags.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {log.attachments?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Paperclip size={12} /> Attachments
                  </p>
                  <div className="space-y-1">
                    {log.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Paperclip size={12} /> {a.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Body</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="preview">
                <div className="px-4 pt-2">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="preview" className="p-4">
                  <div className="rounded-md border bg-background overflow-hidden">
                    <ScrollArea className="h-125">
                      <div className="p-4 text-sm" dangerouslySetInnerHTML={{ __html: log.body || "" }} />
                    </ScrollArea>
                  </div>
                </TabsContent>
                <TabsContent value="html" className="p-4">
                  <ScrollArea className="h-125 rounded-md border bg-muted/30">
                    <pre className="p-4 text-xs font-mono whitespace-pre-wrap wrap-break-word">
                      {log.body || "N/A"}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailLogDetail;
