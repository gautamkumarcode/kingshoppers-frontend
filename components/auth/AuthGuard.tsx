"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
	redirectTo?: string;
	fallback?: React.ReactNode;
}

export function AuthGuard({
	children,
	requireAuth = true,
	redirectTo = "/auth/login",
	fallback,
}: AuthGuardProps) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && requireAuth && !user) {
			router.push(redirectTo);
		}
	}, [user, loading, requireAuth, redirectTo, router]);

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			fallback || (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<LoadingSpinner size="lg" />
						<p className="mt-4 text-muted-foreground">Loading...</p>
					</div>
				</div>
			)
		);
	}

	// If auth is required but user is not logged in, show nothing (will redirect)
	if (requireAuth && !user) {
		return null;
	}

	// If auth is not required or user is logged in, show children
	return <>{children}</>;
}
