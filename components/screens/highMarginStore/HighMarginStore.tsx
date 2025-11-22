import { ProductCard } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Percent, TrendingUp } from "lucide-react";
import Link from "next/link";

interface MarginCategory {
	range: string;
	minMargin: number;
	maxMargin: number;
	products: Product[];
	color: string;
}

interface HighMarginStorePageProps {
	marginCategories: MarginCategory[];
	totalProducts: number;
}

function HighMarginStorePage({
	marginCategories,
	totalProducts,
}: HighMarginStorePageProps) {
	const calculateMargin = (product: Product) => {
		const variant = product.variants[0];
		if (!variant || !variant.wholesalePrice || !variant.costPrice) return 0;
		return Math.round(
			((variant.wholesalePrice - variant.costPrice) / variant.wholesalePrice) *
				100
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-linear-to-r from-purple-600 to-pink-600 text-white py-16">
				<div className="container mx-auto px-4 text-center">
					<div className="flex items-center justify-center mb-4">
						<TrendingUp className="w-8 h-8 mr-3" />
						<h1 className="text-4xl font-bold">High Margin Store</h1>
					</div>
					<p className="text-xl mb-4">
						Maximize your profits with our premium high-margin products
					</p>
					<p className="text-lg opacity-90">
						{totalProducts} High Margin Products • Up to 50%+ Profit Margins
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* Margin Categories Overview */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold mb-6">Shop by Margin Range</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
						{marginCategories.map((category) => (
							<Card
								key={category.range}
								className="hover:shadow-lg transition-shadow">
								<div className="p-4 text-center">
									<div
										className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
										<Percent className="w-8 h-8 text-white" />
									</div>
									<h3 className="font-semibold text-lg mb-1">
										{category.range}
									</h3>
									<p className="text-sm text-muted-foreground">
										{category.products.length} products
									</p>
								</div>
							</Card>
						))}
					</div>
				</div>{" "}
				{/*
 Products by Margin Categories */}
				{marginCategories.map((category) => (
					<div key={category.range} className="mb-12">
						{/* Category Header */}
						<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4">
									<div
										className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
										<Percent className="w-6 h-6 text-white" />
									</div>
									<div>
										<h2 className="text-2xl font-bold">
											{category.range} Margin Products
										</h2>
										<p className="text-muted-foreground">
											Products with {category.minMargin}% to{" "}
											{category.maxMargin === 100 ? "50+" : category.maxMargin}%
											profit margins
										</p>
									</div>
								</div>
								<Badge variant="secondary" className="text-sm">
									{category.products.length} Products
								</Badge>
							</div>
						</div>

						{/* Products Row for this Margin Category (horizontal scroll) */}
						<div className="">
							<div className="flex items-center justify-between mb-4">
								<div />
								<div>
									<Link
										href={`/products?margin=${category.minMargin}-${category.maxMargin}`}
										className="text-sm">
										See all
									</Link>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
								{category.products.map((product) => (
									<ProductCard key={product._id} product={product} />
								))}
							</div>
						</div>
					</div>
				))}
				{/* Empty State */}
				{marginCategories.length === 0 && (
					<div className="text-center py-12">
						<h3 className="text-xl font-semibold mb-2">
							No High Margin Products Available
						</h3>
						<p className="text-muted-foreground">
							Check back soon for profitable high-margin products!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default HighMarginStorePage;
