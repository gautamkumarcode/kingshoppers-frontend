"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { AlertCircle, Briefcase, Lock, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
	const router = useRouter();
	const { login, user, loading: authLoading } = useAuth();
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Redirect if already logged in
	React.useEffect(() => {
		if (!authLoading && user) {
			const userType = user.userType || user.userTypes;
			if (userType === "admin") {
				router.push("/admin/orders");
			}
		}
	}, [authLoading, user, router]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await api.post("/auth/admin-login", {
				phone,
				password,
			});

			const data = response.data;

			// Store token in localStorage for header-based auth
			if (data.token && typeof window !== "undefined") {
				localStorage.setItem("auth_token", data.token);
			}

			// Update auth context with user data
			await login(data.user, data.token);

			// Redirect based on user type
			if (data.user.userType === "admin") {
				router.push("/admin/orders");
			} else if (
				data.user.userType === "sales_executive" ||
				data.user.userType === "delivery"
			) {
				router.push("/agent/dashboard");
			} else {
				router.push("/");
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || "Invalid credentials. Please try again.";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center p-4">
			<Card className="w-full max-w-lg shadow-xl">
				<CardHeader className="space-y-3">
					<div className="flex justify-center">
						<div className="bg-primary/10 p-4 rounded-full">
							<Briefcase className="w-8 h-8 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl text-center">Admin Login</CardTitle>
					<CardDescription className="text-center">
						Sign in to access the admin panel and dashboard
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
								<AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
								<p className="text-sm">{error}</p>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<div className="relative">
								<Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
								<Input
									id="phone"
									type="tel"
									placeholder="Enter your phone number"
									value={phone}
									onChange={(e) => {
										const value = e.target.value
											.replace(/\D/g, "")
											.slice(0, 10);
										setPhone(value);
									}}
									required
									className="pl-10"
									disabled={loading}
									maxLength={10}
								/>
							</div>
							{phone && phone.length !== 10 && (
								<p className="text-xs text-red-500">
									Phone number must be 10 digits
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground z-10" />
								<PasswordInput
									id="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="pl-10"
									disabled={loading}
								/>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Signing in..." : "Sign In"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
