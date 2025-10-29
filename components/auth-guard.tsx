"use client";

import type React from "react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
	children: React.ReactNode;
	requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
	const router = useRouter();
	const [isAuthorized, setIsAuthorized] = useState(false);
	const { loading, isAuthenticated, user } = useAuth();

	useEffect(() => {
		if (loading) return;

		if (!isAuthenticated) {
			router.push("/auth/login");
			return;
		}

		if (requiredRole && user?.userType !== requiredRole) {
			router.push("/unauthorized");
			return;
		}

		setIsAuthorized(true);
	}, [router, requiredRole, loading, isAuthenticated, user]);

	if (!isAuthorized) {
		return <div>Loading...</div>;
	}

	return <>{children}</>;
}
