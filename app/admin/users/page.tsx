"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { apiCall } from "@/lib/auth";
import { UserListResponse } from "@/types/admin-types/user";
import {
	Building2,
	Calendar,
	CheckCircle,
	ExternalLink,
	Eye,
	FileText,
	Mail,
	MapPin,
	Phone,
	Search,
	X,
	XCircle,
	ZoomIn,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersPage() {
	const { toast } = useToast();
	const [users, setUsers] = useState<UserListResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [selectedUser, setSelectedUser] = useState<UserListResponse | null>(
		null
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isApproving, setIsApproving] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const [zoomedImage, setZoomedImage] = useState<string | null>(null);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && zoomedImage) {
				setZoomedImage(null);
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [zoomedImage]);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const response = await api.get("/admin/users");
			console.log(response.data);
			setUsers(response.data.data);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleApproveUser = async (userId: string) => {
		setIsApproving(true);
		try {
			const response = await apiCall(`/admin/users/${userId}/approve`, {
				method: "PUT",
			});

			if (!response.ok) {
				throw new Error("Failed to approve user");
			}

			toast({
				title: "Success",
				description: "User approved successfully",
			});

			setIsDialogOpen(false);
			setSelectedUser(null);
			fetchUsers();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to approve user",
				variant: "destructive",
			});
		} finally {
			setIsApproving(false);
		}
	};

	const handleViewUserDetails = (user: UserListResponse) => {
		setSelectedUser(user);
		setIsDialogOpen(true);
	};

	const handleRejectUser = async (userId: string) => {
		setIsRejecting(true);
		try {
			const response = await apiCall(`/admin/users/${userId}/reject`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					rejectionReason:
						"Documents verification failed or incomplete information",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to reject user");
			}

			toast({
				title: "Success",
				description: "User rejected successfully",
			});

			setIsDialogOpen(false);
			setSelectedUser(null);
			fetchUsers();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to reject user",
				variant: "destructive",
			});
		} finally {
			setIsRejecting(false);
		}
	};

	const handleOpenInNewTab = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const handleZoomImage = (url: string) => {
		setZoomedImage(url);
	};

	const isImageFile = (url: string) => {
		const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
		return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
	};

	const isPdfFile = (url: string) => {
		return url.toLowerCase().endsWith(".pdf");
	};

	const renderDocument = (url: string, title: string) => {
		const isPdf = isPdfFile(url);
		const isImage = isImageFile(url);

		return (
			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<p className="text-sm font-medium">{title}</p>
					<div className="flex gap-2">
						{isImage && (
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleZoomImage(url)}
								className="h-8 px-2">
								<ZoomIn className="w-4 h-4 mr-1" />
								Zoom
							</Button>
						)}
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleOpenInNewTab(url)}
							className="h-8 px-2">
							<ExternalLink className="w-4 h-4 mr-1" />
							{isPdf ? "View PDF" : "Open"}
						</Button>
					</div>
				</div>
				{isImage ? (
					<img
						src={url}
						alt={title}
						className="max-h-48 w-full object-contain border rounded cursor-pointer hover:opacity-80 transition-opacity"
						onClick={() => handleZoomImage(url)}
					/>
				) : isPdf ? (
					<div
						className="flex items-center justify-center h-48 border rounded bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
						onClick={() => handleOpenInNewTab(url)}>
						<div className="text-center">
							<FileText className="w-12 h-12 mx-auto mb-2 text-red-500" />
							<p className="text-sm font-medium">PDF Document</p>
							<p className="text-xs text-muted-foreground">Click to view</p>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-center h-48 border rounded bg-gray-50">
						<div className="text-center">
							<FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
							<p className="text-sm text-muted-foreground">Document</p>
						</div>
					</div>
				)}
			</div>
		);
	};

	const filteredUsers = users.filter(
		(user) =>
			user.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
			user.phone?.includes(search) ||
			user.email?.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Users Management</h1>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
				<Input
					placeholder="Search by name, phone, or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Users ({filteredUsers.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-muted-foreground">Loading users...</p>
					) : filteredUsers.length === 0 ? (
						<p className="text-muted-foreground">No users found</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="border-b border-border">
									<tr>
										<th className="text-left py-3 px-4">Name</th>
										<th className="text-left py-3 px-4">Phone</th>
										<th className="text-left py-3 px-4">Type</th>
										<th className="text-left py-3 px-4">Shop name</th>
										<th className="text-left py-3 px-4">Status</th>
										<th className="text-left py-3 px-4">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredUsers.map((user) => (
										<tr
											key={user._id}
											className="border-b border-border hover:bg-accent/50">
											<td className="py-3 px-4">
												<div>
													<p className="font-semibold">{user.ownerName}</p>
													<p className="text-xs text-muted-foreground">
														{user.email}
													</p>
												</div>
											</td>
											<td className="py-3 px-4">{user.phone}</td>
											<td className="py-3 px-4">
												<span className="capitalize text-xs bg-accent px-2 py-1 rounded">
													{user.userTypes}
												</span>
											</td>
											<td className="py-3 px-4">{user.shopName || "-"}</td>
											<td className="py-3 px-4">
												{user.approvalStatus === "approved" ||
												user.isApproved ? (
													<div className="flex items-center gap-1 text-green-600">
														<CheckCircle className="w-4 h-4" />
														<span>Approved</span>
													</div>
												) : user.approvalStatus === "rejected" ? (
													<div className="flex items-center gap-1 text-red-600">
														<XCircle className="w-4 h-4" />
														<span>Rejected</span>
													</div>
												) : (
													<div className="flex items-center gap-1 text-yellow-600">
														<XCircle className="w-4 h-4" />
														<span>Pending</span>
													</div>
												)}
											</td>
											<td className="py-3 px-4">
												{user.approvalStatus === "pending" &&
													user.userTypes === "customer" && (
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleViewUserDetails(user)}>
																<Eye className="w-4 h-4 mr-1" />
																View & Approve
															</Button>
														</div>
													)}
												{(user.approvalStatus === "approved" ||
													user.approvalStatus === "rejected") && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleViewUserDetails(user)}>
														<Eye className="w-4 h-4 mr-1" />
														View Details
													</Button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* User Details Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto min-w-3xl">
					<DialogHeader>
						<DialogTitle>User Details - Verification</DialogTitle>
						<DialogDescription>
							Review user information before approving
						</DialogDescription>
					</DialogHeader>

					{selectedUser && (
						<div className="space-y-6">
							{/* Status Badge */}
							<div className="flex justify-between items-center">
								<div className="flex gap-2">
									<Badge
										variant={
											selectedUser.approvalStatus === "approved" ||
											selectedUser.isApproved
												? "default"
												: selectedUser.approvalStatus === "rejected"
												? "destructive"
												: "secondary"
										}
										className="text-sm">
										{selectedUser.approvalStatus === "approved" ||
										selectedUser.isApproved
											? "Approved"
											: selectedUser.approvalStatus === "rejected"
											? "Rejected"
											: "Pending Approval"}
									</Badge>
									{selectedUser.approvalStatus === "rejected" &&
										selectedUser.rejectionReason && (
											<Badge variant="outline" className="text-xs text-red-600">
												Reason: {selectedUser.rejectionReason}
											</Badge>
										)}
								</div>
								<div>
									<Badge variant="outline" className="capitalize">
										{selectedUser.userTypes}
									</Badge>
								</div>
							</div>

							{/* Basic Information */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Building2 className="w-5 h-5" />
										Business Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">Shop Name</p>
											<p className="font-medium">
												{selectedUser.shopName || "N/A"}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Owner Name
											</p>
											<p className="font-medium">{selectedUser.ownerName}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Contact Information */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Phone className="w-5 h-5" />
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground flex items-center gap-1">
												<Phone className="w-4 h-4" />
												Phone
											</p>
											<p className="font-medium">{selectedUser.phone}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground flex items-center gap-1">
												<Mail className="w-4 h-4" />
												Email
											</p>
											<p className="font-medium">
												{selectedUser.email || "N/A"}
											</p>
										</div>
									</div>
									{selectedUser.alternatePhone && (
										<div>
											<p className="text-sm text-muted-foreground">
												Alternate Phone
											</p>
											<p className="font-medium">
												{selectedUser.alternatePhone}
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Address Information */}
							{selectedUser.shopAddress && (
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<MapPin className="w-5 h-5" />
											Address
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<p className="font-medium">
												{[
													selectedUser.shopAddress.street,
													selectedUser.shopAddress.area,
													selectedUser.shopAddress.city,
													selectedUser.shopAddress.state,
													selectedUser.shopAddress.pincode,
												]
													.filter(Boolean)
													.join(", ")}
											</p>
											{selectedUser.shopAddress.landmark && (
												<p className="text-sm text-muted-foreground">
													Landmark: {selectedUser.shopAddress.landmark}
												</p>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Business Documents */}
							{(selectedUser.gstNumber ||
								selectedUser.panNumber ||
								selectedUser.tradeLicense) && (
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<FileText className="w-5 h-5" />
											Business Documents
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										{selectedUser.gstNumber && (
											<div className="flex justify-between items-center py-2 border-b">
												<span className="text-sm text-muted-foreground">
													GST Number
												</span>
												<span className="font-medium">
													{selectedUser.gstNumber}
												</span>
											</div>
										)}
										{selectedUser.panNumber && (
											<div className="flex justify-between items-center py-2 border-b">
												<span className="text-sm text-muted-foreground">
													PAN Number
												</span>
												<span className="font-medium">
													{selectedUser.panNumber}
												</span>
											</div>
										)}
										{selectedUser.tradeLicense && (
											<div className="flex justify-between items-center py-2">
												<span className="text-sm text-muted-foreground">
													Trade License
												</span>
												<span className="font-medium">
													{selectedUser.tradeLicense}
												</span>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Document Images */}
							{(selectedUser.gstDocument ||
								selectedUser.aadhaarPhoto ||
								selectedUser.aadhaarPhotoBack ||
								selectedUser.panCardPhoto) && (
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Document Uploads</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{selectedUser.gstDocument?.url &&
											renderDocument(
												selectedUser.gstDocument.url,
												"GST Certificate"
											)}
										{selectedUser.aadhaarPhoto?.url &&
											renderDocument(
												selectedUser.aadhaarPhoto.url,
												"Aadhaar Card (Front)"
											)}
										{selectedUser.aadhaarPhotoBack?.url &&
											renderDocument(
												selectedUser.aadhaarPhotoBack.url,
												"Aadhaar Card (Back)"
											)}
										{selectedUser.panCardPhoto?.url &&
											renderDocument(selectedUser.panCardPhoto.url, "PAN Card")}
									</CardContent>
								</Card>
							)}

							{/* Additional Information */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Calendar className="w-5 h-5" />
										Account Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex justify-between items-center py-2 border-b">
										<span className="text-sm text-muted-foreground">
											Customer Since
										</span>
										<span className="font-medium">
											{selectedUser.customerSince
												? new Date(
														selectedUser.customerSince
												  ).toLocaleDateString()
												: "N/A"}
										</span>
									</div>
									<div className="flex justify-between items-center py-2 border-b">
										<span className="text-sm text-muted-foreground">
											Customer Tier
										</span>
										<Badge variant="outline" className="capitalize">
											{selectedUser.customerTier || "Bronze"}
										</Badge>
									</div>
									{selectedUser.totalOrders !== undefined && (
										<div className="flex justify-between items-center py-2 border-b">
											<span className="text-sm text-muted-foreground">
												Total Orders
											</span>
											<span className="font-medium">
												{selectedUser.totalOrders}
											</span>
										</div>
									)}
									{selectedUser.totalOrderValue !== undefined && (
										<div className="flex justify-between items-center py-2">
											<span className="text-sm text-muted-foreground">
												Total Order Value
											</span>
											<span className="font-medium">
												₹{selectedUser.totalOrderValue.toFixed(2)}
											</span>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Notes */}
							{selectedUser.notes && (
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Notes</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm">{selectedUser.notes}</p>
									</CardContent>
								</Card>
							)}

							{/* Rejection Reason */}
							{selectedUser.approvalStatus === "rejected" &&
								selectedUser.rejectionReason && (
									<Card className="border-red-200 bg-red-50">
										<CardHeader>
											<CardTitle className="text-lg text-red-700">
												Rejection Reason
											</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-red-600">
												{selectedUser.rejectionReason}
											</p>
										</CardContent>
									</Card>
								)}
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={isApproving || isRejecting}>
							Close
						</Button>
						{selectedUser && selectedUser.approvalStatus === "pending" && (
							<>
								<Button
									variant="destructive"
									onClick={() => handleRejectUser(selectedUser._id)}
									disabled={isApproving || isRejecting}>
									{isRejecting ? "Rejecting..." : "Reject User"}
								</Button>
								<Button
									onClick={() => handleApproveUser(selectedUser._id)}
									disabled={isApproving || isRejecting}
									className="bg-green-600 hover:bg-green-700">
									{isApproving ? "Approving..." : "Approve User"}
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Image Zoom Modal */}
			{zoomedImage && (
				<div
					className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
					onClick={() => setZoomedImage(null)}
					style={{ backdropFilter: "blur(4px)" }}>
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
						onClick={() => setZoomedImage(null)}
						title="Close (ESC)">
						<X className="w-6 h-6" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="absolute top-4 left-4 text-white hover:bg-white/20 gap-2"
						onClick={(e) => {
							e.stopPropagation();
							handleOpenInNewTab(zoomedImage);
						}}
						title="Open in new tab">
						<ExternalLink className="w-5 h-5" />
						Open in New Tab
					</Button>
					<div className="relative max-h-[90vh] max-w-[90vw]">
						<img
							src={zoomedImage}
							alt="Zoomed document"
							className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-lg"
							onClick={(e) => e.stopPropagation()}
						/>
					</div>
					<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
						Click outside or press ESC to close
					</div>
				</div>
			)}
		</div>
	);
}
