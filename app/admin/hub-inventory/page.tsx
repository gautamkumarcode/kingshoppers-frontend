"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Package, Plus, Search, Warehouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HubInventoryPage() {
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const [hubs, setHubs] = useState<any[]>([]);
	const [selectedHub, setSelectedHub] = useState<string>("");
	const [products, setProducts] = useState<any[]>([]);
	const [hubStock, setHubStock] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<any>(null);
	const [selectedVariant, setSelectedVariant] = useState<any>(null);
	const [selectedStock, setSelectedStock] = useState<any>(null);
	const [selectedVariants, setSelectedVariants] = useState<any[]>([]); // Multiple variants
	const [stockData, setStockData] = useState({
		quantity: 0,
		costPrice: 0,
		sellingPrice: 0,
		mrp: 0,
		bronzePrice: 0,
		silverPrice: 0,
		goldPrice: 0,
		platinumPrice: 0,
	});

	// Helper function to format price without decimals
	const formatPrice = (price: number) => {
		return Math.round(price || 0);
	};

	useEffect(() => {
		if (user?.userType !== "admin") {
			router.push("/");
			return;
		}
		fetchHubs();
		fetchProducts();
	}, [user]);

	useEffect(() => {
		if (selectedHub) {
			fetchHubStock();
		}
	}, [selectedHub]);

	const fetchHubs = async () => {
		try {
			const response = await api.get("/hubs");
			setHubs(response.data.hubs || []);
		} catch (error) {
			console.error("Error fetching hubs:", error);
			toast({
				title: "Error",
				description: "Failed to fetch hubs",
				variant: "destructive",
			});
		}
	};

	const fetchProducts = async () => {
		try {
			const response = await api.get("/products", {
				params: { limit: 1000 },
			});
			setProducts(response.data.data || []);
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	};

	const fetchHubStock = async () => {
		if (!selectedHub) return;
		setLoading(true);
		try {
			const response = await api.get(`/hubs/${selectedHub}/stock`);
			setHubStock(response.data.stock || []);
		} catch (error) {
			console.error("Error fetching hub stock:", error);
			toast({
				title: "Error",
				description: "Failed to fetch hub stock",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleAddStock = async () => {
		if (!selectedHub || !selectedProduct || selectedVariants.length === 0) {
			toast({
				title: "Validation Error",
				description: "Please select a product and at least one variant",
				variant: "destructive",
			});
			return;
		}

		// Validate that all selected variants have required data
		const invalidVariants = selectedVariants.filter(
			(v) =>
				!v.quantity ||
				v.quantity <= 0 ||
				!v.costPrice ||
				!v.sellingPrice ||
				!v.mrp
		);

		if (invalidVariants.length > 0) {
			toast({
				title: "Validation Error",
				description: "Please fill in all required fields for all variants",
				variant: "destructive",
			});
			return;
		}

		try {
			// Add all variants in parallel
			const promises = selectedVariants.map((variant) =>
				api.post(`/hubs/${selectedHub}/stock`, {
					productId: selectedProduct._id,
					variantId: variant._id,
					quantity: Number(variant.quantity),
					costPrice: Number(variant.costPrice),
					sellingPrice: Number(variant.sellingPrice),
					mrp: Number(variant.mrp),
					tierPricing: [
						{ tier: "bronze", price: Number(variant.bronzePrice) },
						{ tier: "silver", price: Number(variant.silverPrice) },
						{ tier: "gold", price: Number(variant.goldPrice) },
						{ tier: "platinum", price: Number(variant.platinumPrice) },
					],
				})
			);

			await Promise.all(promises);

			toast({
				title: "Success",
				description: `${selectedVariants.length} variant(s) added successfully`,
			});

			setShowAddDialog(false);
			setSelectedProduct(null);
			setSelectedVariants([]);
			fetchHubStock();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to add stock",
				variant: "destructive",
			});
		}
	};

	const handleUpdateStock = async (stockId: string, quantity: number) => {
		try {
			await api.put(`/hubs/${selectedHub}/stock/${stockId}`, {
				quantity,
			});

			toast({
				title: "Success",
				description: "Stock updated successfully",
			});

			fetchHubStock();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to update stock",
				variant: "destructive",
			});
		}
	};

	const handleEditStock = async () => {
		if (!selectedStock) return;

		try {
			await api.put(`/hubs/${selectedHub}/stock/${selectedStock._id}`, {
				quantity: Number(stockData.quantity),
				costPrice: Number(stockData.costPrice),
				sellingPrice: Number(stockData.sellingPrice),
				mrp: Number(stockData.mrp),
				tierPricing: [
					{ tier: "bronze", price: Number(stockData.bronzePrice) },
					{ tier: "silver", price: Number(stockData.silverPrice) },
					{ tier: "gold", price: Number(stockData.goldPrice) },
					{ tier: "platinum", price: Number(stockData.platinumPrice) },
				],
			});

			toast({
				title: "Success",
				description: "Stock updated successfully",
			});

			setShowEditDialog(false);
			setSelectedStock(null);
			fetchHubStock();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to update stock",
				variant: "destructive",
			});
		}
	};

	const filteredProducts = products.filter((product) =>
		product.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Group hub stock by product
	const groupedStock = hubStock.reduce((acc: any, stock: any) => {
		const productId = stock.product?._id;
		if (!productId) return acc;

		if (!acc[productId]) {
			acc[productId] = {
				product: stock.product,
				variants: [],
			};
		}

		acc[productId].variants.push(stock);
		return acc;
	}, {});

	const groupedStockArray = Object.values(groupedStock);

	return (
		<div className=" mx-auto   pb-20">
			<div className="mb-4 md:mb-6">
				<h1 className="text-2xl md:text-3xl font-bold mb-2">
					Hub Inventory Management
				</h1>
				<p className="text-sm md:text-base text-muted-foreground">
					Manage product stock across different hubs
				</p>
			</div>

			{/* Hub Selection */}
			<Card className="mb-4 md:mb-6">
				<CardHeader className="p-4 md:p-6">
					<CardTitle className="flex items-center gap-2 text-lg md:text-xl">
						<Warehouse className="w-4 h-4 md:w-5 md:h-5" />
						Select Hub
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 md:p-6 pt-0">
					<Select value={selectedHub} onValueChange={setSelectedHub}>
						<SelectTrigger>
							<SelectValue placeholder="Select a hub" />
						</SelectTrigger>
						<SelectContent>
							{hubs.map((hub) => (
								<SelectItem key={hub._id} value={hub._id}>
									{hub.name} - {hub?.location?.city}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{selectedHub && (
				<>
					{/* Add Stock Button */}
					<div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
						<h2 className="text-lg md:text-xl font-semibold">Current Stock</h2>
						<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
							<DialogTrigger asChild>
								<Button className="w-full sm:w-auto">
									<Plus className="w-4 h-4 mr-2" />
									<span className="hidden sm:inline">Add Product to Hub</span>
									<span className="sm:hidden">Add Product</span>
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
								<DialogHeader>
									<DialogTitle className="text-lg md:text-xl">
										Add Product to Hub
									</DialogTitle>
								</DialogHeader>

								<div className="space-y-4">
									{/* Product Search */}
									<div>
										<Label>Search Product</Label>
										<div className="relative">
											<Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
											<Input
												placeholder="Search products..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="pl-10"
											/>
										</div>
									</div>

									{/* Product List */}
									{!selectedProduct && (
										<div className="max-h-60 overflow-y-auto border rounded-lg">
											{filteredProducts.map((product) => (
												<div
													key={product._id}
													className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
													onClick={() => {
														console.log("Selected product:", product);
														setSelectedProduct(product);
													}}>
													<div className="flex items-center gap-3">
														<img
															src={product.thumbnail}
															alt={product.name}
															className="w-12 h-12 object-cover rounded"
														/>
														<div className="flex-1">
															<p className="font-medium">{product.name}</p>
															<p className="text-sm text-muted-foreground">
																SKU: {product.sku}
															</p>
															<p className="text-xs text-blue-600 mt-1">
																{product.variants?.length || 0} variant(s)
																available
															</p>
														</div>
													</div>
												</div>
											))}
										</div>
									)}

									{/* Stock Form */}
									{selectedProduct && (
										<div className="space-y-4">
											<div className="p-3 bg-gray-50 rounded-lg">
												<div className="flex justify-between items-start">
													<div>
														<p className="font-medium">
															{selectedProduct.name}
														</p>
														<p className="text-sm text-muted-foreground">
															SKU: {selectedProduct.sku}
														</p>
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															setSelectedProduct(null);
															setSelectedVariant(null);
															setSearchTerm("");
														}}>
														Change
													</Button>
												</div>
											</div>

											{/* Variant Selection with Checkboxes */}
											<div>
												<div className="flex justify-between items-center mb-2">
													<Label className="text-sm font-semibold">
														Select Variants to Add
													</Label>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															// Select all variants
															const allVariants = selectedProduct.variants.map(
																(v: any) => ({
																	...v,
																	quantity: 1,
																	costPrice:
																		v?.costPrice ||
																		v?.wholesalePrice * 0.7 ||
																		100,
																	sellingPrice:
																		v?.wholesalePrice || v?.mrp * 0.8 || 150,
																	mrp: v?.mrp || v?.wholesalePrice * 1.5 || 200,
																	bronzePrice:
																		v?.wholesalePrice || v?.mrp * 0.8 || 150,
																	silverPrice:
																		(v?.wholesalePrice || 150) * 0.96,
																	goldPrice: (v?.wholesalePrice || 150) * 0.9,
																	platinumPrice:
																		(v?.wholesalePrice || 150) * 0.85,
																})
															);
															setSelectedVariants(allVariants);
														}}>
														Select All
													</Button>
												</div>

												<div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3">
													{selectedProduct.variants?.map((variant: any) => {
														const isSelected = selectedVariants.some(
															(v) => v._id === variant._id
														);
														const selectedData = selectedVariants.find(
															(v) => v._id === variant._id
														);

														return (
															<div
																key={variant._id}
																className="border rounded-lg p-3 space-y-2">
																{/* Checkbox Header */}
																<div className="flex items-start gap-2">
																	<input
																		type="checkbox"
																		checked={isSelected}
																		onChange={(e) => {
																			if (e.target.checked) {
																				setSelectedVariants([
																					...selectedVariants,
																					{
																						...variant,
																						quantity: 1,
																						costPrice:
																							variant?.costPrice ||
																							variant?.wholesalePrice * 0.7 ||
																							100,
																						sellingPrice:
																							variant?.wholesalePrice ||
																							variant?.mrp * 0.8 ||
																							150,
																						mrp:
																							variant?.mrp ||
																							variant?.wholesalePrice * 1.5 ||
																							200,
																						bronzePrice:
																							variant?.wholesalePrice ||
																							variant?.mrp * 0.8 ||
																							150,
																						silverPrice:
																							(variant?.wholesalePrice || 150) *
																							0.96,
																						goldPrice:
																							(variant?.wholesalePrice || 150) *
																							0.9,
																						platinumPrice:
																							(variant?.wholesalePrice || 150) *
																							0.85,
																					},
																				]);
																			} else {
																				setSelectedVariants(
																					selectedVariants.filter(
																						(v) => v._id !== variant._id
																					)
																				);
																			}
																		}}
																		className="mt-1"
																	/>
																	<div className="flex-1">
																		<p className="font-medium text-sm">
																			{variant.variantName}
																		</p>
																		<p className="text-xs text-muted-foreground">
																			SKU: {variant.sku} • Stock:{" "}
																			{variant.stock} units
																		</p>
																	</div>
																</div>

																{/* Input Fields (only show if selected) */}
																{isSelected && selectedData && (
																	<div className="pl-6 space-y-2 border-l-2 border-blue-500">
																		<div className="grid grid-cols-2 gap-2">
																			<div>
																				<Label className="text-xs">
																					Quantity
																				</Label>
																				<Input
																					type="number"
																					value={selectedData.quantity}
																					onChange={(e) => {
																						setSelectedVariants(
																							selectedVariants.map((v) =>
																								v._id === variant._id
																									? {
																											...v,
																											quantity:
																												parseInt(
																													e.target.value
																												) || 0,
																									  }
																									: v
																							)
																						);
																					}}
																					className="h-8"
																					min="0"
																					max={variant.stock}
																				/>
																			</div>
																			<div>
																				<Label className="text-xs">
																					Cost Price
																				</Label>
																				<Input
																					type="number"
																					value={selectedData.costPrice}
																					onChange={(e) => {
																						setSelectedVariants(
																							selectedVariants.map((v) =>
																								v._id === variant._id
																									? {
																											...v,
																											costPrice:
																												parseFloat(
																													e.target.value
																												) || 0,
																									  }
																									: v
																							)
																						);
																					}}
																					className="h-8"
																					min="0"
																					step="0.01"
																				/>
																			</div>
																			<div>
																				<Label className="text-xs">
																					Selling Price
																				</Label>
																				<Input
																					type="number"
																					value={selectedData.sellingPrice}
																					onChange={(e) => {
																						setSelectedVariants(
																							selectedVariants.map((v) =>
																								v._id === variant._id
																									? {
																											...v,
																											sellingPrice:
																												parseFloat(
																													e.target.value
																												) || 0,
																									  }
																									: v
																							)
																						);
																					}}
																					className="h-8"
																					min="0"
																					step="0.01"
																				/>
																			</div>
																			<div>
																				<Label className="text-xs">MRP</Label>
																				<Input
																					type="number"
																					value={selectedData.mrp}
																					onChange={(e) => {
																						setSelectedVariants(
																							selectedVariants.map((v) =>
																								v._id === variant._id
																									? {
																											...v,
																											mrp:
																												parseFloat(
																													e.target.value
																												) || 0,
																									  }
																									: v
																							)
																						);
																					}}
																					className="h-8"
																					min="0"
																					step="0.01"
																				/>
																			</div>
																		</div>

																		{/* Tier Pricing */}
																		<details className="text-xs">
																			<summary className="cursor-pointer text-blue-600 font-medium">
																				Tier Pricing (Optional)
																			</summary>
																			<div className="grid grid-cols-2 gap-2 mt-2">
																				<div>
																					<Label className="text-xs">
																						Bronze
																					</Label>
																					<Input
																						type="number"
																						value={selectedData.bronzePrice}
																						onChange={(e) => {
																							setSelectedVariants(
																								selectedVariants.map((v) =>
																									v._id === variant._id
																										? {
																												...v,
																												bronzePrice:
																													parseFloat(
																														e.target.value
																													) || 0,
																										  }
																										: v
																								)
																							);
																						}}
																						className="h-8"
																						min="0"
																						step="0.01"
																					/>
																				</div>
																				<div>
																					<Label className="text-xs">
																						Silver
																					</Label>
																					<Input
																						type="number"
																						value={selectedData.silverPrice}
																						onChange={(e) => {
																							setSelectedVariants(
																								selectedVariants.map((v) =>
																									v._id === variant._id
																										? {
																												...v,
																												silverPrice:
																													parseFloat(
																														e.target.value
																													) || 0,
																										  }
																										: v
																								)
																							);
																						}}
																						className="h-8"
																						min="0"
																						step="0.01"
																					/>
																				</div>
																				<div>
																					<Label className="text-xs">
																						Gold
																					</Label>
																					<Input
																						type="number"
																						value={selectedData.goldPrice}
																						onChange={(e) => {
																							setSelectedVariants(
																								selectedVariants.map((v) =>
																									v._id === variant._id
																										? {
																												...v,
																												goldPrice:
																													parseFloat(
																														e.target.value
																													) || 0,
																										  }
																										: v
																								)
																							);
																						}}
																						className="h-8"
																						min="0"
																						step="0.01"
																					/>
																				</div>
																				<div>
																					<Label className="text-xs">
																						Platinum
																					</Label>
																					<Input
																						type="number"
																						value={selectedData.platinumPrice}
																						onChange={(e) => {
																							setSelectedVariants(
																								selectedVariants.map((v) =>
																									v._id === variant._id
																										? {
																												...v,
																												platinumPrice:
																													parseFloat(
																														e.target.value
																													) || 0,
																										  }
																										: v
																								)
																							);
																						}}
																						className="h-8"
																						min="0"
																						step="0.01"
																					/>
																				</div>
																			</div>
																		</details>
																	</div>
																)}
															</div>
														);
													})}
												</div>
											</div>

											{/* Action Buttons */}
											<div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
												<Button
													onClick={handleAddStock}
													className="flex-1"
													disabled={selectedVariants.length === 0}>
													Add {selectedVariants.length} Variant(s) to Hub
												</Button>
												<Button
													variant="outline"
													className="flex-1 sm:flex-none"
													onClick={() => {
														setSelectedProduct(null);
														setSelectedVariants([]);
														setSearchTerm("");
													}}>
													Cancel
												</Button>
											</div>

											{/* Debug info */}
										</div>
									)}
								</div>
							</DialogContent>
						</Dialog>

						{/* Edit Stock Dialog */}
						<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
							<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
								<DialogHeader>
									<DialogTitle className="text-lg md:text-xl">
										Edit Hub Stock
									</DialogTitle>
								</DialogHeader>

								<div className="space-y-4">
									{selectedStock && (
										<>
											<div className="p-3 bg-gray-50 rounded-lg">
												<div className="flex items-start gap-3">
													<img
														src={
															selectedStock.product?.images?.[0] ||
															selectedStock.product?.thumbnail
														}
														alt={selectedStock.product?.name}
														className="w-16 h-16 object-cover rounded"
													/>
													<div className="flex-1">
														<p className="font-semibold text-base">
															{selectedStock.product?.name}
														</p>
														<p className="text-sm text-muted-foreground mt-1">
															Product SKU: {selectedStock.product?.sku}
														</p>
														{selectedStock.variant && (
															<div className="mt-2 pt-2 border-t">
																<p className="text-sm font-medium text-blue-600">
																	Variant: {selectedStock.variant.variantName}
																</p>
																<p className="text-xs text-muted-foreground">
																	Variant SKU: {selectedStock.variant.sku}
																</p>
																<p className="text-xs text-gray-600 mt-1">
																	Available in Product:{" "}
																	{selectedStock.variant.stock} units
																</p>
															</div>
														)}
													</div>
												</div>
											</div>

											<div>
												<Label className="text-sm">Quantity in Hub</Label>
												<Input
													type="number"
													value={stockData.quantity}
													onChange={(e) =>
														setStockData({
															...stockData,
															quantity: parseInt(e.target.value) || 0,
														})
													}
													min="0"
													max={selectedStock.variant?.stock || 999999}
												/>
												{selectedStock.variant &&
													stockData.quantity > selectedStock.variant.stock && (
														<p className="text-sm text-red-600 mt-1">
															⚠️ Quantity exceeds available product stock (
															{selectedStock.variant.stock} units)
														</p>
													)}
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
												<div>
													<Label className="text-sm">Cost Price</Label>
													<Input
														type="number"
														value={stockData.costPrice}
														onChange={(e) =>
															setStockData({
																...stockData,
																costPrice: parseFloat(e.target.value) || 0,
															})
														}
														min="0"
														step="0.01"
													/>
												</div>
												<div>
													<Label className="text-sm">Selling Price</Label>
													<Input
														type="number"
														value={stockData.sellingPrice}
														onChange={(e) =>
															setStockData({
																...stockData,
																sellingPrice: parseFloat(e.target.value) || 0,
															})
														}
														min="0"
														step="0.01"
													/>
												</div>
												<div>
													<Label className="text-sm">MRP</Label>
													<Input
														type="number"
														value={stockData.mrp}
														onChange={(e) =>
															setStockData({
																...stockData,
																mrp: parseFloat(e.target.value) || 0,
															})
														}
														min="0"
														step="0.01"
													/>
												</div>
											</div>

											<div className="border-t pt-4">
												<Label className="text-sm md:text-base font-semibold mb-3 block">
													Tier Pricing
												</Label>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<div>
														<Label className="text-sm">Bronze Price</Label>
														<Input
															type="number"
															value={stockData.bronzePrice}
															onChange={(e) =>
																setStockData({
																	...stockData,
																	bronzePrice: parseFloat(e.target.value) || 0,
																})
															}
															min="0"
															step="0.01"
														/>
													</div>
													<div>
														<Label className="text-sm">Silver Price</Label>
														<Input
															type="number"
															value={stockData.silverPrice}
															onChange={(e) =>
																setStockData({
																	...stockData,
																	silverPrice: parseFloat(e.target.value) || 0,
																})
															}
															min="0"
															step="0.01"
														/>
													</div>
													<div>
														<Label className="text-sm">Gold Price</Label>
														<Input
															type="number"
															value={stockData.goldPrice}
															onChange={(e) =>
																setStockData({
																	...stockData,
																	goldPrice: parseFloat(e.target.value) || 0,
																})
															}
															min="0"
															step="0.01"
														/>
													</div>
													<div>
														<Label className="text-sm">Platinum Price</Label>
														<Input
															type="number"
															value={stockData.platinumPrice}
															onChange={(e) =>
																setStockData({
																	...stockData,
																	platinumPrice:
																		parseFloat(e.target.value) || 0,
																})
															}
															min="0"
															step="0.01"
														/>
													</div>
												</div>
											</div>

											<div className="flex flex-col sm:flex-row gap-2">
												<Button onClick={handleEditStock} className="flex-1">
													Update Stock
												</Button>
												<Button
													variant="outline"
													className="flex-1 sm:flex-none"
													onClick={() => {
														setShowEditDialog(false);
														setSelectedStock(null);
													}}>
													Cancel
												</Button>
											</div>
										</>
									)}
								</div>
							</DialogContent>
						</Dialog>
					</div>

					{/* Stock Table */}
					<Card>
						<CardContent className="p-0">
							{loading ? (
								<div className="p-8 text-center">Loading...</div>
							) : hubStock.length === 0 ? (
								<div className="p-8 text-center text-muted-foreground">
									<Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p>No products in this hub yet</p>
									<p className="text-sm">Add products to get started</p>
								</div>
							) : (
								<>
									{/* Desktop Grouped View */}
									<div className="hidden lg:block divide-y">
										{groupedStockArray.map((group: any) => (
											<div key={group.product._id} className="p-4">
												{/* Product Header */}
												<div className="flex items-center gap-3 mb-3 pb-3 border-b">
													<img
														src={
															group.product.images?.[0] ||
															group.product.thumbnail
														}
														alt={group.product.name}
														className="w-16 h-16 object-cover rounded"
													/>
													<div className="flex-1">
														<h3 className="font-semibold text-lg">
															{group.product.name}
														</h3>
														<p className="text-sm text-muted-foreground">
															SKU: {group.product.sku} • {group.variants.length}{" "}
															variant(s)
														</p>
													</div>
												</div>

												{/* Variants Table */}
												<div className="overflow-x-auto">
													<table className="w-full text-sm">
														<thead>
															<tr className="border-b bg-gray-50">
																<th className="text-left p-2 font-medium">
																	Variant
																</th>
																<th className="text-left p-2 font-medium">
																	SKU
																</th>
																<th className="text-left p-2 font-medium">
																	Qty
																</th>
																<th className="text-left p-2 font-medium">
																	Cost
																</th>
																<th className="text-left p-2 font-medium">
																	Selling
																</th>
																<th className="text-left p-2 font-medium">
																	MRP
																</th>
																<th className="text-left p-2 font-medium">
																	Bronze
																</th>
																<th className="text-left p-2 font-medium">
																	Silver
																</th>
																<th className="text-left p-2 font-medium">
																	Gold
																</th>
																<th className="text-left p-2 font-medium">
																	Platinum
																</th>
																<th className="text-left p-2 font-medium">
																	Actions
																</th>
															</tr>
														</thead>
														<tbody>
															{group.variants.map((stock: any) => (
																<tr
																	key={stock._id}
																	className="border-b last:border-0">
																	<td className="p-2">
																		<p className="font-medium">
																			{stock.variant?.variantName || "Default"}
																		</p>
																	</td>
																	<td className="p-2 text-muted-foreground">
																		{stock.variant?.sku || "-"}
																	</td>
																	<td className="p-2">
																		<Input
																			type="number"
																			value={stock.quantity}
																			onChange={(e) =>
																				handleUpdateStock(
																					stock._id,
																					parseInt(e.target.value) || 0
																				)
																			}
																			className="w-20 h-8"
																			min="0"
																		/>
																	</td>
																	<td className="p-2">
																		₹{formatPrice(stock.costPrice)}
																	</td>
																	<td className="p-2">
																		₹{formatPrice(stock.sellingPrice)}
																	</td>
																	<td className="p-2">
																		₹{formatPrice(stock.mrp)}
																	</td>
																	<td className="p-2">
																		₹
																		{formatPrice(
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "bronze"
																			)?.price
																		)}
																	</td>
																	<td className="p-2">
																		₹
																		{formatPrice(
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "silver"
																			)?.price
																		)}
																	</td>
																	<td className="p-2">
																		₹
																		{formatPrice(
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "gold"
																			)?.price
																		)}
																	</td>
																	<td className="p-2">
																		₹
																		{formatPrice(
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "platinum"
																			)?.price
																		)}
																	</td>
																	<td className="p-2">
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => {
																				setSelectedStock(stock);
																				setStockData({
																					quantity: stock.quantity,
																					costPrice: stock.costPrice,
																					sellingPrice: stock.sellingPrice,
																					mrp: stock.mrp,
																					bronzePrice:
																						stock.tierPricing?.find(
																							(t: any) => t.tier === "bronze"
																						)?.price || 0,
																					silverPrice:
																						stock.tierPricing?.find(
																							(t: any) => t.tier === "silver"
																						)?.price || 0,
																					goldPrice:
																						stock.tierPricing?.find(
																							(t: any) => t.tier === "gold"
																						)?.price || 0,
																					platinumPrice:
																						stock.tierPricing?.find(
																							(t: any) => t.tier === "platinum"
																						)?.price || 0,
																				});
																				setShowEditDialog(true);
																			}}>
																			Edit
																		</Button>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										))}
									</div>

									{/* Mobile Grouped View */}
									<div className="lg:hidden divide-y">
										{groupedStockArray.map((group: any) => (
											<div key={group.product._id} className="p-4 space-y-3">
												{/* Product Header */}
												<div className="flex items-start gap-3 pb-3 border-b">
													<img
														src={
															group.product.images?.[0] ||
															group.product.thumbnail
														}
														alt={group.product.name}
														className="w-16 h-16 object-cover rounded"
													/>
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-base">
															{group.product.name}
														</h3>
														<p className="text-xs text-muted-foreground mt-1">
															SKU: {group.product.sku}
														</p>
														<p className="text-xs text-blue-600 mt-1">
															{group.variants.length} variant(s)
														</p>
													</div>
												</div>

												{/* Variants */}
												<div className="space-y-3">
													{group.variants.map((stock: any) => (
														<div
															key={stock._id}
															className="p-3 bg-gray-50 rounded-lg space-y-2">
															<div className="flex justify-between items-start">
																<div>
																	<p className="font-medium text-sm">
																		{stock.variant?.variantName || "Default"}
																	</p>
																	<p className="text-xs text-muted-foreground">
																		SKU: {stock.variant?.sku || "-"}
																	</p>
																</div>
															</div>

															<div className="grid grid-cols-2 gap-2 text-sm">
																<div>
																	<span className="text-muted-foreground">
																		Quantity:
																	</span>
																	<Input
																		type="number"
																		value={stock.quantity}
																		onChange={(e) =>
																			handleUpdateStock(
																				stock._id,
																				parseInt(e.target.value) || 0
																			)
																		}
																		className="w-full mt-1 h-8"
																		min="0"
																	/>
																</div>
																<div>
																	<span className="text-muted-foreground">
																		Cost:
																	</span>
																	<p className="font-medium mt-1">
																		₹{formatPrice(stock.costPrice)}
																	</p>
																</div>
																<div>
																	<span className="text-muted-foreground">
																		Selling:
																	</span>
																	<p className="font-medium">
																		₹{formatPrice(stock.sellingPrice)}
																	</p>
																</div>
																<div>
																	<span className="text-muted-foreground">
																		MRP:
																	</span>
																	<p className="font-medium">
																		₹{formatPrice(stock.mrp)}
																	</p>
																</div>
															</div>

															<div className="border-t pt-2">
																<p className="text-xs font-medium text-muted-foreground mb-2">
																	Tier Pricing
																</p>
																<div className="grid grid-cols-2 gap-2 text-xs">
																	<div>
																		<span className="text-muted-foreground">
																			Bronze:
																		</span>
																		<span className="ml-1 font-medium">
																			₹
																			{formatPrice(
																				stock.tierPricing?.find(
																					(t: any) => t.tier === "bronze"
																				)?.price
																			)}
																		</span>
																	</div>
																	<div>
																		<span className="text-muted-foreground">
																			Silver:
																		</span>
																		<span className="ml-1 font-medium">
																			₹
																			{formatPrice(
																				stock.tierPricing?.find(
																					(t: any) => t.tier === "silver"
																				)?.price
																			)}
																		</span>
																	</div>
																	<div>
																		<span className="text-muted-foreground">
																			Gold:
																		</span>
																		<span className="ml-1 font-medium">
																			₹
																			{formatPrice(
																				stock.tierPricing?.find(
																					(t: any) => t.tier === "gold"
																				)?.price
																			)}
																		</span>
																	</div>
																	<div>
																		<span className="text-muted-foreground">
																			Platinum:
																		</span>
																		<span className="ml-1 font-medium">
																			₹
																			{formatPrice(
																				stock.tierPricing?.find(
																					(t: any) => t.tier === "platinum"
																				)?.price
																			)}
																		</span>
																	</div>
																</div>
															</div>

															<Button
																variant="outline"
																size="sm"
																className="w-full"
																onClick={() => {
																	setSelectedStock(stock);
																	setStockData({
																		quantity: stock.quantity,
																		costPrice: stock.costPrice,
																		sellingPrice: stock.sellingPrice,
																		mrp: stock.mrp,
																		bronzePrice:
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "bronze"
																			)?.price || 0,
																		silverPrice:
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "silver"
																			)?.price || 0,
																		goldPrice:
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "gold"
																			)?.price || 0,
																		platinumPrice:
																			stock.tierPricing?.find(
																				(t: any) => t.tier === "platinum"
																			)?.price || 0,
																	});
																	setShowEditDialog(true);
																}}>
																Edit Stock
															</Button>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
