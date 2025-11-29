"use client";

import api from "@/lib/api";
import { logoutRequest } from "@/lib/auth";
import { User } from "@/types/user/user-types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (user?: User, token?: string) => Promise<void>;
	logout: () => Promise<void>;
	updateUser: (user: User) => void;
	refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	// Fetch current user from server (using httpOnly cookie)
	const fetchCurrentUser = async (): Promise<User | null> => {
		// Check if there's a token before making the API call

		try {
			const res = await api.get("/auth/me");

			if (res.status === 200) {
				const data = res;
				console.log("✅ User fetched successfully:", data.data.user);
				return data.data.user || null;
			} else {
				console.log("❌ Failed to fetch user, status:", res.status);
				return null;
			}
		} catch (error) {
			console.error("❌ Error fetching current user:", error);
			return null;
		}
	};

	// Initialize user on app load
	useEffect(() => {
		if (isInitialized) return; // Prevent multiple initializations

		let mounted = true;

		const initializeAuth = async () => {
			try {
				const currentUser = await fetchCurrentUser();
				if (mounted) {
					setUser(currentUser);
					setIsInitialized(true);
				}
			} catch (error) {
				console.error("Auth initialization error:", error);
				if (mounted) {
					setUser(null);
					setIsInitialized(true);
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		};

		initializeAuth();

		return () => {
			mounted = false;
		};
	}, [isInitialized]);

	// Login function - accepts user data or fetches from server
	const login = async (providedUser?: User, token?: string): Promise<void> => {
		try {
			// Store token in localStorage if provided
			if (token && typeof window !== "undefined") {
				localStorage.setItem("auth_token", token);
			}

			if (providedUser) {
				// Use provided user data (from login/register response)
				setUser(providedUser);
				setIsInitialized(true);
			} else {
				// Fetch user from server (token should be in localStorage)
				const currentUser = await fetchCurrentUser();
				setUser(currentUser);
				setIsInitialized(true);
			}
		} catch (error) {
			console.error("Error during login:", error);
			setUser(null);
		}
	};

	// Logout function
	const logout = async (): Promise<void> => {
		try {
			// Determine redirect path based on user role before clearing user state
			let redirectPath = "/auth/login"; // Default for customers

			if (user) {
				const userType = (user as any).userType || (user as any).userTypes;

				if (userType === "admin") {
					redirectPath = "/auth/admin-login";
				} else if (userType === "delivery" || userType === "sales_executive") {
					redirectPath = "/auth/agents-login";
				}
			}

			// Call server to clear cookie
			await logoutRequest();

			// Clear token from localStorage
			if (typeof window !== "undefined") {
				localStorage.removeItem("auth_token");
			}

			setUser(null);
			router.push(redirectPath);
		} catch (error) {
			console.error("Error during logout:", error);

			// Determine redirect path even on error
			let redirectPath = "/auth/login";

			if (user) {
				const userType = (user as any).userType || (user as any).userTypes;

				if (userType === "admin") {
					redirectPath = "/auth/admin-login";
				} else if (userType === "delivery" || userType === "sales_executive") {
					redirectPath = "/auth/agents-login";
				}
			}

			// Still clear user state and token even if server call fails
			if (typeof window !== "undefined") {
				localStorage.removeItem("auth_token");
			}

			setUser(null);
			router.push(redirectPath);
		}
	};

	// Update user in memory
	const updateUser = (updatedUser: User): void => {
		setUser(updatedUser);
	};

	// Refresh user data from server
	const refreshUser = async (): Promise<void> => {
		try {
			const currentUser = await fetchCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error("Error refreshing user:", error);
		}
	};

	const value: AuthContextType = {
		user,
		loading,
		isAuthenticated: !!user, // User exists = authenticated (cookie-based)
		login,
		logout,
		updateUser,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return ctx;
}

export default AuthContext;
