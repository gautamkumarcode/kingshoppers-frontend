"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const categories = [
    { id: 1, name: "Fiction", icon: "📖" },
    { id: 2, name: "Non-Fiction", icon: "📚" },
    { id: 3, name: "Educational", icon: "🎓" },
    { id: 4, name: "Children", icon: "👶" },
    { id: 5, name: "Comics", icon: "💭" },
    { id: 6, name: "Stationery", icon: "✏️" },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 299,
      image: "/book-cover.jpg",
    },
    {
      id: 2,
      name: "To Kill a Mockingbird",
      author: "Harper Lee",
      price: 349,
      image: "/book-cover.jpg",
    },
    {
      id: 3,
      name: "1984",
      author: "George Orwell",
      price: 329,
      image: "/book-cover.jpg",
    },
    {
      id: 4,
      name: "Pride and Prejudice",
      author: "Jane Austen",
      price: 279,
      image: "/book-cover.jpg",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 to-accent/20 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Raju Book World</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover millions of books, stationery, and educational materials
          </p>
          <Link href="/products">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="hover:shadow-lg transition cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <p className="font-semibold text-sm">{category.name}</p>
                </CardContent>
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
              <Card className="hover:shadow-lg transition h-full">
                <CardContent className="p-4">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.author}</p>
                  <p className="text-lg font-bold text-primary">₹{product.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get exclusive deals, early access to new releases, and loyalty rewards
          </p>
          <Link href="/auth/register">
            <Button size="lg">Sign Up Today</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
