"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import logo from "@/public/logo.png";
import { StoreIcon } from "lucide-react";
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

	return (
		<nav className="border-b border-border bg-background sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 py-4">
				<div className="flex justify-between items-center">
					{/* Logo */}
					<Link
						href="/"
						className="relative flex items-center gap-2 w-auto h-12 font-bold text-primary"
						aria-label="Go to Kingshppers homepage">
						{/* Logo Icon */}
						<div className="relative  h-20 w-32 md:w-40">
							<Image
								src={logo}
								alt="Kingshppers Logo"
								fill
								sizes="(max-width: 768px) 40px, 50px"
								className="object-contain"
								priority
							/>
						</div>

						{/* Brand Text */}
					</Link>

					{/* Right Section */}
					<div className="flex items-center gap-4">
						{/* Store Link - Hidden on mobile */}
						<Link
							href="/products"
							className="hidden md:block hover:text-primary">
							<StoreIcon className=" w-4 h-4" />
						</Link>

						{/* Cart - Hidden on mobile, shown on desktop */}
						<div className="hidden md:block">
							<CartIcon showCount={true} variant="ghost" />
						</div>

						{/* Auth Section */}
						{loading ? (
							<div className="flex items-center gap-2">
								<LoadingSpinner size="sm" />
							</div>
						) : user ? (
							<UserDropdown />
						) : (
							<div className=" gap-2">
								<Link href="/auth/login">
									<Button variant="outline" size="sm">
										Login
									</Button>
								</Link>
							</div>
						)}

						{/* Mobile Menu Toggle - Removed */}
					</div>
				</div>
			</div>
		</nav>
	);
}
