import { ProductCard } from "@/components/products/ProductCard";
import api from "@/lib/api";
import Link from "next/link";

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
	try {
		// Attempt to fetch category by slug from backend
		// Adjust endpoint if your backend expects a different path (e.g. /categories/slug/:slug)
		if (slug) {
			const res = await api.get(`/categories/${encodeURIComponent(slug)}`);
			category = res.data?.data.category || res.data || null;
		}
	} catch (err) {
		console.error("Failed to fetch category by slug", slug, err);
	}

	// Fetch products for this category using backend route: GET /categories/:id/products
	let products: any[] = [];
	try {
		if (category?._id) {
			const pres = await api.get(
				`/categories/${encodeURIComponent(category._id)}/products`
			);

			products = pres.data?.data.products || pres.data || [];
		}
	} catch (err) {
		console.error("Failed to fetch products for category", category?._id, err);
	}

	if (!category) {
		return (
			<div className="min-h-screen flex items-center justify-center p-8">
				<div className="max-w-2xl w-full text-center">
					<h1 className="text-2xl font-semibold mb-2">Category not found</h1>
					<p className="text-sm text-muted-foreground mb-4">
						We couldn't find a category with the slug "{slug}".
					</p>
					<Link
						href="/categories"
						className="text-sm text-blue-600 hover:underline">
						Back to categories
					</Link>
				</div>
			</div>
		);
	}

	const subcategories = category.children || [];

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								{category.name}
							</h1>
							{category.description && (
								<p className="mt-2 text-sm text-gray-600">
									{category.description}
								</p>
							)}
							{category.categoryPath && category.categoryPath.length > 0 && (
								<p className="mt-2 text-xs text-muted-foreground">
									{category.categoryPath.join(" › ")}
								</p>
							)}
						</div>
						<div>
							<Link
								href={`/products?category=${category._id}`}
								className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm">
								View products
							</Link>
						</div>
					</div>

					{subcategories.length > 0 && (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
							{subcategories.map((sub) => (
								<Link
									key={sub._id}
									href={`/categories/${sub.slug}`}
									className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition">
									<div className="w-full h-28 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
										{sub.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={sub.image}
												alt={sub.name}
												className="object-cover w-full h-full"
											/>
										) : (
											<div className="text-gray-400">No image</div>
										)}
									</div>
									<div className="mt-3">
										<div className="font-medium text-sm truncate">
											{sub.name}
										</div>
										{sub.productCount !== undefined && sub.productCount > 0 && (
											<p className="text-xs text-muted-foreground mt-1">
												{sub.productCount} items
											</p>
										)}
									</div>
								</Link>
							))}
						</div>
					)}

					{/* Products in this category */}
					{products.length > 0 && (
						<section>
							<h2 className="text-xl font-semibold mt-8 mb-4">Products</h2>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{products.map((p) => {
									return <ProductCard product={p} key={p._id} />;
								})}
							</div>
						</section>
					)}
				</div>
			</div>
		</div>
	);
}
