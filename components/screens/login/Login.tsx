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
import { AlertCircle, ArrowLeft, Phone, ShoppingBag } from "lucide-react";
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
			await login(data.user, data.token);

			// Check for redirect URL from sessionStorage
			const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
			if (redirectUrl) {
				sessionStorage.removeItem("redirectAfterLogin");
				router.push(redirectUrl);
				return;
			}

			if (data.user.userTypes == "admin") {
				router.push("/admin/dashboard");
				return;
			}

			// Always redirect to dashboard to show profile and status
			if (data.user.userTypes == "sales_executive") {
				router.push("/agent/dashboard");
				return;
			}
			if (data.user.userTypes == "customer") {
				router.push("/profile");
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
		<div className="flex items-center justify-center p-4">
			<Card className="w-full max-w-lg shadow-xl">
				<CardHeader className="space-y-3">
					<div className="flex justify-center">
						<div className="bg-primary/10 p-4 rounded-full">
							<ShoppingBag className="w-8 h-8 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl text-center">Customer Login</CardTitle>
					<CardDescription className="text-center">
						{step === "phone"
							? "Enter your phone number to receive OTP"
							: "Enter the OTP sent to your phone"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{step === "phone" ? (
						<form onSubmit={handleSendOTP} className="space-y-4">
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

							<Button
								type="submit"
								className="w-full"
								disabled={loading || phone.length !== 10}>
								{loading ? "Sending OTP..." : "Send OTP"}
							</Button>
						</form>
					) : (
						<form onSubmit={handleVerifyOTP} className="space-y-4">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
									<AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
									<p className="text-sm">{error}</p>
								</div>
							)}

							<div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
								<p className="text-sm">
									OTP sent to <strong>+91 {phone}</strong>
								</p>
								<p className="text-xs mt-1 font-mono">
									Development OTP: <strong>{otp}</strong>
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="otp">Enter OTP</Label>
								<Input
									id="otp"
									type="text"
									placeholder="000000"
									value={otp}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, "").slice(0, 6);
										setOtp(value);
									}}
									maxLength={6}
									required
									disabled={loading}
									className="text-center text-lg tracking-widest"
								/>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={loading || otp.length !== 6}>
								{loading ? "Verifying..." : "Verify & Login"}
							</Button>

							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => {
									setStep("phone");
									setOtp("");
									setError("");
								}}
								disabled={loading}>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Change Phone Number
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
