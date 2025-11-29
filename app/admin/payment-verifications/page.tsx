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
import { Check, Clock, Eye, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
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
		verificationOTP?: string;
		verificationOTPGeneratedAt?: string;
		verificationOTPVerified?: boolean;
		verificationOTPVerifiedAt?: string;
		verifiedBy?: {
			_id: string;
			name: string;
			email: string;
		};
		verifiedAt?: string;
		amount?: number;
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
	const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [rejectionNotes, setRejectionNotes] = useState("");
	const [processing, setProcessing] = useState(false);
	const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

	useEffect(() => {
		fetchPendingPayments();
		fetchPaymentHistory();
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

	const fetchPaymentHistory = async () => {
		try {
			const response = await api.get("/orders/payment-verification-history");
			setHistoryOrders(response.data.orders || []);
		} catch (error) {
			console.error("Failed to fetch payment history:", error);
		}
	};

	const handleVerifyPayment = async (orderId: string, order: Order) => {
		// Check if this is new flow (UPI with verification OTP)
		const isNewFlow =
			order.paymentMethod === "upi" && order.paymentDetails?.verificationOTP;

		if (isNewFlow) {
			if (
				!confirm(
					"Are you sure you want to approve this payment? The delivery agent will receive the OTP to complete verification."
				)
			)
				return;
		} else {
			if (!confirm("Are you sure you want to verify and approve this payment?"))
				return;
		}

		setProcessing(true);
		try {
			if (isNewFlow) {
				// New flow - approve payment verification
				const response = await api.post(`/orders/${orderId}/approve-payment`, {
					approved: true,
				});
				alert(
					`Payment approved! OTP: ${response.data.otp}\n\nDelivery agent can now enter this OTP to complete verification.`
				);
			} else {
				// Old flow - direct verification
				await api.post(`/orders/${orderId}/verify-payment`, {
					approved: true,
				});
				alert("Payment verified successfully!");
			}
			fetchPendingPayments();
			fetchPaymentHistory();
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
			// Check if this is new flow (UPI with verification OTP)
			const isNewFlow =
				selectedOrder.paymentMethod === "upi" &&
				selectedOrder.paymentDetails?.verificationOTP;

			if (isNewFlow) {
				// New flow - reject payment approval
				await api.post(`/orders/${selectedOrder._id}/approve-payment`, {
					approved: false,
					notes: rejectionNotes.trim(),
				});
				alert("Payment verification rejected");
			} else {
				// Old flow - reject and cancel order
				await api.post(`/orders/${selectedOrder._id}/verify-payment`, {
					approved: false,
					notes: rejectionNotes.trim(),
				});
				alert("Payment rejected and order cancelled");
			}
			setShowRejectDialog(false);
			setRejectionNotes("");
			setSelectedOrder(null);
			fetchPendingPayments();
			fetchPaymentHistory();
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

	const getStatusBadge = (order: Order) => {
		if (order.paymentStatus === "completed") {
			return (
				<Badge className="bg-green-100 text-green-800">✅ Completed</Badge>
			);
		} else if (order.paymentStatus === "failed") {
			return <Badge className="bg-red-100 text-red-800">❌ Rejected</Badge>;
		} else if (
			order.paymentDetails?.verificationOTP &&
			order.paymentDetails?.verifiedBy
		) {
			return (
				<Badge className="bg-blue-100 text-blue-800">
					⏳ Approved (Awaiting OTP)
				</Badge>
			);
		} else {
			return (
				<Badge className="bg-yellow-100 text-yellow-800">
					<Clock className="w-3 h-3 mr-1" />
					Pending
				</Badge>
			);
		}
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

				{/* Tabs */}
				<div className="mb-6 border-b border-gray-200">
					<div className="flex gap-4">
						<button
							onClick={() => setActiveTab("pending")}
							className={`pb-3 px-4 font-medium transition-colors ${
								activeTab === "pending"
									? "border-b-2 border-blue-600 text-blue-600"
									: "text-gray-600 hover:text-gray-900"
							}`}>
							Pending ({orders.length})
						</button>
						<button
							onClick={() => setActiveTab("history")}
							className={`pb-3 px-4 font-medium transition-colors ${
								activeTab === "history"
									? "border-b-2 border-blue-600 text-blue-600"
									: "text-gray-600 hover:text-gray-900"
							}`}>
							History ({historyOrders.length})
						</button>
					</div>
				</div>

				{/* Pending Tab */}
				{activeTab === "pending" && (
					<>
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
																₹
																{(
																	order.paymentDetails?.amount ||
																	order.grandTotal
																).toLocaleString()}
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
															<p className="text-xs text-gray-600">
																Payment Method
															</p>
															<p className="font-medium uppercase">
																{order.paymentMethod}
															</p>
														</div>
													</div>
													{order.paymentDetails?.verificationOTP && (
														<div className="mt-3 pt-3 border-t border-blue-200">
															<div className="bg-yellow-100 border border-yellow-300 rounded-md p-3">
																<p className="text-xs text-yellow-800 font-medium mb-2">
																	🔐 Verification OTP (Share with delivery agent
																	after approval)
																</p>
																<p className="text-2xl font-bold text-center tracking-widest font-mono text-yellow-900">
																	{order.paymentDetails.verificationOTP}
																</p>
																<p className="text-xs text-yellow-700 text-center mt-2">
																	Generated:{" "}
																	{new Date(
																		order.paymentDetails.verificationOTPGeneratedAt!
																	).toLocaleString()}
																</p>
															</div>
														</div>
													)}
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
													<p className="text-xs text-gray-600">
														Delivery Address
													</p>
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
														onClick={() =>
															handleVerifyPayment(order._id, order)
														}
														disabled={processing}
														className="flex-1 bg-green-600 hover:bg-green-700">
														<Check className="w-4 h-4 mr-2" />
														{order.paymentDetails?.verificationOTP
															? "Approve Payment (Agent will enter OTP)"
															: "Verify & Approve Payment"}
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
					</>
				)}

				{/* History Tab */}
				{activeTab === "history" && (
					<>
						{historyOrders.length === 0 ? (
							<Card>
								<CardContent className="py-12 text-center">
									<Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										No Payment History
									</h3>
									<p className="text-gray-600">
										Payment verification history will appear here
									</p>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-4">
								{historyOrders.map((order) => (
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
												<div className="flex justify-center items-center gap-4">
													<Link href={`/admin/orders/${order._id}`}>
														<Button variant="outline" size="sm">
															<Eye className="w-4 h-4 mr-2" />
															View Details
														</Button>
													</Link>
													{getStatusBadge(order)}
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												{/* Payment Details */}
												<div className="bg-gray-50 p-4 rounded-lg">
													<h4 className="font-semibold text-sm mb-3">
														Payment Information
													</h4>
													<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
														<div>
															<p className="text-xs text-gray-600">Amount</p>
															<p className="text-lg font-bold text-green-600">
																₹
																{(
																	order.paymentDetails?.amount ||
																	order.grandTotal
																).toLocaleString()}
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
															<p className="text-xs text-gray-600">
																Payment Method
															</p>
															<p className="font-medium uppercase">
																{order.paymentMethod}
															</p>
														</div>
														<div>
															<p className="text-xs text-gray-600">Status</p>
															<p className="font-medium capitalize">
																{order.paymentStatus}
															</p>
														</div>
													</div>

													{/* Verification Details */}
													{order.paymentDetails?.verificationOTP && (
														<div className="mt-3 pt-3 border-t">
															<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
																<div>
																	<p className="text-xs text-gray-600">
																		Verification OTP
																	</p>
																	<p className="font-mono font-bold text-lg">
																		{order.paymentDetails.verificationOTP}
																	</p>
																</div>
																{order.paymentDetails.verifiedBy && (
																	<div>
																		<p className="text-xs text-gray-600">
																			Verified By
																		</p>
																		<p className="font-medium">
																			{order.paymentDetails.verifiedBy.name ||
																				"Admin"}
																		</p>
																		{order.paymentDetails.verifiedAt && (
																			<p className="text-xs text-gray-500">
																				{new Date(
																					order.paymentDetails.verifiedAt
																				).toLocaleString()}
																			</p>
																		)}
																	</div>
																)}
															</div>
															{order.paymentDetails.verificationOTPVerified && (
																<div className="mt-2">
																	<p className="text-xs text-green-600 font-medium">
																		✅ OTP Verified on{" "}
																		{new Date(
																			order.paymentDetails.verificationOTPVerifiedAt!
																		).toLocaleString()}
																	</p>
																</div>
															)}
														</div>
													)}
												</div>

												{/* Order Summary */}
												<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
													<div>
														<p className="text-xs text-gray-600">Order Date</p>
														<p className="font-medium">
															{new Date(order.createdAt).toLocaleDateString()}
														</p>
													</div>
													<div>
														<p className="text-xs text-gray-600">Items</p>
														<p className="font-medium">{order.items.length}</p>
													</div>
													<div>
														<p className="text-xs text-gray-600">
															Order Status
														</p>
														<p className="font-medium capitalize">
															{order.orderStatus}
														</p>
													</div>
													<div>
														<p className="text-xs text-gray-600">Total</p>
														<p className="font-bold text-green-600">
															₹{order.grandTotal.toLocaleString()}
														</p>
													</div>
												</div>

												{/* Customer Info */}
												<div className="bg-blue-50 p-3 rounded-lg">
													<p className="text-xs text-gray-600 mb-1">Customer</p>
													<p className="font-medium">
														{order.user.shopName || order.user.name}
													</p>
													<p className="text-sm text-gray-600">
														{order.user.phone} • {order.user.email}
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</>
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
