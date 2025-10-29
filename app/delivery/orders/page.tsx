"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiCall } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"
import { MapPin, Phone, Eye } from "lucide-react"

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await apiCall("/api/orders/delivery/assigned")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-blue-500/10 text-blue-600",
      processing: "bg-purple-500/10 text-purple-600",
      shipped: "bg-cyan-500/10 text-cyan-600",
      delivered: "bg-green-500/10 text-green-600",
    }
    return colors[status] || "bg-gray-500/10 text-gray-600"
  }

  return (
    <AuthGuard requiredRole="delivery">
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Assigned Orders</h1>

          {loading ? (
            <p className="text-muted-foreground">Loading orders...</p>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No orders assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Number</p>
                        <p className="font-semibold">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-semibold">{order.user?.firstName}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold text-primary">₹{order.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span
                          className={`text-xs px-2 py-1 rounded capitalize inline-block ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-4 pb-4 border-t border-border">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">{order.deliveryAddress?.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{" "}
                            {order.deliveryAddress?.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/delivery/orders/${order._id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
