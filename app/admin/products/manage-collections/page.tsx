"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Product } from "@/types/product";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function ManageCollectionsPage() {
	const { toast } = useToast();
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState<string | null>(null);

	useEffect(() => {
		fetchProducts();
	}, []);

	useEffect(() => {
		if (searchQuery.trim()) {
			const filtered = products.filter(
				(p) =>
					p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredProducts(filtered);
		} else {
			setFilteredProducts(products);
		}
	}, [searchQuery, products]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await api.get("/products", {
				params: { limit: 100 },
			});
			setProducts(response.data.data || []);
			setFilteredProducts(response.data.data || []);
		} catch (error) {
			console.error("Error fetching products:", error);
			toast({
				title: "Error",
				description: "Failed to fetch products",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const updateProductFlags = async (productId: string, updates: any) => {
		try {
			setSaving(productId);
			await api.put(`/products/${productId}`, updates);
			toast({
				title: "Success",
				description: "Product updated successfully",
			});

			// Update local state
			setProducts((prev) =>
				prev.map((p) => (p._id === productId ? { ...p, ...updates } : p))
			);
		} catch (error) {
			console.error("Error updating product:", error);
			toast({
				title: "Error",
				description: "Failed to update product",
				variant: "destructive",
			});
		} finally {
			setSaving(null);
		}
	};

	const toggleFlag = (product: Product, flag: keyof Product) => {
		const currentValue = product[flag];
		updateProductFlags(product._id, { [flag]: !currentValue });
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4 sm:p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
						Manage Product Collections
					</h1>
					<p className="text-sm text-gray-600">
						Control which products appear in Featured, New Arrivals, Sale, and
						Best Sellers sections
					</p>
				</div>

				{/* Search */}
				<Card className="p-4 mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							type="text"
							placeholder="Search products by name or SKU..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</Card>

				{/* Products Table */}
				<Card className="overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Featured
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										New Arrival
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										On Sale
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Best Seller
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredProducts.map((product) => (
									<tr key={product._id} className="hover:bg-gray-50">
										<td className="px-4 py-4">
											<div className="flex items-center gap-3">
												<img
													src={product.thumbnail || "/placeholder.png"}
													alt={product.name}
													className="w-12 h-12 object-cover rounded"
												/>
												<div>
													<p className="text-sm font-medium text-gray-900 line-clamp-1">
														{product.name}
													</p>
													<p className="text-xs text-gray-500">{product.sku}</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center">
												{saving === product._id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Checkbox
														checked={product.isFeatured}
														onCheckedChange={() =>
															toggleFlag(product, "isFeatured")
														}
													/>
												)}
											</div>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center">
												{saving === product._id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Checkbox
														checked={product.isNewArrival}
														onCheckedChange={() =>
															toggleFlag(product, "isNewArrival")
														}
													/>
												)}
											</div>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center">
												{saving === product._id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Checkbox
														checked={product.isOnSale}
														onCheckedChange={() =>
															toggleFlag(product, "isOnSale")
														}
													/>
												)}
											</div>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center">
												{saving === product._id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Checkbox
														checked={product.isBestSeller}
														onCheckedChange={() =>
															toggleFlag(product, "isBestSeller")
														}
													/>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredProducts.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500">No products found</p>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
