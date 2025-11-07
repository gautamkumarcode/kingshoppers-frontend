export interface User {
	shopAddress: ShopAddress;
	approvalStatus: string;
	rejectionReason?: string;
	_id: string;
	shopName: string;
	ownerName: string;
	phone: string;
	shopType: string;
	gstNumber: string;
	creditLimit: number;
	creditUsed: number;
	availableCredit: number;
	paymentTerms: string;
	customerTier: string;
	discountPercentage: number;
	minimumOrderValue: number;
	totalOrders: number;
	totalOrderValue: number;
	averageOrderValue: number;
	totalPaid: number;
	pendingAmount: number;
	overdueAmount: number;
	isActive: boolean;
	isApproved: boolean;
	documents: any[];
	gstDocument?: {
		url: string;
		publicId: string;
		uploadedAt: string;
	};
	aadhaarPhoto?: {
		url: string;
		publicId: string;
		uploadedAt: string;
	};
	aadhaarPhotoBack?: {
		url: string;
		publicId: string;
		uploadedAt: string;
	};
	panCardPhoto?: {
		url: string;
		publicId: string;
		uploadedAt: string;
	};
	walletBalance?: number;
	customerSince: Date;
	specialPricing: any[];
	createdAt: Date;
	updatedAt: Date;
	userTypes: string;
	email: string;
	__v: number;
}

export interface ShopAddress {
	street: string;
	area: string;
	city: string;
	state: string;
	pincode: string;
	landmark: string;
}
