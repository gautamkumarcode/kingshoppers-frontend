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
		<div className="container mx-auto px-4 py-4 md:py-8 mb-20 md:mb-0">
			{/* Header */}
			<div className="mb-4 md:mb-8">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
						<Link href="/products" className="w-fit">
							<Button variant="outline" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								<span className="hidden sm:inline">Continue Shopping</span>
								<span className="sm:hidden">Back</span>
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
								Shopping Cart
							</h1>
							<p className="text-sm md:text-base text-gray-600">
								{items.length} {items.length === 1 ? "item" : "items"} in your
								cart
							</p>
						</div>
					</div>

					{items.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={clearCart}
							className="text-red-600 hover:text-red-700 hover:bg-red-50 w-fit">
							Clear Cart
						</Button>
					)}
				</div>
			</div>

			{/* Validation Errors */}
			{hasErrors && (
				<Card className="mb-4 md:mb-6 border-red-200 bg-red-50">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-red-800 text-base md:text-lg">
							<AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
							Cart Issues
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="space-y-2">
							{validationErrors.map((error, index) => (
								<div key={index} className="text-xs md:text-sm text-red-700">
									• {error.message}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-2 space-y-4">
					<Card>
						<CardHeader className="pb-3 md:pb-6">
							<CardTitle className="text-lg md:text-xl">Cart Items</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<div className="space-y-3 md:space-y-4">
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

					{/* Additional Actions - Desktop Only */}
					<div className="hidden md:flex flex-col sm:flex-row gap-4">
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
					<div className="lg:sticky lg:top-4">
						<CartSummary />

						{/* Additional Info */}
						<Card className="mt-4 hidden md:block">
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
