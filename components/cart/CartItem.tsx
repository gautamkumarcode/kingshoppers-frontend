"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem as CartItemType } from "@/context/CartContext";
import { useCart } from "@/hooks/useCart";
import { calculateDiscountPercentage, formatPrice } from "@/lib/cart-utils";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CartItemProps {
	item: CartItemType;
	showRemoveButton?: boolean;
	showQuantityControls?: boolean;
	compact?: boolean;
}

export function CartItem({
	item,
	showRemoveButton = true,
	showQuantityControls = true,
	compact = false,
}: CartItemProps) {
	const { updateItemQuantity, removeItem, incrementItem, decrementItem } =
		useCart();
	const [isUpdating, setIsUpdating] = useState(false);

	const discountPercent = calculateDiscountPercentage(item.mrp, item.price);
	const itemTotal = item.price * item.quantity;
	const itemSavings = (item.mrp - item.price) * item.quantity;

	const handleQuantityChange = async (newQuantity: number) => {
		if (newQuantity === item.quantity) return;

		setIsUpdating(true);
		try {
			if (newQuantity <= 0) {
				removeItem(item.productId, item.variantId);
			} else {
				updateItemQuantity(item.productId, item.variantId, newQuantity);
			}
		} catch (error) {
			console.error("Error updating quantity:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleIncrement = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isUpdating || item.quantity >= item.stock) return;

		setIsUpdating(true);
		try {
			await incrementItem(item.productId, item.variantId);
		} catch (error) {
			console.error("Error incrementing quantity:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDecrement = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isUpdating || item.quantity <= 1) return;

		setIsUpdating(true);
		try {
			await decrementItem(item.productId, item.variantId);
		} catch (error) {
			console.error("Error decrementing quantity:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	console.log(item);
	if (compact) {
		return (
			<div className="flex items-start gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
				{/* Product Image */}
				<div className="relative w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
					<NextImage
						src={item?.image || "/placeholder-product.png"}
						alt={item.name}
						fill
						className="object-cover"
						sizes="64px"
					/>
				</div>

				{/* Product Info */}
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm leading-snug line-clamp-2 mb-1.5">
						{item.name}
					</h4>
					<p className="text-xs text-gray-500 mb-2">{item.variantName}</p>

					<div className="flex items-center gap-2 mb-2">
						<p className="text-base font-bold">{formatPrice(item.price)}</p>
						{discountPercent > 0 && (
							<>
								<span className="text-xs text-gray-400 line-through">
									{formatPrice(item.mrp)}
								</span>
								<span className="text-xs text-green-600 font-semibold">
									{discountPercent}% off
								</span>
							</>
						)}
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs text-gray-500">Qty: {item.quantity}</span>
						<p className="font-bold text-base">{formatPrice(itemTotal)}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl bg-white shadow-sm">
			{/* Mobile: Image + Header Row */}
			<div className="flex gap-3 sm:hidden">
				<Link
					href={`/products/${item.slug || item.productId}`}
					className="shrink-0">
					<div className="relative w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
						<NextImage
							src={item?.image || "/placeholder-product.png"}
							alt={item.name}
							fill
							className="object-cover"
							sizes="80px"
						/>
					</div>
				</Link>

				<div className="flex-1 min-w-0">
					<Link
						href={`/products/${item.slug || item.productId}`}
						className="font-semibold text-sm leading-tight hover:text-blue-600 transition-colors line-clamp-2 block mb-1">
						{item.name}
					</Link>
					<p className="text-xs text-gray-600 mb-1">{item.variantName}</p>
					{item.packSize && (
						<p className="text-xs text-gray-500">
							{item.packSize} {item.packType}
						</p>
					)}
				</div>

				{showRemoveButton && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							if (!isUpdating) {
								removeItem(item.productId, item.variantId);
							}
						}}
						disabled={isUpdating}
						className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-lg shrink-0">
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				)}
			</div>

			{/* Desktop: Image */}
			<Link
				href={`/products/${item.slug || item.productId}`}
				className="hidden sm:block shrink-0">
				<div className="relative w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
					<NextImage
						src={item?.image || "/placeholder-product.png"}
						alt={item.name}
						fill
						className="object-cover"
						sizes="96px"
					/>
				</div>
			</Link>

			{/* Product Details */}
			<div className="flex-1 min-w-0 flex flex-col">
				{/* Desktop: Header */}
				<div className="hidden sm:flex gap-3 mb-2">
					<div className="flex-1 min-w-0">
						<Link
							href={`/products/${item.slug || item.productId}`}
							className="font-semibold text-base hover:text-blue-600 transition-colors line-clamp-2 block leading-snug mb-1">
							{item.name}
						</Link>
						<p className="text-sm text-gray-600 mb-0.5">{item.variantName}</p>
						{item.packSize && (
							<p className="text-xs text-gray-500">
								{item.packSize} {item.packType}
							</p>
						)}
					</div>

					{showRemoveButton && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (!isUpdating) {
									removeItem(item.productId, item.variantId);
								}
							}}
							disabled={isUpdating}
							className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0 rounded-lg shrink-0">
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Price Information */}
				<div className="flex items-center gap-2 flex-wrap mb-2">
					<span className="font-bold text-base sm:text-lg text-gray-900">
						{formatPrice(item.price)}
					</span>
					{discountPercent > 0 && (
						<>
							<span className="text-xs sm:text-sm text-gray-400 line-through">
								{formatPrice(item.mrp)}
							</span>
							<span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
								{discountPercent}% OFF
							</span>
						</>
					)}
				</div>

				{/* Status Messages */}
				{(item.stock <= 5 || item.moq > 1) && (
					<div className="mb-2 flex flex-wrap gap-1.5">
						{item.stock <= 5 && item.stock > 0 && (
							<p className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-md">
								⚠️ Only {item.stock} left
							</p>
						)}

						{item.stock === 0 && (
							<p className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md">
								Out of stock
							</p>
						)}

						{item.moq > 1 && (
							<p className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
								Min: {item.moq} units
							</p>
						)}
					</div>
				)}

				{/* Bottom Section: Quantity Controls and Total */}
				<div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
					<div className="flex items-center justify-between gap-3">
						{/* Quantity Controls */}
						{showQuantityControls && (
							<div className="flex items-center gap-0 bg-gray-100 rounded-lg p-0.5 sm:p-1 border border-gray-200">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={handleDecrement}
									disabled={isUpdating || item.quantity <= 1}
									className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md hover:bg-white disabled:opacity-40"
									aria-label="Decrease quantity">
									<Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								</Button>

								<div className="relative w-10 sm:w-12">
									{isUpdating ? (
										<div className="h-7 sm:h-8 flex items-center justify-center">
											<Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
										</div>
									) : (
										<Input
											type="number"
											value={item.quantity}
											onChange={(e) => {
												e.preventDefault();
												e.stopPropagation();
												const newQty = parseInt(e.target.value) || 0;
												if (newQty !== item.quantity && newQty > 0) {
													handleQuantityChange(newQty);
												}
											}}
											className="w-full h-7 sm:h-8 text-center text-xs sm:text-sm font-semibold p-0 border-0 bg-transparent rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
											min={item.moq}
											max={item.stock}
											disabled={isUpdating}
											aria-label="Quantity"
										/>
									)}
								</div>

								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={handleIncrement}
									disabled={isUpdating || item.quantity >= item.stock}
									className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md hover:bg-white disabled:opacity-40"
									aria-label="Increase quantity">
									<Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								</Button>
							</div>
						)}

						{/* Item Total */}
						<div className="text-right">
							<p className="font-bold text-base sm:text-lg text-gray-900">
								{formatPrice(itemTotal)}
							</p>
							{itemSavings > 0 && (
								<p className="text-xs text-green-700 font-semibold">
									Save {formatPrice(itemSavings)}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
