"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiCall } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"
import { Eye, Download } from "lucide-react"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await apiCall("/api/orders")
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
      pending: "bg-yellow-500/10 text-yellow-600",
      confirmed: "bg-blue-500/10 text-blue-600",
      processing: "bg-purple-500/10 text-purple-600",
      shipped: "bg-cyan-500/10 text-cyan-600",
      delivered: "bg-green-500/10 text-green-600",
      cancelled: "bg-red-500/10 text-red-600",
    }
    return colors[status] || "bg-gray-500/10 text-gray-600"
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">My Orders</h1>

          {loading ? (
            <p className="text-muted-foreground">Loading orders...</p>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                <Link href="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Number</p>
                        <p className="font-semibold">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold text-primary">₹{order.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <p className="font-semibold">{order.items?.length || 0} items</p>
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

                    {/* Items Preview */}
                    <div className="mb-4 pb-4 border-t border-border">
                      <p className="text-sm font-semibold mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items?.slice(0, 2).map((item: any, idx: number) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.product?.name} x {item.quantity}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-sm text-muted-foreground">+{order.items.length - 2} more items</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/order-confirmation/${order._id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
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
