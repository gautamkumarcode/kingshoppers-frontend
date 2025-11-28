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
	const [paymentOTP, setPaymentOTP] = useState("");
	const [paymentOTPSubmitted, setPaymentOTPSubmitted] = useState(false);
	const [verifyingPaymentOTP, setVerifyingPaymentOTP] = useState(false);
	const [cashReceived, setCashReceived] = useState(false);
	const [generatingOTP, setGeneratingOTP] = useState(false);
	const [otpGenerated, setOtpGenerated] = useState(false);
	const qrRef = useRef<HTMLCanvasElement>(null);

	// Determine agent type
	const userTypeField = user?.userType || user?.userTypes;
	const isSalesAgent = userTypeField === "sales_executive";
	const isDeliveryAgent = userTypeField === "delivery";

	// Debug logging
	useEffect(() => {
		console.log("=== Order Detail Page Debug ===");
		console.log("User:", user);
		console.log("User Type Field:", userTypeField);
		console.log("Is Sales Agent:", isSalesAgent);
		console.log("Is Delivery Agent:", isDeliveryAgent);
		console.log("Order:", order);
		console.log("Delivery Address:", order?.deliveryAddress);
	}, [user, userTypeField, isSalesAgent, isDeliveryAgent, order]);

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

	const handleNavigate = () => {
		if (!order?.deliveryAddress) {
			toast({
				title: "Error",
				description: "Delivery address not available",
				variant: "destructive",
			});
			return;
		}

		const addr = order.deliveryAddress;
		let mapsUrl;

		// Check if customer has stored coordinates in shopAddress
		if (
			order.user?.shopAddress?.location?.coordinates &&
			order.user.shopAddress.location.coordinates.length === 2
		) {
			// Use exact coordinates from customer's shop location
			const [lng, lat] = order.user.shopAddress.location.coordinates;
			mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
			console.log("=== Navigation with Coordinates ===");
			console.log("Using stored coordinates:", lat, lng);
		} else {
			// Fallback to address string
			const addressParts = [];
			if (addr.street) addressParts.push(addr.street);
			if (addr.city) addressParts.push(addr.city);
			if (addr.state) addressParts.push(addr.state);
			if (addr.pincode) addressParts.push(addr.pincode);

			const destination = addressParts.join(", ");
			mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
				destination
			)}`;
			console.log("=== Navigation with Address ===");
			console.log("Using address string:", destination);
		}

		console.log("Maps URL:", mapsUrl);
		window.open(mapsUrl, "_blank");
	};

	useEffect(() => {
		fetchOrder();
	}, [params.id]);

	useEffect(() => {
		// Check if payment verification OTP is already submitted
		if (
			order?.paymentDetails?.verificationOTP &&
			!order?.paymentDetails?.verificationOTPVerified
		) {
			setPaymentOTPSubmitted(true);
		}
	}, [order]);

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

	const handleGenerateOTP = async () => {
		setGeneratingOTP(true);

		try {
			const response = await api.post(
				`/orders/${params.id}/generate-delivery-otp`
			);

			if (response.data.success) {
				toast({
					title: "OTP Sent! 📱",
					description: `OTP has been sent to customer's phone`,
				});
				setOtpGenerated(true);
				// Refresh order data
				fetchOrder();
			} else {
				toast({
					title: "Error",
					description: response.data.message || "Failed to generate OTP",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to generate OTP",
				variant: "destructive",
			});
		} finally {
			setGeneratingOTP(false);
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
				title: "Success! ✅",
				description: "Order delivered successfully",
			});

			// Wait a moment before redirecting
			setTimeout(() => {
				router.push("/agent/orders");
			}, 1500);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to verify OTP",
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
				amount:
					order.balanceAmount > 0
						? order.balanceAmount
						: order.grandTotal || order.total,
			});

			if (response.data.success) {
				toast({
					title: "Success! 📱",
					description:
						"Payment verification OTP generated. Please wait for admin approval.",
				});

				// Mark that OTP has been submitted
				setPaymentOTPSubmitted(true);

				// Refresh order data
				fetchOrder();
			}
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

	const handleVerifyPaymentOTP = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!paymentOTP.trim() || paymentOTP.length !== 6) {
			toast({
				title: "Error",
				description: "Please enter valid 6-digit OTP",
				variant: "destructive",
			});
			return;
		}

		setVerifyingPaymentOTP(true);

		try {
			const response = await api.post(`/orders/${params.id}/verify-payment`, {
				otp: paymentOTP.trim(),
			});

			if (response.data.success) {
				toast({
					title: "Success! ✅",
					description: "Payment verification completed successfully",
				});

				// Refresh order data
				fetchOrder();
				setPaymentOTP("");
				setPaymentOTPSubmitted(false);
				setTransactionId("");
				setShowQRCode(false);
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to verify payment OTP",
				variant: "destructive",
			});
		} finally {
			setVerifyingPaymentOTP(false);
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
							<CardContent className="space-y-4">
								<div className="flex items-start gap-3">
									<MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
									<div className="flex-1">
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
								{/* Navigate Button for Delivery Agents */}
								{isDeliveryAgent && order.orderStatus !== "delivered" && (
									<Button className="w-full" onClick={handleNavigate}>
										<MapPin className="w-4 h-4 mr-2" />
										Navigate to Customer
									</Button>
								)}
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
														{!paymentOTPSubmitted ? (
															<form
																onSubmit={handleVerifyPayment}
																className="space-y-3 pt-3 border-t">
																<div className="space-y-2">
																	<Label
																		htmlFor="transactionId"
																		className="text-sm font-semibold">
																		Step 1: Submit Transaction ID
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
																		Ask customer for transaction ID after
																		payment
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
																			Submitting...
																		</>
																	) : (
																		<>
																			<CheckCircle className="w-4 h-4 mr-2" />
																			Submit for Verification
																		</>
																	)}
																</Button>
															</form>
														) : (
															<form
																onSubmit={handleVerifyPaymentOTP}
																className="space-y-3 pt-3 border-t">
																<div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
																	<p className="text-xs text-blue-800 font-medium text-center">
																		⏳ Waiting for admin approval...
																	</p>
																</div>
																<div className="space-y-2">
																	<Label
																		htmlFor="paymentOTP"
																		className="text-sm font-semibold">
																		Step 2: Enter Verification OTP
																	</Label>
																	<Input
																		id="paymentOTP"
																		type="text"
																		placeholder="Enter 6-digit OTP"
																		value={paymentOTP}
																		onChange={(e) =>
																			setPaymentOTP(e.target.value)
																		}
																		maxLength={6}
																		disabled={verifyingPaymentOTP}
																		className="text-center text-xl tracking-widest font-mono"
																	/>
																	<p className="text-xs text-muted-foreground">
																		Enter OTP after admin approves the payment
																	</p>
																</div>
																<Button
																	type="submit"
																	disabled={
																		verifyingPaymentOTP ||
																		paymentOTP.length !== 6
																	}
																	className="w-full"
																	size="sm">
																	{verifyingPaymentOTP ? (
																		<>
																			<CheckCircle className="w-4 h-4 mr-2 animate-spin" />
																			Verifying OTP...
																		</>
																	) : (
																		<>
																			<CheckCircle className="w-4 h-4 mr-2" />
																			Complete Verification
																		</>
																	)}
																</Button>
																<Button
																	type="button"
																	variant="outline"
																	className="w-full"
																	size="sm"
																	onClick={() => {
																		setPaymentOTPSubmitted(false);
																		setPaymentOTP("");
																		setTransactionId("");
																	}}>
																	Cancel & Start Over
																</Button>
															</form>
														)}
													</div>
												)}
											</div>
										)}
								</CardContent>
							</Card>

							{/* OTP Verification */}
							<Card className="">
								<CardHeader>
									<CardTitle>Delivery Verification</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{order.orderStatus === "delivered" ? (
										<div className="text-center py-6">
											<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
											<p className="font-semibold text-lg">Delivered ✅</p>
											<p className="text-sm text-muted-foreground mt-2">
												{new Date(order.updatedAt).toLocaleString()}
											</p>
										</div>
									) : (
										<>
											{/* Step 1: Generate OTP */}
											{!otpGenerated && (
												<div className="space-y-3">
													<div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
														<p className="text-sm text-blue-800 font-medium mb-3">
															📍 Step 1: Generate OTP for customer
														</p>
														<Button
															onClick={handleGenerateOTP}
															disabled={generatingOTP}
															className="w-full"
															size="lg">
															{generatingOTP ? (
																<>
																	<Package className="w-4 h-4 mr-2 animate-spin" />
																	Generating OTP...
																</>
															) : (
																<>
																	<Package className="w-4 h-4 mr-2" />
																	Generate Delivery OTP
																</>
															)}
														</Button>
													</div>
													<p className="text-xs text-muted-foreground text-center">
														OTP will be sent to customer's phone:{" "}
														{order.user?.phone}
													</p>
												</div>
											)}

											{/* Step 2: Verify OTP */}
											{otpGenerated && (
												<form onSubmit={handleVerifyOTP} className="space-y-4">
													<div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
														<p className="text-xs text-green-800 font-medium text-center">
															✅ OTP sent to customer's phone
														</p>
													</div>

													<div className="space-y-2">
														<Label
															htmlFor="otp"
															className="text-base font-semibold">
															📱 Customer OTP
														</Label>
														<Input
															id="otp"
															type="text"
															placeholder="Enter 6-digit OTP"
															value={otp}
															onChange={(e) => setOtp(e.target.value)}
															maxLength={6}
															required
															className="text-center text-2xl tracking-widest font-mono"
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
														size="lg"
														disabled={verifying || otp.length !== 6}>
														{verifying ? (
															<>
																<CheckCircle className="w-4 h-4 mr-2 animate-spin" />
																Verifying...
															</>
														) : (
															<>
																<CheckCircle className="w-4 h-4 mr-2" />
																Complete Delivery
															</>
														)}
													</Button>

													<Button
														type="button"
														variant="outline"
														className="w-full"
														size="sm"
														onClick={handleGenerateOTP}
														disabled={generatingOTP}>
														Resend OTP
													</Button>
												</form>
											)}
										</>
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
