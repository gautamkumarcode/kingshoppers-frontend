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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { user, loading: authLoading } = useAuth();
	const { items: cart, isEmpty, clearCart, summary } = useCart();
	const [loading, setLoading] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [walletBalance, setWalletBalance] = useState(0);
	const [useWallet, setUseWallet] = useState(false);
	const [walletAmount, setWalletAmount] = useState(0);
	const [deliverySlot, setDeliverySlot] = useState("morning");

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

		// Fetch wallet balance
		fetchWalletBalance();
	}, [router, authLoading, user, isEmpty]);

	const fetchWalletBalance = async () => {
		try {
			const response = await api.get("/wallet");
			setWalletBalance(response.data.balance || 0);
		} catch (error) {
			console.error("Failed to fetch wallet:", error);
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

		console.log("User object:", user);
		console.log("Shop address:", user.shopAddress);
		console.log("Cart items:", cart);

		setLoading(true);

		try {
			// Use summary from useCart hook which has proper calculations
			const subtotal = summary.subtotal;
			const tax = 0; // GST is included in prices
			let total = summary.total;

			// Apply wallet discount if using wallet
			if (useWallet && walletAmount > 0) {
				total = Math.max(0, total - walletAmount);
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
				paymentMethod: useWallet ? "wallet" : paymentMethod,
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
			if (useWallet && walletAmount > 0) {
				await api.post("/wallet/use-for-payment", {
					amount: walletAmount,
					orderId: data.order._id,
				});
			}

			// Clear cart
			clearCart();

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
	let total = summary.total;

	if (useWallet && walletAmount > 0) {
		total = Math.max(0, total - walletAmount);
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
												if (!e.target.checked) setWalletAmount(0);
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
												onChange={(e) =>
													setWalletAmount(
														Math.min(
															walletBalance,
															Number.parseFloat(e.target.value) || 0
														)
													)
												}
												max={walletBalance}
												min={0}
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
									{useWallet && walletAmount > 0 && (
										<div className="flex justify-between text-green-600">
											<span>Wallet Discount:</span>
											<span>-{formatPrice(walletAmount)}</span>
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

						<Link href="/invoice">Invoice</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
