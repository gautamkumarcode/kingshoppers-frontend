"use client";

import { ProductCard } from "@/components/products/ProductCard";
import {
	ProductGridSkeleton,
	ProductListSkeletonGrid,
} from "@/components/products/ProductSkeleton";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import api from "@/lib/api";
import { Product } from "@/types/product";
import {
	Filter,
	Grid,
	List,
	Loader2,
	Package,
	Search,
	ShoppingCart,
	Star,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ProductsPage() {
	const searchParams = useSearchParams();
	const { user, isAuthenticated } = useAuth();
	const { toast } = useToast();
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<any[]>([]);
	const [brands, setBrands] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedBrand, setSelectedBrand] = useState("all");
	const [sortBy, setSortBy] = useState("name");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [showFilters, setShowFilters] = useState(false);
	const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all fetched products
	const [totalProducts, setTotalProducts] = useState(0);

	// Read URL parameters on mount
	useEffect(() => {
		const categoryParam = searchParams.get("category");
		const brandParam = searchParams.get("brand");
		const searchParam = searchParams.get("search");
		const sortParam = searchParams.get("sortBy");

		if (categoryParam) setSelectedCategory(categoryParam);
		if (brandParam) setSelectedBrand(brandParam);
		if (searchParam) setSearch(searchParam);
		if (sortParam) setSortBy(sortParam);

		fetchInitialData();
	}, []);

	useEffect(() => {
		// Reset and fetch from beginning when filters change
		setProducts([]);
		setAllProducts([]);
		setPage(1);
		setHasMore(true);
		setTotalProducts(0);
		fetchProducts(1, true);
	}, [search, selectedCategory, selectedBrand, sortBy]);

	const loadMore = useCallback(() => {
		if (!loadingMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchProducts(nextPage, false);
		}
	}, [page, loadingMore, allProducts]);

	const { targetRef, resetFetching } = useInfiniteScroll(loadMore);

	const fetchInitialData = async () => {
		try {
			// Fetch categories and brands for filters
			const [categoriesRes, brandsRes] = await Promise.all([
				api.get("/categories"),
				api.get("/brands"),
			]);
			setCategories(categoriesRes.data.data || []);
			setBrands(brandsRes.data.data || []);
		} catch (error) {
			console.error("Failed to fetch initial data:", error);
		}
	};

	const fetchProducts = async (pageNum: number, reset: boolean = false) => {
		if (reset) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		try {
			const params = new URLSearchParams();
			if (search) params.append("search", search);
			if (selectedCategory && selectedCategory !== "all")
				params.append("category", selectedCategory);
			if (selectedBrand && selectedBrand !== "all")
				params.append("brand", selectedBrand);
			if (sortBy) params.append("sortBy", sortBy);
			params.append("page", pageNum.toString());
			params.append("limit", "12");

			// Use hub-filtered products for authenticated customers, regular products for guests
			const endpoint =
				isAuthenticated && user?.userTypes === "customer"
					? `/products/hub/my-products?${params}`
					: `/products?${params}`;

			const response = await api.get(endpoint);
			const data = response.data;

			const newProducts = data.data || [];
			const totalPages = data.totalPages || 1;

			if (reset) {
				setProducts(newProducts);
				setAllProducts(newProducts);
				setTotalProducts(data.total || newProducts.length);
			} else {
				// Check if we've reached the end of actual products
				if (newProducts.length === 0 || pageNum > totalPages) {
					// Loop back: start repeating products from the beginning
					const productsNeeded = 12;
					const repeatedProducts: Product[] = [];
					let currentIndex = 0;

					// Keep adding products from allProducts until we have 12
					while (
						repeatedProducts.length < productsNeeded &&
						allProducts.length > 0
					) {
						repeatedProducts.push(
							allProducts[currentIndex % allProducts.length]
						);
						currentIndex++;
					}

					setProducts((prev) => [...prev, ...repeatedProducts]);
					// Always has more since we're looping
					setHasMore(true);
				} else {
					// Normal case: add new products
					setProducts((prev) => [...prev, ...newProducts]);
					setAllProducts((prev) => [...prev, ...newProducts]);
					// Always keep hasMore true for infinite loop
					setHasMore(true);
				}
			}
		} catch (error: any) {
			console.error("Failed to fetch products:", error);

			// Show specific error message for hub-related issues
			if (
				error.response?.status === 400 &&
				error.response?.data?.message?.includes("hub")
			) {
				toast({
					title: "Hub Assignment Required",
					description:
						"Please contact admin to assign you to a hub to view products.",
					variant: "destructive",
				});
			} else {
				toast({
					title: "Error",
					description: "Failed to fetch products",
					variant: "destructive",
				});
			}
		} finally {
			setLoading(false);
			setLoadingMore(false);
			resetFetching();
		}
	};

	const getLowestPrice = (product: Product) => {
		if (!product.variants || product.variants.length === 0) return 0;
		return Math.min(...product.variants.map((v) => v.wholesalePrice));
	};

	const getMinMOQ = (product: Product) => {
		if (!product.variants || product.variants.length === 0)
			return product.moq || 1;
		return Math.min(...product.variants.map((v) => v.moq || product.moq || 1));
	};

	const clearFilters = () => {
		setSearch("");
		setSelectedCategory("all");
		setSelectedBrand("all");
		setSortBy("name");
	};

	return (
		<main className="min-h-screen bg-background pb-20 sm:pb-8">
			<div className="max-w-7xl mx-auto px-3 sm:px-4 pb-8 pt-2">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-2">
						<div className="flex-1">
							<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
								Wholesale Products
							</h1>
							<p className="text-muted-foreground text-xs sm:text-sm">
								Browse our extensive catalog of wholesale stationery products
							</p>
						</div>
						<div className="flex items-center gap-2 w-full sm:w-auto">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowFilters(!showFilters)}
								className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9">
								<Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
								{showFilters ? "Hide" : "Show"} Filters
							</Button>
							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("grid")}
								className="h-8 sm:h-9 px-2 sm:px-3">
								<Grid className="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("list")}
								className="h-8 sm:h-9 px-2 sm:px-3">
								<List className="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>
						</div>
					</div>

					{/* Filters and Search */}
					{showFilters && (
						<Card className="mb-4 sm:mb-6 border-2 shadow-md">
							<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
								<CardTitle className="flex items-center justify-between text-base sm:text-lg">
									<div className="flex items-center gap-2">
										<Filter className="w-4 h-4 sm:w-5 sm:h-5" />
										<span>Filters & Search</span>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={clearFilters}
										className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8">
										Clear All
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
								{/* Search Bar */}
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
									<Input
										placeholder="Search products, SKU, brand..."
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											setPage(1);
										}}
										className="pl-9 sm:pl-10 h-9 sm:h-11 text-sm"
									/>
								</div>
								{/* Filter Row */}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
									<div className="space-y-1.5 sm:space-y-2">
										<Label className="text-xs sm:text-sm font-medium">
											Category
										</Label>
										<Select
											value={selectedCategory}
											onValueChange={(value) => {
												setSelectedCategory(value);
												setPage(1);
											}}>
											<SelectTrigger className="h-9 sm:h-11 text-sm">
												<SelectValue placeholder="All Categories" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Categories</SelectItem>
												{categories.map((category) => (
													<SelectItem key={category._id} value={category._id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1.5 sm:space-y-2">
										<Label className="text-xs sm:text-sm font-medium">
											Brand
										</Label>
										<Select
											value={selectedBrand}
											onValueChange={(value) => {
												setSelectedBrand(value);
												setPage(1);
											}}>
											<SelectTrigger className="h-9 sm:h-11 text-sm">
												<SelectValue placeholder="All Brands" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Brands</SelectItem>
												{brands.map((brand) => (
													<SelectItem key={brand._id} value={brand._id}>
														{brand.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1.5 sm:space-y-2">
										<Label className="text-xs sm:text-sm font-medium">
											Sort By
										</Label>
										<Select value={sortBy} onValueChange={setSortBy}>
											<SelectTrigger className="h-9 sm:h-11 text-sm">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="name">Name A-Z</SelectItem>
												<SelectItem value="-name">Name Z-A</SelectItem>
												<SelectItem value="price">Price Low to High</SelectItem>
												<SelectItem value="-price">
													Price High to Low
												</SelectItem>
												<SelectItem value="-totalSold">Best Selling</SelectItem>
												<SelectItem value="-createdAt">Newest First</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Products Display */}
				{loading ? (
					viewMode === "grid" ? (
						<ProductGridSkeleton count={12} />
					) : (
						<ProductListSkeletonGrid count={8} />
					)
				) : products.length === 0 ? (
					<Card className="text-center py-12">
						<CardContent>
							<Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No products found</h3>
							<p className="text-muted-foreground mb-4">
								Try adjusting your search criteria or filters
							</p>
							<Button onClick={clearFilters}>Clear All Filters</Button>
						</CardContent>
					</Card>
				) : (
					<>
						{/* Results Summary */}
						<div className="flex items-center justify-between mb-4 sm:mb-6">
							<p className="text-xs sm:text-sm text-muted-foreground">
								Showing {products.length} products
							</p>
						</div>

						{/* Products Grid/List */}
						{viewMode === "grid" ? (
							<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
								{products.map((product, index) => (
									<ProductCard
										key={`${product._id}-${index}`}
										product={product}
									/>
								))}
							</div>
						) : (
							<div className="space-y-4 flex flex-col gap-4">
								{products.map((product, index) => (
									<ProductListItem
										key={`${product._id}-${index}`}
										product={product}
									/>
								))}
							</div>
						)}

						{/* Infinite Scroll Trigger */}
						<div ref={targetRef} className="flex justify-center py-8">
							{loadingMore && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Loader2 className="w-5 h-5 animate-spin" />
									<span className="text-sm">Loading more products...</span>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</main>
	);
}

// Product List Item Component for List View
function ProductListItem({ product }: { product: Product }) {
	const lowestPrice = Math.min(
		...product.variants.map((v) => v.wholesalePrice)
	);
	const highestMRP = Math.max(...product.variants.map((v) => v.mrp));
	const minMOQ = Math.min(...product.variants.map((v) => v.moq || 1));

	// Check stock status
	const totalStock =
		product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
	const isOutOfStock =
		totalStock === 0 || !product.variants?.some((v) => v.isInStock);

	return (
		<Link href={`/products/${product._id}`}>
			<Card className="hover:shadow-md transition-all duration-200">
				<CardContent className="p-3 sm:p-4">
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
						{/* Product Image */}
						<div
							className={`w-full sm:w-24 h-40 sm:h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative ${
								isOutOfStock ? "opacity-60" : ""
							}`}>
							<img
								src={
									product.thumbnail ||
									"/placeholder.svg?height=100&width=100&text=Product"
								}
								alt={product.name}
								className="w-full h-full object-cover"
							/>
							{isOutOfStock && (
								<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
									<Badge className="bg-red-600 text-white text-xs">
										OUT OF STOCK
									</Badge>
								</div>
							)}
						</div>

						{/* Product Details */}
						<div className="flex-1 min-w-0">
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
								<div className="space-y-1 sm:space-y-1.5 flex-1">
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
										<h3 className="font-semibold text-sm sm:text-base line-clamp-2 sm:line-clamp-1">
											{product.name}
										</h3>
										{product.isFeatured && (
											<Badge variant="secondary" className="text-xs w-fit">
												<Star className="w-3 h-3 mr-1" />
												Featured
											</Badge>
										)}
									</div>

									<p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">
										{product.shortDescription}
									</p>

									<div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
										{product.brand &&
											typeof product.brand === "object" &&
											product.brand.name && (
												<span className="truncate">
													Brand: {product.brand.name}
												</span>
											)}
										{product.category &&
											typeof product.category === "object" &&
											product.category.name && (
												<span className="truncate hidden sm:inline">
													Category: {product.category.name}
												</span>
											)}
										<span>MOQ: {minMOQ}</span>
										<span>{product.variants.length} variants</span>
									</div>
								</div>

								{/* Pricing and Action */}
								<div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 sm:text-right sm:ml-4">
									<div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
										<span className="text-lg sm:text-xl font-bold text-primary">
											₹{lowestPrice}
										</span>
										<span className="text-xs sm:text-sm text-muted-foreground line-through">
											₹{highestMRP}
										</span>
									</div>
									<Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
										<ShoppingCart className="w-3 h-3 mr-1 sm:mr-2" />
										<span className="hidden sm:inline">View Details</span>
										<span className="sm:hidden">View</span>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
