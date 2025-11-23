"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import api from "@/lib/api";
import { formatPrice } from "@/lib/cart-utils";
import { ArrowLeft, Check, Copy, Download, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

interface BusinessSettings {
	bankDetails?: {
		upiId?: string;
		accountNumber?: string;
		ifscCode?: string;
		bankName?: string;
		accountHolderName?: string;
	};
	businessName?: string;
}

export default function CheckoutPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { user, loading: authLoading, refreshUser } = useAuth();
	const { items: cart, isEmpty, clearCart, summary } = useCart();
	const [loading, setLoading] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [walletBalance, setWalletBalance] = useState(0);
	const [useWallet, setUseWallet] = useState(false);
	const [walletAmount, setWalletAmount] = useState<string>("");
	const [deliverySlot, setDeliverySlot] = useState("morning");
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const qrRef = useRef<HTMLDivElement>(null);
	const [showQR, setShowQR] = useState(false);
	const [upiUrl, setUpiUrl] = useState("");
	const [paymentReferenceId, setPaymentReferenceId] = useState("");
	const [bankingName, setBankingName] = useState("");
	const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(
		{}
	);

	useEffect(() => {
		if (authLoading) return;
		if (!user) {
			router.push("/auth/login");
			return;
		}

		if (isEmpty) {
			router.push("/cart");
			return;
		}

		// Fetch wallet balance and business settings
		fetchWalletBalance();
		fetchBusinessSettings();
	}, [router, authLoading, user, isEmpty]);

	const fetchWalletBalance = async () => {
		try {
			const response = await api.get("/wallet");
			setWalletBalance(response.data.balance || 0);
		} catch (error) {
			console.error("Failed to fetch wallet:", error);
		}
	};

	const fetchBusinessSettings = async () => {
		try {
			const response = await api.get("/business-settings");
			setBusinessSettings(response.data || {});
		} catch (error) {
			console.error("Failed to fetch business settings:", error);
		}
	};

	const generateQRCode = () => {
		const amt = summary.total;
		const vpa = businessSettings.bankDetails?.upiId || "business@upi";
		const name = businessSettings.businessName || "King Shoppers";
		const tn = "Order Payment";

		const params = new URLSearchParams({
			pa: vpa,
			pn: name,
			am: String(amt),
			cu: "INR",
			tn: tn,
		});

		const url = "upi://pay?" + params.toString();
		setUpiUrl(url);
		setShowQR(true);
		setShowPaymentModal(true);
	};

	const copyToClipboard = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 2000);
		} catch (error) {
			alert("Failed to copy");
		}
	};

	const downloadQRCode = () => {
		const canvas = qrRef.current?.querySelector("canvas");
		if (canvas) {
			const url = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.download = `order-payment-qr-${summary.total}.png`;
			link.href = url;
			link.click();
		}
	};

	const handlePlaceOrder = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate shop address exists
		if (!user?.shopAddress) {
			toast({
				title: "Error",
				description:
					"Please update your profile with a shop address before placing an order",
				variant: "destructive",
			});
			return;
		}

		// If online payment is selected and no payment reference, show payment modal
		if (paymentMethod === "online" && !paymentReferenceId && !useWallet) {
			generateQRCode();
			return;
		}

		setLoading(true);

		try {
			// Use summary from useCart hook which has proper calculations
			const subtotal = summary.subtotal;
			const tax = 0; // GST is included in prices
			let total = summary.total;

			// Apply wallet discount if using wallet
			const walletAmountNum = Number.parseFloat(walletAmount) || 0;
			if (useWallet && walletAmountNum > 0) {
				total = Math.max(0, total - walletAmountNum);
			}

			// Use the shop address as delivery address
			const deliveryAddress = {
				...user.shopAddress,
				deliverySlot: deliverySlot,
			};

			const orderData = {
				items: cart.map((item) => ({
					productId: item.productId,
					variantId: item.variantId,
					quantity: item.quantity,
				})),
				deliveryAddress,
				paymentMethod: useWallet
					? walletAmountNum >= summary.total
						? "wallet"
						: "cod"
					: paymentMethod,
				walletAdvance: useWallet ? walletAmountNum : 0,
				...(paymentMethod === "online" && paymentReferenceId
					? {
							paymentDetails: {
								transactionId: paymentReferenceId,
								bankingName: bankingName,
							},
					  }
					: {}),
			};

			console.log("Order data being sent:", orderData);

			const response = await api.post("/orders", orderData);

			console.log("Order response:", response);

			if (response.status !== 201) {
				console.error("Order creation failed:", response);
				toast({
					title: "Error",
					description: response.data?.message || "Failed to place order",
					variant: "destructive",
				});
				return;
			}

			const data = response.data;

			// If using wallet, process wallet payment
			if (useWallet && walletAmountNum > 0) {
				console.log("Processing wallet payment:", {
					amount: walletAmountNum,
					orderId: data.order._id,
				});
				try {
					const walletResponse = await api.post("/wallet/use-for-payment", {
						amount: walletAmountNum,
						orderId: data.order._id,
					});
					console.log("Wallet payment response:", walletResponse.data);
					// Refresh user to update wallet balance
					await refreshUser();
				} catch (walletError: any) {
					console.error("Wallet payment error:", walletError);
					throw new Error(
						walletError.response?.data?.message || "Wallet payment failed"
					);
				}
			}

			// Clear cart
			clearCart();

			// Close payment modal and reset payment fields
			setShowPaymentModal(false);
			setShowQR(false);
			setPaymentReferenceId("");
			setBankingName("");

			toast({
				title: "Success",
				description: "Order placed successfully",
			});

			// Redirect to order confirmation
			router.push(`/order-confirmation/${data.order._id}`);
		} catch (error: any) {
			console.error("Order placement error:", error);
			toast({
				title: "Error",
				description:
					error.response?.data?.message ||
					"An error occurred while placing the order",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	if (!user || cart.length === 0) {
		return <div className="text-center py-12">Loading...</div>;
	}

	// Use properly calculated summary from useCart hook
	const subtotal = summary.subtotal;
	const tax = 0; // GST is included in prices
	const walletAmountNum = Number.parseFloat(walletAmount) || 0;
	let total = summary.total;

	if (useWallet && walletAmountNum > 0) {
		total = Math.max(0, total - walletAmountNum);
	}

	return (
		<main className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link
					href="/cart"
					className="flex items-center gap-2 text-primary hover:underline mb-6">
					<ArrowLeft className="w-4 h-4" />
					Back to Cart
				</Link>

				<h1 className="text-4xl font-bold mb-8">Checkout</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Checkout Form */}
					<div className="lg:col-span-2 space-y-6">
						{/* Delivery Address */}
						<Card>
							<CardHeader>
								<CardTitle>Delivery Address</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Shop Address Display */}
								{user.shopAddress ? (
									<div className="p-4 border rounded-lg bg-muted/50">
										<Label className="text-base font-semibold mb-3 block">
											Delivery Address
										</Label>
										<div className="text-sm space-y-1">
											{user.shopAddress.street && (
												<div>
													<strong>Street:</strong> {user.shopAddress.street}
												</div>
											)}
											{user.shopAddress.area && (
												<div>
													<strong>Area:</strong> {user.shopAddress.area}
												</div>
											)}
											{user.shopAddress.landmark && (
												<div>
													<strong>Landmark:</strong> {user.shopAddress.landmark}
												</div>
											)}
											<div>
												<strong>Location:</strong>{" "}
												{[
													user.shopAddress.city,
													user.shopAddress.state,
													user.shopAddress.pincode,
												]
													.filter(Boolean)
													.join(", ")}
											</div>
										</div>
									</div>
								) : (
									<div className="p-4 border rounded-lg bg-red-50 text-red-700">
										<p className="text-sm">
											No shop address found. Please update your profile with
											your shop address.
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Delivery Slot */}
						<Card>
							<CardHeader>
								<CardTitle>Delivery Slot</CardTitle>
							</CardHeader>
							<CardContent>
								<RadioGroup
									value={deliverySlot}
									onValueChange={setDeliverySlot}>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="morning" id="morning" />
										<Label htmlFor="morning">Morning (6 AM - 12 PM)</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="afternoon" id="afternoon" />
										<Label htmlFor="afternoon">Afternoon (12 PM - 6 PM)</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="evening" id="evening" />
										<Label htmlFor="evening">Evening (6 PM - 10 PM)</Label>
									</div>
								</RadioGroup>
							</CardContent>
						</Card>

						{/* Payment Method */}
						<Card>
							<CardHeader>
								<CardTitle>Payment Method</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<RadioGroup
									value={paymentMethod}
									onValueChange={setPaymentMethod}
									disabled={useWallet}>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="cod" id="cod" />
										<Label htmlFor="cod">Cash on Delivery</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="online" id="online" />
										<Label htmlFor="online">Online Payment</Label>
									</div>
								</RadioGroup>

								{/* Wallet Payment */}
								<div className="border-t pt-4">
									<div className="flex items-center justify-between mb-3">
										<div>
											<p className="font-semibold">Use Wallet Balance</p>
											<p className="text-sm text-muted-foreground">
												Available: ₹{walletBalance}
											</p>
										</div>
										<input
											type="checkbox"
											checked={useWallet}
											onChange={(e) => {
												setUseWallet(e.target.checked);
												if (!e.target.checked) setWalletAmount("");
											}}
											className="w-4 h-4"
										/>
									</div>

									{useWallet && (
										<div className="space-y-2">
											<Label htmlFor="walletAmount">Amount to Use (₹)</Label>
											<Input
												id="walletAmount"
												type="number"
												value={walletAmount}
												onChange={(e) => {
													const value = e.target.value;
													if (value === "") {
														setWalletAmount("");
													} else {
														const numValue = Number.parseFloat(value) || 0;
														const cappedValue = Math.min(
															walletBalance,
															Math.max(0, numValue)
														);
														setWalletAmount(cappedValue.toString());
													}
												}}
												max={walletBalance}
												min={0}
												placeholder="Enter amount"
											/>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Order Summary */}
					<div>
						<Card className="sticky top-20">
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Items */}
								<div className="space-y-3 max-h-64 overflow-y-auto">
									{cart.map((item, index) => {
										const discountPercent =
											item.mrp > item.price
												? Math.round(((item.mrp - item.price) / item.mrp) * 100)
												: 0;

										return (
											<div
												key={index}
												className="flex flex-col gap-1 pb-2 border-b last:border-0">
												<div className="flex justify-between">
													<span className="text-sm font-medium">
														{item.name} x {item.quantity}
													</span>
													<span className="text-sm font-semibold">
														{formatPrice(item.price * item.quantity)}
													</span>
												</div>
												<div className="flex items-center gap-2 text-xs text-gray-500">
													<span>{item.variantName}</span>
													{discountPercent > 0 && (
														<>
															<span className="line-through">
																MRP: {formatPrice(item.mrp * item.quantity)}
															</span>
															<span className="text-green-600 font-medium">
																{discountPercent}% off
															</span>
														</>
													)}
												</div>
											</div>
										);
									})}
								</div>{" "}
								{/* Totals */}
								<div className="border-t pt-4 space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Subtotal:</span>
										<span>{formatPrice(subtotal)}</span>
									</div>
									{useWallet && walletAmountNum > 0 && (
										<div className="flex justify-between text-green-600">
											<span>Wallet Discount:</span>
											<span>-{formatPrice(walletAmountNum)}</span>
										</div>
									)}
									<div className="border-t pt-2 flex justify-between font-bold text-lg">
										<span>Grand Total:</span>
										<span className="text-primary">{formatPrice(total)}</span>
									</div>
								</div>{" "}
								{/* Place Order Button */}
								<Button
									className="w-full"
									size="lg"
									onClick={handlePlaceOrder}
									disabled={loading || !user.shopAddress}>
									{loading ? "Placing Order..." : "Place Order"}
								</Button>
								{!user.shopAddress && (
									<p className="text-xs text-red-600 text-center mt-2">
										Please update your profile with a shop address to place
										orders
									</p>
								)}
							</CardContent>
						</Card>

					</div>
				</div>

				{/* Payment Modal */}
				{showPaymentModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>Complete Payment</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setShowPaymentModal(false);
										setShowQR(false);
										setPaymentReferenceId("");
										setBankingName("");
									}}
									className="h-8 w-8 p-0">
									<X className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent className="space-y-4">
								{!showQR ? (
									<>
										<div>
											<Label className="text-lg font-semibold">
												Payment Amount: ₹{total.toLocaleString()}
											</Label>
											<p className="text-sm text-gray-600 mt-1">
												Choose your payment method below
											</p>
										</div>{" "}
										{businessSettings?.bankDetails && (
											<div className="bg-gray-50 p-4 rounded-lg space-y-3">
												<h3 className="font-medium text-sm">Payment Details</h3>

												{businessSettings.bankDetails.upiId && (
													<div>
														<p className="text-xs text-gray-600">UPI ID:</p>
														<div className="flex items-center gap-2">
															<p className="text-sm font-mono flex-1">
																{businessSettings.bankDetails.upiId}
															</p>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	copyToClipboard(
																		businessSettings.bankDetails?.upiId || "",
																		"upiId"
																	)
																}
																className="h-8 px-2">
																{copiedField === "upiId" ? (
																	<Check className="w-4 h-4 text-green-600" />
																) : (
																	<Copy className="w-4 h-4" />
																)}
															</Button>
														</div>
													</div>
												)}

												{businessSettings.bankDetails.accountNumber && (
													<>
														<div>
															<p className="text-xs text-gray-600">
																Account Number:
															</p>
															<div className="flex items-center gap-2">
																<p className="text-sm font-mono flex-1">
																	{businessSettings.bankDetails.accountNumber}
																</p>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(
																			businessSettings.bankDetails
																				?.accountNumber || "",
																			"accountNumber"
																		)
																	}
																	className="h-8 px-2">
																	{copiedField === "accountNumber" ? (
																		<Check className="w-4 h-4 text-green-600" />
																	) : (
																		<Copy className="w-4 h-4" />
																	)}
																</Button>
															</div>
														</div>
														<div>
															<p className="text-xs text-gray-600">
																IFSC Code:
															</p>
															<div className="flex items-center gap-2">
																<p className="text-sm font-mono flex-1">
																	{businessSettings.bankDetails.ifscCode}
																</p>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(
																			businessSettings.bankDetails?.ifscCode ||
																				"",
																			"ifscCode"
																		)
																	}
																	className="h-8 px-2">
																	{copiedField === "ifscCode" ? (
																		<Check className="w-4 h-4 text-green-600" />
																	) : (
																		<Copy className="w-4 h-4" />
																	)}
																</Button>
															</div>
														</div>
														<div>
															<p className="text-xs text-gray-600">
																Bank Name:
															</p>
															<p className="text-sm">
																{businessSettings.bankDetails.bankName}
															</p>
														</div>
													</>
												)}
											</div>
										)}
										<Button
											onClick={() => setShowQR(true)}
											className="w-full"
											size="lg">
											Generate Payment QR Code
										</Button>
									</>
								) : (
									<>
										<div className="text-center space-y-4">
											<div
												ref={qrRef}
												className="bg-white p-4 rounded-lg inline-block border">
												<QRCodeCanvas value={upiUrl} size={256} />
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={downloadQRCode}
												className="gap-2">
												<Download className="w-4 h-4" />
												Download QR Code
											</Button>
											<div>
												<p className="font-medium text-lg">
													Amount: ₹{total.toLocaleString()}
												</p>
												<p className="text-sm text-gray-600 mt-2">
													Scan this QR code with any UPI app
												</p>
												<p className="text-xs text-gray-500 mt-1">
													(Google Pay, PhonePe, Paytm, etc.)
												</p>
											</div>
										</div>

										<div className="space-y-3">
											<div>
												<Label htmlFor="paymentRef">
													UPI Transaction ID / Reference Number
												</Label>
												<Input
													id="paymentRef"
													type="text"
													placeholder="Enter UPI Reference/UTR Number"
													value={paymentReferenceId}
													onChange={(e) =>
														setPaymentReferenceId(e.target.value)
													}
													className="mt-1"
												/>
												<p className="text-xs text-gray-500 mt-1">
													Enter the transaction ID from your payment app
												</p>
											</div>

											<div>
												<Label htmlFor="bankingName">
													Account Holder Name / Sender Name
												</Label>
												<Input
													id="bankingName"
													type="text"
													placeholder="Enter name used for payment"
													value={bankingName}
													onChange={(e) => setBankingName(e.target.value)}
													className="mt-1"
												/>
												<p className="text-xs text-gray-500 mt-1">
													Enter the name from which payment was made
												</p>
											</div>

											<Button
												onClick={handlePlaceOrder}
												className="w-full bg-green-600 hover:bg-green-700"
												disabled={
													loading ||
													!paymentReferenceId.trim() ||
													!bankingName.trim()
												}>
												{loading
													? "Processing..."
													: "Confirm Payment & Place Order"}
											</Button>

											<Button
												onClick={() => {
													setShowQR(false);
													setPaymentReferenceId("");
													setBankingName("");
												}}
												variant="outline"
												className="w-full">
												Back
											</Button>
										</div>

										<p className="text-xs text-gray-500 text-center">
											Complete the payment and enter the transaction ID above
										</p>
									</>
								)}
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</main>
	);
}