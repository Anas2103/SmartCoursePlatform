export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
        <p className="text-gray-500 mt-2">Last updated: January 1, 2025</p>
      </div>

      <div className="prose-content space-y-8 text-gray-700 dark:text-gray-300">

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Introduction</h2>
          <p>SmartCourse ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. Please read this policy carefully. If you disagree with its terms, please discontinue use of the Platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Information We Collect</h2>
          <p className="font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2">Information You Provide Directly</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Name, email address, and password when you create an account</li>
            <li>Profile information such as bio, headline, and avatar</li>
            <li>Payment information (processed securely through Stripe — we never store raw card data)</li>
            <li>Course reviews, forum posts, and other content you submit</li>
            <li>Communications you send to us via contact forms or support</li>
          </ul>

          <p className="font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2">Information Collected Automatically</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Log data: IP address, browser type, pages visited, time spent on pages</li>
            <li>Device information: hardware model, operating system, unique device identifiers</li>
            <li>Course progress: lessons completed, quiz results, video watch time</li>
            <li>Cookies and similar tracking technologies (see our Cookie Policy)</li>
          </ul>

          <p className="font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2">Information from Third Parties</p>
          <ul className="list-disc list-inside space-y-1">
            <li>If you sign in with Google, we receive your name, email, and profile picture from Google</li>
            <li>Payment processors may share transaction status information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Create and manage your account</li>
            <li>Process payments and issue certificates</li>
            <li>Deliver course content and track your learning progress</li>
            <li>Send transactional emails (enrollment confirmations, password resets)</li>
            <li>Send promotional communications (with your consent)</li>
            <li>Provide customer support</li>
            <li>Improve the Platform through analytics and user research</li>
            <li>Detect and prevent fraud, abuse, or security incidents</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Sharing Your Information</h2>
          <p>We do not sell your personal data. We may share your information with:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Instructors:</strong> Your name and progress data may be visible to the instructor of a course you are enrolled in</li>
            <li><strong>Service Providers:</strong> Stripe (payments), email providers, cloud storage, analytics tools — only as needed to operate the Platform</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect rights and safety</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your data within 30 days, except where retention is required by law (e.g., financial records for 7 years).</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your data:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw Consent:</strong> Opt out of marketing emails at any time</li>
          </ul>
          <p className="mt-3">To exercise these rights, email us at <a href="mailto:privacy@smartcourse.com" className="text-primary-600 hover:underline">privacy@smartcourse.com</a>.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Security</h2>
          <p>We implement industry-standard security measures including encryption in transit (TLS), encrypted password storage (bcrypt), and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Children's Privacy</h2>
          <p>The Platform is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided personal information, we will delete it promptly.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, please contact our Data Protection team at <a href="mailto:privacy@smartcourse.com" className="text-primary-600 hover:underline">privacy@smartcourse.com</a>.</p>
        </section>

      </div>
    </div>
  );
}
