"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
	const validVariants =
		product.variants?.filter((v) => v.wholesalePrice && v.mrp) || [];

	const lowestPrice =
		validVariants.length > 0
			? Math.min(...validVariants.map((v) => v.wholesalePrice))
			: 0;

	const highestMRP =
		validVariants.length > 0 ? Math.max(...validVariants.map((v) => v.mrp)) : 0;

	const minMOQ =
		validVariants.length > 0
			? Math.min(...validVariants.map((v) => v.moq || 1))
			: 1;

	// ✅ Image URL logic

	return (
		<Link href={`/products/${product._id}`}>
			<Card className="hover:shadow-lg transition-all duration-200 h-full group">
				<CardContent className="p-4">
					{/* Product Image */}
					<div className="relative mb-4">
						<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
							<img
								src={
									product.thumbnail ||
									"/placeholder.svg?height=200&width=200&text=Product"
								}
								alt={product.name}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
							/>
						</div>
						{product.isFeatured && (
							<Badge className="absolute top-2 left-2 bg-yellow-500">
								<Star className="w-3 h-3 mr-1" />
								Featured
							</Badge>
						)}
					</div>

					{/* Product Info */}
					<div className="space-y-2">
						<div className="flex items-start justify-between">
							<h3 className="font-semibold line-clamp-2 text-sm leading-tight">
								{product.name}
							</h3>
						</div>

						{/* Brand and Category */}
						<div className="flex items-center gap-2 text-xs">
							{typeof product.brand === "object" && product.brand?.name && (
								<Badge variant="secondary" className="text-xs">
									{product?.brand?.name}
								</Badge>
							)}
						</div>

						{/* SKU */}
						<p className="text-xs text-muted-foreground">SKU: {product.sku}</p>

						{/* Pricing */}
						<div className="space-y-1">
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">From:</span>
								<div className="text-right">
									<span className="text-xs text-muted-foreground line-through">
										₹{highestMRP}
									</span>
									<p className="text-lg font-bold text-primary">
										₹{lowestPrice}
									</p>
								</div>
							</div>
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>MOQ: {minMOQ}</span>
								<span>{product.variants.length} variants</span>
							</div>
						</div>

						{/* Action Button */}
						<Button size="sm" className="w-full mt-3">
							<ShoppingCart className="w-3 h-3 mr-2" />
							View Details
						</Button>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
