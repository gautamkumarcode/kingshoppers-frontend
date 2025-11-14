export interface User {
	shopAddress: ShopAddress;
	approvalStatus: string;
	rejectionReason?: string;
	_id: string;
	shopName: string;
	ownerName: string;
	phone: string;
	alternatePhone?: string;
	shopType: string;
	gstNumber: string;
	panNumber?: string;
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
	businessSettings?: {
		businessName?: string;
		bankDetails?: {
			upiId?: string;
			accountNumber?: string;
			ifscCode?: string;
			bankName?: string;
		};
	};
	customerSince: Date;
	specialPricing: any[];
	createdAt: Date;
	updatedAt: Date;
	// Support both userTypes (Customer schema) and userType (User schema)
	userTypes?: string;
	userType?: string;
	email: string;
	// Admin/Sales Executive specific fields
	firstName?: string;
	lastName?: string;
	assignedArea?: string;
	incentivePercentage?: number;
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
