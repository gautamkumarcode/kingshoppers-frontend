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
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const LocationPicker = dynamic(
	() =>
		import("@/components/ui/location-picker").then((mod) => mod.LocationPicker),
	{ ssr: false }
);

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

	// Location details
	const [latitude, setLatitude] = useState<number | null>(null);
	const [longitude, setLongitude] = useState<number | null>(null);
	const [locationLoading, setLocationLoading] = useState(false);
	const [locationError, setLocationError] = useState("");

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

	// Reverse geocode to get address from coordinates
	const reverseGeocode = async (lat: number, lng: number) => {
		try {
			// Using Nominatim (OpenStreetMap) - free, no API key needed
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
				{
					headers: {
						"User-Agent": "KingShoppers-Registration",
					},
				}
			);

			if (!response.ok) throw new Error("Geocoding failed");

			const data = await response.json();
			const address = data.address;

			// Auto-fill address fields
			if (address) {
				if (address.road || address.street) {
					setStreet(address.road || address.street || "");
				}
				if (address.suburb || address.neighbourhood) {
					setArea(address.suburb || address.neighbourhood || "");
				}
				if (address.city || address.town || address.village) {
					setCity(address.city || address.town || address.village || "");
				}
				if (address.state) {
					setState(address.state || "");
				}
				if (address.postcode) {
					setPincode(address.postcode || "");
				}
			}
		} catch (error) {
			console.error("Reverse geocoding error:", error);
			// Don't show error to user, just log it
		}
	};

	// Capture current location
	const handleGetLocation = () => {
		setLocationLoading(true);
		setLocationError("");

		if (!navigator.geolocation) {
			setLocationError("Geolocation is not supported by your browser");
			setLocationLoading(false);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				const accuracy = position.coords.accuracy;

				setLatitude(lat);
				setLongitude(lng);

				// Reverse geocode to get address
				await reverseGeocode(lat, lng);

				setLocationLoading(false);
				setLocationError("");

				// Show accuracy info
				if (accuracy > 100) {
					setLocationError(
						`Location captured but accuracy is low (±${Math.round(
							accuracy
						)}m). For better accuracy, enable GPS and try outdoors.`
					);
				}
			},
			(error) => {
				setLocationLoading(false);
				switch (error.code) {
					case error.PERMISSION_DENIED:
						setLocationError(
							"Location permission denied. Please enable location access."
						);
						break;
					case error.POSITION_UNAVAILABLE:
						setLocationError("Location information unavailable.");
						break;
					case error.TIMEOUT:
						setLocationError("Location request timed out.");
						break;
					default:
						setLocationError("An unknown error occurred.");
				}
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			}
		);
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
					...(latitude &&
						longitude && {
							location: {
								type: "Point",
								coordinates: [longitude, latitude],
							},
						}),
				},
				documents: uploadedDocuments,
			};

			const response = await api.post("/auth/register", payload);
			const data = response.data;

			// Registration successful - user is now logged in via cookie
			await login(data.user, data.token);

			// Check for redirect URL from sessionStorage
			const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
			if (redirectUrl) {
				sessionStorage.removeItem("redirectAfterLogin");
				router.push(redirectUrl);
				return;
			}

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
		<Card className="max-w-4xl mx-auto w-full overflow-hidden">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-3xl">Create Your Account</CardTitle>
				<CardDescription className="text-base">
					Complete your shop registration to start ordering
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleRegister} className="space-y-6">
					{/* Phone Number Section */}
					<div className="bg-gray-50 p-4 rounded-lg border">
						<div className="space-y-2">
							<Label htmlFor="phone" className="text-base font-semibold">
								Phone Number
							</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="+91 98765 43210"
								value={phone}
								onChange={(e) => {
									const value = e.target.value.replace(/\D/g, "").slice(0, 10);
									setPhone(value);
								}}
								disabled={!!searchParams.get("phone")}
								required
								maxLength={10}
								className="bg-white"
							/>
							{searchParams.get("phone") && (
								<p className="text-sm text-green-600 font-medium">
									✅ Phone number verified via OTP
								</p>
							)}
						</div>
					</div>

					{/* Shop Details Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Shop Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
					</div>

					{/* Document Uploads Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Document Uploads
						</h3>
						<p className="text-sm text-gray-600">
							Please upload clear photos of your documents for verification
						</p>

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

					{/* Address Section */}
					<div className="space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
							<h3 className="text-lg font-semibold">Shop Address</h3>
							<div className="flex gap-2">
								<LocationPicker
									latitude={latitude}
									longitude={longitude}
									onLocationSelect={(lat, lng) => {
										setLatitude(lat);
										setLongitude(lng);
										reverseGeocode(lat, lng);
									}}
								/>
							</div>
						</div>

						{locationError && (
							<p className="text-xs text-orange-600">{locationError}</p>
						)}

						{latitude && longitude && (
							<div className="bg-green-50 border border-green-200 rounded-md p-3">
								<p className="text-xs text-green-800 font-medium mb-1">
									✅ Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
								</p>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="street">Street Address</Label>
							<Input
								id="street"
								placeholder="123 Main Street"
								value={street}
								onChange={(e) => setStreet(e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

					{error && (
						<div className="bg-red-50 border border-red-200 rounded-md p-4">
							<p className="text-sm text-red-800">{error}</p>
						</div>
					)}

					<div className="pt-4 border-t">
						<Button
							type="submit"
							className="w-full h-12 text-base"
							disabled={loading}>
							{loading ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
									Creating Account...
								</>
							) : (
								"Create Account"
							)}
						</Button>
					</div>
				</form>

				<div className="mt-6 text-center text-sm border-t pt-4">
					Already have an account?{" "}
					<Link
						href="/auth/login"
						className="text-primary hover:underline font-medium">
						Login here
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
