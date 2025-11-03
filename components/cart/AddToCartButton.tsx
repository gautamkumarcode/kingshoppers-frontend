"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Product, ProductVariant } from "@/types/product";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
	product: Product;
	variant: ProductVariant;
	quantity?: number;
	showQuantityControls?: boolean;
	disabled?: boolean;
	className?: string;
}

export function AddToCartButton({
	product,
	variant,
	quantity = 1,
	showQuantityControls = false,
	disabled = false,
	className = "",
}: AddToCartButtonProps) {
	const {
		addProductToCart,
		isInCart,
		getItemQuantity,
		incrementItem,
		decrementItem,
		removeItem,
	} = useCart();

	const [isAdding, setIsAdding] = useState(false);
	const inCart = isInCart(product._id, variant._id);
	const currentQuantity = getItemQuantity(product._id, variant._id);

	const isOutOfStock = variant.stock <= 0;
	const isDisabled = disabled || isOutOfStock || isAdding;

	const handleAddToCart = async () => {
		setIsAdding(true);
		try {
			console.log("Adding to cart:", { product, variant, quantity });
			addProductToCart(product, variant, quantity);
			console.log("Successfully added to cart");
		} catch (error) {
			console.error("Error adding to cart:", error);
			// You might want to show a toast notification here
			alert(
				`Error adding to cart: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		} finally {
			setIsAdding(false);
		}
	};

	const handleIncrement = () => {
		if (currentQuantity < variant.stock) {
			incrementItem(product._id, variant._id);
		}
	};

	const handleDecrement = () => {
		if (currentQuantity > 1) {
			decrementItem(product._id, variant._id);
		} else {
			removeItem(product._id, variant._id);
		}
	};

	// If item is in cart and we want to show quantity controls
	if (inCart && showQuantityControls) {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<Button
					variant="outline"
					size="sm"
					onClick={handleDecrement}
					disabled={isAdding}
					className="h-8 w-8 p-0">
					<Minus className="h-4 w-4" />
				</Button>

				<span className="min-w-8 text-center font-medium">
					{currentQuantity}
				</span>

				<Button
					variant="outline"
					size="sm"
					onClick={handleIncrement}
					disabled={isAdding || currentQuantity >= variant.stock}
					className="h-8 w-8 p-0">
					<Plus className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	// Regular add to cart button
	return (
		<Button
			onClick={handleAddToCart}
			disabled={isDisabled}
			className={className}>
			{isAdding ? (
				<>
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
					Adding...
				</>
			) : inCart ? (
				<>
					<Check className="h-4 w-4 mr-2" />
					Added to Cart
				</>
			) : isOutOfStock ? (
				"Out of Stock"
			) : (
				<>
					<ShoppingCart className="h-4 w-4 mr-2" />
					Add to Cart
				</>
			)}
		</Button>
	);
}
