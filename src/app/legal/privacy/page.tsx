import Link from "next/link";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

export const metadata = {
  title: "Privacy Notice & Data Protection Policy · OASIS",
  description:
    "Statutory data protection policy under the Digital Personal Data Protection Act, 2023 (DPDP Act) for the OASIS platform in Odisha.",
};

const DATA_CATEGORIES = [
  {
    category: "1. Common Account & Identity",
    fields:
      "Full name, email address (unique ID), Argon2id salted password hash or Google OAuth sub, 18+ age confirmation, time zone.",
    scope: "Full name & role visible to approved members. Email is Private by default.",
    type: "Required",
  },
  {
    category: "2. Contact & Profile Details",
    fields:
      "Phone number (verified via SMS OTP), City and State, profile photo (<=2 MB), bio (<=500 chars), areas of interest, LinkedIn/website.",
    scope:
      "Phone is Private by default. City, bio, interests, and photo visible to approved members (customizable).",
    type: "Bio/City Required; Phone/Photo Optional",
  },
  {
    category: "3. Aspiring Entrepreneur Data",
    fields:
      "Idea/focus area (<=500 chars), preferred sectors, skills & experience (<=1,000 chars), current stage (Exploring, Validation, Planning, Pre-MVP), guidance needed.",
    scope: "Visible to approved members according to your field privacy settings.",
    type: "Role-Specific Required",
  },
  {
    category: "4. Startup Founder Data",
    fields:
      "Startup name, role in company, industry sector, stage (Ideation, MVP, Launched, Revenue, Scaling), product summary (<=1,000 chars), website URL, location.",
    scope: "Visible to approved members. Multiple co-founders link to one shared Startup record.",
    type: "Role-Specific Required",
  },
  {
    category: "5. Mentor & Advisor Data",
    fields:
      "Current organization, years of experience (1-3, 3-5, 5-10, 10-15, 15+), expertise tags, mentoring topics, availability status, LinkedIn URL, verification evidence (PDF/JPEG/PNG <=10 MB).",
    scope:
      "Profile fields visible to approved members. Verification evidence is Strictly Private to reviewing admins via signed URLs.",
    type: "Role-Specific Required",
  },
  {
    category: "6. Personal Planner Tasks",
    fields: "Task titles (<=200 chars), notes (<=2,000 chars), deadlines, priorities, reminders.",
    scope: "Strictly Private to the Member. Zero visibility to other members or administrators.",
    type: "Optional / User-Generated",
  },
];

export default function PrivacyNoticePage() {
  return (
    <article className="space-y-9 text-[15px] leading-7 text-gray-700">
      <DocsPageHeader
        title="Privacy Policy"
        meta="Last updated: 16 October 2026 · Version 1.0"
      />

      <div className="space-y-4">
        <p>
          Welcome to OASIS&rsquo;s privacy notice (&ldquo;Privacy Policy&rdquo; or &ldquo;Policy&rdquo;). Drafted and enforced in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India, the IT Act 2000, and SPDI Rules 2011.
        </p>
        <p>
          <strong>OASIS</strong> (Odisha Startup Community), headquartered at Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018 (collectively, &ldquo;OASIS&rdquo;, &ldquo;we&rdquo; or &ldquo;us&rdquo;), operates the OASIS community portal available at{" "}
          <Link href="/" className="text-[#4F46E5] hover:underline">
            https://oasisodisha.in/
          </Link>{" "}
          (the &ldquo;Platform&rdquo;). This Policy outlines our practices for collecting, storing, processing, and protecting personal data when you apply for membership or interact with our Platform.
        </p>
        <p>
          We follow three core commitments: <strong>Data Minimization</strong> (we collect only what is needed to verify identity and run the community), <strong>Private by Default</strong> (phone numbers and email addresses are hidden unless explicitly consented on connection), and <strong>Zero Data Selling</strong> (we never sell, rent, or monetize member data).
        </p>
        <p>
          Please read this Policy together with our{" "}
          <Link href="/legal/terms" className="text-[#4F46E5] hover:underline">
            Terms of Service
          </Link>
          . By registering or using the Platform, you consent to the processing described below.
        </p>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
          <div>
            <strong className="text-gray-900">Data Fiduciary:</strong> OASIS
          </div>
          <div>
            <strong className="text-gray-900">Jurisdiction:</strong> Bhubaneswar, Odisha, India
          </div>
          <div>
            <strong className="text-gray-900">Grievance &amp; Privacy Email:</strong> Info@oasisodisha.in
          </div>
          <div>
            <strong className="text-gray-900">Contact Phone:</strong> +91-904-01-98-628
          </div>
          <div className="sm:col-span-2">
            <strong className="text-gray-900">Registered Office:</strong> Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
          </div>
        </div>
      </div>

      <section id="fiduciary-compliance" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          1. Data Fiduciary Identity &amp; Statutory Compliance
        </h2>
        <p>
          <strong>OASIS</strong>, headquartered in Bhubaneswar, Odisha, India, operates the OASIS platform and acts as the <strong>Data Fiduciary</strong> in respect of all personal data collected and processed through the Platform under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
        </p>
        <p>
          Personal data is collected strictly on the lawful basis of your free, specific, informed, unconditional, and unambiguous <strong>Consent</strong> (immutably recorded in <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">ConsentRecord</code>) and for legitimate community safety and administration uses under Section 4 and Section 7 of the DPDP Act.
        </p>
      </section>

      <section id="personal-data-inventory" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          2. Personal Data Inventory
        </h2>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white text-sm">
          {DATA_CATEGORIES.map((cat, i) => (
            <div key={i} className="p-4 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="font-semibold text-gray-900">{cat.category}</strong>
                <span className="font-mono text-[11px] text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {cat.type}
                </span>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm">
                <strong className="text-gray-900">Fields:</strong> {cat.fields}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                <strong className="text-gray-900">Visibility:</strong> {cat.scope}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="purposes-of-processing" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          3. Purposes of Processing
        </h2>
        <p>We process your personal data exclusively for:</p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>
            <strong className="text-gray-900">Membership Vetting:</strong> Verifying email and phone OTP, evaluating application details against the OASIS 6-point Rubric, and matching pre-approved WhatsApp community records.
          </li>
          <li>
            <strong className="text-gray-900">Directory &amp; Expertise Discovery:</strong> Enabling approved members to search peers, founders, and mentors across sectors and cities in Odisha.
          </li>
          <li>
            <strong className="text-gray-900">Consent-Based Connections:</strong> Revealing contact details only when both parties mutually accept a mentor guidance request.
          </li>
          <li>
            <strong className="text-gray-900">Event Registrations &amp; Automated Waitlists:</strong> Processing RSVPs, waitlist promotions, and sharing confidential meeting links to confirmed attendees.
          </li>
          <li>
            <strong className="text-gray-900">Security &amp; Abuse Prevention:</strong> Rate limiting, brute-force defense, ClamAV antivirus scanning, and 3-year compliance audit logging.
          </li>
        </ol>
      </section>

      <section id="data-principal-rights" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          4. Your Rights as a Data Principal (DPDP Act 2023)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 block">Right to Access &amp; Summary</strong>
            <p className="text-xs sm:text-sm text-gray-600">
              Inspect all personal data held about you at any time via Settings and your profile view.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 block">Right to Data Portability</strong>
            <p className="text-xs sm:text-sm text-gray-600">
              Download a complete, machine-readable JSON archive of your account in Settings &rarr; Data &amp; Account within 48 hours.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 block">Right to Correction &amp; Erasure</strong>
            <p className="text-xs sm:text-sm text-gray-600">
              Update profile fields directly. Request permanent account deletion which purges your personal data within 30 days.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 block">Right of Grievance Redressal</strong>
            <p className="text-xs sm:text-sm text-gray-600">
              Submit formal privacy inquiries or appeals to our Designated Grievance Officer at Info@oasisodisha.in.
            </p>
          </div>
        </div>
      </section>

      <section id="data-retention" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          5. Data Retention Schedule
        </h2>
        <div className="space-y-2.5 text-sm text-gray-700">
          <p>
            <strong className="text-gray-900">Active Accounts:</strong> Retained for the duration of active community membership.
          </p>
          <p>
            <strong className="text-gray-900">Inactive Accounts:</strong> Warning sent after 12 months; deactivated at 15 months; subject to purge upon request.
          </p>
          <p>
            <strong className="text-gray-900">Deleted Accounts:</strong> Personal data and uploaded files are purged within 30 days. Community posts display &ldquo;Former Member&rdquo;.
          </p>
          <p>
            <strong className="text-gray-900">Rejected Applications:</strong> Unapproved application drafts and evidence attachments are permanently purged after 90 days.
          </p>
          <p>
            <strong className="text-gray-900">Audit Logs:</strong> Security, admin actions, and consent logs are retained for 3 years in compliance with Indian statutory requirements.
          </p>
        </div>
      </section>
    </article>
  );
}
