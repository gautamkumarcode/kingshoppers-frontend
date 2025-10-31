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
import api from "@/lib/api";
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
			const response = await api.post("/auth/send-otp", { phone });

			console.log(response);
			setOtp(response.data.otp);

			setStep("otp");
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || "An error occurred. Please try again.";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Verify OTP - this will either login existing user or indicate new user
			const verifyResponse = await api.post("/auth/verify-otp", {
				phone,
				otp,
			});

			const data = verifyResponse.data;

			if (!data.verified) {
				setError("Invalid OTP");
				return;
			}

			if (data.isNewUser) {
				// New user - redirect to registration with phone number
				const phoneParam = data.phone || phone;
				router.push(`/auth/register?phone=${encodeURIComponent(phoneParam)}`);
				return;
			}

			// Existing user - they're now logged in via cookie
			// Update auth context with user data
			await login(data.user);

			if (data.user.userTypes == "admin") {
				router.push("/admin/dashboard");
				return;
			}

			// Always redirect to dashboard to show profile and status
			if (data.user.userTypes == "sales_executive") {
				router.push("/sales/dashboard");
				return;
			}
			if (data.user.userTypes == "customer") {
				router.push("/dashboard");
				return;
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || "An error occurred. Please try again.";
			setError(errorMessage);
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
							<p>{otp}</p>
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
