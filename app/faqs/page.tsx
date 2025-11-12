
"use client";

import { useState } from "react";

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How can I place my order?",
      short:
        "Select items, add them to the cart, and proceed to Checkout. You can order as a guest or with an account.",
      answer:
        "You can order through our website or mobile app. Creating an account helps you track orders and enjoy faster checkout.",
      keywords: "order place checkout account guest",
    },
    {
      question: "How long does delivery take?",
      short: "We usually deliver within 24 hours.",
      answer:
        "In remote areas, delivery may take 2–3 working days. Enter your pincode to check delivery availability and estimated time.",
      keywords: "delivery time shipping 24 hours pincode",
    },
    {
      question: "Which payment methods are accepted?",
      short: "We accept UPI, Debit/Credit Cards, Net Banking, and COD in select areas.",
      answer:
        "If a payment fails, the amount is refunded within 3–5 business days depending on your bank’s processing time.",
      keywords: "payment card cod upi netbanking refund",
    },
    {
      question: "What if I receive a wrong or damaged product?",
      short:
        "Please report within 24 hours — we’ll arrange a replacement or refund.",
      answer:
        "Fresh food items are returnable/refundable only if damaged or spoiled. Photos and order details are required for verification.",
      keywords: "return refund wrong item damaged food fresh",
    },
    {
      question: "Can I order in bulk?",
      short: "Yes — contact our support team for wholesale orders.",
      answer:
        "Bulk orders may have customized pricing and delivery schedules. Please reach out for assistance.",
      keywords: "bulk wholesale order contact support",
    },
  ];

  // ✅ Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const hay = (
      faq.question + faq.short + faq.answer + faq.keywords
    ).toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 flex items-start justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Didn’t find your answer below? Contact our support team anytime.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — e.g. delivery, payment, return..."
            className="w-full p-3 rounded-lg border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none"
          />
        </div>

        {/* Layout */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Side Info */}
          <aside className="md:col-span-1 bg-white p-5 rounded-xl shadow-sm transition hover:shadow-md">
            <h2 className="text-lg font-semibold">About Our Store</h2>
            <p className="mt-2 text-sm text-gray-600">
              We provide fresh vegetables, packaged goods, dairy, snacks, and
              doorstep delivery service.
            </p>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium">Delivery Time</dt>
                <dd className="text-gray-600">Usually within 24 hours in most areas.</dd>
              </div>
              <div>
                <dt className="font-medium">Payment Options</dt>
                <dd className="text-gray-600">
                  UPI, Cards, Net Banking, COD (in select locations)
                </dd>
              </div>
              <div>
                <dt className="font-medium">Support</dt>
                <dd className="text-gray-600">
                  support@yourstore.com | +91-XXXXXXXXXX
                </dd>
              </div>
            </dl>
          </aside>

          {/* FAQs */}
          <section className="md:col-span-2 space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <article
                  key={index}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md"
                >
                  <button
                    className="w-full text-left flex items-start gap-3"
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <span className="flex-1">
                      <h3 className="text-base font-semibold">
                        {faq.question}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{faq.short}</p>
                    </span>
                    <svg
                      className={`w-6 h-6 text-gray-400 transform transition-transform ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M6 8l4 4 4-4"></path>
                    </svg>
                  </button>
                  {openIndex === index && (
                    <div className="mt-3 text-sm text-gray-700">{faq.answer}</div>
                  )}
                </article>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No results found — please try a different keyword.
              </p>
            )}

           
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-gray-500">
      
        </footer>
      </div>
    </main>
  );
}
