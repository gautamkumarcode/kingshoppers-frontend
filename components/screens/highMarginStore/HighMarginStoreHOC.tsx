import { Product } from "@/types/product";
import HighMarginStorePage from "./HighMarginStore";

interface MarginCategory {
	range: string;
	minMargin: number;
	maxMargin: number;
	products: Product[];
	color: string;
}

async function fetchHighMarginProducts(): Promise<{
	marginCategories: MarginCategory[];
	totalProducts: number;
}> {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

		// Try main high-margin endpoint first
		let response = await fetch(
			`${baseUrl}/api/products/high-margin?limit=100`,
			{
				cache: "no-store",
			}
		);

		if (!response.ok) {
			// Log response body for debugging
			let body = "";
			try {
				body = await response.text();
			} catch (e) {
				body = String(e);
			}
			console.warn(
				`high-margin endpoint failed: ${response.status} ${response.statusText} - ${body}`
			);

			// Fallback to top margin products endpoint
			response = await fetch(`${baseUrl}/products/high-margin/top?limit=100`, {
				cache: "no-store",
			});
			if (!response.ok) {
				let fb = "";
				try {
					fb = await response.text();
				} catch (e) {
					fb = String(e);
				}
				console.error(
					`high-margin fallback failed: ${response.status} ${response.statusText} - ${fb}`
				);
				throw new Error(
					`Failed to fetch high margin products (primary and fallback)`
				);
			}
		}

		const data = await response.json();
		const products = data.products || [];

		// Group products by margin ranges
		const marginCategories: MarginCategory[] = [
			{
				range: "20-30%",
				minMargin: 20,
				maxMargin: 30,
				products: [],
				color: "bg-blue-500",
			},
			{
				range: "30-40%",
				minMargin: 30,
				maxMargin: 40,
				products: [],
				color: "bg-green-500",
			},
			{
				range: "40-50%",
				minMargin: 40,
				maxMargin: 50,
				products: [],
				color: "bg-orange-500",
			},
			{
				range: "50%+",
				minMargin: 50,
				maxMargin: 100,
				products: [],
				color: "bg-red-500",
			},
		];

		// Categorize products by margin
		products.forEach((product: Product) => {
			const margin = product.calculatedMargin || 0;

			if (margin >= 50) {
				marginCategories[3].products.push(product);
			} else if (margin >= 40) {
				marginCategories[2].products.push(product);
			} else if (margin >= 30) {
				marginCategories[1].products.push(product);
			} else if (margin >= 20) {
				marginCategories[0].products.push(product);
			}
		});

		// Filter out empty categories and limit products per category
		const filteredCategories = marginCategories
			.filter((category) => category.products.length > 0)
			.map((category) => ({
				...category,
				products: category.products.slice(0, 8), // Limit to 8 products per category
			}));

		return {
			marginCategories: filteredCategories,
			totalProducts: products.length,
		};
	} catch (error) {
		console.error("Error fetching high margin products:", error);
		return {
			marginCategories: [],
			totalProducts: 0,
		};
	}
}

async function HighMarginStoreHOC() {
	const { marginCategories, totalProducts } = await fetchHighMarginProducts();

	return (
		<HighMarginStorePage
			marginCategories={marginCategories}
			totalProducts={totalProducts}
		/>
	);
}

export default HighMarginStoreHOC;
