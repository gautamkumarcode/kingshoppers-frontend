"use client";

import { apiCall, logoutRequest } from "@/lib/auth";
import { User } from "@/types/user/user-types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (user?: User) => Promise<void>;
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
		try {
			const res = await apiCall("/auth/me");

			if (res.ok) {
				const data = await res.json();
				return data.user || null;
			} else {
				return null;
			}
		} catch (error) {
			console.error("❌ Error fetching current user:", error);
			return null;
		}
	};

	// Initialize user on app load
	useEffect(() => {
		if (isInitialized) return;

		let mounted = true;

		const initializeAuth = async () => {
			try {
				const currentUser = await fetchCurrentUser();
				if (mounted) {
					setUser(currentUser);
					setIsInitialized(true);
				}
			} catch (error) {
				console.error("❌ Auth initialization error:", error);
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

		// Add a small delay to prevent flash
		const timer = setTimeout(initializeAuth, 100);

		return () => {
			mounted = false;
			clearTimeout(timer);
		};
	}, [isInitialized]);

	// Login function
	const login = async (providedUser?: User): Promise<void> => {
		try {
			if (providedUser) {
				setUser(providedUser);
				setIsInitialized(true);
			} else {
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
			await logoutRequest();
			setUser(null);
			router.push("/auth/login");
		} catch (error) {
			console.error("Error during logout:", error);
			setUser(null);
			router.push("/auth/login");
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
		isAuthenticated: !!user && !loading,
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
