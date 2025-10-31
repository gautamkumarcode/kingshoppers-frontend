export interface UserListResponse {
	_id: string;
	ownerName: string;
	email: string;
	phone: string;
	userTypes: string;
	shopName?: string;
	isApproved: boolean;
}
