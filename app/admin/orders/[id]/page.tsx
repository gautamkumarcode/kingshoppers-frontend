"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import {
	ArrowLeft,
	Building,
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	Download,
	Edit,
	Mail,
	MapPin,
	Package,
	Phone,
	Truck,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderDetails {
	_id: string;
	orderNumber: string;
	orderStatus: string;
	paymentMethod: string;
	paymentStatus: string;
	user: {
		_id: string;
		shopName: string;
		ownerName: string;
		phone: string;
		email: string;
		customerTier: string;
		shopAddress: {
			street: string;
			area: string;
			city: string;
			state: string;
			pincode: string;
		};
	};
	items: Array<{
		product: {
			name: string;
			_id: string;
			category: string;
			brand: string;
		};
		variantName: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}>;
	deliveryAddress: {
		street: string;
		area: string;
		city: string;
		state: string;
		pincode: string;
		landmark: string;
	};
	grandTotal: number;
	subtotal: number;
	totalTax: number;
	createdAt: string;
	expectedDeliveryDate?: string;
	statusHistory: Array<{
		status: string;
		timestamp: string;
		notes: string;
		updatedBy?: string;
	}>;
	deliveryPersonnel?: {
		firstName: string;
		lastName: string;
		phone: string;
	};
}

export default function AdminOrderDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [order, setOrder] = useState<OrderDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [updateData, setUpdateData] = useState({
		status: "",
		notes: "",
	});

	useEffect(() => {
		fetchOrderDetails();
	}, [params.id]);

	const fetchOrderDetails = async () => {
		try {
			const response = await api.get(`/admin/orders/${params.id}`);
			setOrder(response.data);
		} catch (error) {
			console.error("Failed to fetch order details:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async () => {
		if (!order) return;

		setUpdating(true);
		try {
			await api.put(`/admin/orders/${order._id}/status`, {
				status: updateData.status,
				notes: updateData.notes,
			});

			// Refresh order details
			fetchOrderDetails();
			setShowUpdateModal(false);
			setUpdateData({ status: "", notes: "" });
		} catch (error) {
			console.error("Failed to update order status:", error);
		} finally {
			setUpdating(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "confirmed":
				return "bg-blue-100 text-blue-800";
			case "processing":
				return "bg-purple-100 text-purple-800";
			case "shipped":
				return "bg-indigo-100 text-indigo-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return <Clock className="w-4 h-4" />;
			case "confirmed":
			case "processing":
				return <Package className="w-4 h-4" />;
			case "shipped":
				return <Truck className="w-4 h-4" />;
			case "delivered":
				return <CheckCircle className="w-4 h-4" />;
			case "cancelled":
				return <X className="w-4 h-4" />;
			default:
				return <Package className="w-4 h-4" />;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
							<p>Loading order details...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h2 className="text-2xl font-bold mb-2">Order not found</h2>
							<p className="text-gray-600 mb-4">
								The order you're looking for doesn't exist or has been removed.
							</p>
							<Link href="/admin/orders">
								<Button>Back to Orders</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// compute safe totals when API doesn't provide them
	const computedSubtotal =
		order.subtotal ??
		order.items?.reduce((sum, it) => {
			const itemTotal = it.total ?? (it.unitPrice ?? 0) * (it.quantity ?? 0);
			return sum + (itemTotal ?? 0);
		}, 0) ??
		0;

	const computedTotalTax = order.totalTax ?? 0;

	const computedGrandTotal =
		order.grandTotal ?? computedSubtotal + computedTotalTax;

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header */}
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/admin/orders">
							<Button variant="outline" size="sm">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Orders
							</Button>
						</Link>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Order #{order.orderNumber}
							</h1>
							<p className="text-gray-600">
								Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
								{new Date(order.createdAt).toLocaleTimeString()}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							className={`${getStatusColor(
								order.orderStatus
							)} flex items-center gap-1 text-sm px-3 py-1`}>
							{getStatusIcon(order.orderStatus)}
							<span className="capitalize">{order.orderStatus}</span>
						</Badge>
						<Button
							onClick={() => {
								setUpdateData({ status: order.orderStatus, notes: "" });
								setShowUpdateModal(true);
							}}>
							<Edit className="w-4 h-4 mr-2" />
							Update Status
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Customer Information */}
						{order.user && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="w-5 h-5" />
										Customer Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label className="text-sm font-medium text-gray-600">
												Shop Name
											</Label>
											<div className="flex items-center gap-2 mt-1">
												<Building className="w-4 h-4 text-gray-400" />
												<p className="font-medium">{order.user.shopName}</p>
											</div>
										</div>
										<div>
											<Label className="text-sm font-medium text-gray-600">
												Owner Name
											</Label>
											<div className="flex items-center gap-2 mt-1">
												<User className="w-4 h-4 text-gray-400" />
												<p className="font-medium">{order.user.ownerName}</p>
											</div>
										</div>
										<div>
											<Label className="text-sm font-medium text-gray-600">
												Phone
											</Label>
											<div className="flex items-center gap-2 mt-1">
												<Phone className="w-4 h-4 text-gray-400" />
												<p>{order.user.phone}</p>
											</div>
										</div>
										<div>
											<Label className="text-sm font-medium text-gray-600">
												Email
											</Label>
											<div className="flex items-center gap-2 mt-1">
												<Mail className="w-4 h-4 text-gray-400" />
												<p>{order.user.email || "Not provided"}</p>
											</div>
										</div>
									</div>
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Customer Tier
										</Label>
										<Badge variant="secondary" className="mt-1 capitalize">
											{order.user.customerTier}
										</Badge>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Order Items */}
						<Card>
							<CardHeader>
								<CardTitle>Order Items ({order.items.length})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{order.items.map((item, index) => (
										<div
											key={index}
											className="flex gap-4 p-4 border rounded-lg">
											<div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
												<Package className="w-8 h-8 text-gray-400" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold">{item.product.name}</h4>
												<p className="text-sm text-gray-600">
													{item.variantName}
												</p>
												<div className="flex items-center gap-4 mt-2">
													<span className="text-sm">
														Category: {item.product.category}
													</span>
													<span className="text-sm">
														Brand: {item.product.brand}
													</span>
												</div>
												<div className="flex items-center gap-4 mt-1">
													<span className="text-sm">Qty: {item.quantity}</span>
													<span className="text-sm">
														₹{item.unitPrice} each
													</span>
												</div>
											</div>
											<div className="text-right">
												<p className="font-semibold text-lg">₹{item.total}</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Delivery Address */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="w-5 h-5" />
									Delivery Address
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{order.deliveryAddress.street && (
										<p className="font-medium">
											{order.deliveryAddress.street}
										</p>
									)}
									{order.deliveryAddress.area && (
										<p className="text-gray-600">
											{order.deliveryAddress.area}
										</p>
									)}
									{order.deliveryAddress.landmark && (
										<p className="text-gray-600">
											Near: {order.deliveryAddress.landmark}
										</p>
									)}
									<p className="text-gray-600">
										{[
											order.deliveryAddress.city,
											order.deliveryAddress.state,
											order.deliveryAddress.pincode,
										]
											.filter(Boolean)
											.join(", ")}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Status History */}
						<Card>
							<CardHeader>
								<CardTitle>Order Timeline</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{order.statusHistory.map((history, index) => (
										<div key={index} className="flex gap-4">
											<div className="flex flex-col items-center">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center ${
														index === 0
															? "bg-primary text-white"
															: "bg-gray-200"
													}`}>
													{getStatusIcon(history.status)}
												</div>
												{index < order.statusHistory.length - 1 && (
													<div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
												)}
											</div>
											<div className="flex-1 pb-4">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-medium capitalize">
														{history.status}
													</span>
													<span className="text-sm text-gray-500">
														{new Date(history.timestamp).toLocaleDateString()}{" "}
														at{" "}
														{new Date(history.timestamp).toLocaleTimeString()}
													</span>
												</div>
												{history.notes && (
													<p className="text-sm text-gray-600">
														{history.notes}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Order Summary */}
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span>Subtotal</span>
									<span>₹{computedSubtotal}</span>
								</div>
								<div className="flex justify-between">
									<span>Tax</span>
									<span>₹{computedTotalTax}</span>
								</div>
								<div className="flex justify-between">
									<span>Shipping</span>
									<span className="text-green-600">FREE</span>
								</div>
								<Separator />
								<div className="flex justify-between font-bold text-lg">
									<span>Total</span>
									<span className="text-primary">₹{computedGrandTotal}</span>
								</div>
							</CardContent>
						</Card>

						{/* Payment Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="w-5 h-5" />
									Payment Details
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Payment Method</span>
										<span className="capitalize">{order.paymentMethod}</span>
									</div>
									<div className="flex justify-between">
										<span>Payment Status</span>
										<Badge
											variant={
												order.paymentStatus === "completed"
													? "default"
													: "secondary"
											}>
											{order.paymentStatus || "Pending"}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Delivery Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Truck className="w-5 h-5" />
									Delivery Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<Label className="text-sm font-medium text-gray-600">
										Expected Delivery
									</Label>
									<div className="flex items-center gap-2 mt-1">
										<Calendar className="w-4 h-4 text-gray-400" />
										<span className="text-sm">
											{order.expectedDeliveryDate
												? new Date(
														order.expectedDeliveryDate
												  ).toLocaleDateString()
												: "3-5 business days"}
										</span>
									</div>
								</div>
								{order.deliveryPersonnel && (
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Delivery Personnel
										</Label>
										<div className="mt-1">
											<p className="font-medium">
												{order.deliveryPersonnel.firstName}{" "}
												{order.deliveryPersonnel.lastName}
											</p>
											<p className="text-sm text-gray-600">
												{order.deliveryPersonnel.phone}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Actions */}
						<div className="space-y-3">
							<Button variant="outline" className="w-full">
								<Download className="w-4 h-4 mr-2" />
								Download Invoice
							</Button>
							<Button variant="outline" className="w-full">
								Print Order Details
							</Button>
						</div>
					</div>
				</div>

				{/* Update Status Modal */}
				{showUpdateModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="w-full max-w-md">
							<CardHeader>
								<CardTitle>Update Order Status</CardTitle>
								<p className="text-sm text-gray-600">
									Order #{order.orderNumber}
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="status">Order Status</Label>
									<Select
										value={updateData.status}
										onValueChange={(value) =>
											setUpdateData((prev) => ({ ...prev, status: value }))
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="confirmed">Confirmed</SelectItem>
											<SelectItem value="processing">Processing</SelectItem>
											<SelectItem value="shipped">Shipped</SelectItem>
											<SelectItem value="delivered">Delivered</SelectItem>
											<SelectItem value="cancelled">Cancelled</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="notes">Notes (Optional)</Label>
									<Textarea
										id="notes"
										placeholder="Add any notes about this status update..."
										value={updateData.notes}
										onChange={(e) =>
											setUpdateData((prev) => ({
												...prev,
												notes: e.target.value,
											}))
										}
									/>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={handleStatusUpdate}
										className="flex-1"
										disabled={updating}>
										{updating ? "Updating..." : "Update Status"}
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowUpdateModal(false);
											setUpdateData({ status: "", notes: "" });
										}}
										disabled={updating}>
										Cancel
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
