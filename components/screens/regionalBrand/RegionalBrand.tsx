import { ProductCard } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ArrowRight, MapPin } from "lucide-react";

interface RegionalBrand {
	_id: string;
	name: string;
	slug: string;
	description: string;
	region: string;
	logo?: string;
	isActive: boolean;
	products?: Product[];
	productCount?: number;
}

interface RegionalBrandPageProps {
	regionalBrands: RegionalBrand[];
}

function RegionalBrandPage({ regionalBrands }: RegionalBrandPageProps) {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-linear-to-r from-green-600 to-blue-600 text-white py-16">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-4xl font-bold mb-4">Regional Brand Store</h1>
					<p className="text-xl mb-4">
						Discover authentic local brands and regional favorites from across
						India
					</p>
					<p className="text-lg opacity-90">
						{regionalBrands.length} Regional Brands • Authentic Local Products
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* Regional Brands with Products */}
				{regionalBrands.map((brand) => (
					<div key={brand._id} className="mb-12">
						{/* Brand Header */}
						<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4">
									{brand.logo && (
										<img
											src={brand.logo}
											alt={brand.name}
											className="w-16 h-16 rounded-lg object-cover"
										/>
									)}
									<div>
										<h2 className="text-2xl font-bold">{brand.name}</h2>
										<div className="flex items-center text-muted-foreground mt-1">
											<MapPin className="w-4 h-4 mr-1" />
											<span>{brand.region}</span>
										</div>
										<p className="text-sm text-muted-foreground mt-2 max-w-2xl">
											{brand.description}
										</p>
									</div>
								</div>
								<Badge variant="secondary" className="text-sm">
									{brand.products?.length ?? brand.productCount ?? 0} Products
								</Badge>
							</div>
						</div>
						{/* Products Grid for this Brand */}
						{(() => {
							const productList = brand.products ?? [];
							return (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{productList.length === 0 ? (
										<div className="col-span-full text-center py-8 text-muted-foreground">
											No products for this brand
										</div>
									) : (
										productList.map((product) => (
											<ProductCard key={product._id} product={product} />
										))
									)}
								</div>
							);
						})()}

						{/* View All Products Link */}
						{(brand.products?.length ?? brand.productCount ?? 0) >= 8 && (
							<div className="text-center mt-6">
								<Button variant="outline" className="group">
									View All {brand.name} Products
									<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
								</Button>
							</div>
						)}
					</div>
				))}

				{/* Empty State */}
				{regionalBrands.length === 0 && (
					<div className="text-center py-12">
						<h3 className="text-xl font-semibold mb-2">
							No Regional Brands Available
						</h3>
						<p className="text-muted-foreground">
							Check back soon for authentic regional brands and products!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default RegionalBrandPage;
