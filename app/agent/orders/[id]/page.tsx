"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
	ArrowLeft,
	CheckCircle,
	MapPin,
	Package,
	Phone,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

export default function AgentOrderDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const { user } = useAuth();
	const [order, setOrder] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [otp, setOtp] = useState("");
	const [verifying, setVerifying] = useState(false);
	const [showQRCode, setShowQRCode] = useState(false);
	const [transactionId, setTransactionId] = useState("");
	const [verifyingPayment, setVerifyingPayment] = useState(false);
	const [cashReceived, setCashReceived] = useState(false);
	const qrRef = useRef<HTMLCanvasElement>(null);

	// Determine agent type
	const userTypeField = user?.userType || user?.userTypes;
	const isSalesAgent = userTypeField === "sales_executive";
	const isDeliveryAgent = userTypeField === "delivery";

	const handleCallCustomer = (phoneNumber: string) => {
		if (!phoneNumber) {
			toast({
				title: "Error",
				description: "Phone number not available",
				variant: "destructive",
			});
			return;
		}
		window.location.href = `tel:${phoneNumber}`;
	};

	useEffect(() => {
		fetchOrder();
	}, [params.id]);

	useEffect(() => {
		// Business settings loaded from user context
	}, [user]);

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

	const handleVerifyOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setVerifying(true);

		try {
			const response = await api.post(
				`/orders/${params.id}/verify-delivery-otp`,
				{
					otp,
					cashReceived: cashReceived,
				}
			);

			if (!response.data.success) {
				toast({
					title: "Error",
					description: response.data.message || "Invalid OTP",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Success",
				description: "Order delivered successfully",
			});

			router.push("/agent/orders");
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to verify OTP",
				variant: "destructive",
			});
		} finally {
			setVerifying(false);
		}
	};

	const handleVerifyPayment = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!transactionId.trim()) {
			toast({
				title: "Error",
				description: "Please enter transaction ID",
				variant: "destructive",
			});
			return;
		}

		setVerifyingPayment(true);

		try {
			const response = await api.post(`/orders/${params.id}/verify-payment`, {
				transactionId: transactionId.trim(),
				paymentMethod: "upi",
				amount:
					order.balanceAmount > 0
						? order.balanceAmount
						: order.grandTotal || order.total,
			});

			toast({
				title: "Success",
				description: "Payment verified successfully",
			});

			// Refresh order data
			fetchOrder();
			setTransactionId("");
			setShowQRCode(false);
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to verify payment",
				variant: "destructive",
			});
		} finally {
			setVerifyingPayment(false);
		}
	};

	if (loading) {
		return <div className="text-center py-12">Loading...</div>;
	}

	if (!order) {
		return <div className="text-center py-12">Order not found</div>;
	}

	return (
		<div className="space-y-6">
			{/* Back Button */}
			<Link
				href="/agent/orders"
				className="flex items-center gap-2 text-primary hover:underline">
				<ArrowLeft className="w-4 h-4" />
				Back to Orders
			</Link>

			<h2 className="text-3xl font-bold">Order {order.orderNumber}</h2>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Order Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Customer Info */}
					<Card>
						<CardHeader>
							<CardTitle>Customer Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Name</p>
								<p className="font-semibold">
									{order.user?.firstName && order.user?.lastName
										? `${order.user.firstName} ${order.user.lastName}`
										: order.user?.name || order.user?.shopName}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-semibold">{order.user?.phone}</p>
								</div>
							</div>
							{order.user?.email && (
								<div>
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-semibold">{order.user?.email}</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Delivery Address - Show for all agents */}
					{order.deliveryAddress && (
						<Card>
							<CardHeader>
								<CardTitle>Delivery Address</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-start gap-3">
									<MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
									<div>
										<p className="font-semibold">
											{order.deliveryAddress?.street}
										</p>
										<p className="text-muted-foreground">
											{order.deliveryAddress?.city},{" "}
											{order.deliveryAddress?.state}
										</p>
										<p className="text-muted-foreground">
											Pincode: {order.deliveryAddress?.pincode}
										</p>
										{order.deliveryAddress?.landmark && (
											<p className="text-sm text-muted-foreground mt-1">
												Landmark: {order.deliveryAddress.landmark}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Order Items */}
					<Card>
						<CardHeader>
							<CardTitle>Order Items</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{order.items?.map((item: any, idx: number) => (
									<div
										key={idx}
										className="flex justify-between pb-4 border-b last:border-0">
										<div>
											<p className="font-semibold">{item.product?.name}</p>
											<p className="text-sm text-muted-foreground">
												{item.variantName}
											</p>
											{isSalesAgent && item.packSize && (
												<p className="text-xs text-muted-foreground">
													Pack Size: {item.packSize} {item.packType}
												</p>
											)}
										</div>
										<div className="text-right">
											<p className="font-semibold">
												₹{item.total || item.subtotal}
											</p>
											<p className="text-sm text-muted-foreground">
												Qty: {item.quantity}
											</p>
											{item.unitPrice && (
												<p className="text-xs text-muted-foreground">
													@ ₹{item.unitPrice}/unit
												</p>
											)}
										</div>
									</div>
								))}

								{/* Order Summary */}
								<div className="space-y-2 pt-4 border-t">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Subtotal:</span>
										<span>₹{order.itemsSubtotal || order.subtotal}</span>
									</div>
									{order.shippingCost > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Shipping:</span>
											<span>₹{order.shippingCost}</span>
										</div>
									)}
									{order.packingCharges > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Packing:</span>
											<span>₹{order.packingCharges}</span>
										</div>
									)}
									<div className="flex justify-between font-bold text-lg border-t pt-2">
										<span>Total:</span>
										<span className="text-primary">
											₹{order.grandTotal || order.total}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Sales Agent - Additional Info */}
					{isSalesAgent && (
						<Card>
							<CardHeader>
								<CardTitle>Payment & Status</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Payment Method:</span>
									<span className="font-semibold capitalize">
										{order.paymentMethod}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Payment Status:</span>
									<span
										className={`font-semibold capitalize ${
											order.paymentStatus === "completed"
												? "text-green-600"
												: order.paymentStatus === "pending"
												? "text-yellow-600"
												: "text-red-600"
										}`}>
										{order.paymentStatus}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Order Status:</span>
									<span className="font-semibold capitalize">
										{order.orderStatus}
									</span>
								</div>
								{order.advancePayment > 0 && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Advance Payment:
										</span>
										<span className="font-semibold text-green-600">
											₹{order.advancePayment}
										</span>
									</div>
								)}
								{order.balanceAmount > 0 && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Balance Due:</span>
										<span className="font-semibold text-orange-600">
											₹{order.balanceAmount}
										</span>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Sidebar */}
				<div className="space-y-6">
					{/* Delivery Agent - OTP Verification */}
					{isDeliveryAgent && (
						<>
							{/* Payment Information */}
							<Card>
								<CardHeader>
									<CardTitle>Payment Information</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											Payment Method:
										</span>
										<span className="font-semibold capitalize">
											{order.paymentMethod}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											Payment Status:
										</span>
										<span
											className={`font-semibold capitalize ${
												order.paymentStatus === "completed"
													? "text-green-600"
													: order.paymentStatus === "pending"
													? "text-yellow-600"
													: "text-red-600"
											}`}>
											{order.paymentStatus}
										</span>
									</div>
									<div className="flex justify-between items-center pt-2 border-t">
										<span className="text-sm text-muted-foreground">
											Total Amount:
										</span>
										<span className="text-lg font-bold text-primary">
											₹{order.grandTotal || order.total}
										</span>
									</div>
									{order.paymentMethod === "cod" &&
										order.paymentStatus !== "completed" && (
											<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
												<p className="text-xs text-yellow-800 font-medium">
													⚠️ Collect ₹{order.grandTotal || order.total} cash
													from customer
												</p>
											</div>
										)}
									{order.advancePayment > 0 && (
										<>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">
													Advance Paid:
												</span>
												<span className="font-semibold text-green-600">
													₹{order.advancePayment}
												</span>
											</div>
											{order.balanceAmount > 0 && (
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">
														Balance Due:
													</span>
													<span className="font-semibold text-orange-600">
														₹{order.balanceAmount}
													</span>
												</div>
											)}
										</>
									)}
									{/* Dynamic QR Code for Online Payment */}
									{order.paymentStatus !== "completed" &&
										user?.businessSettings?.bankDetails?.upiId && (
											<div className="pt-3 border-t">
												<Button
													variant="outline"
													size="sm"
													className="w-full"
													onClick={() => setShowQRCode(!showQRCode)}>
													{showQRCode
														? "Hide Payment QR"
														: "Show Payment QR Code"}
												</Button>
												{showQRCode && (
													<div className="mt-3 space-y-4">
														{/* QR Code Canvas */}
														<div className="flex justify-center p-4 bg-white rounded-lg border-2 border-gray-200">
															<QRCodeCanvas
																ref={qrRef}
																value={`upi://pay?pa=${
																	user.businessSettings.bankDetails.upiId
																}&pn=${
																	user.businessSettings.businessName ||
																	"Merchant"
																}&am=${
																	order.balanceAmount > 0
																		? order.balanceAmount
																		: order.grandTotal || order.total
																}&cu=INR&tn=Order%20${
																	order.orderNumber || params.id
																}`}
																size={200}
																level="H"
																includeMargin={true}
															/>
														</div>

														{/* Payment Details */}
														<div className="text-center space-y-2">
															<p className="text-xs text-muted-foreground">
																UPI ID:{" "}
																{user.businessSettings.bankDetails.upiId}
															</p>
															<p className="text-lg font-bold text-green-600">
																Amount: ₹
																{order.balanceAmount > 0
																	? order.balanceAmount
																	: order.grandTotal || order.total}
															</p>
															<p className="text-xs text-muted-foreground">
																Order: {order.orderNumber || params.id}
															</p>
															<p className="text-xs text-orange-600 font-medium">
																⚡ Amount will be auto-filled when scanned
															</p>
														</div>

														{/* Payment Verification Form */}
														<form
															onSubmit={handleVerifyPayment}
															className="space-y-3 pt-3 border-t">
															<div className="space-y-2">
																<Label
																	htmlFor="transactionId"
																	className="text-sm font-semibold">
																	Verify Payment
																</Label>
																<Input
																	id="transactionId"
																	placeholder="Enter UPI Transaction ID"
																	value={transactionId}
																	onChange={(e) =>
																		setTransactionId(e.target.value)
																	}
																	disabled={verifyingPayment}
																	className="text-sm"
																/>
																<p className="text-xs text-muted-foreground">
																	Ask customer for transaction ID after payment
																</p>
															</div>
															<Button
																type="submit"
																disabled={
																	verifyingPayment || !transactionId.trim()
																}
																className="w-full"
																size="sm">
																{verifyingPayment ? (
																	<>
																		<CheckCircle className="w-4 h-4 mr-2 animate-spin" />
																		Verifying...
																	</>
																) : (
																	<>
																		<CheckCircle className="w-4 h-4 mr-2" />
																		Verify Payment
																	</>
																)}
															</Button>
														</form>
													</div>
												)}
											</div>
										)}
								</CardContent>
							</Card>

							{/* OTP Verification */}
							<Card className="sticky top-20">
								<CardHeader>
									<CardTitle>Delivery Verification</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{order.orderStatus === "delivered" ? (
										<div className="text-center py-6">
											<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
											<p className="font-semibold">Delivered</p>
											<p className="text-sm text-muted-foreground">
												{new Date(order.updatedAt).toLocaleString()}
											</p>
										</div>
									) : (
										<form onSubmit={handleVerifyOTP} className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="otp">Customer OTP</Label>
												<Input
													id="otp"
													type="text"
													placeholder="Enter 6-digit OTP"
													value={otp}
													onChange={(e) => setOtp(e.target.value)}
													maxLength={6}
													required
												/>
												<p className="text-xs text-muted-foreground">
													Ask customer for the OTP sent to their phone
												</p>
											</div>

											{/* Cash Received Checkbox for COD */}
											{order.paymentMethod === "cod" &&
												order.paymentStatus !== "completed" && (
													<div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
														<Checkbox
															id="cashReceived"
															checked={cashReceived}
															onCheckedChange={(checked) =>
																setCashReceived(checked as boolean)
															}
														/>
														<Label
															htmlFor="cashReceived"
															className="text-sm font-medium cursor-pointer">
															💰 Cash payment received (₹
															{order.balanceAmount > 0
																? order.balanceAmount
																: order.grandTotal || order.total}
															)
														</Label>
													</div>
												)}

											<Button
												type="submit"
												className="w-full"
												disabled={verifying}>
												{verifying ? "Verifying..." : "Mark as Delivered"}
											</Button>
										</form>
									)}
								</CardContent>
							</Card>
						</>
					)}

					{/* Sales Agent - Quick Actions */}
					{isSalesAgent && (
						<Card className="sticky top-20">
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={() => handleCallCustomer(order.user?.phone)}>
									<Phone className="w-4 h-4 mr-2" />
									Call Customer
								</Button>
								{order.user?.alternatePhone && (
									<Button
										variant="outline"
										className="w-full justify-start"
										onClick={() =>
											handleCallCustomer(order.user?.alternatePhone)
										}>
										<Phone className="w-4 h-4 mr-2" />
										Call Alternate
									</Button>
								)}
								<Button variant="outline" className="w-full justify-start">
									<Package className="w-4 h-4 mr-2" />
									Track Shipment
								</Button>
								<Button variant="outline" className="w-full justify-start">
									<TrendingUp className="w-4 h-4 mr-2" />
									View Analytics
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Order Timeline */}
					<Card>
						<CardHeader>
							<CardTitle>Order Timeline</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{order.statusHistory?.map((history: any, idx: number) => (
									<div key={idx} className="relative pl-6 pb-4 last:pb-0">
										<div className="absolute left-0 top-1 w-3 h-3 bg-primary rounded-full" />
										{idx < order.statusHistory.length - 1 && (
											<div className="absolute left-1.5 top-4 bottom-0 w-0.5 bg-border" />
										)}
										<div>
											<p className="font-semibold capitalize text-sm">
												{history.status.replace(/_/g, " ")}
											</p>
											<p className="text-xs text-muted-foreground">
												{new Date(history.timestamp).toLocaleString()}
											</p>
											{history.notes && (
												<p className="text-xs text-muted-foreground mt-1">
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
			</div>
		</div>
	);
}
