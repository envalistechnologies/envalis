import { Link } from "react-router-dom";
import {
    ShieldCheck, Eye, Database, Lock, UserCircle, Bell,
    Cookie, ShareNetwork, Globe, EnvelopeSimple, ArrowRight,
    Clock, Warning, CheckCircle
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Last updated date
const LAST_UPDATED = "January 15, 2025";

const PrivacyHero = () => (
    <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-brand-950 to-indigo-950 text-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="container mx-auto py-28 relative z-10 pt-36">
            <Badge className="mb-5 bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full">
                🔐 Legal
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight max-w-3xl">
                Privacy <span className="text-indigo-300">Policy</span>
            </h1>
            <p className="text-white/70 max-w-2xl text-lg leading-relaxed mb-8">
                At Envalis, your privacy isn't an afterthought it's a foundational commitment. This policy explains exactly how we collect, use, store, and protect your personal information when you interact with our website or services.
            </p>
            <div className="flex items-center gap-3 text-white/50 text-sm">
                <Clock size={15} />
                <span>Last updated: {LAST_UPDATED}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Effective immediately upon publication</span>
            </div>
        </div>
    </section>
);

// Quick Summary Cards
const summaryPoints = [
    { icon: Database, color: "from-blue-500 to-brand-600", title: "Minimal Collection", desc: "We only collect data that's necessary to deliver our services." },
    { icon: Lock, color: "from-indigo-500 to-purple-600", title: "Secure by Design", desc: "Industry-standard encryption and access controls protect your data." },
    { icon: UserCircle, color: "from-green-500 to-emerald-600", title: "Your Rights", desc: "You can access, correct, or delete your data at any time." },
    { icon: ShareNetwork, color: "from-orange-500 to-red-500", title: "No Selling", desc: "We never sell or rent your personal information to third parties." },
];

const SummarySection = () => (
    <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">At a Glance</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryPoints.map((s) => (
                    <div key={s.title} className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <s.icon size={18} weight="duotone" className="text-white" />
                        </div>
                        <h4 className="font-bold text-sm mb-1.5 group-hover:text-primary transition-colors">{s.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// Content sections data
const sections = [
    {
        id: "who-we-are",
        icon: Globe,
        title: "Who We Are",
        content: [
            {
                type: "p",
                text: "Envalis (referred to as \"we\", \"us\", or \"our\") is a full-service digital agency headquartered at 512 SG Highway, Prahlad Nagar, Ahmedabad 380015, India, with offices in Dubai and London. We provide web development, mobile application development, UI/UX design, cloud solutions, AI/ML engineering, and strategic consulting services.",
            },
            {
                type: "p",
                text: "This Privacy Policy applies to all visitors and users of the Envalis website (envalis.com) and to clients and prospective clients who engage with our services. By using our website or submitting your information to us, you agree to the practices described in this policy.",
            },
        ],
    },
    {
        id: "what-we-collect",
        icon: Database,
        title: "Information We Collect",
        content: [
            {
                type: "p",
                text: "We collect two categories of information: information you actively provide to us, and information collected automatically as you use our website.",
            },
            {
                type: "subheading",
                text: "Information You Provide Directly",
            },
            {
                type: "list",
                items: [
                    "Contact details such as your name, email address, phone number, and company name when you submit a contact or project inquiry form.",
                    "Project-related information including your goals, budget range, timelines, and any files or assets you share during the engagement process.",
                    "Communication records including emails, chat messages, and notes from calls or meetings.",
                    "Billing and payment information when applicable (processed securely through our payment providers we do not store raw card data).",
                    "Newsletter subscription preferences if you opt in to receive our updates.",
                    "Account credentials if you access any client portal or project management tools we provide.",
                ],
            },
            {
                type: "subheading",
                text: "Information Collected Automatically",
            },
            {
                type: "list",
                items: [
                    "IP address, browser type, device type, and operating system.",
                    "Pages visited, time spent on each page, links clicked, and referral source.",
                    "Geographic location data at the country or city level derived from your IP address.",
                    "Cookie identifiers and similar tracking technologies (see our Cookies section below).",
                    "Error logs and performance data used to diagnose and fix technical issues.",
                ],
            },
        ],
    },
    {
        id: "how-we-use",
        icon: Eye,
        title: "How We Use Your Information",
        content: [
            {
                type: "p",
                text: "We use the information we collect for specific, legitimate purposes related to our business operations. We do not use your data for anything beyond what is described below without obtaining your explicit consent.",
            },
            {
                type: "list",
                items: [
                    "Respond to your inquiries, evaluate your project requirements, and provide tailored proposals and quotations.",
                    "Deliver, manage, and improve the services outlined in our client agreements.",
                    "Send project updates, invoices, and operational communications necessary for our working relationship.",
                    "Send marketing communications, newsletters, or case study updates but only when you have explicitly opted in.",
                    "Analyse website usage patterns to improve the performance, content, and user experience of our website.",
                    "Comply with applicable legal obligations, including tax and financial record-keeping requirements.",
                    "Protect against fraud, unauthorized access, and other security threats.",
                    "Conduct legitimate business analytics to understand which services resonate most with prospective clients.",
                ],
            },
            {
                type: "p",
                text: "We rely on the following legal bases for processing your personal data: your consent (where given), the performance of a contract with you, our legitimate business interests, and compliance with legal obligations.",
            },
        ],
    },
    {
        id: "data-sharing",
        icon: ShareNetwork,
        title: "How We Share Your Data",
        content: [
            {
                type: "p",
                text: "We do not sell, rent, or trade your personal information. Period. We may share your data with carefully vetted third parties only in the following limited circumstances:",
            },
            {
                type: "list",
                items: [
                    "Service providers and sub-processors who assist us in operating our business (e.g., cloud hosting providers, email delivery platforms, project management tools, analytics services). These parties are contractually bound to process data only on our instructions and with equivalent privacy protections.",
                    "Payment processors for the secure handling of billing transactions. These providers are PCI-DSS compliant and we share only the minimum data required.",
                    "Legal authorities when required by applicable law, court order, or government regulation, or when necessary to protect the rights, property, or safety of Envalis, our clients, or the public.",
                    "Business successors in the event of a merger, acquisition, or sale of all or part of our business assets, provided the acquiring entity agrees to honour this Privacy Policy.",
                    "Professional advisors such as lawyers, accountants, and auditors under strict confidentiality obligations.",
                ],
            },
            {
                type: "p",
                text: "Whenever we engage third-party processors, we enter into Data Processing Agreements (DPAs) to ensure your data is handled with the same level of care we apply internally.",
            },
        ],
    },
    {
        id: "cookies",
        icon: Cookie,
        title: "Cookies & Tracking Technologies",
        content: [
            {
                type: "p",
                text: "Our website uses cookies and similar technologies to improve your browsing experience, understand usage patterns, and deliver relevant content. A cookie is a small text file stored on your device.",
            },
            {
                type: "subheading",
                text: "Types of Cookies We Use",
            },
            {
                type: "list",
                items: [
                    "Essential Cookies: Required for the website to function correctly. These cannot be disabled and do not collect personal information.",
                    "Analytics Cookies: Help us understand how visitors interact with our website (e.g., Google Analytics). All data is aggregated and anonymised.",
                    "Preference Cookies: Remember your settings and preferences to improve your return visits.",
                    "Marketing Cookies: Used to show relevant content and track campaign effectiveness only with your explicit consent.",
                ],
            },
            {
                type: "p",
                text: "You can control cookie preferences at any time through your browser settings or via our cookie consent banner. Note that disabling certain cookies may affect website functionality.",
            },
        ],
    },
    {
        id: "data-security",
        icon: Lock,
        title: "Data Security",
        content: [
            {
                type: "p",
                text: "We take the security of your personal information seriously and implement a multi-layered approach to protect it:",
            },
            {
                type: "list",
                items: [
                    "All data in transit is encrypted using TLS (Transport Layer Security) 1.2 or higher.",
                    "Data at rest is encrypted using AES-256 encryption on our cloud infrastructure.",
                    "Access to personal data is restricted on a strict need-to-know basis, with role-based access controls.",
                    "We conduct regular security audits, penetration testing, and vulnerability assessments.",
                    "All team members with access to client data undergo security awareness training.",
                    "We maintain an incident response plan and will notify affected parties promptly in the event of a data breach, as required by applicable law.",
                ],
            },
            {
                type: "p",
                text: "While we employ best-in-class security measures, no method of transmission over the internet is 100% secure. We encourage you to use strong, unique passwords and to contact us immediately if you suspect any unauthorized access to your data.",
            },
        ],
    },
    {
        id: "data-retention",
        icon: Clock,
        title: "Data Retention",
        content: [
            {
                type: "p",
                text: "We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, and in accordance with applicable legal, regulatory, tax, or accounting requirements.",
            },
            {
                type: "list",
                items: [
                    "Inquiry and pre-sales data: Retained for 24 months from the date of last contact.",
                    "Client project data: Retained for the duration of the engagement plus 7 years to meet contractual and legal obligations.",
                    "Financial records: Retained for a minimum of 7 years in line with statutory requirements.",
                    "Website analytics data: Retained for 26 months in aggregated, anonymised form.",
                    "Marketing opt-in records: Retained until you withdraw your consent.",
                ],
            },
            {
                type: "p",
                text: "When personal data is no longer required, we securely delete or anonymise it in accordance with our data disposal procedures.",
            },
        ],
    },
    {
        id: "your-rights",
        icon: UserCircle,
        title: "Your Rights",
        content: [
            {
                type: "p",
                text: "Depending on your location, you may have the following rights regarding your personal data. We are committed to honouring these rights promptly and without charge:",
            },
            {
                type: "list",
                items: [
                    "Right of Access: Request a copy of the personal data we hold about you.",
                    "Right to Rectification: Request correction of any inaccurate or incomplete data.",
                    "Right to Erasure: Request deletion of your personal data ('right to be forgotten'), subject to certain legal exceptions.",
                    "Right to Restrict Processing: Request that we limit how we use your data in certain circumstances.",
                    "Right to Data Portability: Receive your data in a structured, machine-readable format.",
                    "Right to Object: Object to processing based on our legitimate interests or for direct marketing purposes.",
                    "Right to Withdraw Consent: Withdraw any previously given consent at any time without affecting the lawfulness of prior processing.",
                    "Right to Lodge a Complaint: File a complaint with your local data protection authority if you believe your rights have been infringed.",
                ],
            },
            {
                type: "p",
                text: "To exercise any of these rights, please contact our Privacy Team at envalistechnologies@gmail.com. We will respond within 30 days. We may need to verify your identity before processing certain requests.",
            },
        ],
    },
    {
        id: "third-party-links",
        icon: Globe,
        title: "Third-Party Links",
        content: [
            {
                type: "p",
                text: "Our website may contain links to third-party websites, social media platforms, or tools (e.g., LinkedIn, GitHub, partner sites). This Privacy Policy applies only to Envalis-controlled properties.",
            },
            {
                type: "p",
                text: "We are not responsible for the privacy practices or content of external websites. We encourage you to read the privacy policies of any third-party sites you visit. We do not endorse or make any representations about third-party sites.",
            },
        ],
    },
    {
        id: "children",
        icon: Warning,
        title: "Children's Privacy",
        content: [
            {
                type: "p",
                text: "Our website and services are not directed at individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately at envalistechnologies@gmail.com and we will delete it promptly.",
            },
        ],
    },
    {
        id: "international",
        icon: Globe,
        title: "International Data Transfers",
        content: [
            {
                type: "p",
                text: "Envalis operates globally with offices in India, UAE, and the United Kingdom. Your data may be transferred to, stored, and processed in countries other than your own. In such cases, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by relevant data protection authorities.",
            },
            {
                type: "p",
                text: "By using our website or submitting information to us, you acknowledge that your data may be processed in jurisdictions that may not offer the same level of data protection as your home country. We take all reasonable steps to ensure your data remains protected regardless of where it is processed.",
            },
        ],
    },
    {
        id: "changes",
        icon: Bell,
        title: "Changes to This Policy",
        content: [
            {
                type: "p",
                text: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or business operations. When we make material changes, we will:",
            },
            {
                type: "list",
                items: [
                    "Update the 'Last Updated' date at the top of this policy.",
                    "Display a prominent notice on our website homepage for at least 30 days.",
                    "Send an email notification to registered users or active clients where appropriate.",
                ],
            },
            {
                type: "p",
                text: "We encourage you to review this policy periodically. Your continued use of our website or services after changes take effect constitutes your acceptance of the updated policy.",
            },
        ],
    },
];

// Table of Contents
const TableOfContents = () => (
    <div className="sticky top-24 p-5 rounded-2xl border border-border bg-card shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">On This Page</p>
        <nav className="space-y-1">
            {sections.map((s, i) => (
                <a key={s.id} href={`#${s.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-primary hover:bg-brand-50 transition-colors group">
                    <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-brand-100 transition-colors">{i + 1}</span>
                    {s.title}
                </a>
            ))}
        </nav>
    </div>
);

// Section renderer
const PolicySection = ({ section }) => (
    <div id={section.id} className="scroll-mt-28 group">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition-colors">
                <section.icon size={20} weight="duotone" className="text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{section.title}</h2>
        </div>
        <div className="space-y-4 text-muted-foreground pl-13">
            {section.content.map((block, i) => {
                if (block.type === "p") return (
                    <p key={i} className="leading-relaxed">{block.text}</p>
                );
                if (block.type === "subheading") return (
                    <h3 key={i} className="text-base font-bold text-foreground mt-6 mb-2">{block.text}</h3>
                );
                if (block.type === "list") return (
                    <ul key={i} className="space-y-2.5">
                        {block.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2.5">
                                <CheckCircle size={16} weight="duotone" className="text-brand-500 mt-0.5 shrink-0" />
                                <span className="leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                );
                return null;
            })}
        </div>
        <div className="mt-6 border-b border-border/50" />
    </div>
);

// Contact Box
const ContactBox = () => (
    <div className="mt-10 p-6 rounded-2xl border border-brand-200 bg-brand-50">
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <EnvelopeSimple size={20} weight="duotone" className="text-brand-600" />
            </div>
            <div>
                <h4 className="font-bold text-foreground mb-1">Privacy Questions?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    If you have any questions about this Privacy Policy or how we handle your data, our Privacy Team is here to help.
                </p>
                <a href="mailto:envalistechnologies@gmail.com"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                    envalistechnologies@gmail.com <ArrowRight size={14} />
                </a>
            </div>
        </div>
    </div>
);

// Main Page
const PrivacyPolicy = () => (
    <div className="bg-background">
        <PrivacyHero />
        <SummarySection />

        <section className="section-padding">
            <div className="container">
                <div className="grid lg:grid-cols-[260px_1fr] gap-12 items-start">
                    {/* Sidebar TOC */}
                    <aside className="hidden lg:block">
                        <TableOfContents />
                    </aside>

                    {/* Main content */}
                    <div className="space-y-10">
                        {sections.map((s) => (
                            <PolicySection key={s.id} section={s} />
                        ))}
                        <ContactBox />

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/terms-of-service">
                                <Button variant="outline" size="lg">
                                    Read Terms of Service <ArrowRight size={16} />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="gradient" size="lg">
                                    Contact Us <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

export default PrivacyPolicy;