"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiCall } from "@/lib/auth"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await apiCall(`/api/products/${params.id}`)
      const data = await response.json()
      setProduct(data)
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0])
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({
        title: "Error",
        description: "Please select a variant",
        variant: "destructive",
      })
      return
    }

    if (quantity < (selectedVariant.moq || 1)) {
      toast({
        title: "Error",
        description: `Minimum order quantity is ${selectedVariant.moq || 1}`,
        variant: "destructive",
      })
      return
    }

    // Add to cart
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.variantId === selectedVariant._id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        productId: product._id,
        productName: product.name,
        variantId: selectedVariant._id,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        quantity,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))

    toast({
      title: "Success",
      description: "Product added to cart",
    })
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/products" className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <img
              src={product.thumbnail || "/placeholder.svg?height=400&width=300&query=book"}
              alt={product.name}
              className="w-full rounded-lg mb-4"
            />
            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img || "/placeholder.svg"}
                  alt={`View ${idx}`}
                  className="w-full rounded cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.author}</p>
            </div>

            {/* Product Info */}
            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                {product.isbn && <p>ISBN: {product.isbn}</p>}
                {product.publisher && <p>Publisher: {product.publisher}</p>}
                {product.pages && <p>Pages: {product.pages}</p>}
                {product.language && <p>Language: {product.language}</p>}
                {product.edition && <p>Edition: {product.edition}</p>}
              </CardContent>
            </Card>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Variant</Label>
                <div className="space-y-2">
                  {product.variants.map((variant: any) => (
                    <Card
                      key={variant._id}
                      className={`cursor-pointer transition ${selectedVariant?._id === variant._id ? "border-primary" : ""}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{variant.name}</p>
                            <p className="text-sm text-muted-foreground">MOQ: {variant.moq}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">₹{variant.price}</p>
                            <p className="text-sm text-muted-foreground">Stock: {variant.stock}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={selectedVariant?.moq || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(selectedVariant?.moq || 1, Number.parseInt(e.target.value) || 1))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum order: {selectedVariant?.moq || 1} units</p>
            </div>

            {/* Price Summary */}
            <Card className="bg-accent/10">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span>₹{selectedVariant?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">₹{(selectedVariant?.price || 0) * quantity}</span>
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart Button */}
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        )}
      </div>
    </main>
  )
}
