"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import api from "@/lib/api";
import {
	ArrowLeft,
	Info,
	Minus,
	Package,
	Plus,
	ShoppingCart,
	Star,
	Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const { user } = useAuth();
	const { addProductToCart } = useCart();
	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [selectedVariant, setSelectedVariant] = useState<any>(null);
	const [quantity, setQuantity] = useState(1);
	const [inputValue, setInputValue] = useState("1");
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	useEffect(() => {
		fetchProduct();
	}, [params.id]);

	const fetchProduct = async () => {
		try {
			const response = await api.get(`/products/${params.id}`);
			const data = response.data.data;
			console.log(response);
			setProduct(data);
			if (data.variants && data.variants.length > 0) {
				setSelectedVariant(data.variants[0]);
				const moq = data.variants[0].moq || 1;
				setQuantity(moq);
				setInputValue(String(moq));
			}
		} catch (error) {
			console.error("Failed to fetch product:", error);
		} finally {
			setLoading(false);
		}
	};

	// Helper function to validate and set quantity
	const setValidatedQuantity = (newQuantity: number) => {
		if (!selectedVariant) return;

		const moq = selectedVariant.moq || 1;
		const stock = selectedVariant.stock || 0;

		// Ensure quantity is at least MOQ and not more than stock
		let validatedQty = Math.max(moq, Math.min(stock, newQuantity));

		setQuantity(validatedQty);
		setInputValue(String(validatedQty));
	};

	// Handle quantity increase
	const handleIncrease = () => {
		if (!selectedVariant) return;

		const newQty = quantity + 1;
		if (newQty <= selectedVariant.stock) {
			setValidatedQuantity(newQty);
		} else {
			toast({
				title: "Stock limit reached",
				description: `Only ${selectedVariant.stock} units available`,
				variant: "destructive",
			});
		}
	};

	// Handle quantity decrease
	const handleDecrease = () => {
		if (!selectedVariant) return;

		const newQty = quantity - 1;
		const moq = selectedVariant.moq || 1;

		if (newQty >= moq) {
			setValidatedQuantity(newQty);
		} else {
			toast({
				title: "Minimum quantity",
				description: `Minimum order quantity is ${moq}`,
				variant: "destructive",
			});
		}
	};

	// Handle manual input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		// Allow empty input for better UX
		if (value === "") {
			return;
		}

		// Parse and validate the input
		const numValue = parseInt(value, 10);
		if (isNaN(numValue)) {
			return; // Don't update if not a number
		}

		setValidatedQuantity(numValue);
	};

	// Handle input blur - final validation
	const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (!selectedVariant) return;

		const value = e.target.value;

		if (value === "") {
			// If input is empty, reset to current quantity
			setInputValue(String(quantity));
			return;
		}

		const numValue = parseInt(value, 10);
		if (isNaN(numValue)) {
			// If not a valid number, reset to current quantity
			setInputValue(String(quantity));
			return;
		}

		setValidatedQuantity(numValue);
	};

	// Handle Enter key in input
	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		}
	};

	const handleAddToCart = () => {
		// Check if user is logged in
		if (!user) {
			// Save current URL to redirect back after login
			const currentPath = window.location.pathname;
			sessionStorage.setItem("redirectAfterLogin", currentPath);

			toast({
				title: "Login Required",
				description: "Please login to add items to your cart",
				variant: "destructive",
			});

			// Redirect to login page after showing toast
			setTimeout(() => {
				router.push("/auth/login");
			}, 1500);
			return;
		}

		if (!selectedVariant) {
			toast({
				title: "Error",
				description: "Please select a variant",
				variant: "destructive",
			});
			return;
		}

		if (quantity < (selectedVariant.moq || 1)) {
			toast({
				title: "Error",
				description: `Minimum order quantity is ${selectedVariant.moq || 1}`,
				variant: "destructive",
			});
			return;
		}

		if (quantity > selectedVariant.stock) {
			toast({
				title: "Error",
				description: `Only ${selectedVariant.stock} units available`,
				variant: "destructive",
			});
			return;
		}

		try {
			// Use the new cart context
			addProductToCart(product, selectedVariant, quantity);

			toast({
				title: "Success",
				description: `Added ${quantity} ${selectedVariant.packType}(s) to cart`,
			});
		} catch (error) {
			console.error("Error adding to cart:", error);

			// Check if it's a login required error
			if (error instanceof Error && error.message === "LOGIN_REQUIRED") {
				// Save current URL to redirect back after login
				const currentPath = window.location.pathname;
				sessionStorage.setItem("redirectAfterLogin", currentPath);

				toast({
					title: "Login Required",
					description: "Please login to add items to your cart",
					variant: "destructive",
				});

				setTimeout(() => {
					router.push("/auth/login");
				}, 1500);
			} else {
				toast({
					title: "Error",
					description:
						error instanceof Error ? error.message : "Failed to add to cart",
					variant: "destructive",
				});
			}
		}
	};

	if (loading) {
		return <div className="text-center py-12">Loading...</div>;
	}

	if (!product) {
		return <div className="text-center py-12">Product not found</div>;
	}

	return (
		<main className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link
					href="/products"
					className="flex items-center gap-2 text-primary hover:underline mb-6">
					<ArrowLeft className="w-4 h-4" />
					Back to Products
				</Link>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Images */}
					<div className="space-y-4">
						<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
							<img
								src={
									product.images && product.images.length > 0
										? product.images[selectedImageIndex]
										: product.thumbnail ||
										  "/placeholder.svg?height=400&width=400&text=Product+Image"
								}
								alt={product.name}
								className="w-full h-full object-cover"
							/>
						</div>
						{product.images && product.images.length > 0 && (
							<div className="grid grid-cols-4 gap-2">
								{product.images.map((img: string, idx: number) => (
									<div
										key={idx}
										onClick={() => setSelectedImageIndex(idx)}
										className={`aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer transition-all ${
											selectedImageIndex === idx
												? "ring-2 ring-primary ring-offset-2"
												: "hover:opacity-75"
										}`}>
										<img
											src={img || "/placeholder.svg?height=100&width=100"}
											alt={`View ${idx + 1}`}
											className="w-full h-full object-cover"
										/>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Details */}
					<div className="space-y-6">
						{/* Header */}
						<div className="space-y-4">
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<h1 className="text-3xl font-bold">{product.name}</h1>
									<p className="text-lg text-muted-foreground">
										{product.shortDescription}
									</p>
								</div>
								{product.isFeatured && (
									<Badge
										variant="secondary"
										className="flex items-center gap-1">
										<Star className="w-3 h-3" />
										Featured
									</Badge>
								)}
							</div>

							{/* Brand and Category */}
							<div className="flex items-center gap-4 text-sm">
								{product.brand && (
									<div className="flex items-center gap-2">
										<span className="font-medium">Brand:</span>
										<Badge variant="outline">
											{typeof product.brand === "object"
												? product.brand.name
												: product.brand}
										</Badge>
									</div>
								)}
								{product.category && (
									<div className="flex items-center gap-2">
										<span className="font-medium">Category:</span>
										<Badge variant="outline">
											{typeof product.category === "object"
												? product.category.name
												: product.category}
										</Badge>
									</div>
								)}
							</div>
						</div>

						{/* Product Info */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Info className="w-4 h-4" />
									Product Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-2 gap-4 text-sm">
									{product.sku && (
										<div>
											<span className="font-medium">SKU:</span>
											<p className="text-muted-foreground">{product.sku}</p>
										</div>
									)}
									{product.hsnCode && (
										<div>
											<span className="font-medium">HSN Code:</span>
											<p className="text-muted-foreground">{product.hsnCode}</p>
										</div>
									)}
									{product.barcode && (
										<div>
											<span className="font-medium">Barcode:</span>
											<p className="text-muted-foreground">{product.barcode}</p>
										</div>
									)}
									{product.gstPercentage && (
										<div>
											<span className="font-medium">GST:</span>
											<p className="text-muted-foreground">
												{product.gstPercentage}%
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Variants */}
						{product.variants && product.variants.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Package className="w-4 h-4" />
										Select Pack Size
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{product.variants.map((variant: any) => (
										<div
											key={variant._id}
											className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
												selectedVariant?._id === variant._id
													? "border-primary bg-primary/5"
													: "border-border"
											}`}
											onClick={() => {
												setSelectedVariant(variant);
												const moq = variant.moq || 1;
												setValidatedQuantity(moq);
											}}>
											<div className="flex justify-between items-start">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<h3 className="font-semibold">
															{variant.variantName}
														</h3>
														<Badge variant="secondary">
															{variant.packSize} {variant.packType}
														</Badge>
													</div>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<span>MOQ: {variant.moq}</span>
														<span>Stock: {variant.stock}</span>
														{variant.weight && (
															<span>Weight: {variant.weight}g</span>
														)}
													</div>
												</div>
												<div className="text-right space-y-1">
													<div className="flex items-center gap-2">
														<span className="text-sm text-muted-foreground line-through">
															₹{variant.mrp}
														</span>
														<span className="text-lg font-bold text-primary">
															₹{variant.wholesalePrice}
														</span>
													</div>
													{variant.discountPercentage > 0 && (
														<Badge variant="destructive" className="text-xs">
															{variant.discountPercentage}% OFF
														</Badge>
													)}
												</div>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						{/* Quantity */}
						{selectedVariant && (
							<Card>
								<CardHeader>
									<CardTitle>Order Quantity</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="quantity">
											Quantity ({selectedVariant.packType}s)
										</Label>
										<div className="flex items-center gap-2 mt-2">
											<Button
												type="button"
												variant="outline"
												size="icon"
												onClick={handleDecrease}
												disabled={quantity <= (selectedVariant.moq || 1)}>
												<Minus className="h-4 w-4" />
											</Button>
											<Input
												id="quantity"
												type="number"
												min={selectedVariant.moq || 1}
												max={selectedVariant.stock}
												value={inputValue}
												onChange={handleInputChange}
												onBlur={handleInputBlur}
												onKeyDown={handleInputKeyDown}
												className="text-center"
											/>
											<Button
												type="button"
												variant="outline"
												size="icon"
												onClick={handleIncrease}
												disabled={quantity >= selectedVariant.stock}>
												<Plus className="h-4 w-4" />
											</Button>
										</div>
										<div className="flex justify-between text-xs text-muted-foreground mt-1">
											<span>Min: {selectedVariant.moq || 1}</span>
											<span>Available: {selectedVariant.stock}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Price Summary */}
						{selectedVariant && (
							<Card className="bg-primary/5">
								<CardHeader>
									<CardTitle className="text-lg">Price Summary</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="space-y-2">
										<div className="flex justify-between">
											<span>Price per {selectedVariant.packType}:</span>
											<span>₹{selectedVariant.wholesalePrice}</span>
										</div>
										<div className="flex justify-between">
											<span>Quantity:</span>
											<span>
												{quantity} {selectedVariant.packType}(s)
											</span>
										</div>
									</div>
									<Separator />
									<div className="flex justify-between font-bold text-lg">
										<span>Total Amount:</span>
										<span className="text-primary">
											₹{(selectedVariant.wholesalePrice * quantity).toFixed(2)}
										</span>
									</div>
									<div className="text-xs text-muted-foreground text-center">
										You save ₹
										{(
											(selectedVariant.mrp - selectedVariant.wholesalePrice) *
											quantity
										).toFixed(2)}{" "}
										from MRP
									</div>
								</CardContent>
							</Card>
						)}

						{/* Add to Cart Button */}
						<Button
							size="lg"
							className="w-full"
							onClick={handleAddToCart}
							disabled={
								!selectedVariant ||
								quantity < (selectedVariant.moq || 1) ||
								quantity > selectedVariant.stock
							}>
							<ShoppingCart className="w-5 h-5 mr-2" />
							Add to Cart
						</Button>
					</div>
				</div>

				{/* Description and Specifications */}
				<div className="mt-12 space-y-8">
					{/* Description */}
					{product.description && (
						<Card>
							<CardHeader>
								<CardTitle>Product Description</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground leading-relaxed">
									{product.description}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Specifications */}
					{product.specifications && product.specifications.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Specifications</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{product.specifications.map((spec: any, index: number) => (
										<div
											key={index}
											className="flex justify-between py-2 border-b border-border/50">
											<span className="font-medium">{spec.name}:</span>
											<span className="text-muted-foreground">
												{spec.value}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Additional Info */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Shipping Info */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Truck className="w-4 h-4" />
									Shipping Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								{selectedVariant?.weight && (
									<div className="flex justify-between">
										<span>Weight:</span>
										<span>{selectedVariant.weight}g</span>
									</div>
								)}
								{selectedVariant?.dimensions && (
									<div className="flex justify-between">
										<span>Dimensions:</span>
										<span>
											{selectedVariant.dimensions.length} ×{" "}
											{selectedVariant.dimensions.width} ×{" "}
											{selectedVariant.dimensions.height} cm
										</span>
									</div>
								)}
								<div className="flex justify-between">
									<span>MOQ:</span>
									<span>{selectedVariant?.moq || product.moq} units</span>
								</div>
							</CardContent>
						</Card>

						{/* Business Info */}
						<Card>
							<CardHeader>
								<CardTitle>Business Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>Total Sold:</span>
									<span>{product.totalSold} units</span>
								</div>
								<div className="flex justify-between">
									<span>Views:</span>
									<span>{product.viewCount}</span>
								</div>
								{product.keywords && product.keywords.length > 0 && (
									<div>
										<span className="font-medium">Tags:</span>
										<div className="flex flex-wrap gap-1 mt-1">
											{product.keywords.map(
												(keyword: string, index: number) => (
													<Badge
														key={index}
														variant="secondary"
														className="text-xs">
														{keyword}
													</Badge>
												)
											)}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}