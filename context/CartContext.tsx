"use client";

import api from "@/lib/api";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useReducer,
} from "react";
import { useAuth } from "./AuthContext";

// Types
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
}

export interface CartSummary {
	subtotal: number;
	totalItems: number;
	totalQuantity: number;
	totalGST: number;
	total: number;
	savings: number;
}

interface CartState {
	items: CartItem[];
	isLoading: boolean;
	lastUpdated: Date | null;
	serverSynced: boolean;
}

interface CartContextType extends CartState {
	// Cart Actions
	addItem: (
		item: Omit<CartItem, "quantity">,
		quantity?: number
	) => Promise<void>;
	removeItem: (productId: string, variantId: string) => Promise<void>;
	updateQuantity: (
		productId: string,
		variantId: string,
		quantity: number
	) => Promise<void>;
	clearCart: () => Promise<void>;

	// Cart Calculations
	getCartSummary: () => CartSummary;
	getItemQuantity: (productId: string, variantId: string) => number;
	isInCart: (productId: string, variantId: string) => boolean;

	// Cart Utilities
	syncWithServer: () => Promise<void>;
	getCartItemsCount: () => number;
}

// Action Types
type CartAction =
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_ITEMS"; payload: CartItem[] }
	| {
			type: "ADD_ITEM";
			payload: { item: Omit<CartItem, "quantity">; quantity: number };
	  }
	| { type: "REMOVE_ITEM"; payload: { productId: string; variantId: string } }
	| {
			type: "UPDATE_QUANTITY";
			payload: { productId: string; variantId: string; quantity: number };
	  }
	| { type: "CLEAR_CART" }
	| { type: "SET_LAST_UPDATED"; payload: Date }
	| { type: "SET_SERVER_SYNCED"; payload: boolean };

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };

		case "SET_ITEMS":
			return {
				...state,
				items: action.payload,
				lastUpdated: new Date(),
				isLoading: false,
				serverSynced: true,
			};

		case "ADD_ITEM": {
			const { item, quantity } = action.payload;
			const existingItemIndex = state.items.findIndex(
				(cartItem) =>
					cartItem.productId === item.productId &&
					cartItem.variantId === item.variantId
			);

			let newItems: CartItem[];
			if (existingItemIndex >= 0) {
				newItems = state.items.map((cartItem, index) =>
					index === existingItemIndex
						? {
								...cartItem,
								quantity: Math.min(
									cartItem.quantity + quantity,
									cartItem.stock
								),
						  }
						: cartItem
				);
			} else {
				const newItem: CartItem = {
					...item,
					id: `${item.productId}-${item.variantId}`,
					quantity: Math.min(quantity, item.stock),
				};
				newItems = [...state.items, newItem];
			}

			return {
				...state,
				items: newItems,
				lastUpdated: new Date(),
				serverSynced: false,
			};
		}

		case "REMOVE_ITEM": {
			const { productId, variantId } = action.payload;
			const newItems = state.items.filter(
				(item) =>
					!(item.productId === productId && item.variantId === variantId)
			);
			return {
				...state,
				items: newItems,
				lastUpdated: new Date(),
				serverSynced: false,
			};
		}

		case "UPDATE_QUANTITY": {
			const { productId, variantId, quantity } = action.payload;

			if (quantity <= 0) {
				const newItems = state.items.filter(
					(item) =>
						!(item.productId === productId && item.variantId === variantId)
				);
				return {
					...state,
					items: newItems,
					lastUpdated: new Date(),
					serverSynced: false,
				};
			}

			const newItems = state.items.map((item) =>
				item.productId === productId && item.variantId === variantId
					? { ...item, quantity: Math.min(quantity, item.stock) }
					: item
			);

			return {
				...state,
				items: newItems,
				lastUpdated: new Date(),
				serverSynced: false,
			};
		}

		case "CLEAR_CART":
			return {
				...state,
				items: [],
				lastUpdated: new Date(),
				serverSynced: false,
			};

		case "SET_LAST_UPDATED":
			return { ...state, lastUpdated: action.payload };

		case "SET_SERVER_SYNCED":
			return { ...state, serverSynced: action.payload };

		default:
			return state;
	}
}

// Initial State
const initialState: CartState = {
	items: [],
	isLoading: false,
	lastUpdated: null,
	serverSynced: false,
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(cartReducer, initialState);
	const { user } = useAuth();

	// Format server cart items to match frontend CartItem interface
	const formatServerCartItems = (serverItems: any[]): CartItem[] => {
		return serverItems.map((serverItem: any) => {
			const product = serverItem.productId;
			const variant = product.variants?.find(
				(v: any) => v._id === serverItem.variantId
			);

			return {
				id: `${product._id}-${serverItem.variantId}`,
				productId: product._id,
				variantId: serverItem.variantId,
				name: product.name,
				variantName: variant?.variantName || "Default Variant",
				image: product.thumbnail || product.images?.[0],
				price: serverItem.price,
				mrp: variant?.mrp || serverItem.price,
				quantity: serverItem.quantity,
				packSize: variant?.packSize || 1,
				packType: variant?.packType || "piece",
				stock: variant?.stock || 0,
				moq: variant?.moq || 1,
				gstPercentage: product.gstPercentage || 0,
			};
		});
	};

	// Load cart from server
	const loadCartFromServer = async (): Promise<void> => {
		if (!user) return;

		try {
			dispatch({ type: "SET_LOADING", payload: true });
			const response = await api.get("/cart");

			if (response.data.success) {
				const serverCart = response.data.data.cart;
				const formattedItems = formatServerCartItems(serverCart.items);
				dispatch({ type: "SET_ITEMS", payload: formattedItems });
			}
		} catch (error) {
			console.error("Error loading cart from server:", error);
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	};

	// Load cart from localStorage on initial mount
	useEffect(() => {
		const loadCartFromStorage = () => {
			try {
				const savedCart = localStorage.getItem("cart");
				console.log("Loading cart from localStorage:", savedCart);
				if (savedCart) {
					const parsedCart = JSON.parse(savedCart);
					if (parsedCart.items && parsedCart.items.length > 0) {
						console.log("Found cart items in localStorage:", parsedCart.items);
						dispatch({ type: "SET_ITEMS", payload: parsedCart.items });
					}
				}
			} catch (error) {
				console.error("Error loading cart from localStorage:", error);
			}
		};

		// Load from localStorage immediately on mount
		loadCartFromStorage();
	}, []); // Run only once on mount

	// Load cart from server when user logs in
	useEffect(() => {
		const loadServerCart = async () => {
			if (user && !state.serverSynced) {
				console.log("User logged in, loading cart from server...");
				await loadCartFromServer();
			}
		};

		loadServerCart();
	}, [user]); // Run when user changes

	// Save cart to localStorage for guest users
	useEffect(() => {
		if (!user && state.lastUpdated) {
			try {
				const cartData = {
					items: state.items,
					lastUpdated: state.lastUpdated.toISOString(),
				};
				console.log("Saving cart to localStorage:", cartData);
				localStorage.setItem("cart", JSON.stringify(cartData));
			} catch (error) {
				console.error("Error saving cart to localStorage:", error);
			}
		}
	}, [state.items, state.lastUpdated, user]);

	// Clear cart when user logs out
	useEffect(() => {
		if (!user && state.items.length > 0) {
			dispatch({ type: "CLEAR_CART" });
		}
	}, [user, state.items.length]);

	// Cart Actions
	const addItem = async (
		item: Omit<CartItem, "quantity">,
		quantity: number = 1
	) => {
		try {
			// Validate required fields
			if (!item.productId || !item.variantId || !item.name) {
				throw new Error("Missing required product information");
			}

			const moq = item.moq || 1;
			const finalQuantity = Math.max(quantity, moq);

			if (user) {
				// Add to server cart
				dispatch({ type: "SET_LOADING", payload: true });
				try {
					const response = await api.post("/cart/add", {
						productId: item.productId,
						variantId: item.variantId,
						quantity: finalQuantity,
					});

					if (response.data.success) {
						const serverCart = response.data.data.cart;
						const formattedItems = formatServerCartItems(serverCart.items);
						dispatch({ type: "SET_ITEMS", payload: formattedItems });
					}
				} finally {
					dispatch({ type: "SET_LOADING", payload: false });
				}
			} else {
				// Add to local cart (for guest users)
				dispatch({
					type: "ADD_ITEM",
					payload: { item, quantity: finalQuantity },
				});
			}
		} catch (error) {
			console.error("Error adding item to cart:", error);
			throw error;
		}
	};

	const removeItem = async (productId: string, variantId: string) => {
		try {
			if (user) {
				// Don't set global loading state for item removal
				// dispatch({ type: "SET_LOADING", payload: true });
				try {
					const response = await api.delete("/cart/remove", {
						data: { productId, variantId },
					});

					if (response.data.success) {
						const serverCart = response.data.data.cart;
						const formattedItems = formatServerCartItems(serverCart.items);
						dispatch({ type: "SET_ITEMS", payload: formattedItems });
					}
				} finally {
					// dispatch({ type: "SET_LOADING", payload: false });
				}
			} else {
				dispatch({ type: "REMOVE_ITEM", payload: { productId, variantId } });
			}
		} catch (error) {
			console.error("Error removing item from cart:", error);
			throw error;
		}
	};

	const updateQuantity = async (
		productId: string,
		variantId: string,
		quantity: number
	) => {
		try {
			if (user) {
				// Don't set global loading state for quantity updates
				// dispatch({ type: "SET_LOADING", payload: true });
				try {
					const response = await api.put("/cart/update", {
						productId,
						variantId,
						quantity,
					});

					if (response.data.success) {
						const serverCart = response.data.data.cart;
						const formattedItems = formatServerCartItems(serverCart.items);
						dispatch({ type: "SET_ITEMS", payload: formattedItems });
					}
				} finally {
					// dispatch({ type: "SET_LOADING", payload: false });
				}
			} else {
				dispatch({
					type: "UPDATE_QUANTITY",
					payload: { productId, variantId, quantity },
				});
			}
		} catch (error) {
			console.error("Error updating cart quantity:", error);
			throw error;
		}
	};

	const clearCart = async () => {
		try {
			if (user) {
				dispatch({ type: "SET_LOADING", payload: true });
				try {
					const response = await api.delete("/cart/clear");
					if (response.data.success) {
						dispatch({ type: "CLEAR_CART" });
					}
				} finally {
					dispatch({ type: "SET_LOADING", payload: false });
				}
			} else {
				dispatch({ type: "CLEAR_CART" });
			}
		} catch (error) {
			console.error("Error clearing cart:", error);
			throw error;
		}
	};

	// Sync with server
	const syncWithServer = async (): Promise<void> => {
		if (!user) return;

		try {
			dispatch({ type: "SET_LOADING", payload: true });

			const localItems = state.items.map((item) => ({
				productId: item.productId,
				variantId: item.variantId,
				quantity: item.quantity,
			}));

			const response = await api.post("/cart/sync", { localItems });

			if (response.data.success) {
				const serverCart = response.data.data.cart;
				const formattedItems = formatServerCartItems(serverCart.items);
				dispatch({ type: "SET_ITEMS", payload: formattedItems });
			}
		} catch (error) {
			console.error("Error syncing cart with server:", error);
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	};

	// Cart Calculations
	const getCartSummary = (): CartSummary => {
		const subtotal = state.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		const totalItems = state.items.length;
		const totalQuantity = state.items.reduce(
			(sum, item) => sum + item.quantity,
			0
		);
		const totalMRP = state.items.reduce(
			(sum, item) => sum + item.mrp * item.quantity,
			0
		);
		const savings = totalMRP - subtotal;
		const totalGST = state.items.reduce((sum, item) => {
			const itemTotal = item.price * item.quantity;
			return sum + (itemTotal * item.gstPercentage) / 100;
		}, 0);
		const total = subtotal + totalGST;

		return {
			subtotal,
			totalItems,
			totalQuantity,
			totalGST,
			total,
			savings,
		};
	};

	const getItemQuantity = (productId: string, variantId: string): number => {
		const item = state.items.find(
			(item) => item.productId === productId && item.variantId === variantId
		);
		return item?.quantity || 0;
	};

	const isInCart = (productId: string, variantId: string): boolean => {
		return state.items.some(
			(item) => item.productId === productId && item.variantId === variantId
		);
	};

	const getCartItemsCount = (): number => {
		return state.items.length;
	};

	const contextValue: CartContextType = {
		...state,
		addItem,
		removeItem,
		updateQuantity,
		clearCart,
		getCartSummary,
		getItemQuantity,
		isInCart,
		syncWithServer,
		getCartItemsCount,
	};

	return (
		<CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
	);
}

// Hook to use cart context
export function useCart(): CartContextType {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
