"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import type { LucideIcon } from "lucide-react";
import {
	Grid3x3,
	Home,
	Package,
	ShoppingCart,
	Store,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
	name: string;
	href: string;
	icon: LucideIcon;
	show: boolean;
	badge?: number;
}

export default function BottomNav() {
	const pathname = usePathname();
	const { user, isAuthenticated } = useAuth();
	const { items } = useCart();

	// Calculate total cart items
	const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

	// Check if user is admin
	const isAdmin = user?.userTypes === "admin";
	const isSalesExecutive = user?.userTypes === "sales_executive";

	// Admin navigation items
	const adminNavItems: NavItem[] = [
		{
			name: "Dashboard",
			href: "/admin/dashboard",
			icon: Home,
			show: true,
		},
		{
			name: "Products",
			href: "/admin/products",
			icon: Package,
			show: true,
		},
		{
			name: "Orders",
			href: "/admin/orders",
			icon: ShoppingCart,
			show: true,
		},
		{
			name: "Users",
			href: "/admin/users",
			icon: User,
			show: true,
		},
		{
			name: "Categories",
			href: "/admin/category",
			icon: Grid3x3,
			show: true,
		},
	];

	// Sales Executive navigation items
	const salesNavItems: NavItem[] = [
		{
			name: "Dashboard",
			href: "/agent/dashboard",
			icon: Home,
			show: true,
		},
		{
			name: "Orders",
			href: "/agent/orders",
			icon: Package,
			show: true,
		},
		{
			name: "Customers",
			href: "/agent/customers",
			icon: User,
			show: true,
		},
		{
			name: "Products",
			href: "/products",
			icon: Grid3x3,
			show: true,
		},
		{
			name: "Profile",
			href: "/profile",
			icon: User,
			show: true,
		},
	];

	// Customer navigation items
	const customerNavItems: NavItem[] = [
		{
			name: "Store",
			href: "/products",
			icon: Store,
			show: true,
		},
		{
			name: "Categories",
			href: "/categories",
			icon: Grid3x3,
			show: true,
		},
		{
			name: "Cart",
			href: "/cart",
			icon: ShoppingCart,
			show: true,
			...(cartItemCount > 0 && { badge: cartItemCount }),
		},
		{
			name: "Orders",
			href: "/my-orders",
			icon: Package,
			show: isAuthenticated,
		},
		{
			name: "Profile",
			href: isAuthenticated ? "/profile" : "/auth/login",
			icon: User,
			show: true,
		},
	];

	// Select navigation items based on user type
	const navItems = isAdmin
		? adminNavItems
		: isSalesExecutive
		? salesNavItems
		: customerNavItems;

	const isActive = (href: string) => {
		if (href === "/products") {
			return pathname === "/" || pathname === "/products";
		}
		return pathname.startsWith(href);
	};

	// Hide BottomNav on admin and sales pages (they have their own sidebar)
	if (pathname?.startsWith("/admin") || pathname?.startsWith("/agent")) {
		return null;
	}

	const dynamicAuthRoutes = ["/auth/admin-login", "/auth/agents-login"];
	if (typeof pathname === "string" && dynamicAuthRoutes.includes(pathname)) {
		return null;
	}

	return (
		<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
			<nav className="flex items-center justify-around h-16 px-2">
				{navItems
					.filter((item) => item.show)
					.map((item) => {
						const Icon = item.icon;
						const active = isActive(item.href);

						return (
							<Link
								key={item.name}
								href={item.href}
								className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
									active ? "text-primary" : "text-gray-500 hover:text-gray-700"
								}`}>
								<div className="relative inline-flex items-center justify-center">
									<Icon
										className={`w-6 h-6 ${active ? "stroke-[2.5px]" : ""}`}
									/>
									{item.badge && item.badge > 0 && (
										<span className="absolute -top-1.5 -right-2 h-5 w-5 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white">
											{item.badge > 99 ? "99+" : item.badge}
										</span>
									)}
								</div>
								<span
									className={`text-[10px] mt-1 font-medium ${
										active ? "text-primary" : "text-gray-500"
									}`}>
									{item.name}
								</span>
							</Link>
						);
					})}
			</nav>
		</div>
	);
}
