"use client";

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
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { Check, Clock, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderItem {
	product: {
		_id: string;
		name: string;
	};
	variantName: string;
	quantity: number;
	unitPrice: number;
	total: number;
}

interface Order {
	_id: string;
	orderNumber: string;
	user: {
		_id: string;
		shopName: string;
		name: string;
		phone: string;
		email: string;
	};
	items: OrderItem[];
	grandTotal: number;
	paymentMethod: string;
	paymentStatus: string;
	paymentDetails: {
		transactionId: string;
		bankingName: string;
	};
	orderStatus: string;
	createdAt: string;
	deliveryAddress: {
		street?: string;
		city?: string;
		state?: string;
		pincode?: string;
	};
}

export default function PaymentVerificationsPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [rejectionNotes, setRejectionNotes] = useState("");
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		fetchPendingPayments();
	}, []);

	const fetchPendingPayments = async () => {
		setLoading(true);
		try {
			const response = await api.get("/orders/pending-payment-verification");
			setOrders(response.data.orders || []);
		} catch (error) {
			console.error("Failed to fetch pending payments:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyPayment = async (orderId: string) => {
		if (!confirm("Are you sure you want to verify and approve this payment?"))
			return;

		setProcessing(true);
		try {
			await api.post(`/orders/${orderId}/verify-payment`, {
				approved: true,
			});
			alert("Payment verified successfully!");
			fetchPendingPayments();
		} catch (error: any) {
			alert(error.response?.data?.message || "Failed to verify payment");
		} finally {
			setProcessing(false);
		}
	};

	const handleRejectPayment = async () => {
		if (!selectedOrder) return;
		if (!rejectionNotes.trim()) {
			alert("Please provide a reason for rejection");
			return;
		}

		setProcessing(true);
		try {
			await api.post(`/orders/${selectedOrder._id}/verify-payment`, {
				approved: false,
				notes: rejectionNotes.trim(),
			});
			alert("Payment rejected and order cancelled");
			setShowRejectDialog(false);
			setRejectionNotes("");
			setSelectedOrder(null);
			fetchPendingPayments();
		} catch (error: any) {
			alert(error.response?.data?.message || "Failed to reject payment");
		} finally {
			setProcessing(false);
		}
	};

	const openRejectDialog = (order: Order) => {
		setSelectedOrder(order);
		setShowRejectDialog(true);
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900">
						Payment Verifications
					</h1>
					<p className="text-gray-600 mt-2">
						Review and verify online payment transactions for orders
					</p>
				</div>

				{loading ? (
					<Card>
						<CardContent className="py-12 text-center">
							<p className="text-gray-600">Loading...</p>
						</CardContent>
					</Card>
				) : orders.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center">
							<Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No Pending Payments
							</h3>
							<p className="text-gray-600">
								All online payments have been verified
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{orders.map((order) => (
							<Card key={order._id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<CardTitle className="text-lg flex items-center gap-2">
												<ShoppingCart className="w-5 h-5" />
												Order #{order.orderNumber}
											</CardTitle>
											<p className="text-sm text-gray-600">
												{order.user.shopName || order.user.name} •{" "}
												{order.user.phone}
											</p>
										</div>
										<Badge
											variant="secondary"
											className="bg-yellow-100 text-yellow-800">
											<Clock className="w-3 h-3 mr-1" />
											Pending Verification
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Payment Details */}
										<div className="bg-blue-50 p-4 rounded-lg">
											<h4 className="font-semibold text-sm mb-3 text-blue-900">
												Payment Information
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
												<div>
													<p className="text-xs text-gray-600">Amount</p>
													<p className="text-lg font-bold text-green-600">
														₹{order.grandTotal.toLocaleString()}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-600">
														Transaction ID
													</p>
													<p className="font-medium font-mono text-sm">
														{order.paymentDetails.transactionId}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-600">Paid By</p>
													<p className="font-medium">
														{order.paymentDetails.bankingName}
													</p>
												</div>
											</div>
										</div>

										{/* Order Items */}
										<div>
											<h4 className="font-semibold text-sm mb-2">
												Order Items ({order.items.length})
											</h4>
											<div className="space-y-2">
												{order.items.slice(0, 3).map((item, index) => (
													<div
														key={index}
														className="flex justify-between text-sm border-b pb-2">
														<span>
															{item.product.name} - {item.variantName} x{" "}
															{item.quantity}
														</span>
														<span className="font-medium">
															₹{item.total.toLocaleString()}
														</span>
													</div>
												))}
												{order.items.length > 3 && (
													<p className="text-xs text-gray-500">
														+ {order.items.length - 3} more items
													</p>
												)}
											</div>
										</div>

										{/* Delivery Address */}
										<div>
											<p className="text-xs text-gray-600">Delivery Address</p>
											<p className="text-sm">
												{[
													order.deliveryAddress.street,
													order.deliveryAddress.city,
													order.deliveryAddress.state,
													order.deliveryAddress.pincode,
												]
													.filter(Boolean)
													.join(", ")}
											</p>
										</div>

										{/* Order Date */}
										<div>
											<p className="text-xs text-gray-600">Order Date</p>
											<p className="text-sm">
												{new Date(order.createdAt).toLocaleString()}
											</p>
										</div>

										{/* Action Buttons */}
										<div className="flex gap-3 pt-4 border-t">
											<Button
												onClick={() => handleVerifyPayment(order._id)}
												disabled={processing}
												className="flex-1 bg-green-600 hover:bg-green-700">
												<Check className="w-4 h-4 mr-2" />
												Verify & Approve Payment
											</Button>
											<Button
												onClick={() => openRejectDialog(order)}
												disabled={processing}
												variant="destructive"
												className="flex-1">
												<X className="w-4 h-4 mr-2" />
												Reject Payment
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Reject Dialog */}
			<Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Payment</DialogTitle>
						<DialogDescription>
							This will cancel the order and restore inventory. Please provide a
							reason for rejection.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div>
							<Label htmlFor="rejectionNotes">Rejection Reason</Label>
							<Input
								id="rejectionNotes"
								value={rejectionNotes}
								onChange={(e) => setRejectionNotes(e.target.value)}
								placeholder="e.g., Payment not received, Invalid transaction ID"
								className="mt-2"
							/>
						</div>
						{selectedOrder && (
							<div className="bg-red-50 p-3 rounded text-sm">
								<p className="font-medium text-red-900">Warning:</p>
								<p className="text-red-700">
									Order #{selectedOrder.orderNumber} will be cancelled and
									inventory will be restored.
								</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowRejectDialog(false);
								setRejectionNotes("");
								setSelectedOrder(null);
							}}
							disabled={processing}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRejectPayment}
							disabled={processing || !rejectionNotes.trim()}>
							Reject Payment & Cancel Order
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
