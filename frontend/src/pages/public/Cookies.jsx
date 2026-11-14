export default function Cookies() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Cookie Policy</h1>
        <p className="text-gray-500 mt-2">Last updated: January 1, 2025</p>
      </div>

      <div className="prose-content space-y-8 text-gray-700 dark:text-gray-300">

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to website owners. Cookies do not contain viruses or malicious code.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. How We Use Cookies</h2>
          <p>SmartCourse uses cookies to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Keep you signed in during your session</li>
            <li>Remember your preferences (e.g., dark mode, language selection)</li>
            <li>Understand how you use the Platform and improve user experience</li>
            <li>Deliver relevant content and prevent fraud</li>
            <li>Enable certain features such as video playback and progress tracking</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Types of Cookies We Use</h2>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {[
                  { type: 'Essential', purpose: 'Required for the Platform to function (authentication, session management)', duration: 'Session' },
                  { type: 'Preferences', purpose: 'Remember your settings like theme and language', duration: '1 year' },
                  { type: 'Analytics', purpose: 'Understand how users interact with the Platform to improve it', duration: '2 years' },
                  { type: 'Security', purpose: 'Detect and prevent fraudulent activity and protect your account', duration: 'Session' },
                  { type: 'Performance', purpose: 'Monitor site speed and reliability', duration: '30 days' },
                ].map((row) => (
                  <tr key={row.type}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{row.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.purpose}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Third-Party Cookies</h2>
          <p>Some cookies are placed by third-party services that appear on our pages. We use the following third parties that may set cookies:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Stripe</strong> — Payment processing and fraud prevention</li>
            <li><strong>Google</strong> — OAuth sign-in and optional analytics</li>
            <li><strong>YouTube / Vimeo</strong> — Embedded video content in courses</li>
          </ul>
          <p className="mt-3">These third parties have their own privacy and cookie policies. We encourage you to review them separately.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Local Storage</h2>
          <p>In addition to cookies, we use browser local storage to save certain data on your device, such as your authentication token, theme preference, and language setting. Local storage data is not automatically sent to our servers with every request but is read by our JavaScript code when needed.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Managing Cookies</h2>
          <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>View cookies currently stored on your device</li>
            <li>Delete some or all existing cookies</li>
            <li>Block all cookies or cookies from specific sites</li>
            <li>Set preferences for certain types of cookies</li>
          </ul>
          <p className="mt-3">Please note that blocking essential cookies will affect the functionality of the Platform. You may not be able to sign in or access course content if essential cookies are disabled.</p>
          <p className="mt-3">Browser cookie settings can typically be found under <strong>Settings → Privacy</strong> or <strong>Settings → Security</strong>. Refer to your browser's help documentation for specific instructions:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Chrome: Settings → Privacy and security → Cookies</li>
            <li>Firefox: Options → Privacy &amp; Security → Cookies</li>
            <li>Safari: Preferences → Privacy → Cookies</li>
            <li>Edge: Settings → Cookies and site permissions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. When we make material changes, we will update the "Last updated" date at the top of this page and notify you if required by law.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Contact Us</h2>
          <p>If you have questions about our use of cookies, please contact us at <a href="mailto:privacy@smartcourse.com" className="text-primary-600 hover:underline">privacy@smartcourse.com</a> or visit our <a href="/contact" className="text-primary-600 hover:underline">Contact page</a>.</p>
        </section>

      </div>
    </div>
  );
}
