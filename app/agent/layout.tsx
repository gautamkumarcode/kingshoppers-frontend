"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
	ShoppingCart,
	TrendingUp,
	Truck,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AgentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { user, logout, loading } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Determine agent type
	const userTypeField = user?.userType || user?.userTypes;
	const isSalesAgent = userTypeField === "sales_executive";
	const isDeliveryAgent = userTypeField === "delivery";

	useEffect(() => {
		if (loading) return;
		// Allow both sales_executive and delivery agents
		if (!user || (!isSalesAgent && !isDeliveryAgent)) {
			router.push("/auth/admin-login");
			return;
		}
	}, [router, loading, user, isSalesAgent, isDeliveryAgent]);

	const handleLogout = () => {
		logout();
	};

	if (!user) {
		return <div>Loading...</div>;
	}

	// Define menu items based on agent type
	const salesMenuItems = [
		{ icon: LayoutDashboard, label: "Dashboard", href: "/agent/dashboard" },
		{ icon: Users, label: "Customers", href: "/agent/customers" },
		{ icon: ShoppingCart, label: "Orders", href: "/agent/orders" },
		{ icon: TrendingUp, label: "Performance", href: "/agent/performance" },
	];

	const deliveryMenuItems = [
		{ icon: Package, label: "Assigned Orders", href: "/agent/orders" },
		{ icon: Truck, label: "Deliveries", href: "/agent/deliveries" },
	];

	const menuItems = isSalesAgent ? salesMenuItems : deliveryMenuItems;

	// Portal title based on agent type
	const portalTitle = isSalesAgent
		? "Sales Executive Portal"
		: "Delivery Agent Portal";
	const logoText = isSalesAgent ? "💼 Sales" : "🚚 Delivery";
	const logoShort = isSalesAgent ? "💼" : "🚚";

	return (
		<div className="flex h-screen bg-background overflow-hidden">
			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar - Desktop */}
			<aside
				className={`${
					isOpen ? "w-64" : "w-20"
				} border-r border-border bg-card transition-all duration-300 flex-col hidden lg:flex`}>
				{/* Logo */}
				<div className="p-4 border-b border-border">
					<Link
						href={isSalesAgent ? "/agent/dashboard" : "/agent/orders"}
						className="text-xl font-bold text-primary">
						{isOpen ? logoText : logoShort}
					</Link>
				</div>

				{/* Menu */}
				<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
					{menuItems.map((item) => (
						<Link key={item.href} href={item.href}>
							<Button
								variant="ghost"
								className="w-full justify-start"
								size={isOpen ? "default" : "icon"}>
								<item.icon className="w-5 h-5" />
								{isOpen && <span className="ml-2">{item.label}</span>}
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
						size={isOpen ? "default" : "icon"}>
						<LogOut className="w-5 h-5" />
						{isOpen && <span className="ml-2">Logout</span>}
					</Button>
				</div>
			</aside>

			{/* Sidebar - Mobile */}
			<aside
				className={`${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				} fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-300 flex flex-col lg:hidden`}>
				{/* Logo */}
				<div className="p-4 border-b border-border flex justify-between items-center">
					<Link
						href={isSalesAgent ? "/agent/dashboard" : "/agent/orders"}
						className="text-xl font-bold text-primary"
						onClick={() => setIsMobileMenuOpen(false)}>
						{logoText}
					</Link>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsMobileMenuOpen(false)}>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Menu */}
				<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
					{menuItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setIsMobileMenuOpen(false)}>
							<Button variant="ghost" className="w-full justify-start">
								<item.icon className="w-5 h-5" />
								<span className="ml-2">{item.label}</span>
							</Button>
						</Link>
					))}
				</nav>

				{/* Logout */}
				<div className="p-4 border-t border-border">
					<Button
						variant="ghost"
						className="w-full justify-start text-destructive hover:bg-destructive/10"
						onClick={handleLogout}>
						<LogOut className="w-5 h-5" />
						<span className="ml-2">Logout</span>
					</Button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 overflow-auto flex flex-col">
				{/* Top Bar */}
				<div className="border-b border-border bg-card p-4 flex justify-between items-center sticky top-0 z-30">
					<div className="flex items-center gap-3">
						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden"
							onClick={() => setIsMobileMenuOpen(true)}>
							<Menu className="w-5 h-5" />
						</Button>
						<h1 className="text-lg sm:text-2xl font-bold">{portalTitle}</h1>
					</div>
					<div className="flex items-center gap-2 sm:gap-4">
						<span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
							{user.firstName && user.lastName
								? `${user.firstName} ${user.lastName}`
								: user.ownerName || user.phone}
						</span>
						<Button
							variant="outline"
							size="sm"
							className="hidden lg:flex"
							onClick={() => setIsOpen(!isOpen)}>
							{isOpen ? "Collapse" : "Expand"}
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="p-4 sm:p-6 flex-1 overflow-auto">{children}</div>
			</main>
		</div>
	);
}
