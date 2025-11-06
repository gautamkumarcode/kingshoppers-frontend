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
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
		// Try the richer endpoint first (includes products)
		let response = await fetch(`${baseUrl}/regional-brands/with-products`, {
			cache: "no-store",
		});

		console.log("Fetch regional brands response status:", response);

		if (!response.ok) {
			// log status and body for debugging
			let bodyText = "";
			try {
				bodyText = await response.text();
			} catch (e) {
				bodyText = String(e);
			}
			console.warn(
				`regional-brands/with-products failed: ${response.status} ${response.statusText} - ${bodyText}`
			);

			// Fallback to the basic brands endpoint
			response = await fetch(`${baseUrl}/regional-brands`, {
				cache: "no-store",
			});
			if (!response.ok) {
				let fallbackText = "";
				try {
					fallbackText = await response.text();
				} catch (e) {
					fallbackText = String(e);
				}
				throw new Error(
					`Failed to fetch regional brands (fallback) ${response.status} ${response.statusText} - ${fallbackText}`
				);
			}
		}

		const data = await response.json();
		console.log("Regional brands response:", data);
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
