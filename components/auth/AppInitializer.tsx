"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface AppInitializerProps {
	children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
	const { loading, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect users to their appropriate dashboards
	useEffect(() => {
		if (!loading && user) {
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

			// Redirect admin to admin dashboard if on customer pages
			if (isAdmin && !isOnAdminRoute && !isOnAuthRoute && isOnCustomerPage) {
				router.push("/admin/orders");
			}

			// Redirect agents to agent dashboard if on customer pages
			if (isAgent && !isOnAgentRoute && !isOnAuthRoute && isOnCustomerPage) {
				router.push("/agent/dashboard");
			}
		}
	}, [loading, user, pathname, router]);

	// Show loading screen during initial authentication check
	if (loading) {
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
