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
			<Card className="hover:shadow-lg transition-all duration-200 h-full group p-0 rounded-sm">
				<CardContent className="p-0 pb-1">
					{/* Product Image */}
					<div className="relative mb-1.5 sm:mb-3 md:mb-4">
						<div className="aspect-square bg-gray-100 rounded-t-sm overflow-hidden">
							<img
								src={
									product.thumbnail ||
									"/placeholder.svg?height=200&width=200&text=Product"
								}
								alt={product.name}
								className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
							/>
						</div>
						{product.isFeatured && (
							<Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-yellow-500 text-[10px] sm:text-xs">
								<Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
								Featured
							</Badge>
						)}
						{product?.calculatedMargin! && (
							<Badge className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-green-600 text-[10px] sm:text-xs">
								{Math.round(product.calculatedMargin!)}% OFF
							</Badge>
						)}
					</div>

					{/* Product Info */}
					<div className=" sm:space-y-2 px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4">
						<div className="flex items-start justify-between">
							<h3 className="font-semibold line-clamp-2 text-xs sm:text-sm md:text-base leading-tight">
								{product.name}
							</h3>
						</div>

						{/* Brand and Category */}
						<div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
							{typeof product.brand === "object" && product.brand?.name && (
								<Badge
									variant="secondary"
									className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
									{product?.brand?.name}
								</Badge>
							)}
						</div>

						{/* SKU */}
						{product.sku && (
							<p className="text-[10px] sm:text-xs text-muted-foreground truncate">
								SKU: {product.sku}
							</p>
						)}

						{/* Pricing */}
						<div className="">
							<div className="flex items-center justify-between">
								<span className="text-[10px] sm:text-xs text-muted-foreground">
									From:
								</span>
								<div className="text-right flex gap-1 sm:gap-2">
									<p className="text-sm sm:text-base md:text-lg font-bold text-primary">
										₹{lowestPrice}
									</p>
									<span className="text-[8px] sm:text-xs text-muted-foreground line-through flex items-center">
										₹{highestMRP}
									</span>
								</div>
							</div>
							<div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
								<span>MOQ: {minMOQ}</span>
								<span>{product.variants.length} variants</span>
							</div>
						</div>

						{/* Action Button */}
						<Button
							size="sm"
							className="w-full mt-1.5 sm:mt-3 text-xs sm:text-sm h-7 sm:h-8 md:h-9 flex justify-self-end self-end items-center bg-linear-to-tl to-blue-500 from-indigo-500 justify-center">
							<ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
							View Details
						</Button>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
