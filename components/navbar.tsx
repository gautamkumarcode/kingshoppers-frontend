"use client"


import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Menu, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserDropdown } from "./navbar/UserDropdown";
import { LoadingSpinner } from "./ui/loading-spinner";

export function Navbar() {
	const { user, loading } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [cartCount, setCartCount] = useState(0);

	useEffect(() => {
		// Get cart count from localStorage
		const cart = JSON.parse(localStorage.getItem("cart") || "[]");
		setCartCount(cart.length);
	}, []);

	return (
		<nav className="border-b border-border bg-background sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 py-4">
				<div className="flex justify-between items-center">
					{/* Logo */}
					<Link href="/" className="text-2xl font-bold text-primary">
						{/* Icon (logo image) */}

						<Image
							src="/king1.png" // apna icon path
							alt="King Shopper"
							width={80}
							height={20}
							className="object-contain"
						/>
						{/* Text */}
					</Link>
					{/* Right Section */}
					<div className="flex items-center gap-4">
						{/* Cart */}
						<Link href="/cart" className="relative">
							<Button variant="ghost" size="icon">
								<ShoppingCart className="w-5 h-5" />
								{cartCount > 0 && (
									<span className="absolute -top-2 -right-2 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										{cartCount}
									</span>
								)}
							</Button>
						</Link>

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
									href="/dashboard"
									className="block px-4 py-2 hover:bg-accent rounded"
									onClick={() => setIsOpen(false)}>
									Dashboard
								</Link>
								<Link
									href="/profile"
									className="block px-4 py-2 hover:bg-accent rounded"
									onClick={() => setIsOpen(false)}>
									Profile
								</Link>
								<Link
									href="/orders"
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
