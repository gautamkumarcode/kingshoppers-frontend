import RegionalBrandPage from "./RegionalBrand";

interface RegionalBrand {
	_id: string;
	name: string;
	slug: string;
	description: string;
	region: string;
	logo?: string;
	isActive: boolean;
	products: any[];
}

async function fetchRegionalBrands(): Promise<RegionalBrand[]> {
	try {
		const baseUrl =
			process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
		// Try the richer endpoint first (includes products)
		let response = await fetch(`${baseUrl}/regional-brands/with-products`, {
			cache: "no-store",
		});

		if (!response.ok) {
			// Fallback to the basic brands endpoint
			response = await fetch(`${baseUrl}/regional-brands`, {
				cache: "no-store",
			});
			if (!response.ok) {
				throw new Error(
					`Failed to fetch regional brands: ${response.status} ${response.statusText}`
				);
			}
		}

		const data = await response.json();
		// Support different shapes returned by endpoints
		return (
			data?.regionalBrands ||
			data?.regionalBrandsWithProducts ||
			data?.data ||
			[]
		);
	} catch (error) {
		console.error("Error fetching regional brands:", error);
		return [];
	}
}

async function RegionalBrandHOC() {
	const regionalBrands = await fetchRegionalBrands();

	return <RegionalBrandPage regionalBrands={regionalBrands} />;
}

export default RegionalBrandHOC;
