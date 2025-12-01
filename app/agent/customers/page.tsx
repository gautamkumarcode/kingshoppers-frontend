"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { GoogleLocationPicker } from "@/components/ui/google-location-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Package, Plus, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

export default function CustomersPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [customers, setCustomers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showForm, setShowForm] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		phone: "",
		ownerName: "",
		shopName: "",
		gstNumber: "",
		street: "",
		area: "",
		city: "",
		state: "",
		pincode: "",
		landmark: "",
	});

	// Location state
	const [latitude, setLatitude] = useState<number | null>(null);
	const [longitude, setLongitude] = useState<number | null>(null);

	// Document state
	const [documents, setDocuments] = useState({
		gstDocument: null as any,
		aadhaarPhoto: null as any,
		aadhaarPhotoBack: null as any,
		panCardPhoto: null as any,
	});

	// Orders dialog state
	const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
	const [customerOrders, setCustomerOrders] = useState<any[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [showOrdersDialog, setShowOrdersDialog] = useState(false);

	useEffect(() => {
		fetchCustomers();
	}, []);

	const fetchCustomers = async () => {
		try {
			const response = await api.get("/sales/customers");
			setCustomers(response.data.customers || []);
		} catch (error) {
			console.error("❌ Failed to fetch customers:", error);
			toast({
				title: "Error",
				description: "Failed to fetch customers",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleRegisterCustomer = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate all required documents are uploaded
		if (
			!documents.gstDocument ||
			!documents.aadhaarPhoto ||
			!documents.aadhaarPhotoBack ||
			!documents.panCardPhoto
		) {
			toast({
				title: "Error",
				description: "All documents are required. Please upload all documents.",
				variant: "destructive",
			});
			return;
		}

		try {
			// Prepare customer data with documents and address
			const customerData = {
				phone: formData.phone,
				ownerName: formData.ownerName,
				shopName: formData.shopName,
				gstNumber: formData.gstNumber,
				shopAddress: {
					street: formData.street,
					area: formData.area,
					city: formData.city,
					state: formData.state,
					pincode: formData.pincode,
					landmark: formData.landmark,
					...(latitude &&
						longitude && {
							location: {
								type: "Point",
								coordinates: [longitude, latitude],
							},
						}),
				},
				documents: {
					gstDocument: documents.gstDocument,
					aadhaarPhoto: documents.aadhaarPhoto,
					aadhaarPhotoBack: documents.aadhaarPhotoBack,
					panCardPhoto: documents.panCardPhoto,
				},
			};

			const response = await api.post("/sales/customers", customerData);

			if (response.status < 200 || response.status >= 300) {
				const message = response.data?.message || "Failed to register customer";
				toast({
					title: "Error",
					description: message,
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Success",
				description:
					"Customer registered successfully. Pending admin approval.",
			});

			// Reset form
			setFormData({
				phone: "",
				ownerName: "",
				shopName: "",
				gstNumber: "",
				street: "",
				area: "",
				city: "",
				state: "",
				pincode: "",
				landmark: "",
			});
			setLatitude(null);
			setLongitude(null);
			setDocuments({
				gstDocument: null,
				aadhaarPhoto: null,
				aadhaarPhotoBack: null,
				panCardPhoto: null,
			});
			setShowForm(false);
			fetchCustomers();
		} catch (error: any) {
			const message =
				error?.response?.data?.message || "Failed to register customer";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
			customer.phone?.includes(search) ||
			customer.shopName?.toLowerCase().includes(search.toLowerCase())
	);

	const handleViewOrders = async (customer: any) => {
		if (!customer.isApproved) {
			toast({
				title: "Customer Not Approved",
				description:
					"This customer hasn't been approved yet and cannot place orders.",
				variant: "destructive",
			});
			return;
		}

		setSelectedCustomer(customer);
		setShowOrdersDialog(true);
		setOrdersLoading(true);

		try {
			// Fetch orders for this specific customer
			const response = await api.get(`/orders/customer/${customer._id}`);
			setCustomerOrders(response.data.orders || []);
		} catch (error: any) {
			console.error("Failed to fetch customer orders:", error);
			toast({
				title: "Error",
				description: "Failed to load customer orders",
				variant: "destructive",
			});
			setCustomerOrders([]);
		} finally {
			setOrdersLoading(false);
		}
	};

	const handleCreateOrder = (customer: any) => {
		if (!customer.isApproved) {
			toast({
				title: "Customer Not Approved",
				description: "This customer must be approved before placing orders.",
				variant: "destructive",
			});
			return;
		}

		// Navigate to create order page with customer ID
		router.push(`/agent/create-order?customerId=${customer._id}`);
	};

	return (
		<div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
				<h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
				<Button
					onClick={() => setShowForm(!showForm)}
					className="w-full sm:w-auto">
					<Plus className="w-4 h-4 mr-2" />
					<span className="hidden sm:inline">Register Customer</span>
					<span className="sm:hidden">Add Customer</span>
				</Button>
			</div>

			{/* Registration Form */}
			{showForm && (
				<Card className="overflow-hidden">
					<CardHeader className="px-4 sm:px-6">
						<CardTitle className="text-lg sm:text-xl">
							Register New Customer
						</CardTitle>
						<p className="text-xs sm:text-sm text-muted-foreground mt-1">
							Note: All new customers require admin approval before they can
							place orders.
						</p>
					</CardHeader>
					<CardContent className="px-4 sm:px-6">
						<form
							onSubmit={handleRegisterCustomer}
							className="space-y-4 sm:space-y-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-foreground">
									Basic Information
								</h3>

								<div className="space-y-2">
									<Label htmlFor="ownerName">Owner Name *</Label>
									<Input
										id="ownerName"
										name="ownerName"
										placeholder="Enter owner's full name"
										value={formData.ownerName}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number *</Label>
									<Input
										id="phone"
										name="phone"
										type="tel"
										placeholder="Enter 10-digit phone number"
										value={formData.phone}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="shopName">Shop/Company Name *</Label>
									<Input
										id="shopName"
										name="shopName"
										placeholder="Enter shop or company name"
										value={formData.shopName}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="gstNumber">GST Number (Optional)</Label>
									<Input
										id="gstNumber"
										name="gstNumber"
										placeholder="Enter GST number if available"
										value={formData.gstNumber}
										onChange={handleInputChange}
									/>
								</div>
							</div>

							{/* Shop Address */}
							<div className="space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
									<h3 className="text-sm font-semibold text-foreground">
										Shop Address *
									</h3>
									<GoogleLocationPicker
										latitude={latitude}
										longitude={longitude}
										onLocationSelect={(lat: number, lng: number) => {
											setLatitude(lat);
											setLongitude(lng);
										}}
									/>
								</div>

								{latitude && longitude && (
									<div className="bg-green-50 border border-green-200 rounded-md p-2 sm:p-3">
										<p className="text-xs text-green-800 font-medium break-all">
											✅ Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
										</p>
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="street">Street Address</Label>
									<Input
										id="street"
										name="street"
										placeholder="123 Main Street"
										value={formData.street}
										onChange={handleInputChange}
									/>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
									<div className="space-y-2">
										<Label htmlFor="area">Area/Locality</Label>
										<Input
											id="area"
											name="area"
											placeholder="Sector 15"
											value={formData.area}
											onChange={handleInputChange}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="landmark">Landmark</Label>
										<Input
											id="landmark"
											name="landmark"
											placeholder="Near City Mall"
											value={formData.landmark}
											onChange={handleInputChange}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
									<div className="space-y-2">
										<Label htmlFor="city">City *</Label>
										<Input
											id="city"
											name="city"
											placeholder="Mumbai"
											value={formData.city}
											onChange={handleInputChange}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="state">State *</Label>
										<Input
											id="state"
											name="state"
											placeholder="Maharashtra"
											value={formData.state}
											onChange={handleInputChange}
											required
										/>
									</div>
									<div className="space-y-2 sm:col-span-2 lg:col-span-1">
										<Label htmlFor="pincode">Pincode *</Label>
										<Input
											id="pincode"
											name="pincode"
											placeholder="400001"
											value={formData.pincode}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>
							</div>

							{/* Document Uploads */}
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-foreground">
									Documents (All Required)
								</h3>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
									<FileUpload
										label="GST Document"
										accept=".pdf,.jpg,.jpeg,.png"
										fileType="gstDocument"
										onFileUploaded={(fileData: any) =>
											setDocuments((prev) => ({
												...prev,
												gstDocument: fileData,
											}))
										}
										maxSize={5}
										required={true}
									/>

									<FileUpload
										label="Aadhaar Front"
										accept=".jpg,.jpeg,.png"
										fileType="aadhaarPhoto"
										onFileUploaded={(fileData: any) =>
											setDocuments((prev) => ({
												...prev,
												aadhaarPhoto: fileData,
											}))
										}
										maxSize={5}
										required={true}
									/>

									<FileUpload
										label="Aadhaar Back"
										accept=".jpg,.jpeg,.png"
										fileType="aadhaarPhotoBack"
										onFileUploaded={(fileData: any) =>
											setDocuments((prev) => ({
												...prev,
												aadhaarPhotoBack: fileData,
											}))
										}
										maxSize={5}
										required={true}
									/>

									<FileUpload
										label="PAN Card"
										accept=".jpg,.jpeg,.png,.pdf"
										fileType="panCardPhoto"
										onFileUploaded={(fileData: any) =>
											setDocuments((prev) => ({
												...prev,
												panCardPhoto: fileData,
											}))
										}
										maxSize={5}
										required={true}
									/>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
								<Button type="submit" className="w-full sm:w-auto">
									Register Customer
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowForm(false);
										setFormData({
											phone: "",
											ownerName: "",
											shopName: "",
											gstNumber: "",
											street: "",
											area: "",
											city: "",
											state: "",
											pincode: "",
											landmark: "",
										});
										setLatitude(null);
										setLongitude(null);
										setDocuments({
											gstDocument: null,
											aadhaarPhoto: null,
											aadhaarPhotoBack: null,
											panCardPhoto: null,
										});
									}}
									className="w-full sm:w-auto bg-transparent">
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
				<Input
					placeholder="Search by name, phone, or company..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Customers List */}
			<Card>
				<CardHeader className="px-4 sm:px-6">
					<CardTitle className="text-lg sm:text-xl">
						All Customers ({filteredCustomers.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 sm:px-6">
					{loading ? (
						<p className="text-muted-foreground text-sm">
							Loading customers...
						</p>
					) : filteredCustomers.length === 0 ? (
						<p className="text-muted-foreground text-sm">No customers found</p>
					) : (
						<div className="space-y-3 sm:space-y-4">
							{filteredCustomers.map((customer) => (
								<div
									key={customer._id}
									className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-border rounded-lg">
									<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
										<div className="p-2 bg-accent rounded-lg shrink-0">
											<User className="w-4 h-4 sm:w-5 sm:h-5" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm sm:text-base truncate">
												{customer.ownerName}
											</p>
											<p className="text-xs sm:text-sm text-muted-foreground">
												{customer.phone}
											</p>
											{customer.shopName && (
												<p className="text-xs sm:text-sm text-muted-foreground truncate">
													{customer.shopName}
												</p>
											)}
											{customer.gstNumber && (
												<p className="text-xs text-muted-foreground truncate">
													GST: {customer.gstNumber}
												</p>
											)}
										</div>
									</div>
									<div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
										<span
											className={`text-xs px-2 py-1 rounded whitespace-nowrap font-medium ${
												customer.approvalStatus === "approved"
													? "bg-green-100 text-green-800"
													: customer.approvalStatus === "rejected"
													? "bg-red-100 text-red-800"
													: "bg-yellow-100 text-yellow-800"
											}`}>
											{customer.approvalStatus === "approved"
												? "✓ Approved"
												: customer.approvalStatus === "rejected"
												? "✗ Rejected"
												: "⏳ Pending"}
										</span>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="text-xs sm:text-sm"
												onClick={() => handleViewOrders(customer)}>
												View Orders
											</Button>
											<Button
												size="sm"
												className="text-xs sm:text-sm"
												onClick={() => handleCreateOrder(customer)}
												disabled={!customer.isApproved}>
												Create Order
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Orders Dialog */}
			<Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-lg sm:text-xl">
							Orders - {selectedCustomer?.ownerName}
						</DialogTitle>
						<p className="text-xs sm:text-sm text-muted-foreground">
							{selectedCustomer?.shopName} • {selectedCustomer?.phone}
						</p>
					</DialogHeader>

					<div className="space-y-4">
						{ordersLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							</div>
						) : customerOrders.length === 0 ? (
							<div className="text-center py-8">
								<Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
								<p className="text-muted-foreground">No orders found</p>
								<p className="text-xs text-muted-foreground mt-1">
									This customer hasn't placed any orders yet
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{customerOrders.map((order) => (
									<Card key={order._id} className="overflow-hidden">
										<CardContent className="p-4">
											<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-2">
														<span className="font-semibold text-sm">
															#{order.orderNumber}
														</span>
														<span
															className={`text-xs px-2 py-0.5 rounded ${
																order.orderStatus === "delivered"
																	? "bg-green-100 text-green-800"
																	: order.orderStatus === "cancelled"
																	? "bg-red-100 text-red-800"
																	: order.orderStatus === "processing"
																	? "bg-blue-100 text-blue-800"
																	: "bg-yellow-100 text-yellow-800"
															}`}>
															{order.orderStatus}
														</span>
													</div>
													<p className="text-xs text-muted-foreground">
														{new Date(order.createdAt).toLocaleDateString(
															"en-IN",
															{
																day: "numeric",
																month: "short",
																year: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{order.items?.length || 0} item(s)
													</p>
												</div>
												<div className="flex flex-col items-end gap-2">
													<p className="font-bold text-base">
														₹
														{order.grandTotal?.toFixed(2) ||
															order.total?.toFixed(2)}
													</p>
													<span
														className={`text-xs px-2 py-0.5 rounded ${
															order.paymentStatus === "paid"
																? "bg-green-100 text-green-800"
																: order.paymentStatus === "failed"
																? "bg-red-100 text-red-800"
																: "bg-yellow-100 text-yellow-800"
														}`}>
														{order.paymentStatus}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
