"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/AuthContext";

interface AppInitializerProps {
	children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
	const { loading } = useAuth();

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
