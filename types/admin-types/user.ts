export interface UserListResponse {
	_id: string;
	ownerName: string;
	email: string;
	phone: string;
	alternatePhone?: string;
	userTypes: string;
	shopName?: string;
	isApproved: boolean;
	approvalStatus?: "pending" | "approved" | "rejected";
	rejectionReason?: string;
	shopAddress?: {
		street?: string;
		area?: string;
		city?: string;
		state?: string;
		pincode?: string;
		landmark?: string;
	};
	gstNumber?: string;
	panNumber?: string;
	tradeLicense?: string;
	gstDocument?: {
		url: string;
		publicId?: string;
		uploadedAt?: Date;
	};
	aadhaarPhoto?: {
		url: string;
		publicId?: string;
		uploadedAt?: Date;
	};
	aadhaarPhotoBack?: {
		url: string;
		publicId?: string;
		uploadedAt?: Date;
	};
	panCardPhoto?: {
		url: string;
		publicId?: string;
		uploadedAt?: Date;
	};
	customerSince?: Date;
	customerTier?: string;
	totalOrders?: number;
	totalOrderValue?: number;
	notes?: string;
	shopType?: string;
	creditLimit?: number;
	paymentTerms?: string;
	discountPercentage?: number;
}
