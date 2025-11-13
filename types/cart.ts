export interface CartItem {
	id: string;
	productId: string;
	variantId: string;
	name: string;
	variantName: string;
	image?: string;
	price: number;
	mrp: number;
	quantity: number;
	packSize: number;
	packType: string;
	stock: number;
	moq: number;
	gstPercentage: number;
	slug?: string;
	brand?: string;
	category?: string;
}

export interface CartSummary {
	subtotal: number;
	totalMRP: number;
	totalItems: number;
	totalQuantity: number;
	totalGST: number;
	cgst: number;
	sgst: number;
	igst: number;
	total: number;
	savings: number;
	averageDiscount: number;
}

export interface CartValidationError {
	itemId: string;
	productId: string;
	variantId: string;
	error:
		| "out_of_stock"
		| "insufficient_stock"
		| "below_moq"
		| "product_unavailable";
	message: string;
	availableStock?: number;
	requiredMoq?: number;
}

export interface AddToCartRequest {
	productId: string;
	variantId: string;
	quantity: number;
}

export interface CartState {
	items: CartItem[];
	isLoading: boolean;
	lastUpdated: Date | null;
	errors: CartValidationError[];
}

// Utility types for cart operations
export type CartActionType = "add" | "remove" | "update" | "clear" | "validate";

export interface CartMetrics {
	totalValue: number;
	totalSavings: number;
	averageOrderValue: number;
	uniqueProducts: number;
	totalWeight?: number;
}
