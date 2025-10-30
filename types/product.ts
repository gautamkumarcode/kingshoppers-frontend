export interface ProductVariant {
	_id: string;
	variantName: string;
	variantSku: string;
	packSize: number;
	packType: string;
	mrp: number;
	wholesalePrice: number;
	costPrice: number;
	discountPercentage: number;
	discountedPrice: number;
	stock: number;
	lowStockAlert: number;
	moq?: number;
	weight?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	isActive: boolean;
	isInStock: boolean;
	tierPricing: TierPricing[];
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
	description: string;
	shortDescription: string;
	category: string | { _id: string; name: string; slug: string };
	brand: string | { _id: string; name: string; slug: string };
	sku: string;
	barcode?: string;
	hsnCode?: string;
	images: string[];
	thumbnail: string;
	variants: ProductVariant[];
	specifications: ProductSpecification[];
	moq: number;
	isActive: boolean;
	isFeatured: boolean;
	gstPercentage: number;
	metaTitle?: string;
	metaDescription?: string;
	keywords: string[];
	totalSold: number;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
}
