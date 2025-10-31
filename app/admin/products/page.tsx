"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductsPage() {
	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
		null
	);

	// Fetch products with optional search parameter
	const fetchProducts = async (searchQuery = "") => {
		try {
			setLoading(true);
			const params = searchQuery ? { search: searchQuery } : {};
			const response = await api.get("/admin/products", { params });
			setProducts(response.data.data || response.data.products || []);
		} catch (error) {
			console.error("Failed to fetch products:", error);
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	// Initial load
	useEffect(() => {
		fetchProducts();
	}, []);

	// Debounced search
	useEffect(() => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		const timeout = setTimeout(() => {
			fetchProducts(search);
		}, 500); // 500ms debounce

		setSearchTimeout(timeout);

		return () => {
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
	}, [search]);

	// Handle manual search (when pressing Enter)
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		fetchProducts(search);
	};

	// Clear search
	const handleClearSearch = () => {
		setSearch("");
		fetchProducts();
	};

	// Calculate total stock across all variants
	const getTotalStock = (product: any) => {
		return (
			product.variants?.reduce(
				(sum: number, variant: any) => sum + (variant.stock || 0),
				0
			) || 0
		);
	};

	// Get the first variant's wholesale price (or any other price field)
	const getProductPrice = (product: any) => {
		const firstVariant = product.variants?.[0];
		return firstVariant?.wholesalePrice || firstVariant?.mrp || 0;
	};

	// Get brand name (handles both populated and non-populated brand)
	const getBrandName = (product: any) => {
		return product.brand?.name || product.brand || "-";
	};

	// Get category name (handles both populated and non-populated category)
	const getCategoryName = (product: any) => {
		return product.category?.name || product.category || "-";
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Products Management</h1>
				<Link href="/admin/products/add">
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Add Product
					</Button>
				</Link>
			</div>

			{/* Search Form */}
			<Card>
				<CardHeader>
					<CardTitle>Search Products</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSearchSubmit} className="space-y-4">
						<div className="flex gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
								<Input
									placeholder="Search by product name, SKU, brand, category, variant name..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Button type="submit" variant="default">
								Search
							</Button>
							{search && (
								<Button
									type="button"
									variant="outline"
									onClick={handleClearSearch}>
									Clear
								</Button>
							)}
						</div>
						{search && (
							<p className="text-sm text-muted-foreground">
								Searching for: "{search}"
							</p>
						)}
					</form>
				</CardContent>
			</Card>

			{/* Products Table */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>
						All Products{" "}
						{search
							? `(Search Results: ${products.length})`
							: `(${products.length})`}
					</CardTitle>
					{loading && (
						<div className="text-sm text-muted-foreground">Loading...</div>
					)}
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="text-muted-foreground mt-2">Loading products...</p>
						</div>
					) : products.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								{search
									? `No products found matching "${search}"`
									: "No products found. Create your first product!"}
							</p>
							{search && (
								<Button
									variant="outline"
									className="mt-4"
									onClick={handleClearSearch}>
									Clear Search
								</Button>
							)}
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="border-b border-border">
									<tr>
										<th className="text-left py-3 px-4">Product</th>
										<th className="text-left py-3 px-4">SKU</th>
										<th className="text-left py-3 px-4">Category</th>
										<th className="text-left py-3 px-4">Brand</th>
										<th className="text-left py-3 px-4">Price</th>
										<th className="text-left py-3 px-4">Stock</th>
										<th className="text-left py-3 px-4">Variants</th>
										<th className="text-left py-3 px-4">Status</th>
										<th className="text-left py-3 px-4">Actions</th>
									</tr>
								</thead>
								<tbody>
									{products.map((product) => (
										<tr
											key={product._id}
											className="border-b border-border hover:bg-accent/50 transition-colors">
											<td className="py-3 px-4">
												<div>
													<p className="font-semibold">{product.name}</p>
													{product.shortDescription && (
														<p className="text-xs text-muted-foreground mt-1 line-clamp-1">
															{product.shortDescription}
														</p>
													)}
												</div>
											</td>
											<td className="py-3 px-4">
												<code className="text-xs bg-muted px-2 py-1 rounded">
													{product.sku}
												</code>
											</td>
											<td className="py-3 px-4">{getCategoryName(product)}</td>
											<td className="py-3 px-4">{getBrandName(product)}</td>
											<td className="py-3 px-4">
												₹{getProductPrice(product).toFixed(2)}
											</td>
											<td className="py-3 px-4">
												<span
													className={
														getTotalStock(product) === 0
															? "text-red-600 font-medium"
															: ""
													}>
													{getTotalStock(product)}
												</span>
											</td>
											<td className="py-3 px-4">
												<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
													{product.variants?.length || 0} variants
												</span>
											</td>
											<td className="py-3 px-4">
												<div className="flex flex-col gap-1">
													<span
														className={`text-xs px-2 py-1 rounded w-fit ${
															product.isActive
																? "bg-green-500/10 text-green-600"
																: "bg-red-500/10 text-red-600"
														}`}>
														{product.isActive ? "Active" : "Inactive"}
													</span>
													{product.isFeatured && (
														<span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded w-fit">
															Featured
														</span>
													)}
												</div>
											</td>
											<td className="py-3 px-4">
												<div className="flex gap-2">
													<Link href={`/admin/products/edit/${product._id}`}>
														<Button size="sm" variant="outline">
															<Edit className="w-4 h-4" />
														</Button>
													</Link>
													<Button
														size="sm"
														variant="outline"
														className="text-destructive hover:bg-destructive/10"
														onClick={async () => {
															if (
																confirm(
																	"Are you sure you want to delete this product?"
																)
															) {
																try {
																	await api.delete(`/products/${product._id}`);
																	fetchProducts(search); // Refresh the list
																} catch (error) {
																	console.error(
																		"Failed to delete product:",
																		error
																	);
																	alert("Failed to delete product");
																}
															}
														}}>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}