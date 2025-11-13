"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiCall } from "@/lib/auth";
import { AuthGuard } from "@/components/auth-guard";
import { Search, Eye } from "lucide-react";

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiCall("/api/orders");
      const data = await response.json();
      const ordersArray = Array.isArray(data) ? data : data.orders || [];
      setOrders(ordersArray);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const query = (search || "").toLowerCase();
  const filteredOrders = (orders || []).filter((order) => {
    const orderNum = order?.orderNumber?.toString().toLowerCase() || "";
    const phone = order?.user?.phone?.toString().toLowerCase() || "";
    return orderNum.includes(query) || phone.includes(query);
  });

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
  const handleView = (order: any) => {
    setSelectedOrder(order);
    setViewOpen(true);
  };
  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by order number or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Orders Table */}
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🧾 View Order Modal */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-base">
                    Order #{selectedOrder.orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="border-t border-border pt-2">
                  <p className="font-semibold">Customer Details</p>
                  <p>{selectedOrder.user?.firstName}</p>
                  <p className="text-muted-foreground text-xs">
                    {selectedOrder.user?.phone}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {selectedOrder.user?.email}
                  </p>
                </div>

                <div className="border-t border-border pt-2">
                  <p className="font-semibold">Status</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded capitalize ${getStatusColor(
                      selectedOrder.orderStatus
                    )}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>

                <div className="border-t border-border pt-2">
                  <p className="font-semibold">Total Amount</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{selectedOrder.total}
                  </p>
                </div>

                {selectedOrder.items && (
                  <div className="border-t border-border pt-2">
                    <p className="font-semibold mb-1">Items:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <li key={idx}>
                          {item.productName} × {item.quantity} — ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No order selected.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
