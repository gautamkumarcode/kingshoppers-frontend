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
		// Check if app is running in standalone mode (PWA)
		const checkStandalone = () => {
			const isInStandaloneMode =
				window.matchMedia("(display-mode: standalone)").matches ||
				(window.navigator as any).standalone ||
				document.referrer.includes("android-app://");
			setIsStandalone(isInStandaloneMode);
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
		<footer className="bg-linear-to-r from-blue-600 via-blue-300 to-blue-500 text-gray-800">
			{/* 🔹 Newsletter / CTA Section */}
			<section
				className="relative bg-cover bg-center bg-no-repeat py-20"
				style={{
					backgroundImage:
						"url('https://images.unsplash.com/photo-1607083207333-29f9f1b0d51e?auto=format&fit=crop&w=1200&q=80')",
				}}>
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
							className="bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-xl">
							Sign Up Today
						</Button>
					</Link>
				</div>
			</section>

			{/* 🌟 Main Footer Section */}
			<div className="bg-linear-to-r from-blue-400 via-blue-200 to-blue-300 text-gray-700">
				<div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
					{/* 🏬 Brand Info */}
					<div>
						<h3 className="text-2xl font-bold text-white mb-4">King Shopper</h3>
						<p className="text-gray-900 mb-4 leading-relaxed">
							Your one-stop grocery store — fresh produce, daily essentials, and
							exclusive deals delivered right to your door.
						</p>
						<div className="flex items-start gap-3 text-black-700">
							<Mail size={18} className="mt-1" />
							<span>support@kingshopper.com</span>
						</div>
						<div className="flex items-start gap-3 text-black-700 mt-2">
							<Phone size={18} className="mt-1" />
							<span>‪+91 9876543210‬</span>
						</div>
						<div className="flex items-start gap-3 text-black-700 mt-2">
							<MapPin size={30} className="mt-1" />
							<span>Kandwa Road, Varanasi, Uttar Pradesh 221011</span>
						</div>
					</div>

					{/* 🔗 Links Section */}
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
											className="hover:text-white transition-colors">
											About Us
										</Link>
									</li>
									<li>
										<Link
											href="/contact-us"
											className="hover:text-white transition-colors">
											Contact Us
										</Link>
									</li>
									<li>
										<Link
											href="/cancellation"
											className="hover:text-white transition-colors">
											Cancellation & Return
										</Link>
									</li>
									<li>
										<Link
											href="/refund-policy"
											className="hover:text-white transition-colors">
											Terms & Conditions
										</Link>
									</li>
								</ul>
							</div>

							{/* Customer Support */}
							{/* Customer Support */}
							<div>
								<h4 className="text-lg font-semibold text-white mb-4">
									Customer Support
								</h4>
								<ul className="space-y-2">
									<li>
										<Link
											href="/faqs"
											className="hover:text-white transition-colors">
											FAQs
										</Link>
									</li>
									<li>
										<Link
											href="/shipping-policy"
											className="hover:text-white transition-colors">
											Shipping Policy
										</Link>
									</li>
									<li>
										<Link
											href="/privacy-policy"
											className="hover:text-white transition-colors">
											Privacy Policy
										</Link>
									</li>
									<li>
										<Link
											href="/help-desk"
											className="hover:text-white transition-colors">
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
							<strong className="text-3xl">Follow Us</strong>
						</h4>
						<div className="flex flex-wrap gap-4 mt-6">
							<Link
								href="/"
								className="bg-[#1877F2] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110">
								<Facebook size={20} className="text-white" />
							</Link>
							<Link
								href="/"
								className="bg-linear-to-tr from-pink-500 via-red-500 to-yellow-500 p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110">
								<Instagram size={20} className="text-white" />
							</Link>
							<Link
								href="/"
								className="bg-[#1DA1F2] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110">
								<Twitter size={20} className="text-white" />
							</Link>
							<Link
								href="/"
								className="bg-[#FF0000] p-2 rounded-full hover:opacity-80 transition-transform transform hover:scale-110">
								<Youtube size={20} className="text-white" />
							</Link>
						</div>
					</div>
				</div>

				{/* 🔹 Bottom Bar */}
				<div className="border-t border-green-300 py-6 text-center text-gray-700 text-sm">
					© {new Date().getFullYear()}{" "}
					<span className="text-blue-600 font-semibold">King Shopper</span>. All
					rights reserved.
				</div>
			</div>
		</footer>
	);
};

export default Footer;
