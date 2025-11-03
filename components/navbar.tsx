"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import logo from "@/public/logo.png";
import { Menu, StoreIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartIcon } from "./cart";
import { UserDropdown } from "./navbar/UserDropdown";
import { LoadingSpinner } from "./ui/loading-spinner";

export function Navbar() {
	const { user, loading } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	// Hide navbar on admin routes
	if (typeof pathname === "string" && pathname.startsWith("/admin")) {
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
						{/* Cart */}
						<Link
							href="/products"
							className="hidden md:block hover:text-primary">
							<StoreIcon className=" w-4 h-4" />
						</Link>
						<CartIcon showCount={true} variant="ghost" />

						{/* Auth Section */}
						{loading ? (
							<div className="flex items-center gap-2">
								<LoadingSpinner size="sm" />
							</div>
						) : user ? (
							<UserDropdown />
						) : (
							<div className="flex gap-2">
								<Link href="/auth/login">
									<Button variant="outline" size="sm">
										Login
									</Button>
								</Link>
								<Link href="/auth/register">
									<Button size="sm">Register</Button>
								</Link>
							</div>
						)}

						{/* Mobile Menu Toggle */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setIsOpen(!isOpen)}>
							{isOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isOpen && (
					<div className="md:hidden mt-4 space-y-2 pb-4 border-t pt-4">
						{/* Navigation Links */}
						<Link
							href="/products"
							className="block px-4 py-2 hover:bg-accent rounded"
							onClick={() => setIsOpen(false)}>
							Products
						</Link>

						{user && (
							<>
								<Link
									href="/profile"
									className="block px-4 py-2 hover:bg-accent rounded"
									onClick={() => setIsOpen(false)}>
									Profile
								</Link>
								<Link
									href="/my-orders"
									className="block px-4 py-2 hover:bg-accent rounded"
									onClick={() => setIsOpen(false)}>
									My Orders
								</Link>
								<Link
									href="/wallet"
									className="block px-4 py-2 hover:bg-accent rounded"
									onClick={() => setIsOpen(false)}>
									Wallet
								</Link>
							</>
						)}

						{!user && (
							<div className="px-4 py-2 space-y-2">
								<Link href="/auth/login" onClick={() => setIsOpen(false)}>
									<Button variant="outline" size="sm" className="w-full">
										Login
									</Button>
								</Link>
								<Link href="/auth/register" onClick={() => setIsOpen(false)}>
									<Button size="sm" className="w-full">
										Register
									</Button>
								</Link>
							</div>
						)}
					</div>
				)}
			</div>
		</nav>
	);
}
