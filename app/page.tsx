"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
	const categories = [
		{ id: 1, name: "Categories", image: "/brand.jpg" },
		{ id: 2, name: "Spices", image: "/categori1.jpg" },
		{ id: 3, name: "Fresh Vegetables ", image: "/categori2.jpg" },
		{ id: 4, name: "Grocery ", image: "/grocery.jpg" },
	];

	const featuredProducts = [
		{
			id: 1,
			name: " Cooking oil",
			price: 999,
			image: "/brand.jpg",
		},
		{
			id: 2,
			name: "Groceries Product",
			price: 349,
			image: "/groceries.avif",
		},
		{
			id: 3,
			name: "Flash Vagetables",
			price: 329,
			image: "/vegetable.jpg",
		},
		{
			id: 4,
			name: "Flash Fruits",
			price: 299,
			image: "/fruit.jpg",
		},
	];

	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="bg-linear-to-r from-primary/20 to-accent/20 py-20">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-5xl font-bold mb-4">Welcome to King Shoppers</h1>
					<p className="text-xl text-muted-foreground mb-8">
						Welcome to Smart King Shopper, your trusted online destination for
						smart and stylish shopping.
					</p>
					<Link href="/products">
						<Button size="lg">Shop Now</Button>
					</Link>
				</div>
			</section>

			<section className="max-w-7xl mx-auto px-4 py-16 pb-1">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					{categories.map((category) => (
						<Link key={category.id} href={`/products?category=${category.id}`}>
							<Card className="p-0 gap-1 cursor-pointer overflow-hidden h-64">
								{/* 👇 Image container alag wrapper me */}
								<p className="text-black py-3 font-semibold text-sm drop-shadow-md flex justify-center items-center w-full">
									{category.name}
								</p>
								<div className=" inset-0 overflow-hidden h-[90%]">
									<img
										src={category.image}
										alt={category.name}
										className="w-full h-full object-contain transform  transition-transform duration-500"
									/>
								</div>
							</Card>
						</Link>
					))}
				</div>
			</section>

			{/* Featured Products */}
			<section className="max-w-7xl mx-auto px-4 py-16">
				<h2 className="text-3xl font-bold mb-8">Featured Products</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{featuredProducts.map((product) => (
						<Link key={product.id} href={`/products/${product.id}`}>
							<Card className="hover:shadow-lg transition overflow-hidden cursor-pointer">
								{/* 🖼️ Image at top */}
								<img
									src={product.image || "/placeholder.svg"}
									alt={product.name}
									className="w-full h-56 object-cover"
								/>

								{/* 📄 Text content below image */}
								<CardContent className="p-4 bg-white">
									<h3 className="font-semibold line-clamp-2">{product.name}</h3>
									<p className="text-lg font-bold text-yellow-600">
										₹{product.price}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-primary/10 py-16">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">
						Join the King Shopper Community
					</h2>
					<p className="text-lg text-muted-foreground mb-8">
						Join the King Shopper community and enjoy early access to new
						arrivals, members-only discounts, and royal shopping rewards!
					</p>
					<Link href="/auth/register">
						<Button size="lg">Sign Up Today</Button>
					</Link>
				</div>
			</section>
		</main>
	);
}
