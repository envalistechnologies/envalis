import { Link } from "react-router-dom";
import {
  Scales, FileText, Handshake, CurrencyDollar, ShieldCheck,
  Copyright, Warning, ArrowCounterClockwise, Gavel,
  EnvelopeSimple, ArrowRight, CheckCircle, Clock, X, Globe
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Last updated date
const LAST_UPDATED = "January 15, 2025";

// Hero
const TermsHero = () => (
  <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-brand-950 to-emerald-950 text-white">
    <div className="absolute inset-0 bg-dots opacity-30" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/3" />
    <div className="container mx-auto py-28 relative z-10 pt-36">
      <Badge className="mb-5 bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full">
        ⚖️ Legal
      </Badge>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight max-w-3xl">
        Terms of <span className="text-emerald-300">Service</span>
      </h1>
      <p className="text-white/70 max-w-2xl text-lg leading-relaxed mb-8">
        These terms govern your use of the Envalis website and the professional services we provide. Please read them carefully they protect both you and us, and form the basis of a clear, fair working relationship.
      </p>
      <div className="flex items-center gap-3 text-white/50 text-sm">
        <Clock size={15} />
        <span>Last updated: {LAST_UPDATED}</span>
        <span className="w-1 h-1 rounded-full bg-white/30" />
        <span>Effective for all engagements from this date</span>
      </div>
    </div>
  </section>
);

// Quick Summary Cards
const summaryPoints = [
  { icon: Handshake, color: "from-emerald-500 to-teal-600", title: "Fair Agreements", desc: "All project scopes and deliverables are agreed in writing before work begins." },
  { icon: ShieldCheck, color: "from-brand-500 to-purple-600", title: "IP Protection", desc: "Your IP is protected. We clearly define ownership in every contract." },
  { icon: CurrencyDollar, color: "from-yellow-500 to-orange-500", title: "Transparent Billing", desc: "No hidden fees. Payment terms and schedules are defined upfront." },
  { icon: Scales, color: "from-blue-500 to-indigo-600", title: "Governed by Law", desc: "These terms are governed by the laws of India unless otherwise agreed." },
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
    id: "acceptance",
    icon: FileText,
    title: "Acceptance of Terms",
    content: [
      {
        type: "p",
        text: "By accessing or using the Envalis website (envalis.com) or by engaging Envalis for any professional services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy, which is incorporated herein by reference.",
      },
      {
        type: "p",
        text: "These Terms apply to all visitors, users, prospective clients, and active clients. If you are entering into these Terms on behalf of a company or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms.",
      },
      {
        type: "p",
        text: "If you do not agree with any part of these Terms, you must immediately discontinue your use of the website and must not engage our services. Continued use of the website after any changes to these Terms constitutes your acceptance of the updated version.",
      },
    ],
  },
  {
    id: "use-of-website",
    icon: Globe,
    title: "Use of the Website",
    content: [
      {
        type: "p",
        text: "You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Envalis website solely for lawful purposes and in accordance with these Terms. You agree not to:",
      },
      {
        type: "list-cross",
        items: [
          "Use the website in any way that violates applicable local, national, or international law or regulation.",
          "Transmit any unsolicited or unauthorised advertising, promotional material, spam, or any other form of solicitation.",
          "Attempt to gain unauthorised access to any part of the website, its servers, or any systems or databases connected to the website.",
          "Use automated tools, bots, scrapers, or crawlers to extract data from the website without our prior written consent.",
          "Reproduce, duplicate, copy, sell, resell, or exploit any portion of the website, content, or services without express written permission from Envalis.",
          "Introduce any malware, viruses, trojan horses, worms, or other materially harmful or technologically destructive code into the website.",
          "Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity.",
          "Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the website, or which may cause harm to Envalis or website users.",
        ],
      },
      {
        type: "p",
        text: "We reserve the right to terminate or suspend your access to the website at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, Envalis, or third parties, or for any other reason.",
      },
    ],
  },
  {
    id: "project-engagements",
    icon: Handshake,
    title: "Project Engagements & Service Agreements",
    content: [
      {
        type: "p",
        text: "All professional service engagements between Envalis and a client are governed by a separate written agreement (\"Service Agreement\" or \"Statement of Work\"). These Terms of Service form the general framework within which all such agreements operate.",
      },
      {
        type: "subheading",
        text: "Project Scope & Deliverables",
      },
      {
        type: "list",
        items: [
          "All project scopes, deliverables, milestones, and timelines will be defined in a written Statement of Work (SOW) signed by both parties prior to the commencement of work.",
          "Any changes to the agreed project scope including additions, modifications, or reductions — must be agreed in writing by both parties through a formal Change Order process.",
          "Verbal agreements, informal emails, or messages in project management tools do not constitute a binding change to the agreed SOW unless documented in a formal Change Order.",
          "Changes to scope may affect timeline and pricing. Envalis will provide a written impact assessment for all change requests within 3 business days.",
        ],
      },
      {
        type: "subheading",
        text: "Client Responsibilities",
      },
      {
        type: "list",
        items: [
          "Provide timely feedback, approvals, and required materials (e.g., content, branding assets, credentials) as outlined in the SOW.",
          "Designate a primary point of contact who has the authority to make decisions on behalf of your organisation.",
          "Ensure that all materials and information provided to Envalis do not infringe third-party intellectual property rights and comply with applicable laws.",
          "Promptly notify Envalis of any changes in your requirements, business situation, or project priorities that may affect the engagement.",
        ],
      },
      {
        type: "p",
        text: "Delays caused by late client feedback, missing assets, or failure to meet client responsibilities may result in revised timelines at no additional cost to Envalis, or may attract additional fees if they cause significant disruption to our resource planning.",
      },
    ],
  },
  {
    id: "payment-terms",
    icon: CurrencyDollar,
    title: "Payment Terms & Billing",
    content: [
      {
        type: "p",
        text: "All fees, payment schedules, and billing arrangements are specified in the applicable Service Agreement. The following general terms apply to all engagements unless otherwise agreed in writing:",
      },
      {
        type: "list",
        items: [
          "Invoices are issued in accordance with the payment milestones defined in the SOW. Standard payment terms are net 14 days from the invoice date unless otherwise agreed.",
          "A non-refundable project initiation deposit (typically 30–50% of the total project value) is required before work commences, unless otherwise agreed.",
          "Late payments attract interest at a rate of 1.5% per month (18% per annum) on the outstanding balance, accruing from the due date.",
          "Envalis reserves the right to pause or suspend work on any active project in the event of an overdue invoice that remains unpaid for more than 14 days after its due date.",
          "All prices are quoted exclusive of applicable taxes (including but not limited to GST, VAT). Tax will be added to invoices as required by law.",
          "Multi-currency projects will be invoiced in the currency agreed in the SOW. Envalis is not responsible for exchange rate fluctuations.",
          "Disputed invoices must be raised in writing within 7 days of the invoice date. Undisputed portions of an invoice remain due and payable on time.",
        ],
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: Copyright,
    title: "Intellectual Property",
    content: [
      {
        type: "subheading",
        text: "Envalis Website Content",
      },
      {
        type: "p",
        text: "All content on the Envalis website — including text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software — is the exclusive property of Envalis or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of any website content without our express written consent.",
      },
      {
        type: "subheading",
        text: "Client Project IP",
      },
      {
        type: "list",
        items: [
          "Upon receipt of full and final payment for a project, Envalis assigns to the client all intellectual property rights in the specific custom deliverables created exclusively for that client, unless otherwise stated in the SOW.",
          "Envalis retains ownership of all pre-existing intellectual property, frameworks, libraries, tools, methodologies, and know-how that exist prior to or are developed independently of the client engagement ('Background IP').",
          "Envalis grants the client a perpetual, royalty-free, non-exclusive licence to use Background IP that is incorporated into the client's deliverables, solely to the extent necessary to use those deliverables.",
          "Envalis reserves the right to display the project in its portfolio, case studies, and marketing materials unless the client requests a specific confidentiality arrangement in writing prior to project commencement.",
          "Third-party software, libraries, or tools incorporated into deliverables remain subject to their respective licences. Envalis will notify clients of any such inclusions and associated licensing obligations.",
        ],
      },
    ],
  },
  {
    id: "confidentiality",
    icon: ShieldCheck,
    title: "Confidentiality",
    content: [
      {
        type: "p",
        text: "Both parties acknowledge that in the course of a project engagement, they may receive access to proprietary, sensitive, or confidential information belonging to the other party ('Confidential Information'). Both parties agree to:",
      },
      {
        type: "list",
        items: [
          "Keep all Confidential Information strictly confidential and not disclose it to any third party without prior written consent.",
          "Use Confidential Information solely for the purposes of the engagement as described in the SOW.",
          "Restrict access to Confidential Information to those employees, contractors, or advisors who have a genuine need to know and who are bound by equivalent confidentiality obligations.",
          "Promptly notify the other party upon becoming aware of any actual or suspected breach of confidentiality.",
          "Return or destroy all Confidential Information upon request or upon termination of the engagement.",
        ],
      },
      {
        type: "p",
        text: "Confidentiality obligations do not apply to information that is or becomes publicly known through no fault of the receiving party, was already in the receiving party's possession prior to disclosure, or is required to be disclosed by law or court order.",
      },
      {
        type: "p",
        text: "For clients requiring stronger confidentiality protections, we are happy to enter into a separate Non-Disclosure Agreement (NDA) prior to any project discussions.",
      },
    ],
  },
  {
    id: "limitation-liability",
    icon: Warning,
    title: "Limitation of Liability",
    content: [
      {
        type: "p",
        text: "To the fullest extent permitted by applicable law, Envalis, its directors, employees, contractors, agents, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to:",
      },
      {
        type: "list-cross",
        items: [
          "Loss of profits, revenue, data, business, or goodwill.",
          "Loss of anticipated savings or opportunity.",
          "Business interruption or downtime.",
          "Cost of substitute goods or services.",
          "Damages arising from unauthorised access to or alteration of your data.",
        ],
      },
      {
        type: "p",
        text: "Envalis's total cumulative liability to you for any claims arising under or related to these Terms or any Service Agreement whether in contract, tort (including negligence), breach of statutory duty, or otherwise shall not exceed the total fees paid by you to Envalis in the three (3) months immediately preceding the event giving rise to the claim.",
      },
      {
        type: "p",
        text: "Nothing in these Terms shall limit or exclude liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited by applicable law.",
      },
    ],
  },
  {
    id: "warranties",
    icon: CheckCircle,
    title: "Warranties & Disclaimers",
    content: [
      {
        type: "p",
        text: "Envalis warrants that:",
      },
      {
        type: "list",
        items: [
          "Services will be performed with reasonable skill, care, and diligence.",
          "Deliverables will materially conform to the specifications set out in the agreed SOW.",
          "We will promptly remedy any material defects in deliverables reported within 30 days of delivery, at no additional charge.",
        ],
      },
      {
        type: "p",
        text: "Except as expressly stated above, the Envalis website and all content, materials, and information on it are provided on an 'as is' and 'as available' basis, without any warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.",
      },
      {
        type: "p",
        text: "Envalis does not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components, or that defects will be corrected.",
      },
    ],
  },
  {
    id: "termination",
    icon: ArrowCounterClockwise,
    title: "Termination",
    content: [
      {
        type: "p",
        text: "Either party may terminate a Service Agreement in accordance with the termination provisions set out in that agreement. In general, the following applies:",
      },
      {
        type: "list",
        items: [
          "Either party may terminate a project engagement with 30 days' written notice, subject to payment for all work completed and expenses incurred up to the termination date.",
          "Envalis may terminate immediately with written notice if the client fails to make payment within 30 days of its due date, or commits a material breach of the SOW or these Terms.",
          "The client may terminate immediately with written notice if Envalis commits a material breach and fails to remedy it within 14 days of receiving written notice specifying the breach.",
          "Upon termination, all licences granted under these Terms or any SOW shall terminate immediately, except for any perpetual licences already granted in respect of fully paid deliverables.",
          "Sections relating to IP ownership, confidentiality, limitation of liability, indemnification, and governing law shall survive any termination of these Terms or a Service Agreement.",
        ],
      },
    ],
  },
  {
    id: "indemnification",
    icon: Scales,
    title: "Indemnification",
    content: [
      {
        type: "p",
        text: "You agree to indemnify, defend, and hold harmless Envalis and its officers, directors, employees, contractors, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable legal fees) arising out of or relating to:",
      },
      {
        type: "list",
        items: [
          "Your violation of these Terms of Service.",
          "Your use of the Envalis website in a manner not expressly permitted by these Terms.",
          "Any materials or information you provide to Envalis that infringe the intellectual property rights, privacy rights, or other rights of any third party.",
          "Your violation of any applicable law, regulation, or third-party right.",
          "Any misrepresentation made by you to Envalis or to any third party in connection with your engagement with us.",
        ],
      },
    ],
  },
  {
    id: "governing-law",
    icon: Gavel,
    title: "Governing Law & Dispute Resolution",
    content: [
      {
        type: "p",
        text: "These Terms and any disputes arising out of or relating to them or any Service Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles, unless a specific jurisdiction is agreed in writing for a particular client engagement.",
      },
      {
        type: "subheading",
        text: "Dispute Resolution Process",
      },
      {
        type: "list",
        items: [
          "Step 1 — Informal Resolution: Both parties agree to first attempt to resolve any dispute informally by contacting the other party's designated representative and attempting to negotiate in good faith for a period of 30 days.",
          "Step 2 — Mediation: If informal resolution fails, either party may request mediation before a mutually agreed mediator. The costs of mediation shall be shared equally.",
          "Step 3 — Arbitration or Litigation: Unresolved disputes shall be finally settled by binding arbitration administered under the Arbitration and Conciliation Act, 1996 (India), with the seat of arbitration in Ahmedabad, Gujarat. Alternatively, both parties may elect to litigate before the courts of Ahmedabad, which shall have exclusive jurisdiction.",
        ],
      },
      {
        type: "p",
        text: "Notwithstanding the above, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights or confidential information.",
      },
    ],
  },
  {
    id: "changes",
    icon: FileText,
    title: "Changes to These Terms",
    content: [
      {
        type: "p",
        text: "We reserve the right to update or modify these Terms of Service at any time at our sole discretion. When we make material changes, we will update the 'Last Updated' date at the top of this page and, where appropriate, provide notice via our website or email.",
      },
      {
        type: "p",
        text: "Your continued use of the website or engagement of our services after any changes become effective constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the website and, if applicable, serve notice of termination of any active service agreements in accordance with the termination provisions of those agreements.",
      },
      {
        type: "p",
        text: "We recommend bookmarking this page and reviewing it periodically. For active clients, material changes that affect your ongoing service agreements will be communicated directly.",
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
        if (block.type === "list-cross") return (
          <ul key={i} className="space-y-2.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5">
                <X size={16} weight="bold" className="text-red-400 mt-0.5 shrink-0" />
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
        <h4 className="font-bold text-foreground mb-1">Questions About These Terms?</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          If you have any questions, concerns, or require clarification about any aspect of these Terms of Service, please get in touch with our legal team.
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
const TermsOfService = () => (
  <div className="bg-background">
    <TermsHero />
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
              <Link to="/privacy-policy">
                <Button variant="outline" size="lg">
                  Read Privacy Policy <ArrowRight size={16} />
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

export default TermsOfService;