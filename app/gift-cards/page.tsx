"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { CreditCard, Gift, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const GIFT_CARD_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function GiftCardsPage() {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
	const [customAmount, setCustomAmount] = useState("");
	const [recipientName, setRecipientName] = useState("");
	const [recipientEmail, setRecipientEmail] = useState("");
	const [recipientPhone, setRecipientPhone] = useState("");
	const [message, setMessage] = useState("");
	const [paymentMethod, setPaymentMethod] = useState<"wallet" | "online">(
		"wallet"
	);

	const finalAmount = selectedAmount || parseInt(customAmount) || 0;

	const handlePurchase = async () => {
		if (!finalAmount || finalAmount < 100) {
			toast({
				title: "Invalid Amount",
				description: "Minimum gift card amount is ₹100",
				variant: "destructive",
			});
			return;
		}

		if (finalAmount > 50000) {
			toast({
				title: "Invalid Amount",
				description: "Maximum gift card amount is ₹50,000",
				variant: "destructive",
			});
			return;
		}

		if (!recipientName) {
			toast({
				title: "Missing Information",
				description: "Please enter recipient name",
				variant: "destructive",
			});
			return;
		}

		try {
			setLoading(true);
			const response = await api.post("/gift-cards/purchase", {
				amount: finalAmount,
				recipientName,
				recipientEmail,
				recipientPhone,
				message,
				paymentMethod,
			});

			toast({
				title: "Success!",
				description: `Gift card purchased successfully! Code: ${response.data.data.code}`,
			});

			// Reset form
			setSelectedAmount(null);
			setCustomAmount("");
			setRecipientName("");
			setRecipientEmail("");
			setRecipientPhone("");
			setMessage("");
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to purchase gift card",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
			<div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div className="p-2 bg-pink-100 rounded-lg">
							<Gift className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
						</div>
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
								Gift Cards
							</h1>
							<p className="text-sm text-gray-600">Give the gift of choice</p>
						</div>
					</div>
					<Link
						href="/gift-cards/my-cards"
						className="text-sm text-blue-600 hover:text-blue-800">
						View My Gift Cards →
					</Link>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					{/* Purchase Form */}
					<Card>
						<CardContent className="p-4 sm:p-6">
							<h2 className="text-lg font-semibold mb-4">Purchase Gift Card</h2>

							{/* Amount Selection */}
							<div className="space-y-3 mb-6">
								<Label>Select Amount</Label>
								<div className="grid grid-cols-3 gap-2">
									{GIFT_CARD_AMOUNTS.map((amount) => (
										<Button
											key={amount}
											variant={
												selectedAmount === amount ? "default" : "outline"
											}
											onClick={() => {
												setSelectedAmount(amount);
												setCustomAmount("");
											}}
											className="text-sm">
											₹{amount}
										</Button>
									))}
								</div>
								<div>
									<Label className="text-xs">Or Enter Custom Amount</Label>
									<Input
										type="number"
										placeholder="Enter amount"
										value={customAmount}
										onChange={(e) => {
											setCustomAmount(e.target.value);
											setSelectedAmount(null);
										}}
										min={100}
										max={50000}
									/>
									<p className="text-xs text-gray-500 mt-1">
										Min: ₹100 | Max: ₹50,000
									</p>
								</div>
							</div>

							{/* Recipient Details */}
							<div className="space-y-3 mb-6">
								<div>
									<Label>Recipient Name *</Label>
									<Input
										value={recipientName}
										onChange={(e) => setRecipientName(e.target.value)}
										placeholder="Enter recipient name"
									/>
								</div>
								<div>
									<Label>Recipient Email (Optional)</Label>
									<Input
										type="email"
										value={recipientEmail}
										onChange={(e) => setRecipientEmail(e.target.value)}
										placeholder="Enter email"
									/>
								</div>
								<div>
									<Label>Recipient Phone (Optional)</Label>
									<Input
										type="tel"
										value={recipientPhone}
										onChange={(e) => setRecipientPhone(e.target.value)}
										placeholder="Enter phone number"
									/>
								</div>
								<div>
									<Label>Personal Message (Optional)</Label>
									<Textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="Add a personal message..."
										rows={3}
									/>
								</div>
							</div>

							{/* Payment Method */}
							<div className="space-y-3 mb-6">
								<Label>Payment Method</Label>
								<div className="grid grid-cols-2 gap-2">
									<Button
										variant={paymentMethod === "wallet" ? "default" : "outline"}
										onClick={() => setPaymentMethod("wallet")}
										className="flex items-center gap-2">
										<Wallet className="h-4 w-4" />
										Wallet
									</Button>
									<Button
										variant={paymentMethod === "online" ? "default" : "outline"}
										onClick={() => setPaymentMethod("online")}
										className="flex items-center gap-2">
										<CreditCard className="h-4 w-4" />
										Online
									</Button>
								</div>
							</div>

							{/* Purchase Button */}
							<Button
								onClick={handlePurchase}
								disabled={loading || !finalAmount || !recipientName}
								className="w-full"
								size="lg">
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									<>
										<Gift className="mr-2 h-4 w-4" />
										Purchase Gift Card - ₹{finalAmount}
									</>
								)}
							</Button>
						</CardContent>
					</Card>

					{/* Preview */}
					<Card className="bg-linear-to-br from-pink-500 to-purple-600 text-white">
						<CardContent className="p-6 sm:p-8">
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<Gift className="h-12 w-12" />
									<span className="text-sm opacity-90">Gift Card</span>
								</div>

								<div>
									<p className="text-sm opacity-90 mb-1">Amount</p>
									<p className="text-4xl font-bold">₹{finalAmount || "0"}</p>
								</div>

								{recipientName && (
									<div>
										<p className="text-sm opacity-90 mb-1">To</p>
										<p className="text-xl font-semibold">{recipientName}</p>
									</div>
								)}

								{message && (
									<div>
										<p className="text-sm opacity-90 mb-1">Message</p>
										<p className="text-sm italic">"{message}"</p>
									</div>
								)}

								<div className="pt-4 border-t border-white/20">
									<p className="text-xs opacity-75">
										Valid for 12 months from purchase date
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Info Section */}
				<Card className="mt-6">
					<CardContent className="p-4 sm:p-6">
						<h3 className="font-semibold mb-3">How Gift Cards Work</h3>
						<ul className="space-y-2 text-sm text-gray-600">
							<li>• Gift cards can be used for any purchase on our platform</li>
							<li>• Valid for 12 months from the date of purchase</li>
							<li>• Can be used multiple times until balance is exhausted</li>
							<li>• Non-refundable and cannot be exchanged for cash</li>
							<li>• Recipient will receive the gift card code via email/SMS</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
