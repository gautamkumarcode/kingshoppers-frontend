"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import {
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	Download,
	Mail,
	MapPin,
	Package,
	Phone,
	Truck,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderConfirmationPage() {
	const params = useParams();
	const [order, setOrder] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchOrder();
	}, [params.id]);

	const fetchOrder = async () => {
		try {
			const response = await api.get(`/orders/${params.id}`);
			setOrder(response.data);
		} catch (error) {
			console.error("Failed to fetch order:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadInvoice = async () => {
		if (!order) return;

		try {
			// Call backend API to generate and download invoice PDF
			const response = await api.get(`/orders/${order._id}/invoice`, {
				responseType: "blob", // Important for file download
			});

			// Create a blob from the PDF data
			const blob = new Blob([response.data], { type: "application/pdf" });

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`invoice-${order.orderNumber || order._id}.pdf`
			);
			document.body.appendChild(link);
			link.click();

			// Cleanup
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download invoice:", error);
			alert("Failed to download invoice. Please try again.");
		}
	};

	const getStatusIcon = (status: string) => {
		const normalizedStatus = status?.toLowerCase();
		switch (normalizedStatus) {
			case "pending":
				return <Clock className="w-4 h-4" />;
			case "confirmed":
			case "processing":
			case "packed":
				return <Package className="w-4 h-4" />;
			case "shipped":
			case "out_for_delivery":
				return <Truck className="w-4 h-4" />;
			case "delivered":
				return <CheckCircle className="w-4 h-4" />;
			case "cancelled":
			case "returned":
			case "refunded":
				return <X className="w-4 h-4" />;
			default:
				return <Package className="w-4 h-4" />;
		}
	};

	const getStatusColor = (status: string) => {
		const normalizedStatus = status?.toLowerCase();
		switch (normalizedStatus) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "confirmed":
				return "bg-blue-100 text-blue-800";
			case "processing":
			case "packed":
				return "bg-purple-100 text-purple-800";
			case "shipped":
			case "out_for_delivery":
				return "bg-indigo-100 text-indigo-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "cancelled":
			case "returned":
			case "refunded":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getTimelineIconColor = (status: string) => {
		const normalizedStatus = status?.toLowerCase();
		switch (normalizedStatus) {
			case "pending":
				return "bg-yellow-500 text-white";
			case "confirmed":
				return "bg-blue-500 text-white";
			case "processing":
			case "packed":
				return "bg-purple-500 text-white";
			case "shipped":
			case "out_for_delivery":
				return "bg-indigo-500 text-white";
			case "delivered":
				return "bg-green-500 text-white";
			case "cancelled":
			case "returned":
			case "refunded":
				return "bg-red-500 text-white";
			default:
				return "bg-gray-400 text-white";
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Loading order details...</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-2">Order not found</h2>
					<p className="text-muted-foreground mb-4">
						The order you're looking for doesn't exist or has been removed.
					</p>
					<Link href="/orders">
						<Button>View All Orders</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Calculate totals
	const subtotal =
		order.items?.reduce(
			(sum: number, item: any) => sum + (item.subtotal || item.total || 0),
			0
		) || 0;
	const tax = order.totalTax || Math.round(subtotal * 0.18);
	const total = order.grandTotal || subtotal + tax;

	return (
		<main className="min-h-screen bg-gray-50">
			{/* Print Header - Hidden on screen, visible on print */}
			<div className="print-header hidden print:block p-4 border-b">
				<div className="text-center">
					<h1 className="text-2xl font-bold">Your Store Name</h1>
					<p className="text-sm text-muted-foreground">Order Invoice</p>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-8 print-area">
				{/* Success Header */}
				<div className="text-center mb-8 bg-white rounded-lg p-8 shadow-sm">
					<CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
					<h1 className="text-3xl font-bold text-green-600 mb-2">
						Order Placed Successfully!
					</h1>
					<p className="text-lg text-muted-foreground mb-4">
						Thank you for your order. We'll send you a confirmation email
						shortly.
					</p>
					<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-3">
						<div className="flex items-center gap-1">
							<Package className="w-4 h-4" />
							<span>Order #{order.orderNumber}</span>
						</div>
						<div className="flex items-center gap-1">
							<Calendar className="w-4 h-4" />
							<span>{new Date(order.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
					{order.orderStatus && (
						<div className="flex justify-center">
							<Badge
								className={`${getStatusColor(
									order.orderStatus
								)} flex items-center gap-1 text-sm px-3 py-1`}>
								{getStatusIcon(order.orderStatus)}
								<span className="capitalize">
									{order.orderStatus.replace(/_/g, " ")}
								</span>
							</Badge>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Order Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Order Status Timeline */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Truck className="w-5 h-5" />
									Order Timeline
								</CardTitle>
							</CardHeader>
							<CardContent>
								{order.statusHistory && order.statusHistory.length > 0 ? (
									<div className="space-y-4">
										{[...order.statusHistory]
											.reverse()
											.map((history: any, index: number) => (
												<div key={index} className="flex gap-4">
													<div className="flex flex-col items-center">
														<div
															className={`w-10 h-10 rounded-full flex items-center justify-center ${
																index === 0
																	? getTimelineIconColor(history.status)
																	: "bg-gray-300 text-gray-600"
															}`}>
															{getStatusIcon(history.status)}
														</div>
														{index < order.statusHistory.length - 1 && (
															<div
																className={`w-0.5 h-full mt-2 min-h-10 ${
																	index === 0
																		? getTimelineIconColor(
																				history.status
																		  ).split(" ")[0]
																		: "bg-gray-200"
																}`}></div>
														)}
													</div>
													<div className="flex-1 pb-4">
														<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
															<div className="flex items-center gap-2">
																<span className="font-semibold capitalize text-lg">
																	{history.status.replace(/_/g, " ")}
																</span>
																<Badge
																	className={`${getStatusColor(
																		history.status
																	)} text-xs`}>
																	{index === 0 ? "Current" : "Completed"}
																</Badge>
															</div>
															<span className="text-sm text-muted-foreground">
																{new Date(history.timestamp).toLocaleDateString(
																	"en-US",
																	{
																		day: "numeric",
																		month: "short",
																		year: "numeric",
																	}
																)}{" "}
																at{" "}
																{new Date(history.timestamp).toLocaleTimeString(
																	"en-US",
																	{
																		hour: "2-digit",
																		minute: "2-digit",
																	}
																)}
															</span>
														</div>
														{history.notes && (
															<p className="text-sm text-muted-foreground mt-1">
																{history.notes}
															</p>
														)}
														{history.location && (
															<p className="text-xs text-muted-foreground mt-1">
																📍 {history.location}
															</p>
														)}
													</div>
												</div>
											))}
									</div>
								) : (
									<div className="flex items-center justify-between">
										<div className="flex flex-col items-center">
											<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
												<CheckCircle className="w-4 h-4 text-white" />
											</div>
											<p className="text-xs mt-2 text-center">Order Placed</p>
										</div>
										<div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
										<div className="flex flex-col items-center">
											<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
												<Package className="w-4 h-4 text-gray-500" />
											</div>
											<p className="text-xs mt-2 text-center">Processing</p>
										</div>
										<div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
										<div className="flex flex-col items-center">
											<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
												<Truck className="w-4 h-4 text-gray-500" />
											</div>
											<p className="text-xs mt-2 text-center">Shipped</p>
										</div>
										<div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
										<div className="flex flex-col items-center">
											<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
												<CheckCircle className="w-4 h-4 text-gray-500" />
											</div>
											<p className="text-xs mt-2 text-center">Delivered</p>
										</div>
									</div>
								)}
								<div className="mt-4 p-3 bg-blue-50 rounded-lg">
									<p className="text-sm text-blue-700">
										<strong>Expected Delivery:</strong>{" "}
										{order.expectedDeliveryDate
											? new Date(
													order.expectedDeliveryDate
											  ).toLocaleDateString()
											: "3-5 business days"}
									</p>
									{order.deliverySlot && (
										<p className="text-sm text-blue-700">
											<strong>Delivery Slot:</strong> {order.deliverySlot}
										</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Order Items */}
						<Card>
							<CardHeader>
								<CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{order.items?.map((item: any, index: number) => (
										<div
											key={index}
											className="flex gap-4 p-4 border rounded-lg">
											<div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
												<Package className="w-8 h-8 text-gray-400" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold">
													{item.product?.name || "Product"}
												</h4>
												<p className="text-sm text-muted-foreground">
													{item.variantName || item.variant}
												</p>
												<div className="flex items-center gap-4 mt-2">
													<span className="text-sm">Qty: {item.quantity}</span>
													<span className="text-sm">
														₹{item.unitPrice || item.price} each
													</span>
												</div>
											</div>
											<div className="text-right">
												<p className="font-semibold text-lg">
													₹{item.total || item.subtotal}
												</p>
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
									{order.deliveryAddress?.street && (
										<p className="font-medium">
											{order.deliveryAddress.street}
										</p>
									)}
									{order.deliveryAddress?.area && (
										<p className="text-muted-foreground">
											{order.deliveryAddress.area}
										</p>
									)}
									{order.deliveryAddress?.landmark && (
										<p className="text-muted-foreground">
											Near: {order.deliveryAddress.landmark}
										</p>
									)}
									<p className="text-muted-foreground">
										{[
											order.deliveryAddress?.city,
											order.deliveryAddress?.state,
											order.deliveryAddress?.pincode,
										]
											.filter(Boolean)
											.join(", ")}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Order Summary Sidebar */}
					<div className="space-y-6">
						{/* Order Summary */}
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span>Subtotal</span>
									<span>₹{subtotal}</span>
								</div>
								<div className="flex justify-between">
									<span>Tax (18%)</span>
									<span>₹{tax}</span>
								</div>
								<div className="flex justify-between">
									<span>Shipping</span>
									<span className="text-green-600">FREE</span>
								</div>
								<Separator />
								<div className="flex justify-between font-bold text-lg">
									<span>Total</span>
									<span className="text-primary">₹{total}</span>
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
								<div className="space-y-3">
									<div className="flex justify-between">
										<span>Payment Method</span>
										<span className="capitalize font-medium">
											{order.paymentMethod}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Payment Status</span>
										<Badge
											variant={
												order.paymentStatus === "completed"
													? "default"
													: order.paymentStatus === "partial"
													? "secondary"
													: "outline"
											}>
											{order.paymentStatus === "completed"
												? "Paid"
												: order.paymentStatus === "partial"
												? "Partially Paid"
												: "Pending"}
										</Badge>
									</div>

									{/* Show advance payment if exists */}
									{order.advancePayment && order.advancePayment > 0 && (
										<>
											<Separator />
											<div className="space-y-2 bg-green-50 p-3 rounded-lg">
												<div className="flex justify-between text-sm">
													<span className="text-green-700 font-medium">
														Advance Paid (Wallet)
													</span>
													<span className="text-green-700 font-bold">
														₹{order.advancePayment.toFixed(2)}
													</span>
												</div>
												{order.advancePaymentDate && (
													<div className="text-xs text-green-600">
														Paid on{" "}
														{new Date(
															order.advancePaymentDate
														).toLocaleDateString()}
													</div>
												)}
											</div>
										</>
									)}

									{/* Show balance amount if exists */}
									{order.balanceAmount && order.balanceAmount > 0 && (
										<div className="bg-orange-50 p-3 rounded-lg">
											<div className="flex justify-between text-sm">
												<span className="text-orange-700 font-medium">
													Balance Due
													{order.paymentMethod === "cod"
														? " (At Delivery)"
														: ""}
												</span>
												<span className="text-orange-700 font-bold">
													₹{order.balanceAmount.toFixed(2)}
												</span>
											</div>
											{order.paymentMethod === "cod" && (
												<p className="text-xs text-orange-600 mt-1">
													Pay the remaining amount when you receive your order
												</p>
											)}
										</div>
									)}

									{/* Show full payment confirmation */}
									{order.paymentStatus === "completed" &&
										order.advancePayment > 0 && (
											<div className="bg-green-50 p-3 rounded-lg border border-green-200">
												<div className="flex items-center gap-2 text-green-700">
													<CheckCircle className="w-4 h-4" />
													<span className="text-sm font-medium">
														Fully Paid via Wallet
													</span>
												</div>
											</div>
										)}
								</div>
							</CardContent>
						</Card>

						{/* Customer Support */}
						<Card className="no-print">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="w-5 h-5" />
									Need Help?
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-2 text-sm">
									<Phone className="w-4 h-4" />
									<span>+91 98765 43210</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Mail className="w-4 h-4" />
									<span>support@yourstore.com</span>
								</div>
								<Button variant="outline" size="sm" className="w-full">
									Contact Support
								</Button>
							</CardContent>
						</Card>

						{/* Actions */}
						<div className="space-y-3 no-print">
							<Button
								onClick={handleDownloadInvoice}
								className="w-full"
								variant="outline">
								<Download className="w-4 h-4 mr-2" />
								Download Invoice
							</Button>
							<Link href="/my-orders" className="block">
								<Button className="w-full">View All Orders</Button>
							</Link>
							<Link href="/products" className="block">
								<Button variant="outline" className="w-full">
									Continue Shopping
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Additional Information */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Important Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<h4 className="font-semibold mb-2">Return Policy</h4>
								<p className="text-muted-foreground">
									Items can be returned within 7 days of delivery in original
									condition.
								</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Warranty</h4>
								<p className="text-muted-foreground">
									All products come with manufacturer warranty as applicable.
								</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Delivery Updates</h4>
								<p className="text-muted-foreground">
									You'll receive SMS and email updates about your order status.
								</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Invoice</h4>
								<p className="text-muted-foreground">
									GST invoice will be sent to your registered email address.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
