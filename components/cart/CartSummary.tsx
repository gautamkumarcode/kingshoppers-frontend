"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { Package, Percent, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";

export function CartSummary() {
	const { summary, isEmpty, canCheckout, getFormattedSummary } = useCart();
	const formatted = getFormattedSummary();

	if (isEmpty) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-8">
					<ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
					<p className="text-gray-600 mb-4">Your cart is empty</p>
					<Link href="/products">
						<Button>Start Shopping</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShoppingCart className="h-5 w-5" />
					Cart Summary
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Quick Stats */}
				<div className="grid grid-cols-2 gap-4">
					<div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
						<Package className="h-4 w-4 text-blue-600" />
						<div>
							<p className="text-xs text-gray-600">Items</p>
							<p className="font-semibold">{summary.totalItems}</p>
						</div>
					</div>
					<div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
						<TrendingUp className="h-4 w-4 text-green-600" />
						<div>
							<p className="text-xs text-gray-600">Quantity</p>
							<p className="font-semibold">{summary.totalQuantity}</p>
						</div>
					</div>
				</div>

				{/* Price Breakdown */}
				<div className="space-y-2 border-t pt-4">
					<div className="flex justify-between text-sm">
						<span>Subtotal</span>
						<span>{formatted.subtotal}</span>
					</div>

					{summary.savings > 0 && (
						<div className="flex justify-between text-sm text-green-600">
							<span className="flex items-center gap-1">
								<Percent className="h-3 w-3" />
								Savings
							</span>
							<span>-{formatted.savings}</span>
						</div>
					)}

					<div className="flex justify-between text-sm">
						<span>GST</span>
						<span>{formatted.totalGST}</span>
					</div>

					<div className="flex justify-between font-semibold text-lg border-t pt-2">
						<span>Total</span>
						<span>{formatted.total}</span>
					</div>
				</div>

				{/* Discount Info */}
				{summary.averageDiscount > 0 && (
					<div className="bg-green-50 p-3 rounded-lg">
						<p className="text-sm text-green-800">
							You're saving {formatted.averageDiscount} on average!
						</p>
					</div>
				)}

				{/* Checkout Button */}
				<Button
					className="w-full"
					disabled={!canCheckout()}
					asChild={canCheckout()}>
					{canCheckout() ? (
						<Link href="/checkout">Proceed to Checkout</Link>
					) : (
						<span>Cannot Checkout</span>
					)}
				</Button>

				{/* Continue Shopping */}
				<Link href="/products">
					<Button variant="outline" className="w-full">
						Continue Shopping
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}
