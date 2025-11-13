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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
	Bell,
	Building2,
	CreditCard,
	FileText,
	Loader2,
	MapPin,
	RefreshCw,
	Save,
	Truck,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Address {
	street: string;
	city: string;
	state: string;
	pincode: string;
	country: string;
}

interface BankDetails {
	accountNumber: string;
	ifscCode: string;
	bankName: string;
	accountHolderName: string;
	upiId: string;
}

interface DeliverySettings {
	freeDeliveryAbove: number;
	deliveryCharges: number;
	deliveryRadius: number;
	deliveryDays: string[];
}

interface TierSetting {
	minOrderValue: number;
	discountPercentage: number;
	creditLimit: number;
}

interface TierSettings {
	bronze: TierSetting;
	silver: TierSetting;
	gold: TierSetting;
	platinum: TierSetting;
}

interface BusinessHour {
	open: string;
	close: string;
	isOpen: boolean;
}

interface BusinessHours {
	monday: BusinessHour;
	tuesday: BusinessHour;
	wednesday: BusinessHour;
	thursday: BusinessHour;
	friday: BusinessHour;
	saturday: BusinessHour;
	sunday: BusinessHour;
}

interface Notifications {
	lowStock: boolean;
	newOrders: boolean;
	paymentReceived: boolean;
	overduePayments: boolean;
}

interface BusinessSettings {
	businessName: string;
	ownerName: string;
	phone: string;
	email: string;
	website: string;
	address: Address;
	gstNumber: string;
	panNumber: string;
	tradeLicense: string;
	fssaiLicense: string;
	logo?: string;
	favicon?: string;
	bankDetails: BankDetails;
	defaultCreditTerms: string;
	defaultCreditLimit: number;
	minimumOrderValue: number;
	defaultGSTRate: number;
	lowStockAlertLevel: number;
	autoReorderEnabled: boolean;
	deliverySettings: DeliverySettings;
	tierSettings: TierSettings;
	businessHours: BusinessHours;
	notifications: Notifications;
	termsAndConditions: string;
	privacyPolicy: string;
	returnPolicy: string;
}

const defaultBusinessHour: BusinessHour = {
	open: "09:00",
	close: "18:00",
	isOpen: true,
};

const defaultSettings: BusinessSettings = {
	businessName: "",
	ownerName: "",
	phone: "",
	email: "",
	website: "",
	address: {
		street: "",
		city: "",
		state: "",
		pincode: "",
		country: "India",
	},
	gstNumber: "",
	panNumber: "",
	tradeLicense: "",
	fssaiLicense: "",
	logo: "",
	favicon: "",
	bankDetails: {
		accountNumber: "",
		ifscCode: "",
		bankName: "",
		accountHolderName: "",
		upiId: "",
	},
	defaultCreditTerms: "cash",
	defaultCreditLimit: 50000,
	minimumOrderValue: 1000,
	defaultGSTRate: 18,
	lowStockAlertLevel: 10,
	autoReorderEnabled: false,
	deliverySettings: {
		freeDeliveryAbove: 5000,
		deliveryCharges: 100,
		deliveryRadius: 50,
		deliveryDays: [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
		],
	},
	tierSettings: {
		bronze: { minOrderValue: 0, discountPercentage: 0, creditLimit: 25000 },
		silver: {
			minOrderValue: 200000,
			discountPercentage: 5,
			creditLimit: 75000,
		},
		gold: {
			minOrderValue: 500000,
			discountPercentage: 10,
			creditLimit: 150000,
		},
		platinum: {
			minOrderValue: 1000000,
			discountPercentage: 15,
			creditLimit: 300000,
		},
	},
	businessHours: {
		monday: { ...defaultBusinessHour },
		tuesday: { ...defaultBusinessHour },
		wednesday: { ...defaultBusinessHour },
		thursday: { ...defaultBusinessHour },
		friday: { ...defaultBusinessHour },
		saturday: { ...defaultBusinessHour, close: "14:00" },
		sunday: { open: "", close: "", isOpen: false },
	},
	notifications: {
		lowStock: true,
		newOrders: true,
		paymentReceived: true,
		overduePayments: true,
	},
	termsAndConditions: "",
	privacyPolicy: "",
	returnPolicy: "",
};

export default function BusinessSettingsPage() {
	const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [uploadingLogo, setUploadingLogo] = useState(false);
	const [uploadingFavicon, setUploadingFavicon] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			setLoading(true);
			const response = await api.get("/business-settings");
			if (response.data.success) {
				setSettings({ ...defaultSettings, ...response.data.data });
			}
		} catch (error: any) {
			console.error("Error fetching settings:", error);
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to fetch business settings",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			const response = await api.put("/business-settings", settings);
			if (response.data.success) {
				toast({
					title: "Success",
					description: "Business settings updated successfully",
				});
			}
		} catch (error: any) {
			console.error("Error saving settings:", error);
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to save business settings",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleReset = async () => {
		if (
			!confirm(
				"Are you sure you want to reset all settings to default? This action cannot be undone."
			)
		) {
			return;
		}
		try {
			setSaving(true);
			const response = await api.post("/business-settings/reset");
			if (response.data.success) {
				setSettings({ ...defaultSettings, ...response.data.data });
				toast({
					title: "Success",
					description: "Settings reset to defaults successfully",
				});
			}
		} catch (error: any) {
			console.error("Error resetting settings:", error);
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to reset settings",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const updateField = (field: keyof BusinessSettings, value: any) => {
		setSettings((prev) => ({ ...prev, [field]: value }));
	};

	const updateNestedField = (
		parent: keyof BusinessSettings,
		field: string,
		value: any
	) => {
		setSettings((prev) => ({
			...prev,
			[parent]: {
				...(prev[parent] as any),
				[field]: value,
			},
		}));
	};

	const updateDeepNestedField = (
		parent: keyof BusinessSettings,
		subParent: string,
		field: string,
		value: any
	) => {
		setSettings((prev) => ({
			...prev,
			[parent]: {
				...(prev[parent] as any),
				[subParent]: {
					...((prev[parent] as any)[subParent] as any),
					[field]: value,
				},
			},
		}));
	};

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast({
				title: "Invalid File",
				description: "Please upload an image file",
				variant: "destructive",
			});
			return;
		}

		// Validate file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			toast({
				title: "File Too Large",
				description: "Logo must be less than 2MB",
				variant: "destructive",
			});
			return;
		}

		try {
			setUploadingLogo(true);
			const formData = new FormData();
			formData.append("logo", file);

			const response = await api.post("/upload/logo", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data.logo?.url) {
				updateField("logo", response.data.logo.url);
				toast({
					title: "Success",
					description: "Logo uploaded successfully",
				});
			}
		} catch (error: any) {
			console.error("Logo upload error:", error);
			toast({
				title: "Upload Failed",
				description: error.response?.data?.message || "Failed to upload logo",
				variant: "destructive",
			});
		} finally {
			setUploadingLogo(false);
		}
	};

	const handleFaviconUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast({
				title: "Invalid File",
				description: "Please upload an image file",
				variant: "destructive",
			});
			return;
		}

		// Validate file size (max 1MB)
		if (file.size > 1024 * 1024) {
			toast({
				title: "File Too Large",
				description: "Favicon must be less than 1MB",
				variant: "destructive",
			});
			return;
		}

		try {
			setUploadingFavicon(true);
			const formData = new FormData();
			formData.append("favicon", file);

			const response = await api.post("/upload/favicon", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data.favicon?.url) {
				updateField("favicon", response.data.favicon.url);
				toast({
					title: "Success",
					description: "Favicon uploaded successfully",
				});
			}
		} catch (error: any) {
			console.error("Favicon upload error:", error);
			toast({
				title: "Upload Failed",
				description:
					error.response?.data?.message || "Failed to upload favicon",
				variant: "destructive",
			});
		} finally {
			setUploadingFavicon(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="w-8 h-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-4 md:space-y-6 ">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold">Business Settings</h1>
					<p className="text-sm md:text-base text-muted-foreground">
						Manage your business information and configuration
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={handleReset}
						disabled={saving}
						className="w-full sm:w-auto">
						<RefreshCw className="w-4 h-4 mr-2" />
						<span className="hidden sm:inline">Reset to</span> Default
					</Button>
					<Button
						onClick={handleSave}
						disabled={saving}
						className="w-full sm:w-auto">
						{saving ? (
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<Save className="w-4 h-4 mr-2" />
						)}
						Save Changes
					</Button>
				</div>
			</div>

			<Tabs defaultValue="basic" className="space-y-4">
				<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto gap-1">
					<TabsTrigger
						value="basic"
						className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
						<Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
						<span className="hidden sm:inline">Basic Info</span>
						<span className="sm:hidden">Basic</span>
					</TabsTrigger>
					<TabsTrigger
						value="address"
						className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
						<MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
						<span>Address</span>
					</TabsTrigger>
					<TabsTrigger
						value="legal"
						className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
						<FileText className="w-3 h-3 sm:w-4 sm:h-4" />
						<span>Legal</span>
					</TabsTrigger>
					<TabsTrigger
						value="banking"
						className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
						<CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
						<span>Banking</span>
					</TabsTrigger>
					<TabsTrigger
						value="delivery"
						className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
						<Truck className="w-3 h-3 sm:w-4 sm:h-4" />
						<span>Delivery</span>
					</TabsTrigger>
					<TabsTrigger
						value="tiers"
						className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
						<Users className="w-3 h-3 sm:w-4 sm:h-4" />
						<span className="hidden lg:inline">Customer Tiers</span>
						<span className="lg:hidden">Tiers</span>
					</TabsTrigger>
					<TabsTrigger
						value="advanced"
						className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
						<Bell className="w-3 h-3 sm:w-4 sm:h-4" />
						<span>Advanced</span>
					</TabsTrigger>
				</TabsList>

				{/* Basic Information Tab */}
				<TabsContent value="basic" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>
								Your business contact and identification details
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="businessName">Business Name *</Label>
									<Input
										id="businessName"
										value={settings.businessName}
										onChange={(e) =>
											updateField("businessName", e.target.value)
										}
										placeholder="King Shoppers Wholesale"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="ownerName">Owner Name</Label>
									<Input
										id="ownerName"
										value={settings.ownerName}
										onChange={(e) => updateField("ownerName", e.target.value)}
										placeholder="John Doe"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number *</Label>
									<Input
										id="phone"
										value={settings.phone}
										onChange={(e) => updateField("phone", e.target.value)}
										placeholder="+91 98765 43210"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email Address *</Label>
									<Input
										id="email"
										type="email"
										value={settings.email}
										onChange={(e) => updateField("email", e.target.value)}
										placeholder="info@kingshoppers.com"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="website">Website</Label>
								<Input
									id="website"
									value={settings.website}
									onChange={(e) => updateField("website", e.target.value)}
									placeholder="https://kingshoppers.com"
								/>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="logo">Business Logo</Label>
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
										<div className="flex-1 w-full">
											<Input
												id="logo"
												type="file"
												accept="image/*"
												onChange={handleLogoUpload}
												disabled={uploadingLogo}
											/>
											<p className="text-xs text-muted-foreground mt-1">
												PNG, JPG or WEBP (max 2MB)
											</p>
										</div>
										{settings.logo && (
											<div className="w-20 h-20 border rounded-lg overflow-hidden shrink-0">
												<img
													src={settings.logo}
													alt="Business Logo"
													className="w-full h-full object-contain"
												/>
											</div>
										)}
									</div>
									{uploadingLogo && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Loader2 className="w-4 h-4 animate-spin" />
											Uploading logo...
										</div>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="favicon">Favicon</Label>
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
										<div className="flex-1 w-full">
											<Input
												id="favicon"
												type="file"
												accept="image/*"
												onChange={handleFaviconUpload}
												disabled={uploadingFavicon}
											/>
											<p className="text-xs text-muted-foreground mt-1">
												ICO, PNG (max 1MB, preferably 32x32px)
											</p>
										</div>
										{settings.favicon && (
											<div className="w-12 h-12 border rounded-lg overflow-hidden shrink-0">
												<img
													src={settings.favicon}
													alt="Favicon"
													className="w-full h-full object-contain"
												/>
											</div>
										)}
									</div>
									{uploadingFavicon && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Loader2 className="w-4 h-4 animate-spin" />
											Uploading favicon...
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Address Tab */}
				<TabsContent value="address" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Business Address</CardTitle>
							<CardDescription>
								Physical location of your business
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="street">Street Address *</Label>
								<Input
									id="street"
									value={settings.address.street}
									onChange={(e) =>
										updateNestedField("address", "street", e.target.value)
									}
									placeholder="123, Wholesale Market, Commercial Street"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city">City *</Label>
									<Input
										id="city"
										value={settings.address.city}
										onChange={(e) =>
											updateNestedField("address", "city", e.target.value)
										}
										placeholder="Mumbai"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="state">State *</Label>
									<Input
										id="state"
										value={settings.address.state}
										onChange={(e) =>
											updateNestedField("address", "state", e.target.value)
										}
										placeholder="Maharashtra"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="pincode">Pincode *</Label>
									<Input
										id="pincode"
										value={settings.address.pincode}
										onChange={(e) =>
											updateNestedField("address", "pincode", e.target.value)
										}
										placeholder="400001"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="country">Country *</Label>
									<Input
										id="country"
										value={settings.address.country}
										onChange={(e) =>
											updateNestedField("address", "country", e.target.value)
										}
										placeholder="India"
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Legal Information Tab */}
				<TabsContent value="legal" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Legal Information</CardTitle>
							<CardDescription>Tax and license details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="gstNumber">GST Number *</Label>
									<Input
										id="gstNumber"
										value={settings.gstNumber}
										onChange={(e) => updateField("gstNumber", e.target.value)}
										placeholder="27XXXXX1234X1ZX"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="panNumber">PAN Number</Label>
									<Input
										id="panNumber"
										value={settings.panNumber}
										onChange={(e) => updateField("panNumber", e.target.value)}
										placeholder="ABCDE1234F"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="tradeLicense">Trade License</Label>
									<Input
										id="tradeLicense"
										value={settings.tradeLicense}
										onChange={(e) =>
											updateField("tradeLicense", e.target.value)
										}
										placeholder="TL123456"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="fssaiLicense">
										FSSAI License (Food Products)
									</Label>
									<Input
										id="fssaiLicense"
										value={settings.fssaiLicense}
										onChange={(e) =>
											updateField("fssaiLicense", e.target.value)
										}
										placeholder="12345678901234"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="defaultGSTRate">Default GST Rate (%)</Label>
									<Input
										id="defaultGSTRate"
										type="number"
										value={settings.defaultGSTRate}
										onChange={(e) =>
											updateField("defaultGSTRate", parseFloat(e.target.value))
										}
										placeholder="18"
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Banking Tab */}
				<TabsContent value="banking" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Banking Details</CardTitle>
							<CardDescription>
								Bank account information for payments
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="accountNumber">Account Number</Label>
									<Input
										id="accountNumber"
										value={settings.bankDetails.accountNumber}
										onChange={(e) =>
											updateNestedField(
												"bankDetails",
												"accountNumber",
												e.target.value
											)
										}
										placeholder="1234567890"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="ifscCode">IFSC Code</Label>
									<Input
										id="ifscCode"
										value={settings.bankDetails.ifscCode}
										onChange={(e) =>
											updateNestedField(
												"bankDetails",
												"ifscCode",
												e.target.value
											)
										}
										placeholder="SBIN0001234"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="bankName">Bank Name</Label>
									<Input
										id="bankName"
										value={settings.bankDetails.bankName}
										onChange={(e) =>
											updateNestedField(
												"bankDetails",
												"bankName",
												e.target.value
											)
										}
										placeholder="State Bank of India"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="accountHolderName">Account Holder Name</Label>
									<Input
										id="accountHolderName"
										value={settings.bankDetails.accountHolderName}
										onChange={(e) =>
											updateNestedField(
												"bankDetails",
												"accountHolderName",
												e.target.value
											)
										}
										placeholder="King Shoppers Wholesale"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="upiId">UPI ID</Label>
								<Input
									id="upiId"
									value={settings.bankDetails.upiId}
									onChange={(e) =>
										updateNestedField("bankDetails", "upiId", e.target.value)
									}
									placeholder="kingshoppers@upi"
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Delivery Settings Tab */}
				<TabsContent value="delivery" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Delivery Configuration</CardTitle>
							<CardDescription>
								Manage delivery charges and settings
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="deliveryCharges">Delivery Charges (₹)</Label>
									<Input
										id="deliveryCharges"
										type="number"
										value={settings.deliverySettings.deliveryCharges}
										onChange={(e) =>
											updateNestedField(
												"deliverySettings",
												"deliveryCharges",
												parseFloat(e.target.value)
											)
										}
										placeholder="100"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="freeDeliveryAbove">
										Free Delivery Above (₹)
									</Label>
									<Input
										id="freeDeliveryAbove"
										type="number"
										value={settings.deliverySettings.freeDeliveryAbove}
										onChange={(e) =>
											updateNestedField(
												"deliverySettings",
												"freeDeliveryAbove",
												parseFloat(e.target.value)
											)
										}
										placeholder="5000"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
									<Input
										id="deliveryRadius"
										type="number"
										value={settings.deliverySettings.deliveryRadius}
										onChange={(e) =>
											updateNestedField(
												"deliverySettings",
												"deliveryRadius",
												parseFloat(e.target.value)
											)
										}
										placeholder="50"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Delivery Days</Label>
								<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
									{[
										"monday",
										"tuesday",
										"wednesday",
										"thursday",
										"friday",
										"saturday",
										"sunday",
									].map((day) => (
										<div key={day} className="flex items-center space-x-2">
											<Switch
												id={`delivery-${day}`}
												checked={settings.deliverySettings.deliveryDays.includes(
													day
												)}
												onCheckedChange={(checked) => {
													const days = checked
														? [...settings.deliverySettings.deliveryDays, day]
														: settings.deliverySettings.deliveryDays.filter(
																(d) => d !== day
														  );
													updateNestedField(
														"deliverySettings",
														"deliveryDays",
														days
													);
												}}
											/>
											<Label
												htmlFor={`delivery-${day}`}
												className="capitalize text-xs">
												{day.slice(0, 3)}
											</Label>
										</div>
									))}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="minimumOrderValue">
										Minimum Order Value (₹)
									</Label>
									<Input
										id="minimumOrderValue"
										type="number"
										value={settings.minimumOrderValue}
										onChange={(e) =>
											updateField(
												"minimumOrderValue",
												parseFloat(e.target.value)
											)
										}
										placeholder="1000"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="defaultCreditLimit">
										Default Credit Limit (₹)
									</Label>
									<Input
										id="defaultCreditLimit"
										type="number"
										value={settings.defaultCreditLimit}
										onChange={(e) =>
											updateField(
												"defaultCreditLimit",
												parseFloat(e.target.value)
											)
										}
										placeholder="50000"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="defaultCreditTerms">Default Credit Terms</Label>
								<Select
									value={settings.defaultCreditTerms}
									onValueChange={(value) =>
										updateField("defaultCreditTerms", value)
									}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="cash">Cash</SelectItem>
										<SelectItem value="net7">Net 7 Days</SelectItem>
										<SelectItem value="net15">Net 15 Days</SelectItem>
										<SelectItem value="net30">Net 30 Days</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Customer Tiers Tab */}
				<TabsContent value="tiers" className="space-y-4">
					{(["bronze", "silver", "gold", "platinum"] as const).map((tier) => (
						<Card key={tier}>
							<CardHeader>
								<CardTitle className="capitalize">{tier} Tier</CardTitle>
								<CardDescription>
									Configuration for {tier} tier customers
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor={`${tier}-minOrder`}>
											Min Order Value (₹)
										</Label>
										<Input
											id={`${tier}-minOrder`}
											type="number"
											value={settings.tierSettings[tier].minOrderValue}
											onChange={(e) =>
												updateDeepNestedField(
													"tierSettings",
													tier,
													"minOrderValue",
													parseFloat(e.target.value)
												)
											}
											placeholder="0"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor={`${tier}-discount`}>Discount (%)</Label>
										<Input
											id={`${tier}-discount`}
											type="number"
											value={settings.tierSettings[tier].discountPercentage}
											onChange={(e) =>
												updateDeepNestedField(
													"tierSettings",
													tier,
													"discountPercentage",
													parseFloat(e.target.value)
												)
											}
											placeholder="0"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor={`${tier}-credit`}>Credit Limit (₹)</Label>
										<Input
											id={`${tier}-credit`}
											type="number"
											value={settings.tierSettings[tier].creditLimit}
											onChange={(e) =>
												updateDeepNestedField(
													"tierSettings",
													tier,
													"creditLimit",
													parseFloat(e.target.value)
												)
											}
											placeholder="25000"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</TabsContent>

				{/* Advanced Settings Tab */}
				<TabsContent value="advanced" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Notifications</CardTitle>
							<CardDescription>Configure system notifications</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="lowStock">Low Stock Alerts</Label>
									<p className="text-sm text-muted-foreground">
										Get notified when products are running low
									</p>
								</div>
								<Switch
									id="lowStock"
									checked={settings.notifications.lowStock}
									onCheckedChange={(checked) =>
										updateNestedField("notifications", "lowStock", checked)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="newOrders">New Orders</Label>
									<p className="text-sm text-muted-foreground">
										Get notified for new orders
									</p>
								</div>
								<Switch
									id="newOrders"
									checked={settings.notifications.newOrders}
									onCheckedChange={(checked) =>
										updateNestedField("notifications", "newOrders", checked)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="paymentReceived">Payment Received</Label>
									<p className="text-sm text-muted-foreground">
										Get notified when payments are received
									</p>
								</div>
								<Switch
									id="paymentReceived"
									checked={settings.notifications.paymentReceived}
									onCheckedChange={(checked) =>
										updateNestedField(
											"notifications",
											"paymentReceived",
											checked
										)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="overduePayments">Overdue Payments</Label>
									<p className="text-sm text-muted-foreground">
										Get notified for overdue payments
									</p>
								</div>
								<Switch
									id="overduePayments"
									checked={settings.notifications.overduePayments}
									onCheckedChange={(checked) =>
										updateNestedField(
											"notifications",
											"overduePayments",
											checked
										)
									}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Inventory Settings</CardTitle>
							<CardDescription>Configure inventory management</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="lowStockAlertLevel">
										Low Stock Alert Level
									</Label>
									<Input
										id="lowStockAlertLevel"
										type="number"
										value={settings.lowStockAlertLevel}
										onChange={(e) =>
											updateField(
												"lowStockAlertLevel",
												parseInt(e.target.value)
											)
										}
										placeholder="10"
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="autoReorder">Auto Reorder</Label>
										<p className="text-sm text-muted-foreground">
											Automatically create purchase orders
										</p>
									</div>
									<Switch
										id="autoReorder"
										checked={settings.autoReorderEnabled}
										onCheckedChange={(checked) =>
											updateField("autoReorderEnabled", checked)
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Policies</CardTitle>
							<CardDescription>
								Terms, privacy, and return policies
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="termsAndConditions">Terms and Conditions</Label>
								<Textarea
									id="termsAndConditions"
									value={settings.termsAndConditions}
									onChange={(e) =>
										updateField("termsAndConditions", e.target.value)
									}
									placeholder="Enter your terms and conditions..."
									rows={4}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="privacyPolicy">Privacy Policy</Label>
								<Textarea
									id="privacyPolicy"
									value={settings.privacyPolicy}
									onChange={(e) => updateField("privacyPolicy", e.target.value)}
									placeholder="Enter your privacy policy..."
									rows={4}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="returnPolicy">Return Policy</Label>
								<Textarea
									id="returnPolicy"
									value={settings.returnPolicy}
									onChange={(e) => updateField("returnPolicy", e.target.value)}
									placeholder="Enter your return policy..."
									rows={4}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
				<Button
					variant="outline"
					onClick={handleReset}
					disabled={saving}
					className="w-full sm:w-auto">
					<RefreshCw className="w-4 h-4 mr-2" />
					Reset to Default
				</Button>
				<Button
					onClick={handleSave}
					disabled={saving}
					size="lg"
					className="w-full sm:w-auto">
					{saving ? (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					) : (
						<Save className="w-4 h-4 mr-2" />
					)}
					Save All Changes
				</Button>
			</div>
		</div>
	);
}
