"use client";

import api from "@/lib/api";
import { Hub, ProductWithHubData } from "@/types/hub";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface HubContextType {
	// Customer's assigned hub
	assignedHub: Hub | null;

	// Hub-based products
	hubProducts: ProductWithHubData[];
	loadingProducts: boolean;

	// Hub operations
	fetchHubProducts: (filters?: any) => Promise<void>;
	checkProductAvailability: (
		productId: string,
		variantId?: string,
		quantity?: number
	) => Promise<any>;
	getProductPrice: (productId: string, variantId?: string) => Promise<any>;

	// Admin operations (if user is admin)
	allHubs: Hub[];
	loadingHubs: boolean;
	fetchAllHubs: () => Promise<void>;
	createHub: (hubData: any) => Promise<Hub>;
	updateHub: (hubId: string, hubData: any) => Promise<Hub>;
	deleteHub: (hubId: string) => Promise<void>;

	// Hub assignment operations
	assignHubToCustomer: (customerId: string, hubId: string) => Promise<void>;
	getNearbyHubs: (customerId: string) => Promise<any>;

	// Error handling
	error: string | null;
	clearError: () => void;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function HubProvider({ children }: { children: React.ReactNode }) {
	const { user, isAuthenticated } = useAuth();

	// State
	const [assignedHub, setAssignedHub] = useState<Hub | null>(null);
	const [hubProducts, setHubProducts] = useState<ProductWithHubData[]>([]);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [allHubs, setAllHubs] = useState<Hub[]>([]);
	const [loadingHubs, setLoadingHubs] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize hub data when user is authenticated
	useEffect(() => {
		if (isAuthenticated && user) {
			initializeHubData();
		}
	}, [isAuthenticated, user]);

	const initializeHubData = async () => {
		try {
			// If user has an assigned hub, fetch it
			if (user?.assignedHub) {
				await fetchAssignedHub();
			}

			// If user is admin, fetch all hubs
			if (user?.userType === "admin") {
				await fetchAllHubs();
			}
		} catch (error) {
			console.error("Error initializing hub data:", error);
		}
	};

	const fetchAssignedHub = async () => {
		try {
			if (!user?.assignedHub) return;

			const response = await api.get(`/hubs/${user.assignedHub}`);
			setAssignedHub(response.data.hub);
		} catch (error) {
			console.error("Error fetching assigned hub:", error);
			setError("Failed to fetch assigned hub");
		}
	};

	const fetchHubProducts = async (filters: any = {}) => {
		if (!isAuthenticated || !user) {
			setError("User not authenticated");
			return;
		}

		setLoadingProducts(true);
		setError(null);

		try {
			const params = new URLSearchParams();

			// Add filters to params
			Object.keys(filters).forEach((key) => {
				if (filters[key]) {
					params.append(key, filters[key]);
				}
			});

			const response = await api.get(`/products/hub/my-products?${params}`);
			setHubProducts(response.data.data || []);
		} catch (error: any) {
			console.error("Error fetching hub products:", error);
			setError(error.response?.data?.message || "Failed to fetch products");
			setHubProducts([]);
		} finally {
			setLoadingProducts(false);
		}
	};

	const checkProductAvailability = async (
		productId: string,
		variantId?: string,
		quantity: number = 1
	) => {
		try {
			const params = new URLSearchParams();
			if (variantId) params.append("variantId", variantId);
			params.append("quantity", quantity.toString());

			const response = await api.get(
				`/products/${productId}/availability?${params}`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error checking product availability:", error);
			throw new Error(
				error.response?.data?.message || "Failed to check availability"
			);
		}
	};

	const getProductPrice = async (productId: string, variantId?: string) => {
		try {
			const params = new URLSearchParams();
			if (variantId) params.append("variantId", variantId);
			if (user?.customerTier) params.append("customerTier", user.customerTier);

			const response = await api.get(
				`/hubs/${user?.assignedHub}/products/${productId}/price?${params}`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error getting product price:", error);
			throw new Error(error.response?.data?.message || "Failed to get price");
		}
	};

	// Admin operations
	const fetchAllHubs = async () => {
		setLoadingHubs(true);
		setError(null);

		try {
			const response = await api.get("/hubs");
			setAllHubs(response.data.hubs || []);
		} catch (error: any) {
			console.error("Error fetching all hubs:", error);
			setError(error.response?.data?.message || "Failed to fetch hubs");
		} finally {
			setLoadingHubs(false);
		}
	};

	const createHub = async (hubData: any): Promise<Hub> => {
		try {
			const response = await api.post("/hubs", hubData);
			const newHub = response.data.hub;

			// Update local state
			setAllHubs((prev) => [...prev, newHub]);

			return newHub;
		} catch (error: any) {
			console.error("Error creating hub:", error);
			throw new Error(error.response?.data?.message || "Failed to create hub");
		}
	};

	const updateHub = async (hubId: string, hubData: any): Promise<Hub> => {
		try {
			const response = await api.put(`/hubs/${hubId}`, hubData);
			const updatedHub = response.data.hub;

			// Update local state
			setAllHubs((prev) =>
				prev.map((hub) => (hub._id === hubId ? updatedHub : hub))
			);

			// Update assigned hub if it's the same
			if (assignedHub?._id === hubId) {
				setAssignedHub(updatedHub);
			}

			return updatedHub;
		} catch (error: any) {
			console.error("Error updating hub:", error);
			throw new Error(error.response?.data?.message || "Failed to update hub");
		}
	};

	const deleteHub = async (hubId: string): Promise<void> => {
		try {
			await api.delete(`/hubs/${hubId}`);

			// Update local state
			setAllHubs((prev) => prev.filter((hub) => hub._id !== hubId));

			// Clear assigned hub if it was deleted
			if (assignedHub?._id === hubId) {
				setAssignedHub(null);
			}
		} catch (error: any) {
			console.error("Error deleting hub:", error);
			throw new Error(error.response?.data?.message || "Failed to delete hub");
		}
	};

	const assignHubToCustomer = async (
		customerId: string,
		hubId: string
	): Promise<void> => {
		try {
			await api.post("/hubs/assign-customer", {
				customerId,
				hubId,
			});
		} catch (error: any) {
			console.error("Error assigning hub to customer:", error);
			throw new Error(error.response?.data?.message || "Failed to assign hub");
		}
	};

	const getNearbyHubs = async (customerId: string) => {
		try {
			const response = await api.get(`/admin/users/${customerId}/nearby-hubs`);
			return response.data;
		} catch (error: any) {
			console.error("Error getting nearby hubs:", error);
			throw new Error(
				error.response?.data?.message || "Failed to get nearby hubs"
			);
		}
	};

	const clearError = () => {
		setError(null);
	};

	const value: HubContextType = {
		// Customer's assigned hub
		assignedHub,

		// Hub-based products
		hubProducts,
		loadingProducts,

		// Hub operations
		fetchHubProducts,
		checkProductAvailability,
		getProductPrice,

		// Admin operations
		allHubs,
		loadingHubs,
		fetchAllHubs,
		createHub,
		updateHub,
		deleteHub,

		// Hub assignment operations
		assignHubToCustomer,
		getNearbyHubs,

		// Error handling
		error,
		clearError,
	};

	return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

export function useHub() {
	const context = useContext(HubContext);
	if (context === undefined) {
		throw new Error("useHub must be used within a HubProvider");
	}
	return context;
}
