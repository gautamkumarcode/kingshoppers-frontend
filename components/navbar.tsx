"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import logo from "@/public/logo3.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon } from "./cart";
import { UserDropdown } from "./navbar/UserDropdown";
import { LoadingSpinner } from "./ui/loading-spinner";

export function Navbar() {
	const { user, loading } = useAuth();
	const pathname = usePathname();

	// Hide navbar on admin, sales, and agent routes
	if (
		typeof pathname === "string" &&
		(pathname.startsWith("/admin") ||
			pathname.startsWith("/sales") ||
			pathname.startsWith("/agent"))
	) {
		return null;
	}

	const dynamicAuthRoutes = ["/auth/admin-login", "/auth/agents-login"];
	if (typeof pathname === "string" && dynamicAuthRoutes.includes(pathname)) {
		return (
			<div className="flex h-24 w-full justify-center items-center font-semibold">
				Kingshppers
			</div>
		);
	}

	return (
		<nav
			key={user?.id || "guest"}
			className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo Section */}
					<Link
						href="/"
						className="flex items-center gap-3 group"
						aria-label="Go to King Shoppers homepage">
						<div className="relative h-12 w-12 transition-transform group-hover:scale-105">
							<Image
								src={logo}
								alt="King Shoppers Logo"
								fill
								sizes="48px"
								className="object-contain"
								priority
							/>
						</div>
						<span className="hidden sm:block text-xl font-bold text-slate-900">
							King Shoppers
						</span>
					</Link>

					{/* Center Navigation - Desktop */}
					<div className="hidden md:flex items-center gap-6">
						<Link
							href="/"
							className={`text-sm font-medium transition-colors hover:text-blue-600 ${
								pathname === "/" ? "text-blue-600" : "text-slate-700"
							}`}>
							Home
						</Link>
						<Link
							href="/products"
							className={`text-sm font-medium transition-colors hover:text-blue-600 ${
								pathname === "/products" ? "text-blue-600" : "text-slate-700"
							}`}>
							Products
						</Link>
						<Link
							href="/high-margin-store"
							className={`text-sm font-medium transition-colors hover:text-blue-600 ${
								pathname === "/high-margin-store"
									? "text-blue-600"
									: "text-slate-700"
							}`}>
							Deals
						</Link>
						<Link
							href="/regional-brands"
							className={`text-sm font-medium transition-colors hover:text-blue-600 ${
								pathname === "/regional-brands"
									? "text-blue-600"
									: "text-slate-700"
							}`}>
							Local Brands
						</Link>
					</div>

					{/* Right Section */}
					<div className="flex items-center gap-3">
						{/* Cart - Desktop */}
						<div className="hidden md:block">
							<CartIcon showCount={true} variant="ghost" />
						</div>

						{/* Auth Section */}
						{loading ? (
							<LoadingSpinner size="sm" />
						) : user ? (
							<UserDropdown />
						) : (
							<Link href="/auth/login">
								<Button variant="default" size="sm" className="font-medium">
									Login
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
