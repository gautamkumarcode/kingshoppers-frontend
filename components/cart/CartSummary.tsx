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
			<CardHeader className="pb-2 md:pb-6">
				<CardTitle className="flex items-center gap-2 text-base md:text-xl">
					<ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
					Cart Summary
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2.5 md:space-y-4">
				{/* Quick Stats */}
				<div className="grid grid-cols-2 gap-2 md:gap-4">
					<div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-blue-50 rounded-lg">
						<Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600 shrink-0" />
						<div className="min-w-0">
							<p className="text-[10px] md:text-xs text-gray-600">Items</p>
							<p className="font-semibold text-xs md:text-base truncate">
								{summary.totalItems}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-green-50 rounded-lg">
						<TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 shrink-0" />
						<div className="min-w-0">
							<p className="text-[10px] md:text-xs text-gray-600">Quantity</p>
							<p className="font-semibold text-xs md:text-base truncate">
								{summary.totalQuantity}
							</p>
						</div>
					</div>
				</div>
				{/* Price Breakdown */}
				<div className="space-y-1.5 md:space-y-2 border-t pt-2.5 md:pt-4">
					<div className="flex justify-between text-xs md:text-sm text-gray-600">
						<span>Total MRP</span>
						<span className="font-medium">{formatted.totalMRP}</span>
					</div>

					{summary.savings > 0 && (
						<div className="flex justify-between text-xs md:text-sm text-green-600">
							<span className="flex items-center gap-1">
								<Percent className="h-3 w-3 md:h-3.5 md:w-3.5" />
								Discount
							</span>
							<span className="font-medium">-{formatted.savings}</span>
						</div>
					)}

					<div className="flex justify-between font-semibold text-sm md:text-lg border-t pt-1.5 md:pt-2">
						<span>Grand Total</span>
						<span>{formatted.total}</span>
					</div>
				</div>
				{/* Discount Info */}
				{summary.averageDiscount > 0 && (
					<div className="bg-green-50 p-2 md:p-3 rounded-lg">
						<p className="text-[10px] md:text-sm text-green-800">
							You're saving {formatted.averageDiscount} on average!
						</p>
					</div>
				)}
				{/* Checkout Button */}
				<Button
					className="w-full h-9 md:h-11 text-sm md:text-base font-semibold"
					disabled={!canCheckout()}
					asChild={canCheckout()}>
					{canCheckout() ? (
						<Link href="/checkout">Proceed to Checkout</Link>
					) : (
						<span>Cannot Checkout</span>
					)}
				</Button>
				{/* Continue Shopping - Desktop Only */}
				<Link href="/products" className="hidden md:block">
					<Button variant="outline" className="w-full">
						Continue Shopping
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}
