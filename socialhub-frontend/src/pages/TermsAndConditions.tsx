import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
    <div className="space-y-3 text-slate-600 leading-relaxed">{children}</div>
  </section>
);

const TermsAndConditions = () => (
  <div className="min-h-screen bg-slate-50">
    {/* Header */}
    <header className="bg-white border-b border-slate-200/60 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Social Media Hub" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-slate-900 tracking-tight">Social Media Hub</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </header>

    {/* Hero */}
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-widest">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Terms &amp; Conditions</h1>
        <p className="text-slate-400 text-sm">Last updated: June 23, 2026</p>
      </div>
    </div>

    {/* Content */}
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 sm:p-12">

        <p className="text-slate-600 leading-relaxed mb-10">
          These Terms and Conditions ("Terms") govern your access to and use of{" "}
          <strong className="text-slate-800">Social Media Hub</strong>, a product of{" "}
          <strong className="text-slate-800">Sria Infotech</strong> ("we", "us", or "our"). By creating
          an account or using the platform, you agree to be bound by these Terms. If you do not agree,
          please do not use our service.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Social Media Hub, you confirm that you are at least{" "}
            <strong className="text-slate-700">13 years of age</strong>, have the legal capacity to enter
            into a binding agreement, and agree to comply with these Terms and our{" "}
            <Link to="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            Social Media Hub is a social media management platform that allows users to schedule, publish,
            and manage content across multiple social media platforms from a single interface. Features
            include post creation, scheduling, draft management, analytics, multi-account management, and
            team collaboration tools.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the service at any time,
            with or without notice.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>
            You must provide accurate, current, and complete information during registration and keep your
            account information up to date. You are responsible for maintaining the confidentiality of
            your login credentials.
          </p>
          <p>
            You are solely responsible for all activity that occurs under your account. Notify us
            immediately at{" "}
            <a href="mailto:sriainfotech@gmail.com" className="text-blue-600 hover:underline">
              sriainfotech@gmail.com
            </a>{" "}
            if you suspect unauthorized access.
          </p>
          <p>
            We reserve the right to terminate accounts that violate these Terms or are inactive for an
            extended period.
          </p>
        </Section>

        <Section title="4. Subscription Plans & Billing">
          <p>
            Social Media Hub offers both free and paid subscription plans. Paid plans are billed on a
            recurring basis (monthly or annually) via Razorpay. Prices are listed on the Billing page
            and may change with prior notice.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-slate-700">Free Trial / Free Tier:</strong> Subject to usage limits
              as described on the pricing page.
            </li>
            <li>
              <strong className="text-slate-700">Paid Plans:</strong> Billed in advance. Failure to pay
              may result in downgrade or suspension.
            </li>
            <li>
              <strong className="text-slate-700">Refunds:</strong> Refund requests are evaluated on a
              case-by-case basis. Contact us within 7 days of a charge for consideration.
            </li>
            <li>
              <strong className="text-slate-700">Cancellation:</strong> You may cancel your subscription
              at any time. Access continues until the end of the current billing period.
            </li>
          </ul>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to use Social Media Hub to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Violate any applicable laws or regulations.</li>
            <li>Post content that is illegal, defamatory, hateful, obscene, or infringes third-party rights.</li>
            <li>Spam, harass, or deceive other users or third parties.</li>
            <li>Violate the terms of service of any connected social media platform.</li>
            <li>Attempt to gain unauthorized access to other accounts, systems, or networks.</li>
            <li>Introduce malware, viruses, or malicious code.</li>
            <li>Scrape, crawl, or reverse-engineer any part of the platform without express permission.</li>
            <li>Resell or sublicense access to the service without authorization.</li>
          </ul>
          <p>
            Violation of these policies may result in immediate suspension or termination of your account
            without refund.
          </p>
        </Section>

        <Section title="6. Connected Social Media Accounts">
          <p>
            By connecting a social media account, you authorize Social Media Hub to publish, schedule,
            and manage content on your behalf. You remain responsible for all content posted through the
            platform and must comply with each platform's own terms of service.
          </p>
          <p>
            We are not responsible for changes to third-party APIs or platform policies that may affect
            the availability of certain features.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            <strong className="text-slate-700">Your Content:</strong> You retain all ownership rights to
            the content you create and publish through the platform. By using the service, you grant us a
            limited, non-exclusive license to process and display your content solely to provide the
            service.
          </p>
          <p>
            <strong className="text-slate-700">Our Platform:</strong> All platform software, design,
            trademarks, and branding are the exclusive property of Sria Infotech. You may not copy,
            modify, or distribute any part of the platform without our written consent.
          </p>
        </Section>

        <Section title="8. Privacy">
          <p>
            Your use of the platform is also governed by our{" "}
            <Link to="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference.
          </p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>
            The platform is provided <strong className="text-slate-700">"as is"</strong> and{" "}
            <strong className="text-slate-700">"as available"</strong> without warranties of any kind,
            express or implied, including but not limited to warranties of merchantability, fitness for a
            particular purpose, or non-infringement.
          </p>
          <p>
            We do not warrant that the service will be uninterrupted, error-free, or free from harmful
            components.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Sria Infotech shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the platform,
            including loss of data, revenue, or business opportunities.
          </p>
          <p>
            Our total aggregate liability for any claims related to the service shall not exceed the
            amount you paid us in the three (3) months preceding the claim.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p>
            You agree to indemnify and hold harmless Sria Infotech, its officers, employees, and partners
            from any claims, damages, liabilities, and expenses (including attorney fees) arising from
            your use of the service, your content, or your violation of these Terms.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            We may suspend or terminate your account at our discretion, with or without cause, and with
            or without notice, particularly if you breach these Terms.
          </p>
          <p>
            You may terminate your account at any time by contacting us or using the account deletion
            feature in the platform settings. Upon termination, your data will be deleted in accordance
            with our Privacy Policy.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms are governed by the laws of <strong className="text-slate-700">India</strong>.
            Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the
            courts located in India.
          </p>
        </Section>

        <Section title="14. Changes to Terms">
          <p>
            We reserve the right to update these Terms at any time. We will notify you of material
            changes via email or a prominent notice on the platform. Your continued use of the service
            after changes take effect constitutes your acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="15. Contact Us">
          <p>If you have any questions about these Terms, please contact us:</p>
          <div className="mt-3 bg-slate-50 rounded-xl p-5 text-sm space-y-1">
            <p><strong className="text-slate-700">Company:</strong> Sria Infotech</p>
            <p>
              <strong className="text-slate-700">Email:</strong>{" "}
              <a href="mailto:sriainfotech@gmail.com" className="text-blue-600 hover:underline">
                sriainfotech@gmail.com
              </a>
            </p>
          </div>
        </Section>
      </div>
    </main>

    {/* Footer */}
    <footer className="border-t border-slate-200/60 bg-white mt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Social Media Hub. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-blue-600 transition-colors font-medium text-blue-600">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  </div>
);

export default TermsAndConditions;
