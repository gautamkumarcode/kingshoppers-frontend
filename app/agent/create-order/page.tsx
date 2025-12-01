"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Product } from "@/types/product";
import {
	Minus,
	Package,
	Plus,
	Search,
	ShoppingCart,
	Trash2,
	X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
	productId: string;
	variantId: string;
	name: string;
	variantName: string;
	price: number;
	mrp: number;
	quantity: number;
	packSize: number;
	packType: string;
	gstPercentage: number;
	image?: string;
}

export default function CreateOrderPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();

	const [customer, setCustomer] = useState<any>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const customerId = searchParams.get("customerId");
		if (!customerId) {
			toast({
				title: "Error",
				description: "No customer selected",
				variant: "destructive",
			});
			router.push("/agent/customers");
			return;
		}

		fetchCustomer(customerId);
		fetchProducts();
	}, [searchParams]);

	const fetchCustomer = async (customerId: string) => {
		try {
			const response = await api.get(`/sales/customers`);
			const customerData = response.data.customers?.find(
				(c: any) => c._id === customerId
			);
			if (customerData) {
				setCustomer(customerData);
			} else {
				throw new Error("Customer not found");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to load customer details",
				variant: "destructive",
			});
			router.push("/agent/customers");
		}
	};

	const fetchProducts = async (search = "") => {
		setLoading(true);
		try {
			const response = await api.get("/products", {
				params: { search, limit: 50 },
			});
			setProducts(response.data.data || []);
		} catch (error) {
			console.error("Failed to fetch products:", error);
			toast({
				title: "Error",
				description: "Failed to load products",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = () => {
		fetchProducts(searchQuery);
	};

	const addToOrder = (product: Product, variant: any) => {
		const existingItem = orderItems.find(
			(item) => item.variantId === variant._id
		);

		if (existingItem) {
			updateQuantity(variant._id, existingItem.quantity + (variant.moq || 1));
		} else {
			const newItem: OrderItem = {
				productId: product._id,
				variantId: variant._id,
				name: product.name,
				variantName: variant.variantName,
				price: variant.wholesalePrice,
				mrp: variant.mrp,
				quantity: variant.moq || 1,
				packSize: variant.packSize,
				packType: variant.packType,
				gstPercentage: product.gstPercentage || 0,
				image: product.thumbnail,
			};
			setOrderItems([...orderItems, newItem]);
			toast({
				title: "Added to order",
				description: `${product.name} - ${variant.variantName}`,
			});
		}
	};

	const updateQuantity = (variantId: string, newQuantity: number) => {
		setOrderItems(
			orderItems.map((item) =>
				item.variantId === variantId
					? { ...item, quantity: Math.max(item.packSize, newQuantity) }
					: item
			)
		);
	};

	const removeItem = (variantId: string) => {
		setOrderItems(orderItems.filter((item) => item.variantId !== variantId));
	};

	const calculateTotals = () => {
		const subtotal = orderItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		const totalGST = orderItems.reduce(
			(sum, item) =>
				sum + (item.price * item.quantity * item.gstPercentage) / 100,
			0
		);
		const total = subtotal + totalGST;
		return { subtotal, totalGST, total };
	};

	const handleSubmitOrder = async () => {
		if (orderItems.length === 0) {
			toast({
				title: "Error",
				description: "Please add at least one product",
				variant: "destructive",
			});
			return;
		}

		setSubmitting(true);
		try {
			const { subtotal, totalGST, total } = calculateTotals();

			const orderData = {
				customerId: customer._id,
				items: orderItems.map((item) => ({
					product: item.productId,
					variant: item.variantId,
					quantity: item.quantity,
					price: item.price,
					gstPercentage: item.gstPercentage,
				})),
				paymentMethod,
				deliveryAddress: customer.shopAddress,
				subtotal,
				gstAmount: totalGST,
				total,
				grandTotal: total,
			};

			const response = await api.post("/sales/create-order", orderData);

			toast({
				title: "Success",
				description: "Order created successfully",
			});

			router.push("/agent/customers");
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to create order",
				variant: "destructive",
			});
		} finally {
			setSubmitting(false);
		}
	};

	const { subtotal, totalGST, total } = calculateTotals();

	if (!customer) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
			{/* Header with Customer Info */}
			<Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
				<CardContent className="p-4 sm:p-6">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2">
								<ShoppingCart className="w-5 h-5 text-primary" />
								<h1 className="text-xl sm:text-2xl font-bold">
									Create New Order
								</h1>
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium">
									Customer:{" "}
									<span className="text-primary">{customer.ownerName}</span>
								</p>
								<p className="text-xs text-muted-foreground">
									Shop: {customer.shopName} • Phone: {customer.phone}
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push("/agent/customers")}
							className="shrink-0">
							<X className="w-4 h-4 mr-2" />
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
				{/* Products Section */}
				<div className="lg:col-span-2 space-y-4">
					{/* Search */}
					<Card>
						<CardContent className="p-3 sm:p-4">
							<div className="flex gap-2">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										placeholder="Search products by name..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyPress={(e) => e.key === "Enter" && handleSearch()}
										className="pl-9"
									/>
								</div>
								<Button onClick={handleSearch} size="default">
									Search
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Products List */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base sm:text-lg flex items-center gap-2">
								<Package className="w-5 h-5" />
								Available Products
								{products.length > 0 && (
									<span className="text-sm font-normal text-muted-foreground">
										({products.length})
									</span>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
							{loading ? (
								<div className="flex flex-col items-center justify-center py-12">
									<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
									<p className="text-sm text-muted-foreground">
										Loading products...
									</p>
								</div>
							) : products.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12">
									<Package className="w-12 h-12 text-muted-foreground mb-3" />
									<p className="text-sm text-muted-foreground">
										No products found
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Try searching with different keywords
									</p>
								</div>
							) : (
								products.map((product) => (
									<Card key={product._id}>
										<CardContent className="p-4">
											<div className="flex gap-3">
												{product.thumbnail && (
													<img
														src={product.thumbnail}
														alt={product.name}
														className="w-16 h-16 object-cover rounded"
													/>
												)}
												<div className="flex-1 min-w-0">
													<h3 className="font-semibold text-sm truncate">
														{product.name}
													</h3>
													<div className="space-y-2 mt-2">
														{product.variants?.map((variant) => (
															<div
																key={variant._id}
																className="flex items-center justify-between gap-2 text-xs">
																<div className="flex-1 min-w-0">
																	<p className="truncate">
																		{variant.variantName}
																	</p>
																	<p className="text-muted-foreground">
																		₹{variant.wholesalePrice} • Stock:{" "}
																		{variant.stock}
																	</p>
																</div>
																<Button
																	size="sm"
																	onClick={() => addToOrder(product, variant)}
																	disabled={variant.stock < (variant.moq || 1)}>
																	<Plus className="w-3 h-3" />
																</Button>
															</div>
														))}
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))
							)}
						</CardContent>
					</Card>
				</div>

				{/* Order Summary */}
				<div className="space-y-4 lg:sticky lg:top-4">
					<Card className="border-2">
						<CardHeader className="pb-3">
							<CardTitle className="text-base sm:text-lg flex items-center gap-2">
								<ShoppingCart className="w-5 h-5 text-primary" />
								Order Summary
								{orderItems.length > 0 && (
									<span className="ml-auto text-sm font-normal bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
										{orderItems.length}
									</span>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{orderItems.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<ShoppingCart className="w-12 h-12 text-muted-foreground mb-3" />
									<p className="text-sm font-medium text-muted-foreground">
										No items in order
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Search and add products to create order
									</p>
								</div>
							) : (
								<div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-1">
									{orderItems.map((item) => (
										<div
											key={item.variantId}
											className="flex gap-2 p-2 sm:p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
											{item.image && (
												<img
													src={item.image}
													alt={item.name}
													className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded border shrink-0"
												/>
											)}
											<div className="flex-1 min-w-0">
												<p className="text-xs sm:text-sm font-medium truncate">
													{item.name}
												</p>
												<p className="text-xs text-muted-foreground truncate">
													{item.variantName}
												</p>
												<p className="text-xs sm:text-sm font-semibold text-primary mt-1">
													₹{item.price} × {item.quantity} = ₹
													{(item.price * item.quantity).toFixed(2)}
												</p>
												<div className="flex items-center gap-1 mt-2">
													<Button
														size="sm"
														variant="outline"
														className="h-7 w-7 p-0"
														onClick={() =>
															updateQuantity(
																item.variantId,
																item.quantity - item.packSize
															)
														}>
														<Minus className="w-3 h-3" />
													</Button>
													<span className="text-xs sm:text-sm font-medium px-2 min-w-[2rem] text-center">
														{item.quantity}
													</span>
													<Button
														size="sm"
														variant="outline"
														className="h-7 w-7 p-0"
														onClick={() =>
															updateQuantity(
																item.variantId,
																item.quantity + item.packSize
															)
														}>
														<Plus className="w-3 h-3" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														className="h-7 w-7 p-0 ml-auto hover:bg-red-50 hover:text-red-600"
														onClick={() => removeItem(item.variantId)}>
														<Trash2 className="w-3.5 h-3.5" />
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{orderItems.length > 0 && (
								<>
									<div className="border-t pt-3 space-y-2 text-sm">
										<div className="flex justify-between">
											<span>Subtotal:</span>
											<span>₹{subtotal.toFixed(2)}</span>
										</div>
										<div className="flex justify-between">
											<span>GST:</span>
											<span>₹{totalGST.toFixed(2)}</span>
										</div>
										<div className="flex justify-between font-bold text-base">
											<span>Total:</span>
											<span>₹{total.toFixed(2)}</span>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Payment Method</Label>
										<Select
											value={paymentMethod}
											onValueChange={setPaymentMethod}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="cod">Cash on Delivery</SelectItem>
												<SelectItem value="online">Online Payment</SelectItem>
												<SelectItem value="credit">Credit</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<Button
										className="w-full"
										onClick={handleSubmitOrder}
										disabled={submitting}>
										{submitting ? "Creating Order..." : "Create Order"}
									</Button>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
