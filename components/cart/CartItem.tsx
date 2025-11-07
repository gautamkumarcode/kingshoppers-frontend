"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { calculateDiscountPercentage, formatPrice } from "@/lib/cart-utils";
import { CartItem as CartItemType } from "@/types/cart";
import { Loader2, Minus, Package, Plus, Trash2 } from "lucide-react";
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
			// You might want to show a toast notification here
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

	if (compact) {
		return (
			<div className="flex items-center gap-3 p-3 border rounded-lg">
				{/* Product Image */}
				<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
					{item.image ? (
						<img
							src={item.image}
							alt={item.name}
							className="w-full h-full object-cover rounded-lg"
						/>
					) : (
						<Package className="h-6 w-6 text-gray-400" />
					)}
				</div>

				{/* Product Info */}
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm truncate">{item.name}</h4>
					<p className="text-xs text-gray-600 truncate">{item.variantName}</p>
					<p className="text-sm font-semibold">
						{formatPrice(item.price)} × {item.quantity}
					</p>
				</div>

				{/* Total */}
				<div className="text-right">
					<p className="font-semibold">{formatPrice(itemTotal)}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex gap-4 p-4 border rounded-lg bg-white">
			{/* Product Image */}
			<div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
				{item.image ? (
					<img
						src={item.image}
						alt={item.name}
						className="w-full h-full object-cover rounded-lg"
					/>
				) : (
					<Package className="h-8 w-8 text-gray-400" />
				)}
			</div>

			{/* Product Details */}
			<div className="flex-1 space-y-2">
				<div>
					<Link
						href={`/products/${item.slug || item.productId}`}
						className="font-semibold text-lg hover:text-blue-600 transition-colors">
						{item.name}
					</Link>
					<p className="text-gray-600">{item.variantName}</p>
					<p className="text-sm text-gray-500">
						{item.packSize} {item.packType} • {item.brand}
					</p>
				</div>

				{/* Price Info */}
				<div className="flex items-center gap-2">
					<span className="font-semibold text-lg">
						{formatPrice(item.price)}
					</span>
					{discountPercent > 0 && (
						<>
							<span className="text-sm text-gray-500 line-through">
								{formatPrice(item.mrp)}
							</span>
							<span className="text-sm text-green-600 font-medium">
								{discountPercent}% off
							</span>
						</>
					)}
				</div>

				{/* Stock Status */}
				{item.stock <= 5 && item.stock > 0 && (
					<p className="text-sm text-orange-600">
						Only {item.stock} left in stock
					</p>
				)}

				{item.stock === 0 && (
					<p className="text-sm text-red-600 font-medium">Out of stock</p>
				)}
			</div>

			{/* Quantity Controls & Actions */}
			<div className="flex flex-col items-end gap-3">
				{/* Item Total */}
				<div className="text-right">
					<p className="font-semibold text-lg">{formatPrice(itemTotal)}</p>
					{itemSavings > 0 && (
						<p className="text-sm text-green-600">
							Save {formatPrice(itemSavings)}
						</p>
					)}
				</div>

				{/* Quantity Controls */}
				{showQuantityControls && (
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleDecrement}
							disabled={isUpdating || item.quantity <= 1}
							className="h-8 w-8 p-0"
							aria-label="Decrease quantity">
							<Minus className="h-4 w-4" />
						</Button>

						<div className="relative w-16 h-8">
							{isUpdating ? (
								<div className="absolute inset-0 flex items-center justify-center bg-white border rounded-md">
									<Loader2 className="h-4 w-4 animate-spin text-primary" />
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
									className="w-full h-full text-center"
									min={item.moq}
									max={item.stock}
									disabled={isUpdating}
									aria-label="Quantity"
								/>
							)}
						</div>

						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleIncrement}
							disabled={isUpdating || item.quantity >= item.stock}
							className="h-8 w-8 p-0"
							aria-label="Increase quantity">
							<Plus className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* MOQ Info */}
				{item.moq > 1 && (
					<p className="text-xs text-gray-500">Min: {item.moq} units</p>
				)}

				{/* Remove Button */}
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
						className="text-red-600 hover:text-red-700 hover:bg-red-50">
						<Trash2 className="h-4 w-4 mr-1" />
						Remove
					</Button>
				)}
			</div>
		</div>
	);
}
