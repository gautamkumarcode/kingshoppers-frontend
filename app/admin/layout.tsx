"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
	Briefcase,
	CheckCircle,
	CreditCard,
	Image,
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
	Settings,
	ShoppingCart,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { user, logout, loading } = useAuth();
	const [isOpen, setIsOpen] = useState(true);
	const [isDesktop, setIsDesktop] = useState(true);
	const [mobileOpen, setMobileOpen] = useState(false);

	// set initial collapsed state on small screens and handle resize
	useEffect(() => {
		const handleResize = () => {
			const isNowDesktop = window.innerWidth >= 768; // md breakpoint
			setIsDesktop(isNowDesktop);
			// if desktop, ensure sidebar visible (respect collapsed state)
			if (isNowDesktop) {
				setMobileOpen(false);
				setIsOpen(true);
			} else {
				// on mobile default to collapsed (hidden)
				setIsOpen(false);
			}
		};

		// set initial
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		console.log("🔍 Admin layout auth check:", {
			loading,
			user,
			userType: user?.userType,
			userTypes: user?.userTypes,
		});
		if (loading) return;
		// Check for both userType (User schema) and userTypes (Customer schema)
		const userTypeField = user?.userType || user?.userTypes;
		console.log("📋 Extracted userTypeField:", userTypeField);
		if (!user || userTypeField !== "admin") {
			console.log("❌ Not authorized, redirecting to admin login");
			router.push("/auth/admin-login");
			return;
		}
		console.log("✅ Admin authorized");
	}, [router, loading, user]);

	const handleLogout = () => {
		logout();
	};

	if (!user) {
		return <div>Loading...</div>;
	}

	const menuItems = [
		{ icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
		{ icon: ShoppingCart, label: "Brands", href: "/admin/brands" },
		{ icon: Users, label: "Regional Brands", href: "/admin/regional-brands" },

		{ icon: ShoppingCart, label: "Category", href: "/admin/category" },
		{ icon: Package, label: "Products", href: "/admin/products" },
		{ icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
		{ icon: Image, label: "Banners", href: "/admin/banners" },
		{
			icon: ShoppingCart,
			label: "Homepage Sections",
			href: "/admin/homepage-sections",
		},
		{ icon: Users, label: "Users", href: "/admin/users" },
		{
			icon: Briefcase,
			label: "Sales Executives",
			href: "/admin/sales-executives",
		},
		{
			icon: CreditCard,
			label: "Wallet Topups",
			href: "/admin/wallet-topups",
		},
		{
			icon: CheckCircle,
			label: "Payment Verifications",
			href: "/admin/payment-verifications",
		},
		{
			icon: Settings,
			label: "Business Settings",
			href: "/admin/business-settings",
		},
	];

	// whether to show full labels (desktop expanded OR mobile overlay open)
	const showLabels = isDesktop ? isOpen : mobileOpen;

	return (
		<div className=" bg-background">
			{/* Sidebar */}
			{/* Desktop: fixed visible (collapsed/expanded). Mobile: overlay slide-in when mobileOpen. */}
			<aside
				className={`${
					isDesktop
						? `fixed left-0 top-0 h-screen z-40 overflow-y-auto ${
								isOpen ? "w-64" : "w-20"
						  }`
						: `fixed left-0 top-0 h-screen z-40 overflow-y-auto w-64 transform ${
								mobileOpen ? "translate-x-0" : "-translate-x-full"
						  }`
				} border-r border-border bg-card transition-transform duration-300 flex flex-col`}>
				{/* Logo */}
				<div className="p-4 border-b border-border relative">
					<Link
						href="/admin/dashboard"
						className="text-xl font-bold text-primary">
						{showLabels ? "📚 Admin" : "📚"}
					</Link>

					{/* Close button inside sidebar for mobile overlay */}
					{!isDesktop && mobileOpen && (
						<div className="absolute right-2 top-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setMobileOpen(false)}>
								<X className="w-4 h-4" />
							</Button>
						</div>
					)}
				</div>

				{/* Menu */}
				<nav className="flex-1 p-4 space-y-2">
					{menuItems.map((item) => (
						<Link key={item.href} href={item.href}>
							<Button
								variant="ghost"
								className="w-full justify-start"
								size={showLabels ? "default" : "icon"}>
								<item.icon className="w-5 h-5" />
								{showLabels && <span className="ml-2">{item.label}</span>}
							</Button>
						</Link>
					))}
				</nav>

				{/* Logout */}
				<div className="p-4 border-t border-border">
					<Button
						variant="ghost"
						className="w-full justify-start text-destructive hover:bg-destructive/10"
						onClick={handleLogout}
						size={showLabels ? "default" : "icon"}>
						<LogOut className="w-5 h-5" />
						{showLabels && <span className="ml-2">Logout</span>}
					</Button>
				</div>
			</aside>

			{/* Mobile backdrop when sidebar open */}
			{!isDesktop && mobileOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30"
					onClick={() => setMobileOpen(false)}
				/>
			)}

			{/* Main Content */}
			<main
				className={`transition-all duration-300 ${
					isDesktop ? (isOpen ? "ml-64" : "ml-20") : "ml-0"
				}`}>
				{/* Top Bar (fixed) */}
				<div
					className={`fixed top-0 right-0 z-50 border-b border-border bg-card p-4 flex justify-between items-center w-full`}
					style={{
						left: isDesktop ? (isOpen ? "16rem" : "5rem") : 0,
						right: 0,
					}}>
					<div className="flex items-center gap-4">
						{/* Mobile menu button */}
						{!isDesktop ? (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setMobileOpen(true)}>
								<Menu className="w-5 h-5" />
							</Button>
						) : null}

						<h1 className="text-2xl font-bold">Admin Panel</h1>
					</div>

					<div className="flex items-center gap-2 sm:gap-4">
						<span className="text-sm text-muted-foreground hidden sm:inline">
							{user.ownerName}
						</span>
						{isDesktop ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsOpen(!isOpen)}>
								{isOpen ? "Collapse" : "Expand"}
							</Button>
						) : (
							<Button
								variant="outline"
								size="sm"
								onClick={handleLogout}
								className="text-destructive hover:bg-destructive/10 flex items-center gap-1">
								<LogOut className="w-4 h-4" />
								<span className="hidden sm:inline">Logout</span>
							</Button>
						)}
					</div>
				</div>

				{/* Content (add top padding so content isn't hidden behind fixed top bar) */}
				<div className="p-6" style={{ paddingTop: 80 }}>
					{children}
				</div>
			</main>
		</div>
	);
}
