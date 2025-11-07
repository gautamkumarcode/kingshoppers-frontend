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
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();

	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [redirecting, setRedirecting] = useState(false);

	// Shop/Customer details
	const [shopName, setShopName] = useState("");
	const [ownerName, setOwnerName] = useState("");
	const [shopType, setShopType] = useState("general_store");
	const [gstNumber, setGstNumber] = useState("");

	// Address details
	const [street, setStreet] = useState("");
	const [area, setArea] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [pincode, setPincode] = useState("");
	const [landmark, setLandmark] = useState("");

	// Document upload states
	const [uploadedDocuments, setUploadedDocuments] = useState<{
		gstDocument?: any;
		aadhaarPhoto?: any;
		aadhaarPhotoBack?: any;
		panCardPhoto?: any;
	}>({});

	// Get phone from URL params if coming from login
	useEffect(() => {
		const phoneParam = searchParams.get("phone");
		if (phoneParam) {
			setPhone(decodeURIComponent(phoneParam));
		} else {
			// If no phone parameter, redirect to login
			// This ensures users go through OTP verification first
			setRedirecting(true);
			setError("Please verify your phone number first");
			setTimeout(() => {
				router.push("/auth/login");
			}, 2000);
		}
	}, [searchParams, router]);

	// Handle document uploads
	const handleDocumentUpload = (fileType: string, fileData: any) => {
		setUploadedDocuments((prev) => ({
			...prev,
			[fileType]: fileData,
		}));
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validate required fields
		if (!phone) {
			setError("Phone number is required. Please go back to login.");
			setLoading(false);
			return;
		}

		if (!shopName || !ownerName || !city || !state || !pincode) {
			setError("Please fill in all required fields");
			setLoading(false);
			return;
		}

		// Validate required documents
		if (!uploadedDocuments.aadhaarPhoto) {
			setError("Aadhaar card front photo is required");
			setLoading(false);
			return;
		}

		if (!uploadedDocuments.aadhaarPhotoBack) {
			setError("Aadhaar card back photo is required");
			setLoading(false);
			return;
		}

		if (!uploadedDocuments.panCardPhoto) {
			setError("PAN card photo is required");
			setLoading(false);
			return;
		}

		try {
			const payload = {
				phone,
				shopName,
				ownerName,
				shopType,
				gstNumber,
				shopAddress: {
					street,
					area,
					city,
					state,
					pincode,
					landmark,
				},
				documents: uploadedDocuments,
			};

			const response = await api.post("/auth/register", payload);
			const data = response.data;

			// Registration successful - user is now logged in via cookie
			await login(data.user);

			// Redirect to pending approval or products page
			if (!data.user.isApproved) {
				router.push("/pending-approval");
			} else {
				router.push("/products");
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || "Registration failed. Please try again.";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Show redirecting message if no phone verification
	if (redirecting) {
		return (
			<Card>
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl">
						Phone Verification Required
					</CardTitle>
					<CardDescription>
						Redirecting to login page for phone verification...
					</CardDescription>
				</CardHeader>
				<CardContent className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-sm text-muted-foreground">
						You need to verify your phone number before registration
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl">Create Account</CardTitle>
				<CardDescription>
					Complete your shop registration details
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleRegister} className="space-y-4">
					{/* Phone Number (readonly if from login) */}
					<div className="space-y-2">
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="+91 98765 43210"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							disabled={!!searchParams.get("phone")}
							required
						/>
						{searchParams.get("phone") && (
							<p className="text-xs text-green-600">
								✅ Phone number verified via OTP
							</p>
						)}
					</div>

					{/* Shop Details */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="shopName">Shop Name *</Label>
							<Input
								id="shopName"
								placeholder="Raj General Store"
								value={shopName}
								onChange={(e) => setShopName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ownerName">Owner Name *</Label>
							<Input
								id="ownerName"
								placeholder="Rajesh Kumar"
								value={ownerName}
								onChange={(e) => setOwnerName(e.target.value)}
								required
							/>
						</div>
					</div>

					{/* Shop Type */}
					<div className="space-y-2">
						<Label htmlFor="shopType">Shop Type</Label>
						<Select value={shopType} onValueChange={setShopType}>
							<SelectTrigger>
								<SelectValue placeholder="Select shop type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="general_store">General Store</SelectItem>
								<SelectItem value="kirana">Kirana Store</SelectItem>
								<SelectItem value="supermarket">Supermarket</SelectItem>
								<SelectItem value="medical_store">Medical Store</SelectItem>
								<SelectItem value="stationery">Stationery Shop</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* GST Number (Optional) */}
					<div className="space-y-2">
						<Label htmlFor="gstNumber">GST Number (Optional)</Label>
						<Input
							id="gstNumber"
							placeholder="27XXXXX1234X1Z5"
							value={gstNumber}
							onChange={(e) => setGstNumber(e.target.value)}
						/>
					</div>

					{/* Document Uploads */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">Document Uploads</h3>

						<div className="grid gap-4 md:grid-cols-1">
							<FileUpload
								label="GST Certificate (PDF)"
								accept=".pdf"
								fileType="gstDocument"
								onFileUploaded={(fileData) =>
									handleDocumentUpload("gstDocument", fileData)
								}
								maxSize={5}
								required={false}
							/>

							<FileUpload
								label="Aadhaar Card - Front Side *"
								accept=".jpg,.jpeg,.png"
								fileType="aadhaarPhoto"
								onFileUploaded={(fileData) =>
									handleDocumentUpload("aadhaarPhoto", fileData)
								}
								maxSize={3}
								required={true}
							/>

							<FileUpload
								label="Aadhaar Card - Back Side *"
								accept=".jpg,.jpeg,.png"
								fileType="aadhaarPhotoBack"
								onFileUploaded={(fileData) =>
									handleDocumentUpload("aadhaarPhotoBack", fileData)
								}
								maxSize={3}
								required={true}
							/>

							<FileUpload
								label="PAN Card Photo"
								accept=".jpg,.jpeg,.png"
								fileType="panCardPhoto"
								onFileUploaded={(fileData) =>
									handleDocumentUpload("panCardPhoto", fileData)
								}
								maxSize={3}
								required={true}
							/>
						</div>
					</div>

					{/* Address */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">Shop Address</h3>

						<div className="space-y-2">
							<Label htmlFor="street">Street Address</Label>
							<Input
								id="street"
								placeholder="123 Main Street"
								value={street}
								onChange={(e) => setStreet(e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="area">Area/Locality</Label>
								<Input
									id="area"
									placeholder="Sector 15"
									value={area}
									onChange={(e) => setArea(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="landmark">Landmark</Label>
								<Input
									id="landmark"
									placeholder="Near City Mall"
									value={landmark}
									onChange={(e) => setLandmark(e.target.value)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="city">City *</Label>
								<Input
									id="city"
									placeholder="Mumbai"
									value={city}
									onChange={(e) => setCity(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="state">State *</Label>
								<Input
									id="state"
									placeholder="Maharashtra"
									value={state}
									onChange={(e) => setState(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="pincode">Pincode *</Label>
								<Input
									id="pincode"
									placeholder="400001"
									value={pincode}
									onChange={(e) => setPincode(e.target.value)}
									required
								/>
							</div>
						</div>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Creating Account..." : "Create Account"}
					</Button>
				</form>

				<div className="mt-4 text-center text-sm">
					Already have an account?{" "}
					<Link href="/auth/login" className="text-primary hover:underline">
						Login here
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
