"use client";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 flex justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-md">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Protecting your personal information and privacy is our top priority.
          </p>
        </header>

        {/* Content */}
        <section className="space-y-6 text-sm md:text-base leading-relaxed text-gray-700">
          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🔐 Information Collection
            </h2>
            <p>
              When you use our website or app, we may collect details such as your name, email, mobile number, address, and payment information. This data is collected solely for the purpose of providing our services.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              💡 Use of Information
            </h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>To process and deliver your orders</li>
              <li>To provide customer support and improve our services</li>
              <li>To send offers, discounts, and updates (with your consent)</li>
              <li>To prevent fraud and ensure security</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🤝 Information Sharing
            </h2>
            <p>
              We do not sell or rent your personal data to third parties. However, we may share necessary details with delivery partners, payment processors, or logistics providers to complete your orders.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🧾 Cookies
            </h2>
            <p>
              Our website uses cookies to enhance your browsing experience. You can disable cookies from your browser settings, but some features of the site may not function properly as a result.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🔒 Data Security
            </h2>
            <p>
              We use modern security measures to protect your information. However, please note that data transmission over the Internet is never 100% secure, and we cannot be held responsible for risks beyond our control.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              📞 Your Rights
            </h2>
            <p>
              You can request to view, update, or delete your personal data by contacting us at:
              <a
                href="mailto:privacy@yourstore.com"
                className="text-blue-500 font-medium ml-1 hover:underline"
              >
                privacy@yourstore.com
              </a>
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🗓️ Policy Updates
            </h2>
            <p>
              We may update our Privacy Policy from time to time. Any changes will be posted on this page along with the effective date.
            </p>
          </div>

          {/* Section 8 */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              This policy is effective from January 1, 2025. For any questions, please contact us.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center">
          {/* <a
            href="/contact"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-green-600 shadow"
          >
            Contact Us
          </a> */}
        </footer>
      </div>
    </main>
  );
}
