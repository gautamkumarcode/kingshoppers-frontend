"use client";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { ArrowLeft, Loader2, MapPin, Save, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProfilePage() {
	const { user, refreshUser } = useAuth();
	const router = useRouter();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		shopName: "",
		ownerName: "",
		email: "",
		alternatePhone: "",
		shopType: "general_store",
		gstNumber: "",
		panNumber: "",
		shopAddress: {
			street: "",
			area: "",
			city: "",
			state: "",
			pincode: "",
			landmark: "",
		},
	});

	useEffect(() => {
		if (user) {
			setFormData({
				shopName: user.shopName || "",
				ownerName: user.ownerName || "",
				email: user.email || "",
				alternatePhone: user.alternatePhone || "",
				shopType: user.shopType || "general_store",
				gstNumber: user.gstNumber || "",
				panNumber: user.panNumber || "",
				shopAddress: {
					street: user.shopAddress?.street || "",
					area: user.shopAddress?.area || "",
					city: user.shopAddress?.city || "",
					state: user.shopAddress?.state || "",
					pincode: user.shopAddress?.pincode || "",
					landmark: user.shopAddress?.landmark || "",
				},
			});
		}
	}, [user]);

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleAddressChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			shopAddress: {
				...prev.shopAddress,
				[field]: value,
			},
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (!formData.shopName.trim()) {
			toast({
				title: "Validation Error",
				description: "Shop name is required",
				variant: "destructive",
			});
			return;
		}

		if (!formData.ownerName.trim()) {
			toast({
				title: "Validation Error",
				description: "Owner name is required",
				variant: "destructive",
			});
			return;
		}

		// Validate address if any field is provided
		if (
			formData.shopAddress.street ||
			formData.shopAddress.city ||
			formData.shopAddress.state ||
			formData.shopAddress.pincode
		) {
			if (
				!formData.shopAddress.street ||
				!formData.shopAddress.city ||
				!formData.shopAddress.state ||
				!formData.shopAddress.pincode
			) {
				toast({
					title: "Validation Error",
					description:
						"Please provide complete address (street, city, state, and pincode)",
					variant: "destructive",
				});
				return;
			}
		}

		setLoading(true);

		try {
			const response = await api.put("/profile/me", formData);

			if (response.data.success) {
				toast({
					title: "Success",
					description: "Profile updated successfully",
				});

				// Refresh user data
				await refreshUser();

				// Redirect to profile page
				router.push("/profile");
			}
		} catch (error: any) {
			console.error("Error updating profile:", error);
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to update profile",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6 text-center">
						<p className="text-gray-600 mb-4">Please log in to edit profile</p>
						<Button onClick={() => router.push("/auth/login")}>
							Go to Login
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="max-w-3xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link href="/profile">
						<Button variant="outline" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
						<p className="text-gray-600">
							Update your shop information and address
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Shop Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Store className="w-5 h-5" />
								Shop Information
							</CardTitle>
							<CardDescription>
								Basic information about your shop
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="shopName">
										Shop Name <span className="text-red-500">*</span>
									</Label>
									<Input
										id="shopName"
										value={formData.shopName}
										onChange={(e) => handleChange("shopName", e.target.value)}
										placeholder="Enter shop name"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="ownerName">
										Owner Name <span className="text-red-500">*</span>
									</Label>
									<Input
										id="ownerName"
										value={formData.ownerName}
										onChange={(e) => handleChange("ownerName", e.target.value)}
										placeholder="Enter owner name"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										value={formData.email}
										onChange={(e) => handleChange("email", e.target.value)}
										placeholder="Enter email address"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="alternatePhone">Alternate Phone</Label>
									<Input
										id="alternatePhone"
										value={formData.alternatePhone}
										onChange={(e) =>
											handleChange("alternatePhone", e.target.value)
										}
										placeholder="Enter alternate phone"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="shopType">Shop Type</Label>
									<Select
										value={formData.shopType}
										onValueChange={(value) => handleChange("shopType", value)}>
										<SelectTrigger>
											<SelectValue placeholder="Select shop type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="general_store">
												General Store
											</SelectItem>
											<SelectItem value="kirana">Kirana</SelectItem>
											<SelectItem value="supermarket">Supermarket</SelectItem>
											<SelectItem value="medical_store">
												Medical Store
											</SelectItem>
											<SelectItem value="stationery">Stationery</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="gstNumber">GST Number</Label>
									<Input
										id="gstNumber"
										value={formData.gstNumber}
										onChange={(e) => handleChange("gstNumber", e.target.value)}
										placeholder="Enter GST number"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="panNumber">PAN Number</Label>
									<Input
										id="panNumber"
										value={formData.panNumber}
										onChange={(e) => handleChange("panNumber", e.target.value)}
										placeholder="Enter PAN number"
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Shop Address */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="w-5 h-5" />
								Shop Address
							</CardTitle>
							<CardDescription>
								Your shop's physical location for delivery
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="street">
									Street Address <span className="text-red-500">*</span>
								</Label>
								<Input
									id="street"
									value={formData.shopAddress.street}
									onChange={(e) =>
										handleAddressChange("street", e.target.value)
									}
									placeholder="Enter street address"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="area">Area / Locality</Label>
								<Input
									id="area"
									value={formData.shopAddress.area}
									onChange={(e) => handleAddressChange("area", e.target.value)}
									placeholder="Enter area or locality"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city">
										City <span className="text-red-500">*</span>
									</Label>
									<Input
										id="city"
										value={formData.shopAddress.city}
										onChange={(e) =>
											handleAddressChange("city", e.target.value)
										}
										placeholder="Enter city"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="state">
										State <span className="text-red-500">*</span>
									</Label>
									<Input
										id="state"
										value={formData.shopAddress.state}
										onChange={(e) =>
											handleAddressChange("state", e.target.value)
										}
										placeholder="Enter state"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="pincode">
										Pincode <span className="text-red-500">*</span>
									</Label>
									<Input
										id="pincode"
										value={formData.shopAddress.pincode}
										onChange={(e) =>
											handleAddressChange("pincode", e.target.value)
										}
										placeholder="Enter pincode"
										maxLength={6}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="landmark">Landmark</Label>
									<Input
										id="landmark"
										value={formData.shopAddress.landmark}
										onChange={(e) =>
											handleAddressChange("landmark", e.target.value)
										}
										placeholder="Enter landmark (optional)"
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col sm:flex-row gap-3">
								<Button type="submit" disabled={loading} className="flex-1">
									{loading ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Save className="h-4 w-4 mr-2" />
											Save Changes
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push("/profile")}
									disabled={loading}
									className="flex-1 sm:flex-none">
									Cancel
								</Button>
							</div>
						</CardContent>
					</Card>
				</form>
			</div>
		</div>
	);
}
