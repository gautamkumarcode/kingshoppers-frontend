"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Check, Copy, Gift, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface GiftCard {
	_id: string;
	code: string;
	amount: number;
	balance: number;
	status: string;
	expiryDate: string;
	recipientName: string;
	recipientEmail?: string;
	recipientPhone?: string;
	message?: string;
	purchaseDate: string;
}

export default function MyGiftCardsPage() {
	const { toast } = useToast();
	const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
	const [loading, setLoading] = useState(true);
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	useEffect(() => {
		fetchGiftCards();
	}, []);

	const fetchGiftCards = async () => {
		try {
			setLoading(true);
			const response = await api.get("/gift-cards/my-cards");
			setGiftCards(response.data.data || []);
		} catch (error) {
			console.error("Error fetching gift cards:", error);
			toast({
				title: "Error",
				description: "Failed to load gift cards",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const copyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(code);
		toast({
			title: "Copied!",
			description: "Gift card code copied to clipboard",
		});
		setTimeout(() => setCopiedCode(null), 2000);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "used":
				return "bg-gray-100 text-gray-800";
			case "expired":
				return "bg-red-100 text-red-800";
			case "cancelled":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
			<div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-6 sm:mb-8">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
							My Gift Cards
						</h1>
						<p className="text-sm text-gray-600">
							Manage your purchased gift cards
						</p>
					</div>
					<Link href="/gift-cards">
						<Button>
							<Gift className="mr-2 h-4 w-4" />
							Buy Gift Card
						</Button>
					</Link>
				</div>

				{/* Gift Cards List */}
				{giftCards.length === 0 ? (
					<Card>
						<CardContent className="p-12 text-center">
							<Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								No Gift Cards Yet
							</h3>
							<p className="text-sm text-gray-600 mb-6">
								Purchase a gift card to get started
							</p>
							<Link href="/gift-cards">
								<Button>
									<Gift className="mr-2 h-4 w-4" />
									Purchase Gift Card
								</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{giftCards.map((card) => (
							<Card
								key={card._id}
								className={`overflow-hidden ${
									card.status === "active"
										? "border-2 border-green-200"
										: "opacity-75"
								}`}>
								<div className="bg-linear-to-br from-pink-500 to-purple-600 text-white p-4 sm:p-6">
									<div className="flex items-center justify-between mb-4">
										<Gift className="h-8 w-8" />
										<span
											className={`text-xs px-2 py-1 rounded ${getStatusColor(
												card.status
											)}`}>
											{card.status.toUpperCase()}
										</span>
									</div>
									<div className="mb-4">
										<p className="text-sm opacity-90 mb-1">Balance</p>
										<p className="text-3xl font-bold">₹{card.balance}</p>
										<p className="text-xs opacity-75">of ₹{card.amount}</p>
									</div>
									<div className="flex items-center gap-2 bg-white/20 rounded px-3 py-2">
										<code className="text-sm font-mono flex-1">
											{card.code}
										</code>
										<button
											onClick={() => copyCode(card.code)}
											className="text-white hover:text-gray-200">
											{copiedCode === card.code ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<CardContent className="p-4">
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-600">To:</span>
											<span className="font-medium">{card.recipientName}</span>
										</div>
										{card.recipientEmail && (
											<div className="flex justify-between">
												<span className="text-gray-600">Email:</span>
												<span className="text-xs">{card.recipientEmail}</span>
											</div>
										)}
										{card.recipientPhone && (
											<div className="flex justify-between">
												<span className="text-gray-600">Phone:</span>
												<span className="text-xs">{card.recipientPhone}</span>
											</div>
										)}
										<div className="flex justify-between">
											<span className="text-gray-600">Expires:</span>
											<span className="text-xs">
												{new Date(card.expiryDate).toLocaleDateString()}
											</span>
										</div>
										{card.message && (
											<div className="pt-2 border-t">
												<p className="text-xs text-gray-600 italic">
													"{card.message}"
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
