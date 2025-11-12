"use client";

export default function ShippingPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 flex justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-md">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600">
            Shipping Policy
          </h1>
          <p className="mt-2 text-sm text-black-600">
            Please find below details about our delivery process, timelines, and terms.
          </p>
        </header>

        {/* Content */}
        <section className="space-y-6 text-sm md:text-base leading-relaxed text-black-700">
          {/* Order Processing */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">🛒 Order Processing</h2>
            <p>
              All orders are processed within <strong>1–2 hours</strong> of being received.  
              Once your order is confirmed, you’ll receive a notification via email or SMS.
            </p>
          </div>

          {/* Delivery Time */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">🚚 Delivery Time</h2>
            <p>
              Most orders are delivered within <strong>24 hours</strong>.  
              However, depending on your pin code and order size, delivery may take up to 1–2 days.
            </p>
          </div>

          {/* Service Area */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">🌍 Service Area</h2>
            <p>
              Currently, we deliver within city limits only.  
              We’ll soon be expanding our service to nearby regions.
            </p>
          </div>

          {/* Shipping Charges */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">💰 Shipping Charges</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Orders above ₹499 — <strong>Free Delivery</strong></li>
              <li>Orders below ₹499 — ₹30 shipping charge</li>
              <li>Bulk orders or deliveries to special zones — charges may vary</li>
            </ul>
          </div>

          {/* Delay / Issues */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">⚠️ Delays or Issues</h2>
            <p>
              Deliveries may be delayed due to weather conditions, traffic, or other unforeseen events.  
              For any delivery-related issue, please contact us at:
              <a
                href="mailto:support@yourstore.com"
                className="text-blue-500 font-medium ml-1 hover:underline"
              >
                support@yourstore.com
              </a>
            </p>
          </div>

          {/* Order Tracking */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">🔄 Order Tracking</h2>
            <p>
              Once your order has been shipped, you’ll receive a tracking link and estimated delivery time via email or SMS.
            </p>
          </div>

          {/* Order Receiving */}
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">📦 Upon Delivery</h2>
            <p>
              Please check the condition of the product at the time of delivery.  
              Report any damaged or incorrect items within <strong>24 hours</strong> of receiving your order.
            </p>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-black-800">
              This policy is effective from January 1, 2025.  
              We reserve the right to make updates or changes as needed.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center">
          {/* <a
            href="/contact"
            className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow"
          >
            Contact Us
          </a> */}
        </footer>
      </div>
    </main>
  );
}
