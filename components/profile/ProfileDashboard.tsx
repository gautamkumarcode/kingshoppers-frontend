"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
	AlertCircle,
	Award,
	CheckCircle,
	Clock,
	CreditCard,
	MapPin,
	Phone,
	RefreshCw,
	Store,
	User,
	XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import DocumentsTab from "./DocumentsTab";

export default function ProfileDashboard() {
	const { user, logout, refreshUser } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState("profile");

	// Handle tab from URL parameters
	useEffect(() => {
		const tab = searchParams.get("tab");
		if (tab && ["profile", "documents", "business"].includes(tab)) {
			setActiveTab(tab);
		}
	}, [searchParams]);

	const handleRefreshProfile = async () => {
		setRefreshing(true);
		await refreshUser();
		setRefreshing(false);
	};

	const getStatusColor = (approvalStatus: string, isApproved: boolean) => {
		if (approvalStatus === "approved" || isApproved) {
			return "bg-green-100 text-green-800";
		} else if (approvalStatus === "rejected") {
			return "bg-red-100 text-red-800";
		}
		return "bg-yellow-100 text-yellow-800";
	};

	const getStatusIcon = (approvalStatus: string, isApproved: boolean) => {
		if (approvalStatus === "approved" || isApproved) {
			return <CheckCircle className="w-4 h-4" />;
		} else if (approvalStatus === "rejected") {
			return <XCircle className="w-4 h-4" />;
		}
		return <Clock className="w-4 h-4" />;
	};

	const getStatusText = (approvalStatus: string, isApproved: boolean) => {
		if (approvalStatus === "approved" || isApproved) {
			return "Approved";
		} else if (approvalStatus === "rejected") {
			return "Rejected";
		}
		return "Pending Approval";
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6 text-center">
						<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h2 className="text-lg font-semibold mb-2">Not Logged In</h2>
						<p className="text-gray-600 mb-4">
							Please log in to view your profile
						</p>
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
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Profile Dashboard
						</h1>
						<p className="text-gray-600">
							Manage your shop information and settings
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefreshProfile}
							disabled={refreshing}>
							<RefreshCw
								className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
						<Button variant="outline" size="sm" onClick={logout}>
							Logout
						</Button>
					</div>
				</div>

				{/* Verification Status Card */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									{getStatusIcon(user.approvalStatus, user.isApproved)}
									Account Status
								</CardTitle>
								<CardDescription>
									Your account verification status
								</CardDescription>
							</div>
							<Badge
								className={getStatusColor(
									user.approvalStatus,
									user.isApproved
								)}>
								{getStatusText(user.approvalStatus, user.isApproved)}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						{user.approvalStatus === "approved" || user.isApproved ? (
							<div className="flex items-center gap-2 text-green-700">
								<CheckCircle className="w-5 h-5" />
								<span>
									Your account is approved and active. You can start placing
									orders!
								</span>
							</div>
						) : user.approvalStatus === "rejected" ? (
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-red-700">
									<XCircle className="w-5 h-5" />
									<span>Your account registration has been rejected.</span>
								</div>
								{user.rejectionReason && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-3">
										<h4 className="font-medium text-red-900 mb-1">
											Rejection Reason
										</h4>
										<p className="text-sm text-red-800">
											{user.rejectionReason}
										</p>
									</div>
								)}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
									<h4 className="font-medium text-blue-900 mb-1">
										What you can do?
									</h4>
									<ul className="text-sm text-blue-800 space-y-1">
										<li>• Review the rejection reason above</li>
										<li>• Contact our support team for clarification</li>
										<li>
											• You may need to register again with correct documents
										</li>
									</ul>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-yellow-700">
									<Clock className="w-5 h-5" />
									<span>
										Your account is under review. This typically takes 24-48
										hours.
									</span>
								</div>
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
									<h4 className="font-medium text-blue-900 mb-1">
										What's next?
									</h4>
									<ul className="text-sm text-blue-800 space-y-1">
										<li>• Our team will verify your shop details</li>
										<li>• You may receive a verification call</li>
										<li>• You'll be notified once approved</li>
									</ul>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Tabbed Content */}
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="documents">Documents</TabsTrigger>
						<TabsTrigger value="business">Business</TabsTrigger>
					</TabsList>

					<TabsContent value="profile" className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Shop Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Store className="w-5 h-5" />
										Shop Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-500">
											Shop Name
										</label>
										<p className="text-lg font-semibold">
											{user.shopName || "Not provided"}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">
											Owner Name
										</label>
										<p className="font-medium">
											{user.ownerName || "Not provided"}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">
											Shop Type
										</label>
										<p className="font-medium capitalize">
											{user.shopType?.replace("_", " ") || "Not specified"}
										</p>
									</div>
									{user.gstNumber && (
										<div>
											<label className="text-sm font-medium text-gray-500">
												GST Number
											</label>
											<p className="font-medium font-mono">{user.gstNumber}</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Contact Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Phone className="w-5 h-5" />
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-500">
											Phone Number
										</label>
										<p className="font-medium">{user.phone}</p>
										<Badge variant="outline" className="mt-1">
											<CheckCircle className="w-3 h-3 mr-1" />
											Verified
										</Badge>
									</div>
									{user.email && (
										<div>
											<label className="text-sm font-medium text-gray-500">
												Email
											</label>
											<p className="font-medium">{user.email}</p>
										</div>
									)}
									{user.shopAddress && (
										<div>
											<label className="text-sm font-medium text-gray-500">
												Shop Address
											</label>
											<div className="flex items-start gap-2 mt-1">
												<MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
												<div className="text-sm">
													{user.shopAddress.street && (
														<p>{user.shopAddress.street}</p>
													)}
													{user.shopAddress.area && (
														<p>{user.shopAddress.area}</p>
													)}
													<p>
														{user.shopAddress.city}, {user.shopAddress.state} -{" "}
														{user.shopAddress.pincode}
													</p>
													{user.shopAddress.landmark && (
														<p className="text-gray-600">
															Near {user.shopAddress.landmark}
														</p>
													)}
												</div>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="documents">
						<DocumentsTab />
					</TabsContent>

					<TabsContent value="business" className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Business Details */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Award className="w-5 h-5" />
										Business Details
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-500">
											Customer Tier
										</label>
										<Badge variant="secondary" className="mt-1">
											{user.customerTier?.toUpperCase() || "BRONZE"}
										</Badge>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">
											Member Since
										</label>
										<p className="font-medium">
											{user.customerSince
												? new Date(user.customerSince).toLocaleDateString()
												: "Recently joined"}
										</p>
									</div>
									{user.totalOrderValue && (
										<div>
											<label className="text-sm font-medium text-gray-500">
												Total Order Value
											</label>
											<p className="font-medium">
												₹{user.totalOrderValue.toLocaleString()}
											</p>
										</div>
									)}
									{user.totalOrders && (
										<div>
											<label className="text-sm font-medium text-gray-500">
												Total Orders
											</label>
											<p className="font-medium">{user.totalOrders}</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Credit Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CreditCard className="w-5 h-5" />
										Credit Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-500">
											Credit Limit
										</label>
										<p className="text-lg font-semibold">
											₹{user.creditLimit?.toLocaleString() || "0"}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">
											Available Credit
										</label>
										<p className="font-medium text-green-600">
											₹{user.availableCredit?.toLocaleString() || "0"}
										</p>
									</div>
									{user.creditUsed !== undefined && (
										<div>
											<label className="text-sm font-medium text-gray-500">
												Credit Used
											</label>
											<p className="font-medium text-orange-600">
												₹{user.creditUsed.toLocaleString()}
											</p>
										</div>
									)}
									<div>
										<label className="text-sm font-medium text-gray-500">
											Payment Terms
										</label>
										<p className="font-medium capitalize">
											{user.paymentTerms?.replace("net", "Net ") || "Cash"}
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				{/* Action Buttons */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-wrap gap-3">
							{user.approvalStatus === "approved" || user.isApproved ? (
								<>
									<Button onClick={() => router.push("/products")}>
										Browse Products
									</Button>
									<Button
										variant="outline"
										onClick={() => router.push("/my-orders")}>
										My Orders
									</Button>
									<Button
										variant="outline"
										onClick={() => router.push("/profile/edit")}>
										Edit Profile
									</Button>
								</>
							) : user.approvalStatus === "rejected" ? (
								<>
									<Button variant="outline" disabled>
										Products (Account Rejected)
									</Button>
									<Button
										variant="default"
										onClick={() =>
											(window.location.href = "tel:+919876543210")
										}>
										<Phone className="w-4 h-4 mr-2" />
										Contact Support
									</Button>
								</>
							) : (
								<>
									<Button variant="outline" disabled>
										Products (Available after approval)
									</Button>
									<Button
										variant="outline"
										onClick={() => router.push("/profile/edit")}>
										Edit Profile
									</Button>
								</>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Support Information */}
				<Card>
					<CardHeader>
						<CardTitle>Need Help?</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600 mb-3">
							If you have any questions or need assistance, feel free to contact
							us:
						</p>
						<div className="flex flex-wrap gap-4 text-sm">
							<a
								href="tel:+919876543210"
								className="flex items-center gap-2 text-blue-600 hover:underline">
								<Phone className="w-4 h-4" />
								+91 98765 43210
							</a>
							<a
								href="mailto:support@kingshoppers.com"
								className="flex items-center gap-2 text-blue-600 hover:underline">
								<User className="w-4 h-4" />
								support@kingshoppers.com
							</a>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
