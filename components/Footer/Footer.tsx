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
              className="bg-blue-400 hover:bg-blue-800 text-white font-semibold rounded-xl"
            >
              Sign Up Today
            </Button>
          </Link>
        </div>
      </section>
      <div className="bg-blue-300 text-gray-600">
        {/* 🌟 Main Footer Section */}
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* 🏬 Brand Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">King Shopper</h3>
            <p className="text-white-100 mb-4 leading-relaxed">
              Your one-stop grocery store — fresh produce, daily essentials, and
              exclusive deals delivered right to your door.
            </p>
            <div className="flex items-start gap-3 text-red-400">
              <Mail size={18} className="mt-1" />
              <span>support@kingshopper.com</span>
            </div>
            <div className="flex items-start gap-3 text-white-100 mt-2">
              <Phone size={18} className="mt-1" />
              <span>+91 9876543210</span>
            </div>
            <div className="flex items-start gap-3 text-white-100 mt-2">
              <MapPin size={18} className="mt-1" />
              <span>Kandwa Road, Varanasi, Uttar Pradesh 221011</span>
            </div>
          </div>

          {/* 🔗 Links Section (2 Columns in One Row) */}
          <div className="sm:col-span-2">
            <div className="grid grid-cols-2 gap-8">
              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Quick Links
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about-us"
                      className="hover:text-red-400 transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="hover:text-red-400 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cancellation"
                      className="hover:text-red-400 transition-colors"
                    >
                      Cancellation & Return
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/refund-policy"
                      className="hover:text-red-400 transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Customer Support */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Customer Support
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-red-400 transition-colors"
                    >
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-red-400 transition-colors"
                    >
                      Shipping Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-red-400 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-red-400 transition-colors"
                    >
                      Help Desk
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* 🌐 Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              <strong className="text-4xl">Follow Us</strong>
            </h4>
            <br />
            <br />
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="bg-[#1877F2] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
              >
                <Facebook size={20} className="text-white" />
              </Link>
              <Link
                href="/"
                className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
              >
                <Instagram size={20} className="text-white" />
              </Link>
              <Link
                href="/"
                className="bg-[#1DA1F2] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
              >
                <Twitter size={20} className="text-white" />
              </Link>
              <Link
                href="/"
                className="bg-[#e61f1f] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110"
              >
                <Youtube size={20} className="text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* 🔹 Bottom Bar */}
        <div className="border-t border-white-700 py-6 text-center text-black-800 text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="text-white">King Shopper</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
