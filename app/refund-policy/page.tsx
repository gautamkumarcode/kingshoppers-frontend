"use client";

import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, AlertCircle, Mail } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to from-gray-50 to-blue-50 py-10 px-4 sm:px-8 lg:px-16">
      <motion.div
        className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-10 space-y-8 border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <ShieldCheck className="text-blue-600" size={32} />
            Refund & Return Policy
          </h1>
          <p className="text-gray-500">
            Your satisfaction is our top priority. Learn how we ensure a smooth
            refund & return experience.
          </p>
        </div>

        {/* Policy Sections */}
        <section className="space-y-8 text-gray-700 leading-relaxed">
          {/* 1. Return Eligibility */}
          <motion.div
            className="bg-blue-50 border border-blue-100 p-5 rounded-xl hover:shadow-md transition"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-800">
              <RefreshCw size={22} /> 1. Return Eligibility
            </h2>
            <p className="mt-2 text-gray-600">
              Products can be returned within <strong>7 days</strong> of
              delivery if they are damaged, defective, or incorrect. Items must
              be unused and in their original packaging.
            </p>
          </motion.div>

          {/* 2. Refund Process */}
          <motion.div
            className="bg-green-50 border border-green-100 p-5 rounded-xl hover:shadow-md transition"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2 text-green-800">
              <ShieldCheck size={22} /> 2. Refund Process
            </h2>
            <p className="mt-2 text-gray-600">
              Once we receive your returned item, our team will inspect it and
              process your refund within <strong>5–7 business days</strong> to
              your original payment method.
            </p>
          </motion.div>

          {/* 3. Non-Returnable Items */}
          <motion.div
            className="bg-red-50 border border-red-100 p-5 rounded-xl hover:shadow-md transition"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-800">
              <AlertCircle size={22} /> 3. Non-Returnable Items
            </h2>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>Opened or used personal care items</li>
              <li>Perishable goods (food, flowers, etc.)</li>
              <li>Gift cards or downloadable products</li>
            </ul>
          </motion.div>

          {/* 4. Contact Support */}
          <motion.div
            className="bg-purple-50 border border-purple-100 p-5 rounded-xl hover:shadow-md transition"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-800">
              <Mail size={22} /> 4. Contact Support
            </h2>
            <p className="mt-2 text-gray-600">
              For refund or return queries, please contact our support team at{" "}
              <a
                href="mailto:support@kingshoppers.com"
                className="text-purple-700 font-medium hover:underline"
              >
                support@kingshoppers.com
              </a>
              .
            </p>
          </motion.div>
        </section>

        {/* Footer Note */}
        <div className="text-center border-t pt-6 text-sm text-gray-500">
          Last updated on <strong>November 2025</strong> — King Shoppers Pvt.
          Ltd.
        </div>
      </motion.div>
    </div>
  );
}
