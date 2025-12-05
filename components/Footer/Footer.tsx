"use client";

import {
	Facebook,
	Instagram,
	Mail,
	MapPin,
	Phone,
	Twitter,
	Youtube,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const Footer = () => {
	const pathname = usePathname();
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		// Check if app is running in standalone mode (PWA) or Flutter WebView
		const checkStandalone = () => {
			// Check for Flutter WebView indicators
			const isFlutterApp =
				// Check if running in Flutter WebView
				(window as any).flutter_inappwebview !== undefined ||
				(window as any).FlutterChannel !== undefined ||
				// Check user agent for Flutter
				/flutter/i.test(navigator.userAgent) ||
				// Check if app mode is set in localStorage
				localStorage.getItem("isFlutterApp") === "true" ||
				// Check for PWA standalone mode
				window.matchMedia("(display-mode: standalone)").matches ||
				(window.navigator as any).standalone ||
				document.referrer.includes("android-app://");

			setIsStandalone(isFlutterApp);
		};

		checkStandalone();
	}, []);

	// Hide footer for admin and sales pages
	if (pathname?.startsWith("/admin") || pathname?.startsWith("/agent")) {
		return null;
	}

	const dynamicAuthRoutes = ["/auth/admin-login", "/auth/agents-login"];
	if (typeof pathname === "string" && dynamicAuthRoutes.includes(pathname)) {
		return null;
	}

	// Hide footer if app is opened in standalone mode (PWA)
	if (isStandalone) {
		return null;
	}

	return (
		<footer className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300 mt-auto">
			{/* Newsletter Section */}
			<div className="border-b border-slate-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="flex flex-col md:flex-row items-center justify-between gap-6">
						<div className="text-center md:text-left">
							<h3 className="text-2xl font-bold text-white mb-2">
								Join King Shoppers Community
							</h3>
							<p className="text-gray-400">
								Get exclusive deals and updates delivered to your inbox
							</p>
						</div>
						<Link href="/auth/register">
							<Button
								size="lg"
								className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8">
								Sign Up Now
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Main Footer Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Brand Info */}
					<div className="lg:col-span-1">
						<h3 className="text-2xl font-bold text-white mb-4">
							King Shoppers
						</h3>
						<p className="text-gray-400 mb-6 text-sm leading-relaxed">
							Your trusted partner for fresh groceries and daily essentials,
							delivered with care.
						</p>
						<div className="space-y-3">
							<div className="flex items-center gap-3 text-sm">
								<Mail size={16} className="text-blue-500 shrink-0" />
								<span>support@kingshoppers.com</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<Phone size={16} className="text-blue-500 shrink-0" />
								<span>+91 9876543210</span>
							</div>
							<div className="flex items-start gap-3 text-sm">
								<MapPin size={16} className="text-blue-500 shrink-0 mt-1" />
								<span>Kandwa Road, Varanasi, UP 221011</span>
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className="text-lg font-semibold text-white mb-4">
							Quick Links
						</h4>
						<ul className="space-y-2.5">
							{[
								{ href: "/about-us", label: "About Us" },
								{ href: "/contact-us", label: "Contact Us" },
								{ href: "/cancellation", label: "Returns & Cancellation" },
								{ href: "/refund-policy", label: "Terms & Conditions" },
							].map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm hover:text-blue-400 transition-colors inline-block">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Customer Support */}
					<div>
						<h4 className="text-lg font-semibold text-white mb-4">
							Customer Support
						</h4>
						<ul className="space-y-2.5">
							{[
								{ href: "/faqs", label: "FAQs" },
								{ href: "/shipping-policy", label: "Shipping Policy" },
								{ href: "/privacy-policy", label: "Privacy Policy" },
								{ href: "/help-desk", label: "Help Center" },
							].map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm hover:text-blue-400 transition-colors inline-block">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Social Media */}
					<div>
						<h4 className="text-lg font-semibold text-white mb-4">
							Connect With Us
						</h4>
						<p className="text-sm text-gray-400 mb-4">
							Follow us on social media for updates and offers
						</p>
						<div className="flex gap-3">
							{[
								{
									href: "/",
									icon: Facebook,
									bg: "bg-[#1877F2] hover:bg-[#1877F2]/80",
								},
								{
									href: "/",
									icon: Instagram,
									bg: "bg-gradient-to-tr from-purple-600 to-pink-600 hover:opacity-80",
								},
								{
									href: "/",
									icon: Twitter,
									bg: "bg-[#1DA1F2] hover:bg-[#1DA1F2]/80",
								},
								{
									href: "/",
									icon: Youtube,
									bg: "bg-[#FF0000] hover:bg-[#FF0000]/80",
								},
							].map((social, index) => (
								<Link
									key={index}
									href={social.href}
									className={`${social.bg} p-2.5 rounded-full transition-all transform hover:scale-110`}>
									<social.icon size={18} className="text-white" />
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="border-t border-slate-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<p className="text-center text-sm text-gray-400">
						© {new Date().getFullYear()}{" "}
						<span className="text-blue-400 font-semibold">King Shoppers</span>.
						All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
