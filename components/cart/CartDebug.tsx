"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";

export function CartDebug() {
	const cart = useCart();

	const testProduct = {
		_id: "test-product-1",
		name: "Test Product",
		slug: "test-product",
		description: "A test product for debugging",
		shortDescription: "Test product",
		category: "Test Category",
		brand: "Test Brand",
		sku: "TEST-001",
		images: [],
		thumbnail: "",
		variants: [],
		specifications: [],
		moq: 1,
		isActive: true,
		isFeatured: false,
		gstPercentage: 18,
		keywords: [],
		totalSold: 0,
		viewCount: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const testVariant = {
		_id: "test-variant-1",
		variantName: "Test Variant",
		variantSku: "TEST-VAR-001",
		packSize: 1,
		packType: "piece" as const,
		mrp: 100,
		wholesalePrice: 80,
		costPrice: 60,
		discountPercentage: 20,
		discountedPrice: 80,
		stock: 50,
		lowStockAlert: 10,
		moq: 1,
		isActive: true,
		isInStock: true,
		tierPricing: [],
	};

	const handleTestAdd = () => {
		try {
			console.log("Testing cart add with:", { testProduct, testVariant });
			cart.addProductToCart(testProduct, testVariant, 1);
		} catch (error) {
			console.error("Test add failed:", error);
		}
	};

	const handleDirectAdd = () => {
		try {
			const testItem = {
				id: "test-direct-1",
				productId: "test-product-direct",
				variantId: "test-variant-direct",
				name: "Direct Test Product",
				variantName: "Direct Test Variant",
				price: 50,
				mrp: 60,
				packSize: 1,
				packType: "piece" as const,
				stock: 100,
				moq: 1,
				gstPercentage: 18,
			};

			console.log("Testing direct add with:", testItem);
			cart.addItem(testItem, 1);
		} catch (error) {
			console.error("Direct add failed:", error);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Cart Debug</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<p className="text-sm text-gray-600">
						Items in cart: {cart.items.length}
					</p>
					<p className="text-sm text-gray-600">
						Loading: {cart.isLoading ? "Yes" : "No"}
					</p>
					<p className="text-sm text-gray-600">
						Has errors: {cart.hasErrors ? "Yes" : "No"}
					</p>
					<p className="text-sm text-gray-600">
						Last updated:{" "}
						{cart.lastUpdated
							? new Date(cart.lastUpdated).toLocaleTimeString()
							: "Never"}
					</p>
					<p className="text-sm text-gray-600">
						Server synced: {(cart as any).serverSynced ? "Yes" : "No"}
					</p>
				</div>

				<div className="space-y-2">
					<Button onClick={handleTestAdd} className="w-full">
						Test Add Product
					</Button>
					<Button
						onClick={handleDirectAdd}
						variant="outline"
						className="w-full">
						Test Direct Add
					</Button>
					<Button
						onClick={cart.clearCart}
						variant="destructive"
						className="w-full">
						Clear Cart
					</Button>
				</div>

				{cart.items.length > 0 && (
					<div className="mt-4">
						<h4 className="font-semibold mb-2">Cart Items:</h4>
						<div className="space-y-2">
							{cart.items.map((item) => (
								<div key={item.id} className="text-xs bg-gray-100 p-2 rounded">
									<p>
										<strong>Name:</strong> {item.name}
									</p>
									<p>
										<strong>Variant:</strong> {item.variantName}
									</p>
									<p>
										<strong>Price:</strong> ₹{item.price}
									</p>
									<p>
										<strong>Quantity:</strong> {item.quantity}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{cart.validationErrors.length > 0 && (
					<div className="mt-4">
						<h4 className="font-semibold mb-2 text-red-600">Errors:</h4>
						<div className="space-y-1">
							{cart.validationErrors.map((error, index) => (
								<p key={index} className="text-xs text-red-600">
									{error.message}
								</p>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
