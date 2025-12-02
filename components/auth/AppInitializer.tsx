"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface AppInitializerProps {
	children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
	const { loading, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Check if redirect is needed
	const shouldRedirect = React.useMemo(() => {
		if (loading || !user) return false;

		const userType = user.userType || user.userTypes;
		const isAdmin = userType === "admin";
		const isAgent = userType === "sales_executive" || userType === "delivery";
		const isOnAdminRoute = pathname?.startsWith("/admin");
		const isOnAgentRoute = pathname?.startsWith("/agent");
		const isOnAuthRoute = pathname?.startsWith("/auth");
		const isOnCustomerPage =
			pathname === "/" ||
			pathname?.startsWith("/cart") ||
			pathname?.startsWith("/products") ||
			pathname?.startsWith("/checkout");

		// Check if admin needs redirect
		if (isAdmin && !isOnAdminRoute && !isOnAuthRoute && isOnCustomerPage) {
			return true;
		}

		// Check if agent needs redirect
		if (isAgent && !isOnAgentRoute && !isOnAuthRoute && isOnCustomerPage) {
			return true;
		}

		return false;
	}, [loading, user, pathname]);

	// Perform redirect
	useEffect(() => {
		if (shouldRedirect && user) {
			const userType = user.userType || user.userTypes;
			const isAdmin = userType === "admin";
			const isAgent = userType === "sales_executive" || userType === "delivery";

			if (isAdmin) {
				router.replace("/admin/orders");
			} else if (isAgent) {
				router.replace("/agent/dashboard");
			}
		}
	}, [shouldRedirect, user, router]);

	// Show loading screen during initial authentication check or redirect
	if (loading || shouldRedirect) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center space-y-4 flex justify-center items-center flex-col">
					<LoadingSpinner size="lg" />
					<div className="space-y-2">
						<h2 className="text-xl font-semibold">King Shoppers</h2>
					</div>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
