import { useCart as useCartContext } from "@/context/CartContext";
import {
	calculateCartSummary,
	formatPrice,
	validateCartItems,
} from "@/lib/cart-utils";
import { CartItem } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product";
import { useMemo } from "react";

/**
 * Enhanced cart hook with additional utilities
 */
export function useCart() {
	const cart = useCartContext();

	// Memoized calculations
	const summary = useMemo(() => calculateCartSummary(cart.items), [cart.items]);
	const validationErrors = useMemo(
		() => validateCartItems(cart.items),
		[cart.items]
	);
	const hasErrors = validationErrors.length > 0;
	const isEmpty = cart.items.length === 0;

	/**
	 * Add product variant to cart
	 */
	const addProductToCart = async (
		product: Product,
		variant: ProductVariant,
		quantity: number = 1
	) => {
		try {
			// Validate required product data
			if (!product || !variant) {
				throw new Error("Product or variant data is missing");
			}

			if (!product._id || !variant._id) {
				throw new Error("Product or variant ID is missing");
			}

			// Ensure all required fields have valid values
			const cartItem: Omit<CartItem, "quantity"> = {
				id: `${product._id}-${variant._id}`,
				productId: product._id,
				variantId: variant._id,
				name: product.name || "Unknown Product",
				variantName: variant.variantName || "Default Variant",
				image:
					product.thumbnail ||
					(product.images && product.images[0]) ||
					undefined,
				price: variant.wholesalePrice || 0,
				mrp: variant.mrp || 0,
				packSize: variant.packSize || 1,
				packType: variant.packType || "piece",
				stock: variant.stock || 0,
				moq: variant.moq || 1,
				gstPercentage: product.gstPercentage || 0,
				slug: product.slug,
				brand:
					typeof product.brand === "string"
						? product.brand
						: product.brand?.name || "Unknown Brand",
				category:
					typeof product.category === "string"
						? product.category
						: product.category?.name || "Unknown Category",
			};

			console.log("Prepared cart item:", cartItem);
			await cart.addItem(cartItem, quantity);
		} catch (error) {
			console.error("Error in addProductToCart:", error);
			throw error;
		}
	};

	/**
	 * Update item quantity with validation
	 */
	const updateItemQuantity = async (
		productId: string,
		variantId: string,
		quantity: number
	) => {
		const item = cart.items.find(
			(item) => item.productId === productId && item.variantId === variantId
		);

		if (!item) return;

		// Validate against stock and MOQ
		if (quantity > item.stock) {
			throw new Error(`Only ${item.stock} units available`);
		}

		if (quantity > 0 && quantity < item.moq) {
			throw new Error(`Minimum order quantity is ${item.moq}`);
		}

		await cart.updateQuantity(productId, variantId, quantity);
	};

	/**
	 * Get formatted cart summary
	 */
	const getFormattedSummary = () => ({
		subtotal: formatPrice(summary.subtotal),
		totalMRP: formatPrice(summary.totalMRP),
		totalGST: formatPrice(summary.totalGST),
		total: formatPrice(summary.total),
		savings: formatPrice(summary.savings),
		totalItems: summary.totalItems,
		totalQuantity: summary.totalQuantity,
		averageDiscount: `${summary.averageDiscount.toFixed(1)}%`,
	});

	/**
	 * Check if cart can be checked out
	 */
	const canCheckout = () => {
		return !isEmpty && !hasErrors && !cart.isLoading;
	};

	/**
	 * Get cart validation status
	 */
	const getValidationStatus = () => ({
		isValid: !hasErrors,
		errors: validationErrors,
		canProceed: canCheckout(),
	});

	/**
	 * Quick add/remove toggle
	 */
	const toggleItem = async (product: Product, variant: ProductVariant) => {
		if (cart.isInCart(product._id, variant._id)) {
			await cart.removeItem(product._id, variant._id);
		} else {
			await addProductToCart(product, variant, variant.moq || 1);
		}
	};

	/**
	 * Increment item quantity
	 */
	const incrementItem = async (productId: string, variantId: string) => {
		const currentQuantity = cart.getItemQuantity(productId, variantId);
		await updateItemQuantity(productId, variantId, currentQuantity + 1);
	};

	/**
	 * Decrement item quantity
	 */
	const decrementItem = async (productId: string, variantId: string) => {
		const currentQuantity = cart.getItemQuantity(productId, variantId);
		if (currentQuantity > 1) {
			await updateItemQuantity(productId, variantId, currentQuantity - 1);
		} else {
			await cart.removeItem(productId, variantId);
		}
	};

	/**
	 * Get item by product and variant ID
	 */
	const getCartItem = (productId: string, variantId: string) => {
		return cart.items.find(
			(item) => item.productId === productId && item.variantId === variantId
		);
	};

	/**
	 * Get cart metrics
	 */
	const getCartMetrics = () => ({
		totalValue: summary.total,
		totalSavings: summary.savings,
		averageOrderValue:
			summary.totalItems > 0 ? summary.total / summary.totalItems : 0,
		uniqueProducts: cart.items.length,
		averageDiscount: summary.averageDiscount,
	});

	return {
		// Original cart context
		...cart,

		// Enhanced data
		summary,
		validationErrors,
		hasErrors,
		isEmpty,

		// Enhanced methods
		addProductToCart,
		updateItemQuantity,
		toggleItem,
		incrementItem,
		decrementItem,
		getCartItem,

		// Utilities
		getFormattedSummary,
		canCheckout,
		getValidationStatus,
		getCartMetrics,
	};
}
