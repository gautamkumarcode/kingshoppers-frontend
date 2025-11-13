export interface ProductVariant {
	_id: string;
	variantName: string;
	variantSku: string;
	packSize: number;
	packType: string;
	mrp: number;
	wholesalePrice: number;
	stock: number;
	moq?: number;
	weight?: number;
	isActive: boolean;
	isInStock: boolean;
	// Fields below only available in admin/detail views
	costPrice?: number;
	discountPercentage?: number;
	discountedPrice?: number;
	lowStockAlert?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	tierPricing?: TierPricing[];
}

export interface TierPricing {
	_id: string;
	tier: "bronze" | "silver" | "gold" | "platinum";
	price: number;
	minimumQuantity: number;
}

export interface ProductSpecification {
	_id: string;
	name: string;
	value: string;
}

export interface Product {
	_id: string;
	name: string;
	slug: string;
	shortDescription: string;
	category: string | { _id: string; name: string; slug?: string } | null;
	brand:
		| string
		| { _id: string; name: string; slug?: string; region?: string }
		| null;
	thumbnail: string;
	variants: ProductVariant[];
	gstPercentage: number;
	isFeatured: boolean;
	totalSold: number;
	minPrice?: number; // Available in listing
	// Fields below only available in detail views
	description?: string;
	images?: string[];
	specifications?: ProductSpecification[];
	keywords?: string[];
	// Fields below only in admin views
	sku?: string;
	barcode?: string;
	hsnCode?: string;
	moq?: number;
	isActive?: boolean;
	metaTitle?: string;
	metaDescription?: string;
	viewCount?: number;
	calculatedMargin?: number; // For high margin products
	createdAt?: string;
	updatedAt?: string;
}
