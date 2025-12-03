import { CategorySearch } from "@/components/categories/CategorySearch";
import { ProductCard } from "@/components/products/ProductCard";
import api from "@/lib/api";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Shop by Category | Browse All Categories",
	description:
		"Browse our complete catalog of categories and subcategories. Find products organized by category for easy shopping.",
};

type Category = {
	_id: string;
	name: string;
	slug?: string;
	description?: string;
	image?: string;
	parentCategory?: string;
	level?: number;
	categoryPath?: string[];
	productCount?: number;
	isActive?: boolean;
	isFeatured?: boolean;
};

// Helper function to build category tree
function buildCategoryTree(categories: Category[]): Category[] {
	const categoryMap = new Map<string, Category & { children: Category[] }>();

	// Initialize all categories with children array
	categories.forEach((cat) => {
		categoryMap.set(cat._id, { ...cat, children: [] });
	});

	// Build tree structure
	const tree: Category[] = [];

	categoryMap.forEach((category) => {
		if (category.parentCategory && categoryMap.has(category.parentCategory)) {
			// This is a child category, add to parent's children
			const parent = categoryMap.get(category.parentCategory);
			if (parent) {
				parent.children.push(category);
			}
		} else {
			// This is a root category (no parent or parent not found)
			tree.push(category);
		}
	});

	// Sort children for consistent display
	categoryMap.forEach((category) => {
		category.children.sort((a, b) => a.name.localeCompare(b.name));
	});

	tree.sort((a, b) => a.name.localeCompare(b.name));

	return tree;
}

// Component to render parent category with its children and products
async function CategorySection({
	category,
}: {
	category: Category & { children: Category[] };
}) {
	const hasChildren = category.children && category.children.length > 0;

	return (
		<div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
			{/* Parent Category Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
				<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
					{category.image && (
						<div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={category.image}
								alt={category.name}
								className="object-cover w-full h-full"
							/>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 line-clamp-2">
							{category.name}
						</h2>
						{category.description && (
							<p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 sm:line-clamp-1">
								{category.description}
							</p>
						)}
						<div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
							{category.productCount !== undefined &&
								category.productCount > 0 && (
									<span>
										<span className="font-semibold text-gray-900">
											{category.productCount}
										</span>{" "}
										products
									</span>
								)}
							{hasChildren && (
								<span>
									<span className="font-semibold text-gray-900">
										{category.children.length}
									</span>{" "}
									subcategories
								</span>
							)}
						</div>
					</div>
				</div>
				<Link
					href={`/categories/${category.slug || category._id}`}
					className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm hover:bg-blue-700 transition-colors whitespace-nowrap self-start sm:self-auto">
					View All →
				</Link>
			</div>

			{hasChildren && (
				<div className="space-y-6 sm:space-y-8">
					{category.children.map(async (child) => {
						// Fetch products for each subcategory
						let childProducts: any[] = [];
						try {
							const res = await api.get(`/categories/${child._id}/products`, {
								params: { limit: 4, page: 1 },
							});
							childProducts = res.data?.data?.products || [];
						} catch (err) {
							console.error(
								"Failed to fetch products for subcategory",
								child._id,
								err
							);
						}

						return (
							<div
								key={child._id}
								className="border-t border-gray-100 pt-4 sm:pt-6 first:border-t-0 first:pt-0">
								{/* Subcategory Header */}
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
									<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
										{child.image && (
											<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={child.image}
													alt={child.name}
													className="object-cover w-full h-full"
												/>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
												{child.name}
											</h3>
											{child.productCount !== undefined &&
												child.productCount > 0 && (
													<p className="text-xs sm:text-sm text-gray-500">
														{child.productCount}{" "}
														{child.productCount === 1 ? "product" : "products"}
													</p>
												)}
										</div>
									</div>
									<Link
										href={`/categories/${child.slug || child._id}`}
										className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap self-start sm:self-auto">
										View All →
									</Link>
								</div>

								{/* Products for this subcategory */}
								{childProducts.length > 0 ? (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
										{childProducts.map((product) => (
											<ProductCard key={product._id} product={product} />
										))}
									</div>
								) : (
									<div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center">
										<p className="text-xs sm:text-sm text-gray-500">
											No products available in this category yet.
										</p>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{!hasChildren && (
				<div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center border border-gray-100">
					<div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📦</div>
					<p className="text-xs sm:text-sm text-gray-600">
						No subcategories available.{" "}
						<Link
							href={`/categories/${category.slug || category._id}`}
							className="text-blue-600 hover:text-blue-800 font-medium">
							Browse products →
						</Link>
					</p>
				</div>
			)}
		</div>
	);
}
export default async function Page({
	searchParams,
}: {
	searchParams?: { q?: string };
}) {
	let categories: Category[] = [];
	let error: string | null = null;

	try {
		const res = await api.get("/categories");
		categories = res.data?.data || res.data || [];
	} catch (err: any) {
		console.error("Failed to fetch categories", err);
		error = err.response?.data?.message || "Failed to load categories";
	}

	// Build category tree
	const categoryTree = buildCategoryTree(categories);

	// server-side search filtering if q provided
	// `searchParams` may be a Promise in the App Router; await it to safely access properties
	const resolvedSearchParams = (await searchParams) ?? {};
	const q = (resolvedSearchParams.q || "").toString().trim().toLowerCase();

	// For search, we want to flatten the tree and show all matching categories
	const flattenCategories = (cats: Category[]): Category[] => {
		const flattened: Category[] = [];
		cats.forEach((cat) => {
			flattened.push(cat);
			if ((cat as any).children && (cat as any).children.length > 0) {
				flattened.push(...flattenCategories((cat as any).children));
			}
		});
		return flattened;
	};

	const filtered = q
		? flattenCategories(categoryTree).filter((c) => {
				const hay = [c.name, c.description, ...(c.categoryPath || [])]
					.join(" ")
					.toLowerCase();
				return hay.includes(q);
		  })
		: categoryTree;

	// Show error state
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
					<div className="text-6xl mb-4">⚠️</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Unable to Load Categories
					</h1>
					<p className="text-sm text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
				<div className="space-y-4 sm:space-y-6">
					{/* Header */}
					<div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6">
						<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
							<div className="flex-1">
								<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
									Shop by Category
								</h1>
								<p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
									Browse categories and subcategories to discover products.
								</p>
								{!q && categoryTree.length > 0 && (
									<p className="text-xs sm:text-sm text-gray-500 mt-1">
										{categoryTree.length} main{" "}
										{categoryTree.length === 1 ? "category" : "categories"}
									</p>
								)}
							</div>
							<div className="w-full md:w-80">
								<Suspense
									fallback={
										<div className="h-9 sm:h-10 bg-gray-100 rounded-lg animate-pulse" />
									}>
									<CategorySearch />
								</Suspense>
							</div>
						</div>
					</div>

					{/* Categories Display */}
					{filtered.length === 0 ? (
						<div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
							<div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
								🔍
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
								{q ? "No categories found" : "No categories available"}
							</h3>
							<p className="text-xs sm:text-sm text-gray-600">
								{q
									? `No categories match your search "${q}"`
									: "Categories will appear here once they are added."}
							</p>
						</div>
					) : !q ? (
						// Display hierarchical structure when not searching
						<div className="space-y-6 sm:space-y-8">
							{(filtered as (Category & { children: Category[] })[]).map(
								(parentCategory) => (
									<CategorySection
										key={parentCategory._id}
										category={parentCategory}
									/>
								)
							)}
						</div>
					) : (
						// Display flat grid when searching
						<div>
							<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
								Found {filtered.length}{" "}
								{filtered.length === 1 ? "category" : "categories"} matching "
								{q}"
							</p>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
								{filtered.map((cat) => (
									<Link
										key={cat._id}
										href={`/categories/${cat.slug || cat._id}`}
										className="group block p-2.5 sm:p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
										<div className="w-full h-24 sm:h-28 bg-gray-50 rounded flex items-center justify-center overflow-hidden mb-2 sm:mb-3">
											{cat.image ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={cat.image}
													alt={cat.name}
													className="object-cover w-full h-full group-hover:scale-105 transition-transform"
												/>
											) : (
												<div className="text-gray-300 text-2xl sm:text-3xl">
													📦
												</div>
											)}
										</div>
										<div>
											<h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 min-h-8 sm:min-h-10">
												{cat.name}
											</h3>
											{cat.categoryPath && cat.categoryPath.length > 1 && (
												<p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-1">
													{cat.categoryPath.slice(0, -1).join(" › ")}
												</p>
											)}
											{cat.description && (
												<p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 line-clamp-2 hidden sm:block">
													{cat.description}
												</p>
											)}
											<div className="flex items-center justify-between mt-2 sm:mt-3 text-[10px] sm:text-xs">
												<span className="text-gray-600">
													{cat.productCount ?? 0}{" "}
													{cat.productCount === 1 ? "product" : "products"}
												</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
