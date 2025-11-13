"use client";

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
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
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-center min-h-[500px]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
							<p className="text-gray-600 text-lg">Loading your cart...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isEmpty) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-8 md:py-16">
					<div className="max-w-2xl mx-auto">
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
							<div className="flex flex-col items-center justify-center text-center">
								<div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
									<ShoppingCart className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
								</div>
								<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
									Your cart is empty
								</h2>
								<p className="text-gray-600 mb-8 text-base md:text-lg max-w-md">
									Looks like you haven't added any items to your cart yet. Start
									shopping to fill it up!
								</p>
								<Link href="/products">
									<Button size="lg" className="px-8">
										<ShoppingCart className="h-5 w-5 mr-2" />
										Start Shopping
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 pb-24 md:pb-8">
				{/* Header */}
				<div className="mb-4 sm:mb-6">
					<Link href="/products" className="inline-block mb-3 sm:mb-4">
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 hover:bg-white -ml-2 sm:ml-0">
							<ArrowLeft className="h-4 w-4" />
							<span className="text-sm">Back to Shopping</span>
						</Button>
					</Link>

					<div className="flex items-center justify-between gap-3">
						<div>
							<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
								Shopping Cart
							</h1>
							<p className="text-xs sm:text-sm text-gray-600">
								{items.length} {items.length === 1 ? "item" : "items"}
							</p>
						</div>

						{items.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearCart}
								className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
								Clear
							</Button>
						)}
					</div>
				</div>

				{/* Validation Errors */}
				{hasErrors && (
					<div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
						<div className="flex items-start gap-2 sm:gap-3">
							<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0 mt-0.5" />
							<div className="flex-1">
								<h3 className="font-semibold text-sm sm:text-base text-red-900 mb-1.5">
									Cart Issues
								</h3>
								<div className="space-y-1">
									{validationErrors.map((error, index) => (
										<p key={index} className="text-xs sm:text-sm text-red-700">
											• {error.message}
										</p>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
					{/* Cart Items */}
					<div className="lg:col-span-8 space-y-3 sm:space-y-4">
						{items.map((item) => (
							<CartItem
								key={item.id}
								item={item}
								showRemoveButton={true}
								showQuantityControls={true}
							/>
						))}

						{/* Additional Actions - Desktop Only */}
						<div className="hidden md:flex gap-4 pt-2">
							<Link href="/products" className="flex-1">
								<Button variant="outline" className="w-full h-11">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Continue Shopping
								</Button>
							</Link>

							<Button
								variant="outline"
								onClick={clearCart}
								className="flex-1 h-11 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
								Clear All Items
							</Button>
						</div>
					</div>

					{/* Cart Summary Sidebar */}
					<div className="lg:col-span-4">
						<div className="lg:sticky lg:top-6 space-y-3 sm:space-y-4">
							<CartSummary />

							{/* Benefits Card - Hidden on mobile */}
							<div className="hidden sm:block bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
								<h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
									Why shop with us?
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-2.5 sm:gap-3">
										<div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
											<span className="text-green-600 text-base sm:text-lg">
												✓
											</span>
										</div>
										<div>
											<p className="text-xs sm:text-sm font-medium text-gray-900">
												Free Delivery
											</p>
											<p className="text-xs text-gray-600">
												On orders above ₹500
											</p>
										</div>
									</div>

									<div className="flex items-start gap-2.5 sm:gap-3">
										<div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
											<span className="text-blue-600 text-base sm:text-lg">
												↻
											</span>
										</div>
										<div>
											<p className="text-xs sm:text-sm font-medium text-gray-900">
												Easy Returns
											</p>
											<p className="text-xs text-gray-600">
												Within 7 days of delivery
											</p>
										</div>
									</div>

									<div className="flex items-start gap-2.5 sm:gap-3">
										<div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
											<span className="text-purple-600 text-base sm:text-lg">
												🔒
											</span>
										</div>
										<div>
											<p className="text-xs sm:text-sm font-medium text-gray-900">
												Secure Payment
											</p>
											<p className="text-xs text-gray-600">
												100% secure transactions
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
