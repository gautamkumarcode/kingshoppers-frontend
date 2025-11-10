"use client";

export default function CancellationReturn() {
  return (
    <section className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white text-center mb-8">
          Cancellation Policy
        </h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🛍️ Order Cancellation
            </h2>
            <p>
              Orders can be cancelled within <strong>30 minutes</strong> of placing them, 
              provided they have not been packed or dispatched. To cancel, 
              please visit the <strong>“My Orders”</strong> section of your account 
              or contact our support team.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🍎 Return Policy
            </h2>
            <p>
              We ensure top quality, but if you receive any damaged, expired, or incorrect items, 
              you can request a return within <strong>24 hours</strong> of delivery. 
              Perishable goods like fruits, vegetables, and dairy are not eligible 
              for return once delivered unless they arrive in a damaged condition.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              🔁 Refund Process
            </h2>
            <p>
              Once your return is approved, the refund will be processed within 
              <strong>3–5 business days</strong> to your original payment method. 
              For COD orders, refunds will be issued via UPI or bank transfer.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              📦 Exchange Policy
            </h2>
            <p>
              In case of damaged or incorrect products, we offer a quick exchange 
              wherever possible. Replacement will be initiated immediately 
              after verification.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              📞 Need Help?
            </h2>
            <p>
              For cancellations, returns, or refunds, contact our support team at{" "}
              <a
                href="mailto:support@freshbasket.com"
                className="text-blue-600 hover:underline"
              >
                support@KingShopper.com
              </a>{" "}
              or call us at{" "}
              <span className="font-semibold text-blue-600">+91 98765 43210</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
