import { ProductCard } from "@/components/products/ProductCard";
import api from "@/lib/api";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
	params,
}: {
	params: { slug: string };
}): Promise<Metadata> {
	const resolvedParams = await params;
	const slug = resolvedParams?.slug;

	try {
		const res = await api.get(`/categories/${encodeURIComponent(slug)}`);
		const data = res.data?.data || res.data;
		const category = data.category || data;

		return {
			title: `${category.name} | Shop by Category`,
			description:
				category.description ||
				`Browse ${category.name} products and subcategories. Find the best deals on ${category.name}.`,
		};
	} catch (error) {
		return {
			title: "Category Not Found",
			description: "The category you're looking for could not be found.",
		};
	}
}

type Category = {
	_id: string;
	name: string;
	slug?: string;
	description?: string;
	image?: string;
	parentCategory?: string | null;
	categoryPath?: string[];
	productCount?: number;
	children?: Category[];
	isActive?: boolean;
};

export default async function Page({
	params,
}: { params: { slug: string } } | any) {
	// params may be a Promise in Next.js App Router; await to safely access
	const resolvedParams = await params;
	const slug = resolvedParams?.slug;

	let category: Category | null = null;
	let subcategories: Category[] = [];

	try {
		// Attempt to fetch category by slug from backend
		if (slug) {
			const res = await api.get(`/categories/${encodeURIComponent(slug)}`);
			const data = res.data?.data || res.data;

			// Handle the response structure
			if (data.category) {
				category = data.category;
				subcategories = data.children || data.category.children || [];
			} else {
				category = data;
				subcategories = data.children || [];
			}
		}
	} catch (err) {
		console.error("Failed to fetch category by slug", slug, err);
	}

	// Fetch products for this category using backend route: GET /categories/:id/products
	let products: any[] = [];
	let pagination: any = null;

	try {
		if (category?._id) {
			const pres = await api.get(
				`/categories/${encodeURIComponent(category._id)}/products`,
				{
					params: {
						limit: 20,
						page: 1,
					},
				}
			);

			const data = pres.data?.data || pres.data;
			products = data.products || [];
			pagination = data.pagination || null;
		}
	} catch (err) {
		console.error("Failed to fetch products for category", category?._id, err);
	}

	if (!category) {
		return (
			<div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
				<div className="max-w-2xl w-full text-center bg-white rounded-lg shadow-sm p-8">
					<div className="text-6xl mb-4">📦</div>
					<h1 className="text-2xl font-semibold mb-2 text-gray-900">
						Category not found
					</h1>
					<p className="text-sm text-gray-600 mb-6">
						We couldn't find a category with the identifier "{slug}".
					</p>
					<Link
						href="/categories"
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
						← Back to categories
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				<div className="space-y-6">
					{/* Breadcrumb */}
					{category.categoryPath && category.categoryPath.length > 0 && (
						<nav className="flex items-center space-x-2 text-sm text-gray-600">
							<Link href="/" className="hover:text-blue-600">
								Home
							</Link>
							<span>›</span>
							<Link href="/categories" className="hover:text-blue-600">
								Categories
							</Link>
							{category.categoryPath.map((path, idx) => (
								<span key={idx} className="flex items-center space-x-2">
									<span>›</span>
									<span
										className={
											idx === category.categoryPath!.length - 1
												? "font-medium text-gray-900"
												: ""
										}>
										{path}
									</span>
								</span>
							))}
						</nav>
					)}

					{/* Category Header */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h1 className="text-3xl font-bold text-gray-900">
									{category.name}
								</h1>
								{category.description && (
									<p className="mt-2 text-sm text-gray-600 max-w-3xl">
										{category.description}
									</p>
								)}
								<div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
									{pagination && pagination.totalProducts > 0 && (
										<span className="flex items-center gap-1">
											<span className="font-semibold text-gray-900">
												{pagination.totalProducts}
											</span>{" "}
											products available
										</span>
									)}
									{subcategories.length > 0 && (
										<span className="flex items-center gap-1">
											<span className="font-semibold text-gray-900">
												{subcategories.length}
											</span>{" "}
											subcategories
										</span>
									)}
								</div>
							</div>
							{products.length > 0 && (
								<Link
									href={`/products?category=${category._id}`}
									className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
									View All Products →
								</Link>
							)}
						</div>
					</div>

					{/* Subcategories */}
					{subcategories.length > 0 && (
						<div>
							<h2 className="text-xl font-semibold mb-4 text-gray-900">
								Subcategories
							</h2>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
								{subcategories.map((sub) => (
									<Link
										key={sub._id}
										href={`/categories/${sub.slug}`}
										className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
										<div className="p-3">
											<div className="w-full h-28 bg-gray-50 rounded flex items-center justify-center overflow-hidden mb-3">
												{sub.image ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={sub.image}
														alt={sub.name}
														className="object-cover w-full h-full group-hover:scale-105 transition-transform"
													/>
												) : (
													<div className="text-gray-300 text-3xl">📦</div>
												)}
											</div>
											<div className="text-center">
												<h3 className="font-medium text-sm text-gray-900 line-clamp-2 min-h-10">
													{sub.name}
												</h3>
												{sub.productCount !== undefined &&
													sub.productCount > 0 && (
														<p className="text-xs text-gray-500 mt-2">
															{sub.productCount}{" "}
															{sub.productCount === 1 ? "item" : "items"}
														</p>
													)}
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Products in this category */}
					{products.length > 0 ? (
						<section>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-gray-900">
									Products in {category.name}
								</h2>
								{pagination && pagination.totalProducts > products.length && (
									<Link
										href={`/products?category=${category._id}`}
										className="text-sm text-blue-600 hover:text-blue-800 font-medium">
										View all {pagination.totalProducts} products →
									</Link>
								)}
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{products.map((p) => {
									return <ProductCard product={p} key={p._id} />;
								})}
							</div>
						</section>
					) : (
						subcategories.length === 0 && (
							<div className="bg-white rounded-lg shadow-sm p-12 text-center">
								<div className="text-6xl mb-4">🔍</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									No products found
								</h3>
								<p className="text-sm text-gray-600 mb-6">
									This category doesn't have any products yet.
								</p>
								<Link
									href="/categories"
									className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors">
									← Browse other categories
								</Link>
							</div>
						)
					)}
				</div>
			</div>
		</div>
	);
}
