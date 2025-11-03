"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import {
	Calendar,
	CheckCircle,
	CreditCard,
	Download,
	Mail,
	MapPin,
	Package,
	Phone,
	Truck,
	User,
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

	const handleDownloadInvoice = () => {
		// Add print styles
		const printStyles = `
			<style>
				@media print {
					body * { visibility: hidden; }
					.print-area, .print-area * { visibility: visible; }
					.print-area { position: absolute; left: 0; top: 0; width: 100%; }
					.no-print { display: none !important; }
					.print-header { display: block !important; }
				}
			</style>
		`;

		// Add styles to head
		const styleSheet = document.createElement("style");
		styleSheet.innerHTML = printStyles;
		document.head.appendChild(styleSheet);

		// Print
		window.print();

		// Remove styles after printing
		setTimeout(() => {
			document.head.removeChild(styleSheet);
		}, 1000);
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
					<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Package className="w-4 h-4" />
							<span>Order #{order.orderNumber}</span>
						</div>
						<div className="flex items-center gap-1">
							<Calendar className="w-4 h-4" />
							<span>{new Date(order.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Order Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Order Status Timeline */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Truck className="w-5 h-5" />
									Order Status
								</CardTitle>
							</CardHeader>
							<CardContent>
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
								<div className="mt-4 p-3 bg-blue-50 rounded-lg">
									<p className="text-sm text-blue-700">
										<strong>Expected Delivery:</strong> 3-5 business days
									</p>
									{order.deliveryAddress?.deliverySlot && (
										<p className="text-sm text-blue-700">
											<strong>Delivery Slot:</strong>{" "}
											{order.deliveryAddress.deliverySlot}
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
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Payment Method</span>
										<span className="capitalize">{order.paymentMethod}</span>
									</div>
									<div className="flex justify-between">
										<span>Payment Status</span>
										<span className="capitalize text-green-600">
											{order.paymentStatus || "Pending"}
										</span>
									</div>
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
