"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiCall } from "@/lib/auth"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [walletBalance, setWalletBalance] = useState(0)
  const [useWallet, setUseWallet] = useState(false)
  const [walletAmount, setWalletAmount] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    deliverySlot: "morning",
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/auth/login")
      return
    }

    const cartData = JSON.parse(localStorage.getItem("cart") || "[]")
    if (cartData.length === 0) {
      router.push("/cart")
      return
    }
    setCart(cartData)

    // Fetch wallet balance
    fetchWalletBalance()
  }, [router, authLoading, user])

  const fetchWalletBalance = async () => {
    try {
      const response = await apiCall("/api/wallet")
      const data = await response.json()
      setWalletBalance(data.balance || 0)
    } catch (error) {
      console.error("Failed to fetch wallet:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const tax = Math.round(subtotal * 0.18)
      let total = subtotal + tax

      // Apply wallet discount if using wallet
      if (useWallet && walletAmount > 0) {
        total = Math.max(0, total - walletAmount)
      }

      const orderData = {
        items: cart.map((item) => ({
          product: item.productId,
          variant: item.variantName,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        deliveryAddress: formData,
        paymentMethod: useWallet ? "wallet" : paymentMethod,
        subtotal,
        tax,
        total,
      }

      const response = await apiCall("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to place order",
          variant: "destructive",
        })
        return
      }

      // If using wallet, process wallet payment
      if (useWallet && walletAmount > 0) {
        await apiCall("/api/wallet/use-for-payment", {
          method: "POST",
          body: JSON.stringify({ amount: walletAmount, orderId: data.order._id }),
        })
      }

      // Clear cart
      localStorage.removeItem("cart")

      toast({
        title: "Success",
        description: "Order placed successfully",
      })

      // Redirect to order confirmation
      router.push(`/order-confirmation/${data.order._id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while placing the order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || cart.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.18)
  let total = subtotal + tax

  if (useWallet && walletAmount > 0) {
    total = Math.max(0, total - walletAmount)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/cart" className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Slot */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.deliverySlot}
                  onValueChange={(value: string) => setFormData((prev) => ({ ...prev, deliverySlot: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning">Morning (6 AM - 12 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="afternoon" />
                    <Label htmlFor="afternoon">Afternoon (12 PM - 6 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evening" id="evening" />
                    <Label htmlFor="evening">Evening (6 PM - 10 PM)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={useWallet}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online Payment</Label>
                  </div>
                </RadioGroup>

                {/* Wallet Payment */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">Use Wallet Balance</p>
                      <p className="text-sm text-muted-foreground">Available: ₹{walletBalance}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => {
                        setUseWallet(e.target.checked)
                        if (!e.target.checked) setWalletAmount(0)
                      }}
                      className="w-4 h-4"
                    />
                  </div>

                  {useWallet && (
                    <div className="space-y-2">
                      <Label htmlFor="walletAmount">Amount to Use (₹)</Label>
                      <Input
                        id="walletAmount"
                        type="number"
                        value={walletAmount}
                        onChange={(e) =>
                          setWalletAmount(Math.min(walletBalance, Number.parseFloat(e.target.value) || 0))
                        }
                        max={walletBalance}
                        min={0}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.productName} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18%):</span>
                    <span>₹{tax}</span>
                  </div>
                  {useWallet && walletAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Wallet Discount:</span>
                      <span>-₹{walletAmount}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
