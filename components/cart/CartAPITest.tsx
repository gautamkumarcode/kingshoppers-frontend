"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

export function CartAPITest() {
	const { user } = useAuth();
	const {
		items,
		isLoading,
		addProductToCart,
		syncWithServer,
		clearCart,
		getCartSummary,
	} = useCart();
	const [testing, setTesting] = useState(false);

	const summary = getCartSummary();

	const testProduct = {
		_id: "test-api-product-1",
		name: "API Test Product",
		slug: "api-test-product",
		description: "A test product for API testing",
		shortDescription: "API test product",
		category: "Test Category",
		brand: "Test Brand",
		sku: "API-TEST-001",
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
		_id: "test-api-variant-1",
		variantName: "API Test Variant",
		variantSku: "API-TEST-VAR-001",
		packSize: 1,
		packType: "piece" as const,
		mrp: 150,
		wholesalePrice: 120,
		costPrice: 90,
		discountPercentage: 20,
		discountedPrice: 120,
		stock: 100,
		lowStockAlert: 10,
		moq: 1,
		isActive: true,
		isInStock: true,
		tierPricing: [],
	};

	const handleAPITest = async () => {
		if (!user) {
			alert("Please login to test API cart functionality");
			return;
		}

		setTesting(true);
		try {
			await addProductToCart(testProduct, testVariant, 2);
			console.log("API test successful!");
		} catch (error) {
			console.error("API test failed:", error);
			alert(
				`API test failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		} finally {
			setTesting(false);
		}
	};

	const handleSync = async () => {
		if (!user) {
			alert("Please login to sync cart");
			return;
		}

		setTesting(true);
		try {
			await syncWithServer();
			console.log("Cart sync successful!");
		} catch (error) {
			console.error("Cart sync failed:", error);
		} finally {
			setTesting(false);
		}
	};

	const handleClear = async () => {
		setTesting(true);
		try {
			await clearCart();
			console.log("Cart cleared successfully!");
		} catch (error) {
			console.error("Clear cart failed:", error);
		} finally {
			setTesting(false);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Cart API Test</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<p className="text-sm">
						<strong>User:</strong>{" "}
						{user ? user.ownerName || user.email : "Not logged in"}
					</p>
					<p className="text-sm">
						<strong>Items:</strong> {items.length}
					</p>
					<p className="text-sm">
						<strong>Total:</strong> ₹{summary.total.toFixed(2)}
					</p>
					<p className="text-sm">
						<strong>Loading:</strong> {isLoading ? "Yes" : "No"}
					</p>
				</div>

				<div className="space-y-2">
					<Button
						onClick={handleAPITest}
						disabled={testing || !user}
						className="w-full">
						{testing ? "Testing..." : "Test API Add to Cart"}
					</Button>

					<Button
						onClick={handleSync}
						disabled={testing || !user}
						variant="outline"
						className="w-full">
						{testing ? "Syncing..." : "Sync with Server"}
					</Button>

					<Button
						onClick={handleClear}
						disabled={testing}
						variant="destructive"
						className="w-full">
						{testing ? "Clearing..." : "Clear Cart"}
					</Button>
				</div>

				{!user && (
					<div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
						<strong>Note:</strong> Login required for API cart features. Guest
						users will use localStorage.
					</div>
				)}

				{items.length > 0 && (
					<div className="mt-4">
						<h4 className="font-semibold mb-2">Cart Items:</h4>
						<div className="space-y-2 max-h-40 overflow-y-auto">
							{items.map((item) => (
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
			</CardContent>
		</Card>
	);
}
