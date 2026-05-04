import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, EnvelopeSimple, Phone, MapPin, Sparkle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { publicAPI } from "@/api/publicApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SERVICES = [
    "Web Development",
    "Mobile Apps",
    "UI/UX Design",
    "Cloud Solutions",
    "AI & ML",
    "Consulting",
];

const BUDGETS = ["< $5k", "$5k-$15k", "$15k-$50k", "$50k+", "Not sure"];
const TIMELINES = ["ASAP", "1-2 months", "3-6 months", "6+ months", "Not sure"];

const defaultForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    service: "",
    budget: "",
    timeline: "",
};

const Contact = () => {
    const [form, setForm] = useState(defaultForm);

    const submit = useMutation({
        mutationFn: (payload) => publicAPI.submitContact(payload),
        onSuccess: () => {
            toast.success("Thanks for reaching out. We will respond soon.");
            setForm(defaultForm);
        },
        onError: (e) => {
            toast.error(e?.response?.data?.message || "Unable to send message.");
        },
    });

    const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const onSubmit = (e) => {
        e.preventDefault();
        submit.mutate(form);
    };

    return (
        <div className="bg-background">
            <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-brand-950 to-rose-950 text-white">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="container mx-auto py-20 relative">
                    <div className="max-w-3xl">
                        <Badge className="mb-4 bg-white/10 text-white border-white/20">
                            <Sparkle size={14} weight="duotone" className="mr-2" /> Start a Project
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">Let's build something great</h1>
                        <p className="text-white/70 text-lg max-w-2xl">
                            Tell us about your goals and we will follow up with ideas, timelines, and next steps.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container mx-auto">
                    <div className="grid gap-10 lg:grid-cols-3">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="rounded-2xl border border-border bg-card p-6">
                                <h2 className="text-xl font-bold mb-3">Contact details</h2>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <EnvelopeSimple size={16} className="text-primary" />
                                        envalistechnologies@gmail.com
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-primary" />
                                        +91 63547 00626
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-primary mt-0.5" />
                                        Ahmedabad, Gujarat, India - 380001
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-6">
                                <h3 className="text-lg font-bold mb-2">What happens next</h3>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li>We review your request within 1 business day.</li>
                                    <li>Our team proposes a timeline and discovery session.</li>
                                    <li>We align on scope, budget, and launch plan.</li>
                                </ul>
                            </div>
                        </div>

                        <form className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 lg:p-10 space-y-6" onSubmit={onSubmit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full name</Label>
                                    <Input id="name" value={form.name} onChange={onChange("name")} placeholder="Jane Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={form.email} onChange={onChange("email")} placeholder="jane@company.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={form.phone} onChange={onChange("phone")} placeholder="+91 98765 43210" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input id="company" value={form.company} onChange={onChange("company")} placeholder="Company name" />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Service</Label>
                                    <Select value={form.service || "none"} onValueChange={(v) => setForm((prev) => ({ ...prev, service: v === "none" ? "" : v }))}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select a service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Not sure yet</SelectItem>
                                            {SERVICES.map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" value={form.subject} onChange={onChange("subject")} placeholder="Project inquiry" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Budget</Label>
                                    <Select value={form.budget || "none"} onValueChange={(v) => setForm((prev) => ({ ...prev, budget: v === "none" ? "" : v }))}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select a range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Not sure yet</SelectItem>
                                            {BUDGETS.map((b) => (
                                                <SelectItem key={b} value={b}>{b}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Timeline</Label>
                                    <Select value={form.timeline || "none"} onValueChange={(v) => setForm((prev) => ({ ...prev, timeline: v === "none" ? "" : v }))}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select a timeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Not sure yet</SelectItem>
                                            {TIMELINES.map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" value={form.message} onChange={onChange("message")} rows={6} placeholder="Tell us about your goals..." required />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">We respect your privacy and never share data.</p>
                                <Button type="submit" size="lg" variant="gradient" disabled={submit.isPending}>
                                    {submit.isPending ? "Sending..." : "Send message"} <ArrowRight size={16} />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
