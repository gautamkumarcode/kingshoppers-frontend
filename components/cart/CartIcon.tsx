"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CartIconProps {
	showCount?: boolean;
	variant?: "default" | "outline" | "ghost";
	size?: "sm" | "default" | "lg";
}

export function CartIcon({
	showCount = true,
	variant = "ghost",
	size = "default",
}: CartIconProps) {
	const { getCartItemsCount, isEmpty } = useCart();
	const totalItems = getCartItemsCount();

	return (
		<Link href="/cart">
			<Button variant={variant} size={size} className="relative">
				<ShoppingCart className="h-5 w-5" />
				{showCount && !isEmpty && (
					<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
						{totalItems > 99 ? "99+" : totalItems}
					</span>
				)}
				<span className="sr-only">Shopping cart with {totalItems} items</span>
			</Button>
		</Link>
	);
}
