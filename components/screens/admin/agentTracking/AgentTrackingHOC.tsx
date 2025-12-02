"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AgentTracking from "./AgentTracking";

export default function AgentTrackingHOC() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && (!user || user.userType !== "admin")) {
			router.push("/auth/admin-login");
		}
	}, [user, loading, router]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!user || user.userType !== "admin") {
		return null;
	}

	return <AgentTracking />;
}
