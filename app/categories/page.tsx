import api from "@/lib/api";
import Link from "next/link";

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

// Component to render parent category with its children
function CategorySection({
  category,
}: {
  category: Category & { children: Category[] };
}) {
  const hasChildren = category.children && category.children.length > 0;

	return (
		<div className="mb-8">
			{/* Parent Category Header */}
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">
						{category.name}
					</h3>
					{category.productCount !== undefined && category.productCount > 0 && (
						<p className="text-sm text-gray-500 mt-0.5">
							{category.productCount} products
						</p>
					)}
				</div>
				<Link
					href={`/products?category=${category._id}`}
					className="text-sm text-blue-600 hover:text-blue-800 font-medium">
					View Products →
				</Link>
			</div>

			{hasChildren && (
				<>
					{/* Child Categories Tabs/Pills */}
					<div className="flex flex-wrap gap-2 mb-4">
						{category.children.slice(0, 8).map((child) => (
							<Link
								key={child._id}
								href={`/products?category=${child._id}`}
								className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors">
								{child.name}
								{child.productCount !== undefined && child.productCount > 0 && (
									<span className="ml-1.5 text-xs text-gray-500">
										({child.productCount})
									</span>
								)}
							</Link>
						))}
						{category.children.length > 8 && (
							<span className="px-3 py-1.5 text-sm text-gray-500">
								+{category.children.length - 8} more
							</span>
						)}
					</div>

					{/* Child Categories Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{category.children.map((child) => (
							<Link
								key={child._id}
								href={`/products?category=${child._id}`}
								className="group block">
								<div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
									<div className="w-full h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden mb-2">
										{child.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={child.image}
												alt={child.name}
												className="object-cover w-full h-full group-hover:scale-105 transition-transform"
											/>
										) : (
											<div className="text-gray-300 text-2xl">📦</div>
										)}
									</div>
									<div className="text-center">
										<h4 className="text-xs font-medium text-gray-900 line-clamp-2 min-h-8">
											{child.name}
										</h4>
										{child.productCount !== undefined && (
											<p className="text-xs text-gray-500 mt-1">
												{child.productCount}{" "}
												{child.productCount === 1 ? "item" : "items"}
											</p>
										)}
									</div>
								</div>
							</Link>
						))}
					</div>
				</>
			)}

			{!hasChildren && (
				<div className="bg-gray-50 rounded-lg p-6 text-center">
					<p className="text-sm text-gray-500">
						No subcategories available.
						<Link
							href={`/products?category=${category._id}`}
							className="text-blue-600 hover:text-blue-800 ml-1">
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
  try {
    const res = await api.get("/categories");
    categories = res.data?.data || res.data || [];
  } catch (err) {
    console.error("Failed to fetch categories", err);
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

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				<div className="space-y-6">
					<div className="flex items-start gap-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Shop by Category
							</h1>
							<p className="text-sm text-gray-500 mt-1">
								Browse categories and subcategories to discover products.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{filtered.length === 0 && (
							<div className="p-6 text-center text-muted-foreground col-span-full">
								No categories found
							</div>
						)}

						{!q ? (
							// Display hierarchical structure when not searching
							<div className="col-span-full">
								<div className="space-y-8">
									{(filtered as (Category & { children: Category[] })[]).map(
										(parentCategory) => (
											<CategorySection
												key={parentCategory._id}
												category={parentCategory}
											/>
										)
									)}
								</div>
							</div>
						) : (
							// Display flat list when searching
							filtered.map((cat) => (
								<Link
									key={cat._id}
									href={`/products?category=${cat._id}`}
									className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition">
									<div className="w-full h-28 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
										{cat.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={cat.image}
												alt={cat.name}
												className="object-cover w-full h-full"
											/>
										) : (
											<div className="text-gray-400">No image</div>
										)}
									</div>
									<div className="mt-3">
										<div className="font-medium text-sm truncate">
											{cat.name}
										</div>
										{cat.categoryPath && cat.categoryPath.length > 0 && (
											<div className="text-xs text-muted-foreground mt-1 line-clamp-1">
												{cat.categoryPath.join(" › ")}
											</div>
										)}
										{cat.description && (
											<p className="text-xs text-muted-foreground mt-2 line-clamp-2">
												{cat.description}
											</p>
										)}
										<div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
											<span>{cat.productCount ?? 0} products</span>
											<span
												className={`px-2 py-0.5 rounded text-[11px] ${
													cat.isActive
														? "bg-green-50 text-green-700"
														: "bg-gray-100 text-gray-700"
												}`}>
												{cat.isActive ? "Active" : "Inactive"}
											</span>
										</div>
									</div>
								</Link>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
