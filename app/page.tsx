"use client";

import { AnimatedGradientText } from "@/components/AnimatedText/AnimatedText";
import BannerSlider from "@/components/BannerSlider/BannerSlider";
import HomepageSectionsList from "@/components/HomepageSectionsList";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Product } from "@/types/product";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function HomePage() {
	const [products, setProducts] = useState<Product[]>([]);
	const getProductData = async () => {
		const response = await api.get(`/products`);
		const data = response.data;
		setProducts(data.data || []);
	};

	useEffect(() => {
		getProductData();
	}, []);
	return (
		<main className="min-h-screen ">
			{/* Hero Section */}
			<section
				className="relative bg-cover bg-center bg-no-repeat py-20"
				style={{
					backgroundImage:
						"url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSApRYg6X880zej2UlumRztM6qJj_zw29vu6Q&s')",
				}}>
				{/* Overlay for better text visibility */}
				<div className="absolute inset-0 bg-black/40" />

				<div className="relative  mx-auto px-4 text-center text-white">
					<div className="overflow-hidden">
						<h1 className="text-5xl font-bold mb-4 animate-marquee whitespace-nowrap">
							Welcome to King Shoppers
						</h1>
					</div>

					<p className="text-xl text-black-600 mb-8">
						Welcome to Smart King Shopper, your trusted online destination for
						smart and stylish shopping.
					</p>
					<Link href="/products">
						<Button size="lg" className="bg-white text-black hover:bg-blue-400">
							Shop Now
						</Button>
					</Link>
				</div>
			</section>

			{/* Homepage Sections - Replace hardcoded categories with dynamic sections */}
			<section className="max-w-7xl mx-auto px-4 py-16 pb-1">
				<HomepageSectionsList />
			</section>

			<div className="md:w-1/2  my-16  w-full h-full mx-auto px-4">
				<BannerSlider bannerType="hero" />
			</div>

			{/* Featured Products */}
			<section className="max-w-7xl mx-auto px-4 py-16">
				<AnimatedGradientText className="mb-8 text-2xl md:text-3xl lg:text-4xl bg-linear-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-extrabold">
					Featured Products
				</AnimatedGradientText>

				<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
					{products.map((product) => (
						<ProductCard key={product._id} product={product} />
					))}
				</div>
			</section>

			{/* CTA Section */}
		</main>
	);
}
