import { CartItem, CartSummary, CartValidationError } from "@/types/cart";

/**
 * Calculate cart summary with detailed breakdown
 */
export function calculateCartSummary(items: CartItem[]): CartSummary {
	const subtotal = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const totalItems = items.length;
	const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
	const totalMRP = items.reduce(
		(sum, item) => sum + item.mrp * item.quantity,
		0
	);
	const savings = totalMRP - subtotal;
	const averageDiscount = totalMRP > 0 ? (savings / totalMRP) * 100 : 0;

	const totalGST = items.reduce((sum, item) => {
		const itemTotal = item.price * item.quantity;
		return sum + (itemTotal * item.gstPercentage) / 100;
	}, 0);

	const total = subtotal + totalGST;

	return {
		subtotal,
		totalItems,
		totalQuantity,
		totalGST,
		total,
		savings,
		averageDiscount,
	};
}

/**
 * Validate cart items against stock and MOQ requirements
 */
export function validateCartItems(items: CartItem[]): CartValidationError[] {
	const errors: CartValidationError[] = [];

	items.forEach((item) => {
		// Check if item is out of stock
		if (item.stock <= 0) {
			errors.push({
				itemId: item.id,
				productId: item.productId,
				variantId: item.variantId,
				error: "out_of_stock",
				message: `${item.name} (${item.variantName}) is out of stock`,
				availableStock: 0,
			});
		}
		// Check if quantity exceeds available stock
		else if (item.quantity > item.stock) {
			errors.push({
				itemId: item.id,
				productId: item.productId,
				variantId: item.variantId,
				error: "insufficient_stock",
				message: `Only ${item.stock} units available for ${item.name} (${item.variantName})`,
				availableStock: item.stock,
			});
		}
		// Check if quantity meets MOQ requirements
		else if (item.quantity < item.moq) {
			errors.push({
				itemId: item.id,
				productId: item.productId,
				variantId: item.variantId,
				error: "below_moq",
				message: `Minimum order quantity for ${item.name} (${item.variantName}) is ${item.moq}`,
				requiredMoq: item.moq,
			});
		}
	});

	return errors;
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = "₹"): string {
	return `${currency}${amount.toLocaleString("en-IN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
	mrp: number,
	price: number
): number {
	if (mrp <= 0) return 0;
	return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Get cart item display name
 */
export function getCartItemDisplayName(item: CartItem): string {
	return `${item.name} - ${item.variantName} (${item.packSize} ${item.packType})`;
}

/**
 * Check if cart meets minimum order requirements
 */
export function checkMinimumOrderValue(
	cartTotal: number,
	minimumOrderValue: number = 0
): { isValid: boolean; shortfall: number } {
	const isValid = cartTotal >= minimumOrderValue;
	const shortfall = isValid ? 0 : minimumOrderValue - cartTotal;

	return { isValid, shortfall };
}

/**
 * Group cart items by category or brand
 */
export function groupCartItems(
	items: CartItem[],
	groupBy: "category" | "brand" = "category"
): Record<string, CartItem[]> {
	return items.reduce((groups, item) => {
		const key =
			groupBy === "category" ? item.category || "Other" : item.brand || "Other";
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(item);
		return groups;
	}, {} as Record<string, CartItem[]>);
}

/**
 * Calculate estimated delivery weight
 */
export function calculateTotalWeight(items: CartItem[]): number {
	return items.reduce((total, item) => {
		// Assuming weight is stored per unit in grams
		const itemWeight = item.packSize * item.quantity * 100; // Default 100g per unit if no weight
		return total + itemWeight;
	}, 0);
}

/**
 * Generate cart summary for sharing or export
 */
export function generateCartSummaryText(
	items: CartItem[],
	summary: CartSummary
): string {
	let text = "🛒 Cart Summary\n\n";

	items.forEach((item, index) => {
		text += `${index + 1}. ${getCartItemDisplayName(item)}\n`;
		text += `   Qty: ${item.quantity} | Price: ${formatPrice(
			item.price
		)} each\n`;
		text += `   Total: ${formatPrice(item.price * item.quantity)}\n\n`;
	});

	text += `📊 Summary:\n`;
	text += `Subtotal: ${formatPrice(summary.subtotal)}\n`;
	text += `GST: ${formatPrice(summary.totalGST)}\n`;
	text += `Total: ${formatPrice(summary.total)}\n`;
	text += `Savings: ${formatPrice(summary.savings)}\n`;
	text += `Items: ${summary.totalItems} | Quantity: ${summary.totalQuantity}`;

	return text;
}

/**
 * Check if two cart items are the same product variant
 */
export function isSameCartItem(item1: CartItem, item2: CartItem): boolean {
	return (
		item1.productId === item2.productId && item1.variantId === item2.variantId
	);
}

/**
 * Merge duplicate cart items
 */
export function mergeDuplicateItems(items: CartItem[]): CartItem[] {
	const merged: CartItem[] = [];

	items.forEach((item) => {
		const existingIndex = merged.findIndex((mergedItem) =>
			isSameCartItem(item, mergedItem)
		);

		if (existingIndex >= 0) {
			merged[existingIndex].quantity += item.quantity;
		} else {
			merged.push({ ...item });
		}
	});

	return merged;
}

/**
 * Calculate bulk discount if applicable
 */
export function calculateBulkDiscount(
	quantity: number,
	price: number,
	bulkTiers: Array<{ minQuantity: number; discountPercent: number }> = []
): { discountPercent: number; discountAmount: number; finalPrice: number } {
	let applicableDiscount = 0;

	// Find the highest applicable bulk discount
	bulkTiers.forEach((tier) => {
		if (
			quantity >= tier.minQuantity &&
			tier.discountPercent > applicableDiscount
		) {
			applicableDiscount = tier.discountPercent;
		}
	});

	const discountAmount = (price * applicableDiscount) / 100;
	const finalPrice = price - discountAmount;

	return {
		discountPercent: applicableDiscount,
		discountAmount,
		finalPrice,
	};
}
