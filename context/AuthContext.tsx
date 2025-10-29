"use client"

import { apiCall, logoutRequest } from "@/lib/auth"
import { useRouter } from "next/navigation"
import React, { createContext, useContext, useEffect, useState } from "react"

type User = any;

type AuthContextType = {
	user: User | null;
	token: string | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (token: string, user: User) => void;
	logout: () => void;
	updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
		// token is not stored client-side; keep it nullable for compatibility
		const [token, setToken] = useState<string | null>(null)
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
			// hydrate current user from server (uses httpOnly cookie)
			let mounted = true

			const fetchMe = async () => {
				try {
					const res = await apiCall("/api/auth/me")
					if (!mounted) return
					if (!res.ok) {
						setUser(null)
						setToken(null)
					} else {
						const data = await res.json()
						// server should return the user object
						setUser(data.user || null)
						// token is intentionally not persisted on client
						setToken(null)
					}
				} catch (e) {
					if (!mounted) return
					setUser(null)
					setToken(null)
				} finally {
					if (mounted) setLoading(false)
				}
			}

			fetchMe()

			return () => {
				mounted = false
			}
	}, []);

		const login = (providedUser?: User) => {
			// If login flow already returned user, accept it; otherwise fetch /me
			if (providedUser) {
				setUser(providedUser)
				setToken(null)
				return
			}

			// otherwise hydrate from server
			apiCall("/api/auth/me")
				.then(async (res) => {
					if (!res.ok) return
					const data = await res.json()
					setUser(data.user || null)
				})
				.catch(() => {})
		}

		const logout = async () => {
			// tell server to clear auth cookie/session
			await logoutRequest()
			setToken(null)
			setUser(null)
			try {
				router.push("/auth/login")
			} catch (e) {
				// ignore
			}
		}

		const updateUser = (u: User) => {
			// update in-memory user; server should be updated separately
			setUser(u)
		}

	const value: AuthContextType = {
		user,
		token,
		loading,
		isAuthenticated: !!token,
		login,
		logout,
		updateUser,
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
