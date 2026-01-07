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
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Phone, ShieldCheck, ShoppingBag } from "lucide-react";
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

			if (data.user.userTypes === "admin") {
				router.push("/admin/dashboard");
				return;
			}

			// Always redirect to dashboard to show profile and status
			if (data.user.userTypes === "sales_executive") {
				router.push("/agent/dashboard");
				return;
			}
			if (data.user.userTypes === "customer") {
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
		<div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
			{/* Decorative Elements */}
			<div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
			<div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

			<Card className="w-full max-w-md shadow-2xl border-muted/40 bg-card/80 backdrop-blur-sm relative z-10 overflow-hidden">
				{/* Top Accent Line */}
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600" />
				
				<CardHeader className="space-y-4 pb-2 text-center pt-8">
					<div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center transform rotate-3 transition-transform hover:rotate-0 duration-300">
						<ShoppingBag className="w-8 h-8 text-primary" />
					</div>
					
					<div className="space-y-1">
						<CardTitle className="text-2xl font-bold tracking-tight">
							{step === "phone" ? "Welcome Back" : "Verify It's You"}
						</CardTitle>
						<CardDescription className="text-muted-foreground/80 text-base">
							{step === "phone"
								? "Enter your mobile number to get started"
								: "We've sent a code to your phone"}
						</CardDescription>
					</div>
				</CardHeader>
				
				<CardContent className="pt-6 px-6 pb-8">
					{step === "phone" ? (
						<form onSubmit={handleSendOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
							{error && (
								<div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
									<AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
									<p>{error}</p>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="phone" className="text-foreground/80">Mobile Number</Label>
								<div className="relative group">
									<Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="phone"
										type="tel"
										placeholder="98765 43210"
										value={phone}
										onChange={(e) => {
											const value = e.target.value
												.replace(/\D/g, "")
												.slice(0, 10);
											setPhone(value);
										}}
										required
										className="pl-10 h-11 text-lg tracking-wide transition-all border-muted focus:border-primary focus:ring-primary/20"
										disabled={loading}
										maxLength={10}
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
								disabled={loading || phone.length !== 10}>
								{loading ? (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Sending Code...
									</>
								) : (
									<>
										Get OTP
										<ArrowRight className="w-5 h-5 ml-2" />
									</>
								)}
							</Button>
						</form>
					) : (
						<form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
							{error && (
								<div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
									<AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
									<p>{error}</p>
								</div>
							)}

							<div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center">
								<p className="text-sm text-muted-foreground mb-1">
									Code sent to <span className="text-foreground font-semibold">+91 {phone}</span>
								</p>
								{otp && (
									<p className="text-xs font-mono bg-background/50 inline-block px-2 py-0.5 rounded border border-border/50 mt-1">
										Dev Code: {otp}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="otp" className="text-foreground/80">Enter Verification Code</Label>
								<div className="relative group">
									<ShieldCheck className="absolute left-3 top-3 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="otp"
										type="text"
										placeholder="• • • • • •"
										value={otp}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, "").slice(0, 6);
											setOtp(value);
										}}
										maxLength={6}
										required
										disabled={loading}
										className="pl-10 h-11 text-center text-xl tracking-[0.5em] font-medium transition-all border-muted focus:border-primary focus:ring-primary/20 placeholder:tracking-normal"
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
								disabled={loading || otp.length !== 6}>
								{loading ? (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Verifying...
									</>
								) : (
									"Verify & Continue"
								)}
							</Button>

							<Button
								type="button"
								variant="ghost"
								className="w-full text-muted-foreground hover:text-foreground"
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
