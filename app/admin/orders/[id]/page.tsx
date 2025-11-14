"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Edit,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderDetails {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  user: {
    _id: string;
    shopName: string;
    ownerName: string;
    phone: string;
    email: string;
    customerTier: string;
    shopAddress: {
      street: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  items: Array<{
    product: {
      name: string;
      _id: string;
      category: string;
      brand: string;
    };
    variantName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  grandTotal: number;
  subtotal: number;
  totalTax: number;
  createdAt: string;
  expectedDeliveryDate?: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    notes: string;
    updatedBy?: string;
  }>;
  deliveryPersonnel?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function AdminOrderDetailsPage() {
<<<<<<< Updated upstream
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    notes: "",
  });
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
=======
	const params = useParams();
	const router = useRouter();
	const [order, setOrder] = useState<OrderDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [showAdvancePaymentModal, setShowAdvancePaymentModal] = useState(false);
	const [showDeliveryModal, setShowDeliveryModal] = useState(false);
	const [updateData, setUpdateData] = useState({
		status: "",
		notes: "",
	});
	const [paymentData, setPaymentData] = useState({
		paymentStatus: "",
		transactionId: "",
		paymentGateway: "",
		notes: "",
	});
	const [advancePaymentData, setAdvancePaymentData] = useState({
		amount: "",
		paymentMethod: "online",
		transactionId: "",
		notes: "",
	});
	const [downloadingInvoice, setDownloadingInvoice] = useState(false);
>>>>>>> Stashed changes

  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/admin/orders/${params.id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, {
        status: updateData.status,
        notes: updateData.notes,
      });

<<<<<<< Updated upstream
      // Refresh order details
      fetchOrderDetails();
      setShowUpdateModal(false);
      setUpdateData({ status: "", notes: "" });
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
=======
			// Refresh order details
			fetchOrderDetails();
			setShowUpdateModal(false);
			setUpdateData({ status: "", notes: "" });
		} catch (error) {
			console.error("Failed to update order status:", error);
			alert("Failed to update order status");
		} finally {
			setUpdating(false);
		}
	};

	const handlePaymentStatusUpdate = async () => {
		if (!order) return;

		setUpdating(true);
		try {
			const payload: any = {
				paymentStatus: paymentData.paymentStatus,
				notes: paymentData.notes,
			};

			// Add payment details if provided
			if (paymentData.transactionId || paymentData.paymentGateway) {
				payload.paymentDetails = {
					transactionId: paymentData.transactionId,
					paymentGateway: paymentData.paymentGateway,
				};
			}

			await api.put(`/orders/${order._id}/payment-status`, payload);

			// Refresh order details
			fetchOrderDetails();
			setShowPaymentModal(false);
			setPaymentData({
				paymentStatus: "",
				transactionId: "",
				paymentGateway: "",
				notes: "",
			});
			alert("Payment status updated successfully");
		} catch (error) {
			console.error("Failed to update payment status:", error);
			alert("Failed to update payment status");
		} finally {
			setUpdating(false);
		}
	};

	const handleAdvancePayment = async () => {
		if (!order) return;

		const amount = parseFloat(advancePaymentData.amount);
		if (!amount || amount <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		setUpdating(true);
		try {
			await api.post(`/orders/${order._id}/advance-payment`, {
				amount,
				paymentMethod: advancePaymentData.paymentMethod,
				transactionId: advancePaymentData.transactionId,
				notes: advancePaymentData.notes,
			});

			// Refresh order details
			fetchOrderDetails();
			setShowAdvancePaymentModal(false);
			setAdvancePaymentData({
				amount: "",
				paymentMethod: "online",
				transactionId: "",
				notes: "",
			});
			alert("Advance payment recorded successfully");
		} catch (error) {
			console.error("Failed to record advance payment:", error);
			alert("Failed to record advance payment");
		} finally {
			setUpdating(false);
		}
	};

	const handleMarkDelivered = async () => {
		if (!order) return;

		// For COD orders, ask if cash was received
		if (order.paymentMethod === "cod") {
			const cashReceived = confirm(
				"Did the customer pay cash at the time of delivery?\n\nClick OK if payment was received, or Cancel if payment is still pending."
			);

			setUpdating(true);
			try {
				await api.post(`/orders/${order._id}/mark-delivered`, {
					notes: cashReceived
						? "Order delivered and cash payment received"
						: "Order delivered, payment pending",
					paymentReceived: cashReceived,
				});

				// Refresh order details
				fetchOrderDetails();
				setShowDeliveryModal(false);
				alert(
					cashReceived
						? "Order marked as delivered and payment completed!"
						: "Order marked as delivered. Payment status remains pending."
				);
			} catch (error) {
				console.error("Failed to mark order as delivered:", error);
				alert("Failed to mark order as delivered");
			} finally {
				setUpdating(false);
			}
		} else {
			// For other payment methods, just confirm delivery
			if (!confirm("Are you sure you want to mark this order as delivered?")) {
				return;
			}

			setUpdating(true);
			try {
				await api.post(`/orders/${order._id}/mark-delivered`, {
					notes: "Order marked as delivered by admin",
					paymentReceived: false,
				});

				// Refresh order details
				fetchOrderDetails();
				setShowDeliveryModal(false);
				alert("Order marked as delivered successfully");
			} catch (error) {
				console.error("Failed to mark order as delivered:", error);
				alert("Failed to mark order as delivered");
			} finally {
				setUpdating(false);
			}
		}
	};

	const handleDownloadInvoice = async () => {
		if (!order) return;
>>>>>>> Stashed changes

    setDownloadingInvoice(true);
    try {
      const response = await api.get(`/orders/${order._id}/invoice`, {
        responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order not found</h2>
              <p className="text-gray-600 mb-4">
                The order you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/admin/orders">
                <Button>Back to Orders</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // compute safe totals when API doesn't provide them
  const computedSubtotal =
    order.subtotal ??
    order.items?.reduce((sum, it) => {
      const itemTotal = it.total ?? (it.unitPrice ?? 0) * (it.quantity ?? 0);
      return sum + (itemTotal ?? 0);
    }, 0) ??
    0;

  const computedTotalTax = order.totalTax ?? 0;

  const computedGrandTotal =
    order.grandTotal ?? computedSubtotal + computedTotalTax;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Badge
              className={`${getStatusColor(
                order.orderStatus
              )} flex items-center justify-center gap-1 text-xs sm:text-sm px-3 py-2 sm:py-1`}
            >
              {getStatusIcon(order.orderStatus)}
              <span className="capitalize">{order.orderStatus}</span>
            </Badge>
            <Button
              onClick={() => {
                setUpdateData({ status: order.orderStatus, notes: "" });
                setShowUpdateModal(true);
              }}
              className="w-full sm:w-auto text-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Customer Information */}
            {order.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Shop Name
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        <p className="font-medium">{order.user.shopName}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Owner Name
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="font-medium">{order.user.ownerName}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Phone
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p>{order.user.phone}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Email
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p>{order.user.email || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Customer Tier
                    </Label>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {order.user.customerTier}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {item.variantName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                          <span className="truncate">
                            Category: {item.product.category}
                          </span>
                          <span className="truncate">
                            Brand: {item.product.brand}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm">
                          <span>Qty: {item.quantity}</span>
                          <span>₹{item.unitPrice} each</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="font-semibold text-base sm:text-lg">
                          ₹{item.total}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                  {order.deliveryAddress.street && (
                    <p className="font-medium">
                      {order.deliveryAddress.street}
                    </p>
                  )}
                  {order.deliveryAddress.area && (
                    <p className="text-gray-600">
                      {order.deliveryAddress.area}
                    </p>
                  )}
                  {order.deliveryAddress.landmark && (
                    <p className="text-gray-600">
                      Near: {order.deliveryAddress.landmark}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {[
                      order.deliveryAddress.city,
                      order.deliveryAddress.state,
                      order.deliveryAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-3 sm:gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                            index === 0
                              ? "bg-primary text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          {getStatusIcon(history.status)}
                        </div>
                        {index < order.statusHistory.length - 1 && (
                          <div className="w-0.5 h-6 sm:h-8 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-3 sm:pb-4 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <span className="font-medium capitalize text-sm sm:text-base">
                            {history.status}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(history.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {history.notes && (
                          <p className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{computedSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{computedTotalTax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{computedGrandTotal}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <Badge
                      variant={
                        order.paymentStatus === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.paymentStatus || "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Expected Delivery
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {order.expectedDeliveryDate
                        ? new Date(
                            order.expectedDeliveryDate
                          ).toLocaleDateString()
                        : "3-5 business days"}
                    </span>
                  </div>
                </div>
                {order.deliveryPersonnel && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Delivery Personnel
                    </Label>
                    <div className="mt-1">
                      <p className="font-medium">
                        {order.deliveryPersonnel.firstName}{" "}
                        {order.deliveryPersonnel.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryPersonnel.phone}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

<<<<<<< Updated upstream
            {/* Actions */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
              >
                <Download className="w-4 h-4 mr-2" />
                {downloadingInvoice ? "Downloading..." : "Download Invoice"}
              </Button>
              <Button variant="outline" className="w-full text-sm">
                Print Order Details
              </Button>
            </div>
          </div>
        </div>

        {/* Update Status Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <Card className="w-full max-w-md mx-2">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Update Order Status
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  Order #{order.orderNumber}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="status" className="text-sm">
                    Order Status
                  </Label>
                  <Select
                    value={updateData.status}
                    onValueChange={(value) =>
                      setUpdateData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this status update..."
                    value={updateData.notes}
                    onChange={(e) =>
                      setUpdateData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleStatusUpdate}
                    className="flex-1 text-sm"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateData({ status: "", notes: "" });
                    }}
                    disabled={updating}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
=======
						{/* Payment Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-base sm:text-lg">
									<div className="flex items-center gap-2">
										<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
										Payment Details
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setPaymentData({
												paymentStatus: order.paymentStatus || "pending",
												transactionId: "",
												paymentGateway: "",
												notes: "",
											});
											setShowPaymentModal(true);
										}}
										className="text-xs">
										<Edit className="w-3 h-3 mr-1" />
										Edit
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 text-sm sm:text-base">
									<div className="flex justify-between">
										<span>Payment Method</span>
										<span className="capitalize">{order.paymentMethod}</span>
									</div>
									<div className="flex justify-between">
										<span>Payment Status</span>
										<Badge
											variant={
												order.paymentStatus === "completed"
													? "default"
													: order.paymentStatus === "partial"
													? "secondary"
													: "outline"
											}>
											{order.paymentStatus || "Pending"}
										</Badge>
									</div>
									<Separator />
									<div className="space-y-2">
										<Button
											variant="outline"
											size="sm"
											className="w-full text-xs"
											onClick={() => setShowAdvancePaymentModal(true)}
											disabled={order.paymentStatus === "completed"}>
											Record Advance Payment
										</Button>
										{/* Button to record COD cash payment after delivery */}
										{order.paymentMethod === "cod" &&
											order.orderStatus === "delivered" &&
											order.paymentStatus !== "completed" && (
												<Button
													variant="default"
													size="sm"
													className="w-full text-xs bg-green-600 hover:bg-green-700"
													onClick={async () => {
														if (
															!confirm(
																"Confirm that cash payment has been received from the customer?"
															)
														) {
															return;
														}
														setUpdating(true);
														try {
															await api.put(
																`/orders/${order._id}/payment-status`,
																{
																	paymentStatus: "completed",
																	notes: "Cash payment received after delivery",
																}
															);
															fetchOrderDetails();
															alert("Cash payment recorded successfully!");
														} catch (error) {
															console.error(
																"Failed to record cash payment:",
																error
															);
															alert("Failed to record cash payment");
														} finally {
															setUpdating(false);
														}
													}}
													disabled={updating}>
													Record Cash Payment
												</Button>
											)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Delivery Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
									<Truck className="w-4 h-4 sm:w-5 sm:h-5" />
									Delivery Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 sm:space-y-3 text-sm sm:text-base">
								<div>
									<Label className="text-sm font-medium text-gray-600">
										Expected Delivery
									</Label>
									<div className="flex items-center gap-2 mt-1">
										<Calendar className="w-4 h-4 text-gray-400" />
										<span className="text-sm">
											{order.expectedDeliveryDate
												? new Date(
														order.expectedDeliveryDate
												  ).toLocaleDateString()
												: "3-5 business days"}
										</span>
									</div>
								</div>
								{order.deliveryPersonnel && (
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Delivery Personnel
										</Label>
										<div className="mt-1">
											<p className="font-medium">
												{order.deliveryPersonnel.firstName}{" "}
												{order.deliveryPersonnel.lastName}
											</p>
											<p className="text-sm text-gray-600">
												{order.deliveryPersonnel.phone}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Actions */}
						<div className="space-y-2 sm:space-y-3">
							<Button
								variant="outline"
								className="w-full text-sm"
								onClick={handleDownloadInvoice}
								disabled={downloadingInvoice}>
								<Download className="w-4 h-4 mr-2" />
								{downloadingInvoice ? "Downloading..." : "Download Invoice"}
							</Button>
							<Button variant="outline" className="w-full text-sm">
								Print Order Details
							</Button>
							{order.orderStatus !== "delivered" && (
								<Button
									className="w-full text-sm"
									onClick={handleMarkDelivered}
									disabled={updating}>
									<CheckCircle className="w-4 h-4 mr-2" />
									Mark as Delivered
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Update Status Modal */}
				{showUpdateModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
						<Card className="w-full max-w-md mx-2">
							<CardHeader>
								<CardTitle className="text-lg sm:text-xl">
									Update Order Status
								</CardTitle>
								<p className="text-xs sm:text-sm text-gray-600">
									Order #{order.orderNumber}
								</p>
							</CardHeader>
							<CardContent className="space-y-3 sm:space-y-4">
								<div>
									<Label htmlFor="status" className="text-sm">
										Order Status
									</Label>
									<Select
										value={updateData.status}
										onValueChange={(value) =>
											setUpdateData((prev) => ({ ...prev, status: value }))
										}>
										<SelectTrigger className="text-sm">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="confirmed">Confirmed</SelectItem>
											<SelectItem value="processing">Processing</SelectItem>
											<SelectItem value="shipped">Shipped</SelectItem>
											<SelectItem value="delivered">Delivered</SelectItem>
											<SelectItem value="cancelled">Cancelled</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="notes" className="text-sm">
										Notes (Optional)
									</Label>
									<Textarea
										id="notes"
										placeholder="Add any notes about this status update..."
										value={updateData.notes}
										onChange={(e) =>
											setUpdateData((prev) => ({
												...prev,
												notes: e.target.value,
											}))
										}
										className="text-sm"
									/>
								</div>
								<div className="flex flex-col sm:flex-row gap-2">
									<Button
										onClick={handleStatusUpdate}
										className="flex-1 text-sm"
										disabled={updating}>
										{updating ? "Updating..." : "Update Status"}
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowUpdateModal(false);
											setUpdateData({ status: "", notes: "" });
										}}
										disabled={updating}
										className="text-sm">
										Cancel
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Payment Status Modal */}
				{showPaymentModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
						<Card className="w-full max-w-md mx-2">
							<CardHeader>
								<CardTitle className="text-lg sm:text-xl">
									Update Payment Status
								</CardTitle>
								<p className="text-xs sm:text-sm text-gray-600">
									Order #{order.orderNumber}
								</p>
							</CardHeader>
							<CardContent className="space-y-3 sm:space-y-4">
								<div>
									<Label htmlFor="paymentStatus" className="text-sm">
										Payment Status
									</Label>
									<Select
										value={paymentData.paymentStatus}
										onValueChange={(value) =>
											setPaymentData((prev) => ({
												...prev,
												paymentStatus: value,
											}))
										}>
										<SelectTrigger className="text-sm">
											<SelectValue placeholder="Select payment status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="partial">Partial</SelectItem>
											<SelectItem value="completed">Completed</SelectItem>
											<SelectItem value="failed">Failed</SelectItem>
											<SelectItem value="overdue">Overdue</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="transactionId" className="text-sm">
										Transaction ID (Optional)
									</Label>
									<Input
										id="transactionId"
										placeholder="Enter transaction ID"
										value={paymentData.transactionId}
										onChange={(e) =>
											setPaymentData((prev) => ({
												...prev,
												transactionId: e.target.value,
											}))
										}
										className="text-sm"
									/>
								</div>
								<div>
									<Label htmlFor="paymentGateway" className="text-sm">
										Payment Gateway (Optional)
									</Label>
									<Input
										id="paymentGateway"
										placeholder="e.g., Razorpay, PayTM"
										value={paymentData.paymentGateway}
										onChange={(e) =>
											setPaymentData((prev) => ({
												...prev,
												paymentGateway: e.target.value,
											}))
										}
										className="text-sm"
									/>
								</div>
								<div>
									<Label htmlFor="paymentNotes" className="text-sm">
										Notes (Optional)
									</Label>
									<Textarea
										id="paymentNotes"
										placeholder="Add any notes about this payment update..."
										value={paymentData.notes}
										onChange={(e) =>
											setPaymentData((prev) => ({
												...prev,
												notes: e.target.value,
											}))
										}
										className="text-sm"
									/>
								</div>
								<div className="flex flex-col sm:flex-row gap-2">
									<Button
										onClick={handlePaymentStatusUpdate}
										className="flex-1 text-sm"
										disabled={updating}>
										{updating ? "Updating..." : "Update Payment"}
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowPaymentModal(false);
											setPaymentData({
												paymentStatus: "",
												transactionId: "",
												paymentGateway: "",
												notes: "",
											});
										}}
										disabled={updating}
										className="text-sm">
										Cancel
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Advance Payment Modal */}
				{showAdvancePaymentModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
						<Card className="w-full max-w-md mx-2">
							<CardHeader>
								<CardTitle className="text-lg sm:text-xl">
									Record Advance Payment
								</CardTitle>
								<p className="text-xs sm:text-sm text-gray-600">
									Order #{order.orderNumber} | Total: ₹{computedGrandTotal}
								</p>
							</CardHeader>
							<CardContent className="space-y-3 sm:space-y-4">
								<div>
									<Label htmlFor="amount" className="text-sm">
										Payment Amount *
									</Label>
									<Input
										id="amount"
										type="number"
										placeholder="Enter amount"
										value={advancePaymentData.amount}
										onChange={(e) =>
											setAdvancePaymentData((prev) => ({
												...prev,
												amount: e.target.value,
											}))
										}
										className="text-sm"
									/>
								</div>
								<div>
									<Label htmlFor="paymentMethod" className="text-sm">
										Payment Method
									</Label>
									<Select
										value={advancePaymentData.paymentMethod}
										onValueChange={(value) =>
											setAdvancePaymentData((prev) => ({
												...prev,
												paymentMethod: value,
											}))
										}>
										<SelectTrigger className="text-sm">
											<SelectValue placeholder="Select payment method" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="online">Online Payment</SelectItem>
											<SelectItem value="bank_transfer">
												Bank Transfer
											</SelectItem>
											<SelectItem value="cheque">Cheque</SelectItem>
											<SelectItem value="cash">Cash</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="advanceTransactionId" className="text-sm">
										Transaction ID (Optional)
									</Label>
									<Input
										id="advanceTransactionId"
										placeholder="Enter transaction ID"
										value={advancePaymentData.transactionId}
										onChange={(e) =>
											setAdvancePaymentData((prev) => ({
												...prev,
												transactionId: e.target.value,
											}))
										}
										className="text-sm"
									/>
								</div>
								<div>
									<Label htmlFor="advanceNotes" className="text-sm">
										Notes (Optional)
									</Label>
									<Textarea
										id="advanceNotes"
										placeholder="Add any notes about this payment..."
										value={advancePaymentData.notes}
										onChange={(e) =>
											setAdvancePaymentData((prev) => ({
												...prev,
												notes: e.target.value,
											}))
										}
										className="text-sm"
									/>
								</div>
								<div className="flex flex-col sm:flex-row gap-2">
									<Button
										onClick={handleAdvancePayment}
										className="flex-1 text-sm"
										disabled={updating}>
										{updating ? "Recording..." : "Record Payment"}
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowAdvancePaymentModal(false);
											setAdvancePaymentData({
												amount: "",
												paymentMethod: "online",
												transactionId: "",
												notes: "",
											});
										}}
										disabled={updating}
										className="text-sm">
										Cancel
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
>>>>>>> Stashed changes
}
