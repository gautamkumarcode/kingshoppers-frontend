export interface Hub {
	_id: string;
	name: string;
	code: string;
	address: {
		street: string;
		city: string;
		state: string;
		pincode: string;
		country?: string;
	};
	geoLocation: {
		type: "Point";
		coordinates: [number, number]; // [longitude, latitude]
	};
	description?: string;
	capacity?: number;
	contactInfo?: {
		phone?: string;
		email?: string;
		managerName?: string;
		managerPhone?: string;
	};
	servicePincodes: string[];
	deliveryRadius: number;
	isActive: boolean;
	isOperational: boolean;
	operatingHours?: {
		[key: string]: {
			open: string;
			close: string;
		};
	};
	totalCustomers: number;
	totalOrders: number;
	totalRevenue: number;
	createdAt: string;
	updatedAt: string;
}

export interface HubStock {
	_id: string;
	hub: string | Hub;
	product: string | Product;
	variantId?: string;
	variantSku?: string;
	quantity: number;
	reservedQuantity: number;
	availableQuantity: number;
	costPrice: number;
	sellingPrice: number;
	mrp: number;
	discountPercentage: number;
	tierPricing: TierPricing[];
	minimumStock: number;
	maximumStock: number;
	reorderLevel: number;
	isActive: boolean;
	isAvailable: boolean;
	lastRestocked?: string;
	lastSold?: string;
	totalSold: number;
	totalRestocked: number;
	hasExpiry: boolean;
	expiryDate?: string;
	batchNumber?: string;
	location?: {
		section?: string;
		shelf?: string;
		position?: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface TierPricing {
	tier: "bronze" | "silver" | "gold" | "platinum";
	price: number;
	discountPercentage: number;
}

export interface HubStatistics {
	totalProducts: number;
	activeProducts: number;
	lowStockItems: number;
	outOfStockItems: number;
	totalStockValue: number;
}

export interface ProductAvailability {
	available: boolean;
	reason: string;
	availableQuantity: number;
	requestedQuantity?: number;
	stockInfo?: {
		sellingPrice: number;
		mrp: number;
		discountPercentage: number;
		tierPricing: TierPricing[];
	};
}

export interface ProductPricing {
	price: number;
	discountPercentage: number;
	finalPrice: number;
}

export interface HubAssignmentData {
	customerId: string;
	hubId?: string;
}

export interface NearbyHubsResponse {
	nearbyHubs: Hub[];
	recommendedHub?: Hub;
	customerAddress?: {
		street?: string;
		city?: string;
		state?: string;
		pincode?: string;
	};
}

// Extended Product interface with hub-specific data
export interface ProductWithHubData extends Product {
	hubStock?: {
		hubId: string;
		quantity: number;
		availableQuantity: number;
		sellingPrice: number;
		mrp: number;
		customerPrice: number;
		discountPercentage: number;
		finalPrice: number;
		variantId?: string;
		variantSku?: string;
	};
}

// Base Product interface (you might already have this)
export interface Product {
	_id: string;
	name: string;
	slug: string;
	description?: string;
	shortDescription?: string;
	category?: {
		_id: string;
		name: string;
		slug?: string;
	};
	brand?: {
		_id: string;
		name: string;
		slug?: string;
	};
	thumbnail?: string;
	images?: string[];
	sku: string;
	gstPercentage: number;
	isFeatured: boolean;
	isOnSale: boolean;
	totalSold: number;
	averageRating: number;
	totalReviews: number;
	variants?: ProductVariant[];
	createdAt: string;
	updatedAt: string;
}

export interface ProductVariant {
	_id: string;
	variantName: string;
	variantSku: string;
	packSize: number;
	packType: string;
	mrp: number;
	wholesalePrice: number;
	costPrice?: number;
	stock: number;
	weight?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	isActive: boolean;
	isInStock: boolean;
}

// Order interfaces with hub support
export interface OrderItem {
	productId: string;
	variantId?: string;
	quantity: number;
	hubId?: string; // For hub-based orders
}

export interface HubOrderRequest {
	items: OrderItem[];
	deliveryAddress: any;
	paymentMethod: string;
	paymentTerms?: string;
	paymentDetails?: any;
	couponCode?: string;
	couponDiscount?: number;
	shippingCost?: number;
	packingCharges?: number;
	walletAdvance?: number;
	clearCart?: boolean;
}

export interface HubOrderResponse {
	success: boolean;
	message: string;
	order: any;
	hubInfo?: {
		hubId: string;
		fulfillmentDetails: any[];
	};
}
