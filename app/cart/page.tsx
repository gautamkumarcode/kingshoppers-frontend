"use client";

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { AlertTriangle, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
	const {
		items,
		isEmpty,
		isLoading,
		validationErrors,
		hasErrors,
		clearCart,
		getValidationStatus,
	} = useCart();

	const validationStatus = getValidationStatus();

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading your cart...</p>
					</div>
				</div>
			</div>
		);
	}

	if (isEmpty) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<ShoppingCart className="h-16 w-16 text-gray-400 mb-6" />
							<h2 className="text-2xl font-semibold text-gray-900 mb-2">
								Your cart is empty
							</h2>
							<p className="text-gray-600 mb-6 text-center">
								Looks like you haven't added any items to your cart yet. Start
								shopping to fill it up!
							</p>
							<Link href="/products">
								<Button size="lg">Start Shopping</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<Link href="/products">
						<Button variant="outline" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Continue Shopping
						</Button>
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
						<p className="text-gray-600">
							{items.length} {items.length === 1 ? "item" : "items"} in your
							cart
						</p>
					</div>
				</div>

				{items.length > 0 && (
					<Button
						variant="outline"
						onClick={clearCart}
						className="text-red-600 hover:text-red-700 hover:bg-red-50">
						Clear Cart
					</Button>
				)}
			</div>

			{/* Validation Errors */}
			{hasErrors && (
				<Card className="mb-6 border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-800">
							<AlertTriangle className="h-5 w-5" />
							Cart Issues
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{validationErrors.map((error, index) => (
								<div key={index} className="text-sm text-red-700">
									• {error.message}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Cart Items</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{items.map((item) => (
									<CartItem
										key={item.id}
										item={item}
										showRemoveButton={true}
										showQuantityControls={true}
									/>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Additional Actions */}
					<div className="mt-6 flex flex-col sm:flex-row gap-4">
						<Link href="/products" className="flex-1">
							<Button variant="outline" className="w-full">
								Continue Shopping
							</Button>
						</Link>

						<Button
							variant="outline"
							onClick={clearCart}
							className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
							Clear All Items
						</Button>
					</div>
				</div>

				{/* Cart Summary */}
				<div className="lg:col-span-1">
					<div className="sticky top-4">
						<CartSummary />

						{/* Additional Info */}
						<Card className="mt-4">
							<CardContent className="p-4">
								<div className="space-y-3 text-sm text-gray-600">
									<div className="flex items-center gap-2">
										<span className="w-2 h-2 bg-green-500 rounded-full"></span>
										<span>Free delivery on orders above ₹500</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
										<span>Easy returns within 7 days</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="w-2 h-2 bg-purple-500 rounded-full"></span>
										<span>Secure payment options</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
