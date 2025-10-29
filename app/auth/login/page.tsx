"use client";

import type React from "react";

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
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();
	const [step, setStep] = useState<"phone" | "otp">("phone");
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSendOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/send-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Failed to send OTP");
				return;
			}

			setStep("otp");
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// First verify OTP
			const verifyResponse = await fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone, otp }),
			});

			if (!verifyResponse.ok) {
				const data = await verifyResponse.json();
				setError(data.message || "Invalid OTP");
				return;
			}

			// Then login
			const loginResponse = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone, otp }),
			});

			const data = await loginResponse.json();

			if (!loginResponse.ok) {
				setError(data.message || "Login failed");
				return;
			}

			// Save token
			// use AuthContext to persist and update state
			login(data.token, data.user);

			// Redirect based on user type
			if (data.user.userType === "admin") {
				router.push("/admin/dashboard");
			} else if (data.user.userType === "delivery") {
				router.push("/delivery/orders");
			} else if (data.user.userType === "sales_executive") {
				router.push("/sales/dashboard");
			} else {
				router.push("/products");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>
					{step === "phone"
						? "Enter your phone number"
						: "Enter the OTP sent to your phone"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{step === "phone" ? (
					<form onSubmit={handleSendOTP} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="+91 98765 43210"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
							/>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Sending..." : "Send OTP"}
						</Button>
					</form>
				) : (
					<form onSubmit={handleVerifyOTP} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="otp">OTP</Label>
							<Input
								id="otp"
								type="text"
								placeholder="000000"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								maxLength={6}
								required
							/>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Verifying..." : "Verify & Login"}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full bg-transparent"
							onClick={() => {
								setStep("phone");
								setOtp("");
								setError("");
							}}>
							Change Phone Number
						</Button>
					</form>
				)}

				<div className="mt-4 text-center text-sm">
					Don't have an account?{" "}
					<Link href="/auth/register" className="text-primary hover:underline">
						Register here
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
