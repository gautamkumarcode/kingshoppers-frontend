"use client";

import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-500 via-blue-200 to-white text-gray-800">
      {/* 🔹 Newsletter / CTA Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1607083207333-29f9f1b0d51e?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="bg-black/60 absolute inset-0"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Join the King Shopper Community
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Get early access to new arrivals, exclusive discounts, and royal
            shopping rewards — straight to your inbox!
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-xl"
            >
              Sign Up Today
            </Button>
          </Link>
        </div>
      </section>

      {/* 🔹 Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* 🏬 Brand Info */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            King Shopper
          </h3>
          <p className="text-gray-800 mb-4">
            Your one-stop grocery store — fresh produce, daily essentials, and
            exclusive deals delivered right to your door.
          </p>
          <div className="flex items-center gap-3 text-gray-800">
            <Mail size={18} />
            <span>support@kingshopper.com</span>
          </div>
          <div className="flex items-center gap-3 text-gray-800 mt-2">
            <Phone size={18} />
            <span>+91 9876543210</span>
          </div>
          <div className="flex items-center gap-3 text-gray-800 mt-2">
            <MapPin size={18} />
            <span>Kandwa Road Varanasi Uttar Pradesh 221011 </span>
          </div>
        </div>

        {/* 🛒 Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/about-us" className="hover:text-red-400">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="hover:text-red-400">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/cancellation" className="hover:text-red-400">
                Cancellation & Return
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-red-400">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* 🧾 Customer Support */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Customer Support
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-red-400">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-red-400">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-red-400">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* 🌐 Social Media */}
        <div>
          <h4 className="text-6xl font-semibold text-black mb-4">Follow Us</h4>

          <br />
          <br />
          <br />
          <br />
          <br />

          <div className="flex gap-6">
            <Link
              href="/"
              className="bg-[#1877F2] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
            >
              <Facebook size={24} className="text-white" />
            </Link>
            <Link
              href="/"
              className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
            >
              <Instagram size={24} className="text-white" />
            </Link>
            <Link
              href="/"
              className="bg-[#1DA1F2] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
            >
              <Twitter size={24} className="text-white" />
            </Link>
            <Link
              href="/"
              className="bg-[#e61f1f] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
            >
              <Youtube size={24} className="text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* 🔹 Bottom Bar */}
      <div className="border-t border-gray-700 py-6 text-center text-white text-sm">
        © {new Date().getFullYear()} King Shopper. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
