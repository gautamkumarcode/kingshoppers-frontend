"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
	ArrowLeft,
	Info,
	Package,
	ShoppingCart,
	Star,
	Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
	const params = useParams();
	const { toast } = useToast();
	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [selectedVariant, setSelectedVariant] = useState<any>(null);
	const [quantity, setQuantity] = useState(1);
	const [selectedTier, setSelectedTier] = useState("bronze");
	const [currentPrice, setCurrentPrice] = useState(0);

	useEffect(() => {
		fetchProduct();
	}, [params.id]);

	useEffect(() => {
		if (selectedVariant) {
			updatePrice();
		}
	}, [selectedVariant, quantity, selectedTier]);

	const fetchProduct = async () => {
		try {
			const response = await api.get(`/products/${params.id}`);
			const data = response.data;
			setProduct(data);
			if (data.variants && data.variants.length > 0) {
				setSelectedVariant(data.variants[0]);
				setQuantity(data.variants[0].moq || 1);
			}
		} catch (error) {
			console.error("Failed to fetch product:", error);
		} finally {
			setLoading(false);
		}
	};

	const updatePrice = () => {
		if (!selectedVariant) return;

		// Find the best tier price based on quantity
		let bestPrice = selectedVariant.wholesalePrice;
		let bestTier = "bronze";

		if (selectedVariant.tierPricing) {
			for (const tier of selectedVariant.tierPricing) {
				if (quantity >= tier.minimumQuantity && tier.price < bestPrice) {
					bestPrice = tier.price;
					bestTier = tier.tier;
				}
			}
		}

		setCurrentPrice(bestPrice);
		setSelectedTier(bestTier);
	};

	const handleAddToCart = () => {
		if (!selectedVariant) {
			toast({
				title: "Error",
				description: "Please select a variant",
				variant: "destructive",
			});
			return;
		}

		if (quantity < selectedVariant.moq) {
			toast({
				title: "Error",
				description: `Minimum order quantity is ${selectedVariant.moq}`,
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

		// Add to cart
		const cart = JSON.parse(localStorage.getItem("cart") || "[]");
		const existingItem = cart.find(
			(item: any) => item.variantId === selectedVariant._id
		);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart.push({
				productId: product._id,
				productName: product.name,
				variantId: selectedVariant._id,
				variantName: selectedVariant.variantName,
				price: currentPrice,
				quantity,
				tier: selectedTier,
				packSize: selectedVariant.packSize,
				packType: selectedVariant.packType,
			});
		}

		localStorage.setItem("cart", JSON.stringify(cart));

		toast({
			title: "Success",
			description: `Added ${quantity} ${selectedVariant.packType}(s) to cart`,
		});
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
									product.thumbnail ||
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
										className="aspect-square bg-gray-100 rounded overflow-hidden">
										<img
											src={img || "/placeholder.svg?height=100&width=100"}
											alt={`View ${idx + 1}`}
											className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
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
											{product.brand.name || product.brand}
										</Badge>
									</div>
								)}
								{product.category && (
									<div className="flex items-center gap-2">
										<span className="font-medium">Category:</span>
										<Badge variant="outline">
											{product.category.name || product.category}
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
												setQuantity(variant.moq || 1);
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

											{/* Tier Pricing */}
											{variant.tierPricing &&
												variant.tierPricing.length > 0 && (
													<div className="mt-3 pt-3 border-t">
														<p className="text-xs font-medium text-muted-foreground mb-2">
															Bulk Pricing:
														</p>
														<div className="grid grid-cols-2 gap-2 text-xs">
															{variant.tierPricing.map((tier: any) => (
																<div
																	key={tier.tier}
																	className="flex justify-between">
																	<span className="capitalize">
																		{tier.tier} ({tier.minimumQuantity}+):
																	</span>
																	<span className="font-medium">
																		₹{tier.price}
																	</span>
																</div>
															))}
														</div>
													</div>
												)}
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
										<Input
											id="quantity"
											type="number"
											min={selectedVariant.moq}
											max={selectedVariant.stock}
											value={quantity}
											onChange={(e) => {
												const newQuantity = Math.max(
													selectedVariant.moq,
													Math.min(
														selectedVariant.stock,
														Number.parseInt(e.target.value) ||
															selectedVariant.moq
													)
												);
												setQuantity(newQuantity);
											}}
											className="mt-2"
										/>
										<div className="flex justify-between text-xs text-muted-foreground mt-1">
											<span>Min: {selectedVariant.moq}</span>
											<span>Available: {selectedVariant.stock}</span>
										</div>
									</div>

									{/* Current Tier Info */}
									<div className="p-3 bg-primary/5 rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium">Current Tier:</span>
											<Badge variant="outline" className="capitalize">
												{selectedTier}
											</Badge>
										</div>
										<div className="text-xs text-muted-foreground">
											Total units: {quantity * selectedVariant.packSize} pieces
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
											<span>₹{currentPrice}</span>
										</div>
										<div className="flex justify-between">
											<span>Quantity:</span>
											<span>
												{quantity} {selectedVariant.packType}(s)
											</span>
										</div>
										<div className="flex justify-between">
											<span>Subtotal:</span>
											<span>₹{(currentPrice * quantity).toFixed(2)}</span>
										</div>
										<div className="flex justify-between text-sm text-muted-foreground">
											<span>GST ({product.gstPercentage}%):</span>
											<span>
												₹
												{(
													(currentPrice * quantity * product.gstPercentage) /
													100
												).toFixed(2)}
											</span>
										</div>
									</div>
									<Separator />
									<div className="flex justify-between font-bold text-lg">
										<span>Total Amount:</span>
										<span className="text-primary">
											₹
											{(
												currentPrice *
												quantity *
												(1 + product.gstPercentage / 100)
											).toFixed(2)}
										</span>
									</div>
									<div className="text-xs text-muted-foreground text-center">
										You save ₹
										{((selectedVariant.mrp - currentPrice) * quantity).toFixed(
											2
										)}{" "}
										from MRP
									</div>
								</CardContent>
							</Card>
						)}

						{/* Add to Cart Button */}
						<Button size="lg" className="w-full" onClick={handleAddToCart}>
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
