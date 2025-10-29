"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiCall } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, MapPin, Phone, CheckCircle } from "lucide-react"

export default function DeliveryOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [otp, setOtp] = useState("")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await apiCall(`/api/orders/${params.id}`)
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error("Failed to fetch order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)

    try {
      const response = await apiCall(`/api/orders/${params.id}/verify-delivery-otp`, {
        method: "POST",
        body: JSON.stringify({ otp }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Invalid OTP",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Order delivered successfully",
      })

      router.push("/delivery/orders")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>
  }

  return (
    <AuthGuard requiredRole="delivery">
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/delivery/orders" className="flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <h1 className="text-3xl font-bold mb-8">Order {order.orderNumber}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">
                      {order.user?.firstName} {order.user?.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold">{order.user?.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{order.deliveryAddress?.street}</p>
                      <p className="text-muted-foreground">
                        {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                      </p>
                      <p className="text-muted-foreground">Pincode: {order.deliveryAddress?.pincode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between pb-4 border-b last:border-0">
                        <div>
                          <p className="font-semibold">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">{item.variant}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{item.total}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery Verification */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Delivery Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.orderStatus === "delivered" ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="font-semibold">Delivered</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.updatedAt).toLocaleString()}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp">Customer OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Ask customer for the OTP sent to their phone</p>
                      </div>

                      <Button type="submit" className="w-full" disabled={verifying}>
                        {verifying ? "Verifying..." : "Mark as Delivered"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}
