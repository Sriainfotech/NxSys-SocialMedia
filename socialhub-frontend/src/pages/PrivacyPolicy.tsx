import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
    <div className="space-y-3 text-slate-600 leading-relaxed">{children}</div>
  </section>
);

const PrivacyPolicy = () => (
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
    <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-widest">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-blue-100 text-sm">Last updated: June 23, 2026</p>
      </div>
    </div>

    {/* Content */}
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 sm:p-12">

        <p className="text-slate-600 leading-relaxed mb-10">
          Welcome to <strong className="text-slate-800">Social Media Hub</strong>, a product of{" "}
          <strong className="text-slate-800">Sria Infotech</strong>. We are committed to protecting your
          personal information and your right to privacy. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our platform.
        </p>

        <Section title="1. Information We Collect">
          <p>
            <strong className="text-slate-700">Account Information:</strong> When you register, we collect
            your name, email address, and password (stored in hashed form).
          </p>
          <p>
            <strong className="text-slate-700">Social Media Tokens:</strong> When you connect a social
            media account (Instagram, Facebook, LinkedIn, Twitter/X, YouTube, etc.), we store the OAuth
            access tokens required to publish content on your behalf. We never store your social media
            passwords.
          </p>
          <p>
            <strong className="text-slate-700">Content You Create:</strong> Posts, captions, media files,
            schedules, and drafts you create within the platform.
          </p>
          <p>
            <strong className="text-slate-700">Usage Data:</strong> Log data such as IP address, browser
            type, pages visited, and actions taken within the app — used solely for analytics and
            improving our service.
          </p>
          <p>
            <strong className="text-slate-700">Billing Information:</strong> Payment details are processed
            by Razorpay and are not stored on our servers. We only retain transaction IDs and plan details.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc list-inside space-y-2">
            <li>To create and manage your account.</li>
            <li>To publish, schedule, and manage posts on connected social media accounts.</li>
            <li>To process billing and manage subscription plans.</li>
            <li>To send transactional emails (account confirmations, password resets).</li>
            <li>To monitor and improve platform performance and security.</li>
            <li>To respond to support requests.</li>
          </ul>
          <p>
            We do <strong className="text-slate-700">not</strong> sell, rent, or trade your personal
            information to third parties for marketing purposes.
          </p>
        </Section>

        <Section title="3. Sharing of Information">
          <p>We may share your data with the following categories of third parties:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-slate-700">Social Media Platforms:</strong> Content and tokens are
              shared with the platforms you explicitly connect (Meta, LinkedIn, X Corp, Google/YouTube).
            </li>
            <li>
              <strong className="text-slate-700">Payment Processors:</strong> Razorpay, for secure payment
              handling.
            </li>
            <li>
              <strong className="text-slate-700">Cloud Infrastructure:</strong> Our hosting provider
              processes data solely to operate the service.
            </li>
            <li>
              <strong className="text-slate-700">Legal Requirements:</strong> If required by law, court
              order, or to protect the rights and safety of our users or the public.
            </li>
          </ul>
        </Section>

        <Section title="4. Data Retention">
          <p>
            We retain your account data for as long as your account is active. If you delete your account,
            we will remove your personal data within <strong className="text-slate-700">30 days</strong>,
            except where retention is required by law or for legitimate business purposes (e.g., billing
            records).
          </p>
          <p>
            Social media access tokens are deleted immediately upon disconnecting an account or deleting
            your profile.
          </p>
        </Section>

        <Section title="5. Cookies & Tracking">
          <p>
            We use essential cookies to maintain your session and authentication state. We do not use
            third-party advertising cookies or tracking pixels.
          </p>
          <p>
            You may disable cookies in your browser settings, but this may affect the functionality of
            the platform.
          </p>
        </Section>

        <Section title="6. Security">
          <p>
            We implement industry-standard security measures including HTTPS encryption, hashed password
            storage, and restricted access to production systems. However, no method of transmission over
            the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
          <p>
            If you discover a security vulnerability, please report it to{" "}
            <a
              href="mailto:sriainfotech@gmail.com"
              className="text-blue-600 hover:underline"
            >
              sriainfotech@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request deletion of your data ("right to be forgotten").</li>
            <li>Object to or restrict processing of your data.</li>
            <li>Data portability — receive your data in a machine-readable format.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:sriainfotech@gmail.com" className="text-blue-600 hover:underline">
              sriainfotech@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="8. Third-Party Links">
          <p>
            Our platform may contain links to third-party websites or services. We are not responsible
            for the privacy practices of those sites and encourage you to review their privacy policies.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            Social Media Hub is not intended for users under the age of 13. We do not knowingly collect
            personal information from children. If you believe a child has provided us with their data,
            please contact us and we will promptly delete it.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            by email or by posting a prominent notice within the platform. Your continued use of the
            service after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>If you have any questions or concerns about this Privacy Policy, please reach out to us:</p>
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
          <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors font-medium text-blue-600">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-blue-600 transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  </div>
);

export default PrivacyPolicy;
