"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth-guard";
import { Search, Eye } from "lucide-react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Fetch Orders
  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };
  // ✅ Filter Orders
  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.includes(search) || order.user?.phone?.includes(search)
  );
  // ✅ Status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      confirmed: "bg-blue-500/10 text-blue-600",
      processing: "bg-purple-500/10 text-purple-600",
      shipped: "bg-cyan-500/10 text-cyan-600",
      delivered: "bg-green-500/10 text-green-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600";
  };
  // ✅ Update Order function (any field)
  const updateOrderField = async (field: string, value: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await api.put(`/orders/${selectedOrder._id}`, { [field]: value });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, [field]: value } : o
        )
      );
      setSelectedOrder((prev: any) => ({
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AuthGuard requiredRole="sales_executive">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders</h1>

        {/* 🔍 Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by order number or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* 📋 Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-muted-foreground">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4">Order #</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-border hover:bg-accent/50"
                      >
                        <td className="py-3 px-4 font-semibold">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">
                              {order.user?.firstName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.user?.phone}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ₹{order.total}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {/* 👁️ View Button with Modal */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-xl border shadow-xl">
                              <div className="bg-primary text-primary-foreground px-5 py-4">
                                <DialogTitle className="text-lg font-semibold">
                                  Order Details
                                </DialogTitle>
                                <DialogDescription className="opacity-90 text-sm">
                                  Complete customer & order summary
                                </DialogDescription>
                              </div>

                              <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                                {/* Order Header */}
                                <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg">
                                  <p className="text-sm">
                                    <span className="font-semibold">
                                      Order #:
                                    </span>{" "}
                                    {selectedOrder.orderNumber}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-semibold">Date:</span>{" "}
                                    {new Date(
                                      selectedOrder.createdAt
                                    ).toLocaleString()}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-semibold">
                                      Status:
                                    </span>{" "}
                                    <span className="capitalize font-medium">
                                      {selectedOrder.orderStatus}
                                    </span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-semibold">
                                      Payment:
                                    </span>{" "}
                                    <span className="capitalize">
                                      {selectedOrder.paymentStatus}
                                    </span>
                                  </p>
                                </div>

                                {/* Customer Info */}
                                <div className="p-4 rounded-lg border">
                                  <h3 className="font-semibold text-base mb-3">
                                    👤 Customer Information
                                  </h3>
                                  <p>
                                    <b>Name:</b> {selectedOrder.user?.ownerName}
                                  </p>
                                  <p>
                                    <b>Email:</b> {selectedOrder.user?.email}
                                  </p>
                                  <p>
                                    <b>Phone:</b> {selectedOrder.user?.phone}
                                  </p>
                                </div>

                                {/* Address */}
                                <div className="p-4 rounded-lg border">
                                  <h3 className="font-semibold text-base mb-2">
                                    📍 Delivery Address
                                  </h3>
                                  <p className="text-sm leading-6">
                                    {selectedOrder.deliveryAddress
                                      ? `${
                                          selectedOrder.deliveryAddress
                                            .street || ""
                                        }, 
             ${selectedOrder.deliveryAddress.city || ""}, 
             ${selectedOrder.deliveryAddress.state || ""} - 
             ${selectedOrder.deliveryAddress.pincode || ""}`
                                      : "No address available"}
                                  </p>
                                </div>

                                {/* Items Table */}
                                <div className="rounded-lg border overflow-hidden">
                                  <h3 className="font-semibold text-base p-3 border-b">
                                    🧾 Items
                                  </h3>
                                  <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                      <tr>
                                        <th className="text-left py-2 px-3">
                                          Product
                                        </th>
                                        <th className="text-center py-2 px-3">
                                          Qty
                                        </th>
                                        <th className="text-right py-2 px-3">
                                          Price
                                        </th>
                                        <th className="text-right py-2 px-3">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedOrder.items.map((item, i) => (
                                        <tr key={i} className="border-t">
                                          <td className="py-2 px-3">
                                            {item.productName ||
                                              item.product?.name}
                                          </td>
                                          <td className="text-center py-2 px-3">
                                            {item.quantity}
                                          </td>
                                          <td className="text-right py-2 px-3">
                                            ₹{item.unitPrice?.toFixed(2)}
                                          </td>
                                          <td className="text-right py-2 px-3 font-medium">
                                            ₹{item.total?.toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Summary */}
                                <div className="text-right space-y-2 p-4 border rounded-lg">
                                  <p>
                                    <b>Subtotal:</b> ₹
                                    {selectedOrder.subtotal?.toFixed(2)}
                                  </p>
                                  {selectedOrder.shippingCost > 0 && (
                                    <p>
                                      <b>Shipping:</b> ₹
                                      {selectedOrder.shippingCost.toFixed(2)}
                                    </p>
                                  )}
                                  <p className="text-lg font-bold">
                                    <b>Total:</b> ₹
                                    {selectedOrder.grandTotal?.toFixed(2)}
                                  </p>
                                </div>

                                {/* Status Update */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <b>Order Status</b>
                                    <Select
                                      value={selectedOrder.orderStatus}
                                      onValueChange={(v) =>
                                        updateOrderField("orderStatus", v)
                                      }
                                    >
                                      <SelectTrigger className="w-full mt-1" />
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="confirmed">
                                          Confirmed
                                        </SelectItem>
                                        <SelectItem value="processing">
                                          Processing
                                        </SelectItem>
                                        <SelectItem value="shipped">
                                          Shipped
                                        </SelectItem>
                                        <SelectItem value="delivered">
                                          Delivered
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                          Cancelled
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <b>Payment Status</b>
                                    <Select
                                      value={selectedOrder.paymentStatus}
                                      onValueChange={(v) =>
                                        updateOrderField("paymentStatus", v)
                                      }
                                    >
                                      <SelectTrigger className="w-full mt-1" />
                                      <SelectContent>
                                        <SelectItem value="unpaid">
                                          Unpaid
                                        </SelectItem>
                                        <SelectItem value="paid">
                                          Paid
                                        </SelectItem>
                                        <SelectItem value="refunded">
                                          Refunded
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
