"use client";

import BannerSlider from "@/components/BannerSlider/BannerSlider";
import HomepageSectionsList from "@/components/HomepageSectionsList";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Product } from "@/types/product";
import { ArrowRight, Flame, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
	const [bestSellers, setBestSellers] = useState<Product[]>([]);
	const [highMarginProducts, setHighMarginProducts] = useState<Product[]>([]);
	const [newArrivals, setNewArrivals] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [featuredPage, setFeaturedPage] = useState(1);
	const [bestSellersPage, setBestSellersPage] = useState(1);
	const [salePage, setSalePage] = useState(1);
	const [newArrivalsPage, setNewArrivalsPage] = useState(1);
	const [hasMoreFeatured, setHasMoreFeatured] = useState(true);
	const [hasMoreBestSellers, setHasMoreBestSellers] = useState(true);
	const [hasMoreSale, setHasMoreSale] = useState(true);
	const [hasMoreNewArrivals, setHasMoreNewArrivals] = useState(true);
	const [hero, setHero] = useState<{ image: string }[]>([]);

	const fetchBanners = async () => {
		try {
			const response = await api.get(`/banners?bannerType=hero`);
			setHero(response.data.data || []);
		} catch (error) {
			console.error("Error fetching banners:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Wait for auth to finish loading before fetching products
		if (!authLoading) {
			fetchAllProducts();
			fetchBanners();
		}
	}, [authLoading, isAuthenticated]);

	const fetchAllProducts = async () => {
		try {
			setLoading(true);

			// Add timestamp to prevent caching
			const timestamp = Date.now();

			// For authenticated customers, use hub-filtered products
			if (isAuthenticated && user?.userTypes === "customer") {
				// Fetch hub-filtered products with different filters
				const [featuredRes, bestSellersRes, saleRes, newArrivalsRes] =
					await Promise.all([
						api.get(`/products/hub/my-products`, {
							params: { limit: 8, page: 1, isFeatured: true, _t: timestamp },
						}),
						api.get(`/products/hub/my-products`, {
							params: {
								limit: 8,
								page: 1,
								sortBy: "-totalSold",
								_t: timestamp,
							},
						}),
						api.get(`/products/hub/my-products`, {
							params: { limit: 8, page: 1, isOnSale: true, _t: timestamp },
						}),
						api.get(`/products/hub/my-products`, {
							params: {
								limit: 8,
								page: 1,
								sortBy: "-createdAt",
								_t: timestamp,
							},
						}),
					]);

				setFeaturedProducts(featuredRes.data.data || []);
				setBestSellers(bestSellersRes.data.data || []);
				setHighMarginProducts(saleRes.data.data || []);
				setNewArrivals(newArrivalsRes.data.data || []);

				setHasMoreFeatured((featuredRes.data.data || []).length === 8);
				setHasMoreBestSellers((bestSellersRes.data.data || []).length === 8);
				setHasMoreSale((saleRes.data.data || []).length === 8);
				setHasMoreNewArrivals((newArrivalsRes.data.data || []).length === 8);
			} else {
				// For guests, use regular product endpoints
				const featuredRes = await api.get(`/products/featured`, {
					params: { limit: 8, page: 1, _t: timestamp },
				});
				setFeaturedProducts(featuredRes.data.data || []);
				setHasMoreFeatured((featuredRes.data.data || []).length === 8);

				const bestSellersRes = await api.get(`/products/best-sellers`, {
					params: { limit: 8, page: 1, _t: timestamp },
				});
				setBestSellers(bestSellersRes.data.data || []);
				setHasMoreBestSellers((bestSellersRes.data.data || []).length === 8);

				const saleRes = await api.get(`/products/on-sale`, {
					params: { limit: 8, page: 1, _t: timestamp },
				});
				setHighMarginProducts(saleRes.data.data || []);
				setHasMoreSale((saleRes.data.data || []).length === 8);

				const newArrivalsRes = await api.get(`/products/new-arrivals`, {
					params: { limit: 8, page: 1, _t: timestamp },
				});
				setNewArrivals(newArrivalsRes.data.data || []);
				setHasMoreNewArrivals((newArrivalsRes.data.data || []).length === 8);
			}
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadMoreFeatured = async () => {
		const nextPage = featuredPage + 1;
		try {
			const endpoint =
				isAuthenticated && user?.userTypes === "customer"
					? `/products/hub/my-products`
					: `/products/featured`;
			const res = await api.get(endpoint, {
				params: {
					limit: 8,
					page: nextPage,
					...(isAuthenticated && user?.userTypes === "customer"
						? { isFeatured: true }
						: {}),
				},
			});
			const newProducts = res.data.data || [];

			if (newProducts.length === 0 && featuredProducts.length > 0) {
				// Loop back: repeat existing products
				const productsToAdd = featuredProducts.slice(0, 8);
				setFeaturedProducts((prev) => [...prev, ...productsToAdd]);
			} else {
				setFeaturedProducts((prev) => [...prev, ...newProducts]);
			}

			setFeaturedPage(nextPage);
			setHasMoreFeatured(true); // Always true for infinite loop
		} catch (error) {
			console.error("Error loading more featured products:", error);
		}
	};

	const loadMoreBestSellers = async () => {
		const nextPage = bestSellersPage + 1;
		try {
			const endpoint =
				isAuthenticated && user?.userTypes === "customer"
					? `/products/hub/my-products`
					: `/products/best-sellers`;
			const res = await api.get(endpoint, {
				params: {
					limit: 8,
					page: nextPage,
					...(isAuthenticated && user?.userTypes === "customer"
						? { sortBy: "-totalSold" }
						: {}),
				},
			});
			const newProducts = res.data.data || [];

			if (newProducts.length === 0 && bestSellers.length > 0) {
				// Loop back: repeat existing products
				const productsToAdd = bestSellers.slice(0, 8);
				setBestSellers((prev) => [...prev, ...productsToAdd]);
			} else {
				setBestSellers((prev) => [...prev, ...newProducts]);
			}

			setBestSellersPage(nextPage);
			setHasMoreBestSellers(true); // Always true for infinite loop
		} catch (error) {
			console.error("Error loading more best sellers:", error);
		}
	};

	const loadMoreSale = async () => {
		const nextPage = salePage + 1;
		try {
			const endpoint =
				isAuthenticated && user?.userTypes === "customer"
					? `/products/hub/my-products`
					: `/products/on-sale`;
			const res = await api.get(endpoint, {
				params: {
					limit: 8,
					page: nextPage,
					...(isAuthenticated && user?.userTypes === "customer"
						? { isOnSale: true }
						: {}),
				},
			});
			const newProducts = res.data.data || [];

			if (newProducts.length === 0 && highMarginProducts.length > 0) {
				// Loop back: repeat existing products
				const productsToAdd = highMarginProducts.slice(0, 8);
				setHighMarginProducts((prev) => [...prev, ...productsToAdd]);
			} else {
				setHighMarginProducts((prev) => [...prev, ...newProducts]);
			}

			setSalePage(nextPage);
			setHasMoreSale(true); // Always true for infinite loop
		} catch (error) {
			console.error("Error loading more sale products:", error);
		}
	};

	const loadMoreNewArrivals = async () => {
		const nextPage = newArrivalsPage + 1;
		try {
			const endpoint =
				isAuthenticated && user?.userTypes === "customer"
					? `/products/hub/my-products`
					: `/products/new-arrivals`;
			const res = await api.get(endpoint, {
				params: {
					limit: 8,
					page: nextPage,
					...(isAuthenticated && user?.userTypes === "customer"
						? { sortBy: "-createdAt" }
						: {}),
				},
			});
			const newProducts = res.data.data || [];

			if (newProducts.length === 0 && newArrivals.length > 0) {
				// Loop back: repeat existing products
				const productsToAdd = newArrivals.slice(0, 8);
				setNewArrivals((prev) => [...prev, ...productsToAdd]);
			} else {
				setNewArrivals((prev) => [...prev, ...newProducts]);
			}

			setNewArrivalsPage(nextPage);
			setHasMoreNewArrivals(true); // Always true for infinite loop
		} catch (error) {
			console.error("Error loading more new arrivals:", error);
		}
	};

	return (
		<main className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
			{/* Hero Section */}
			<section className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
				{/* Hero Image */}
				<img
					src={hero?.[0]?.image || "/placeholder-hero.jpg"}
					alt="King Shoppers Hero Banner"
					className="w-full h-full object-cover"
				/>

				{/* Dark Overlay */}
				<div className="absolute inset-0 bg-black/40" />

				{/* Text Content */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="relative mx-auto px-4 text-center text-white max-w-4xl">
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
							Welcome to King Shoppers
						</h1>
						<p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-md">
							Your trusted online destination for smart and stylish shopping
						</p>
						<Link href="/products">
							<Button
								size="lg"
								className="bg-white text-black hover:bg-gray-100 font-semibold px-6 sm:px-8 shadow-lg">
								Shop Now
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Homepage Sections */}
			<section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
				<HomepageSectionsList />
			</section>

			{/* Banner */}
			<section className="max-w-4xl mx-auto px-3 sm:px-4 my-8 sm:my-12">
				<BannerSlider bannerType="deal" />
			</section>

			{/* Featured Products */}
			{featuredProducts.length > 0 && (
				<section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
					<div className="flex items-center justify-between mb-6 sm:mb-8">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="p-2 bg-yellow-100 rounded-lg">
								<Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
							</div>
							<div>
								<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
									Featured Products
								</h2>
								<p className="text-xs sm:text-sm text-gray-600">
									Hand-picked favorites just for you
								</p>
							</div>
						</div>
						<Link
							href="/products"
							className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
							View All →
						</Link>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
						{featuredProducts.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
					{hasMoreFeatured && (
						<div className="flex justify-center mt-6">
							<Button onClick={loadMoreFeatured} variant="outline">
								Load More Featured Products
							</Button>
						</div>
					)}
				</section>
			)}

			{/* Best Sellers */}
			{bestSellers.length > 0 && (
				<section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 bg-white rounded-lg my-8">
					<div className="flex items-center justify-between mb-6 sm:mb-8">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="p-2 bg-red-100 rounded-lg">
								<Flame className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
							</div>
							<div>
								<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
									Best Sellers
								</h2>
								<p className="text-xs sm:text-sm text-gray-600">
									Most popular products this month
								</p>
							</div>
						</div>
						<Link
							href="/products"
							className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
							View All →
						</Link>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
						{bestSellers.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
					{hasMoreBestSellers && (
						<div className="flex justify-center mt-6">
							<Button onClick={loadMoreBestSellers} variant="outline">
								Load More Best Sellers
							</Button>
						</div>
					)}
				</section>
			)}

			{/* Sale Products Banner */}
			{highMarginProducts.length > 0 && (
				<section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
					<div className="bg-linear-to-r from-red-500 to-pink-500 rounded-lg p-6 sm:p-8 text-white text-center mb-6">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Zap className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
							<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
								MEGA SALE!
							</h2>
							<Zap className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
						</div>
						<p className="text-sm sm:text-base md:text-lg opacity-90">
							Limited time offers - Save big on selected products!
						</p>
					</div>
				</section>
			)}

			{/* Sale Products / Special Offers */}
			{highMarginProducts.length > 0 && (
				<section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
					<div className="flex items-center justify-between mb-6 sm:mb-8">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="p-2 bg-red-100 rounded-lg">
								<Zap className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
							</div>
							<div>
								<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
									On Sale Now
								</h2>
								<p className="text-xs sm:text-sm text-gray-600">
									Limited time offers with huge discounts
								</p>
							</div>
						</div>
						<Link
							href="/products"
							className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
							View All →
						</Link>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
						{highMarginProducts.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
					{hasMoreSale && (
						<div className="flex justify-center mt-6">
							<Button onClick={loadMoreSale} variant="outline">
								Load More Sale Products
							</Button>
						</div>
					)}
				</section>
			)}

			{/* New Arrivals */}
			{newArrivals.length > 0 && (
				<section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 bg-white rounded-lg my-8">
					<div className="flex items-center justify-between mb-6 sm:mb-8">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
							</div>
							<div>
								<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
									New Arrivals
								</h2>
								<p className="text-xs sm:text-sm text-gray-600">
									Fresh products just added
								</p>
							</div>
						</div>
						<Link
							href="/products"
							className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
							View All →
						</Link>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
						{newArrivals.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
					{hasMoreNewArrivals && (
						<div className="flex justify-center mt-6">
							<Button onClick={loadMoreNewArrivals} variant="outline">
								Load More New Arrivals
							</Button>
						</div>
					)}
				</section>
			)}

			{/* CTA Banner */}
			{/* <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
				<Card className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-8 sm:p-12 text-center">
					<TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6" />
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
						Start Shopping Today!
					</h2>
					<p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90">
						Discover thousands of products at wholesale prices. Join thousands
						of satisfied customers.
					</p>
					<Link href="/products">
						<Button
							size="lg"
							className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 sm:px-8">
							Browse All Products
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</Card>
			</section> */}
		</main>
	);
}
