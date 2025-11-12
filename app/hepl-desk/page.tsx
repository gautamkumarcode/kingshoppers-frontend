"use client";

export default function HelpDesk() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 flex justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-md">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600">
            Customer Help Desk
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Our support team is always here to help you with your questions and concerns.
          </p>
        </header>

        {/* Contact Methods */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">📞 Phone Support</h2>
            <p className="text-gray-700 text-sm mb-2">
              Monday to Saturday (9:00 AM – 7:00 PM)
            </p>
            <p className="text-lg font-medium text-gray-900">+91 9876543210</p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">✉️ Email Support</h2>
            <p className="text-gray-700 text-sm mb-2">Available 24x7</p>
            <a
              href="mailto:support@yourstore.com"
              className="text-blue-600 font-medium hover:underline"
            >
              supportKingShopper@gmail.com
            </a>
          </div>
        </section>

        {/* Live Chat */}
        <section className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">💬 Live Chat</h2>
          <p className="text-sm text-gray-700 mb-4">
            Click on the “Chat Support” icon on our website or mobile app to connect with our live agent.  
            Service available from 9:00 AM to 9:00 PM.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600">
            Start Chat
          </button>
        </section>

        {/* FAQ Shortcut */}
        <section className="mt-8 bg-green-50 p-6 rounded-xl border border-green-100">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            ❓ Frequently Asked Questions (FAQs)
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            Find answers to common questions about orders, payments, and delivery.
          </p>
          <a
            href="/faqs"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow"
          >
            View FAQs
          </a>
        </section>

        {/* Feedback Form */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            📝 Send Us Feedback
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-100 focus:border-blue-400 outline-none"
                placeholder="Write your message or suggestion..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600"
            >
              Send
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
       
        </footer>
      </div>
    </main>
  );
}
