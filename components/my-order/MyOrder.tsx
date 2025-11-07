"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	Filter,
	Package,
	Search,
	ShoppingBag,
	Truck,
	X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Order {
	_id: string;
	orderNumber: string;
	orderStatus: string;
	paymentMethod: string;
	paymentStatus: string;
	items: Array<{
		product: {
			name: string;
			_id: string;
		};
		variantName: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}>;
	deliveryAddress: {
		street: string;
		city: string;
		state: string;
		pincode: string;
	};
	grandTotal?: number;
	totalAmount?: number;
	subtotal?: number;
	totalTax?: number;
	createdAt: string;
	expectedDeliveryDate?: string;
}

export default function OrdersPage() {
	const { user } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		if (user?.isApproved) {
			fetchOrders();
		}
	}, [user]);

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

	const calculateOrderTotal = (order: Order) => {
		// Try different possible field names for total
		if (order.grandTotal) return order.grandTotal;
		if (order.totalAmount) return order.totalAmount;

		// Calculate from items if no total field exists
		const itemsTotal = order.items.reduce((sum, item) => {
			return sum + (item.total || item.unitPrice * item.quantity || 0);
		}, 0);

		// Add tax if available
		const total = itemsTotal + (order.totalTax || 0);

		return total || 0;
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

	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.items.some((item) =>
				item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
			);

		const matchesStatus =
			statusFilter === "all" || order.orderStatus === statusFilter;

		return matchesSearch && matchesStatus;
	});

	if (loading) {
		return (
			<AuthGuard>
				<div className="min-h-screen bg-gray-50 p-4">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
								<p>Loading your orders...</p>
							</div>
						</div>
					</div>
				</div>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-6xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
							<p className="text-gray-600">Track and manage your orders</p>
						</div>
						<Link href="/products">
							<Button>
								<ShoppingBag className="w-4 h-4 mr-2" />
								Browse Products
							</Button>
						</Link>
					</div>

					{/* Orders Content */}
					{user?.isApproved ? (
						<>
							{/* Search and Filter */}
							<Card>
								<CardContent className="pt-6">
									<div className="flex flex-col sm:flex-row gap-4">
										<div className="flex-1 relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
											<Input
												placeholder="Search by order number or product name..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="pl-10"
											/>
										</div>
										<div className="flex items-center gap-2">
											<Filter className="w-4 h-4 text-gray-500" />
											<select
												value={statusFilter}
												onChange={(e) => setStatusFilter(e.target.value)}
												className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
												<option value="all">All Orders</option>
												<option value="pending">Pending</option>
												<option value="confirmed">Confirmed</option>
												<option value="processing">Processing</option>
												<option value="shipped">Shipped</option>
												<option value="delivered">Delivered</option>
												<option value="cancelled">Cancelled</option>
											</select>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Orders List */}
							{filteredOrders.length > 0 ? (
								<div className="space-y-4">
									{filteredOrders.map((order) => (
										<Card
											key={order._id}
											className="hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												{/* Order Header */}
												<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
													<div className="flex items-center gap-4 mb-2 sm:mb-0">
														<div>
															<h3 className="font-semibold text-lg">
																Order #{order.orderNumber}
															</h3>
															<p className="text-sm text-gray-600">
																Placed on{" "}
																{new Date(order.createdAt).toLocaleDateString()}
															</p>
														</div>
														<Badge
															className={`${getStatusColor(
																order.orderStatus
															)} flex items-center gap-1`}>
															{getStatusIcon(order.orderStatus)}
															<span className="capitalize">
																{order.orderStatus}
															</span>
														</Badge>
													</div>
													<div className="flex items-center gap-2">
														<Link href={`/order-confirmation/${order._id}`}>
															<Button variant="outline" size="sm">
																<Eye className="w-4 h-4 mr-2" />
																View Details
															</Button>
														</Link>
													</div>
												</div>

												<Separator className="mb-4" />

												{/* Order Items */}
												<div className="space-y-3 mb-4">
													{order.items.slice(0, 2).map((item, index) => (
														<div
															key={index}
															className="flex items-center gap-4">
															<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
																<Package className="w-6 h-6 text-gray-400" />
															</div>
															<div className="flex-1">
																<h4 className="font-medium">
																	{item.product.name}
																</h4>
																<p className="text-sm text-gray-600">
																	{item.variantName} • Qty: {item.quantity}
																</p>
															</div>
															<div className="text-right">
																<p className="font-semibold">₹{item.total}</p>
															</div>
														</div>
													))}
													{order.items.length > 2 && (
														<p className="text-sm text-gray-600 pl-16">
															+{order.items.length - 2} more items
														</p>
													)}
												</div>

												<Separator className="mb-4" />

												{/* Order Footer */}
												<div className="flex flex-col sm:flex-row sm:items-center justify-between">
													<div className="flex items-center gap-4 mb-2 sm:mb-0">
														<div className="flex items-center gap-1 text-sm text-gray-600">
															<Truck className="w-4 h-4" />
															<span>
																Delivery to {order.deliveryAddress.city},{" "}
																{order.deliveryAddress.state}
															</span>
														</div>
														<div className="flex items-center gap-1 text-sm text-gray-600">
															<Calendar className="w-4 h-4" />
															<span>
																{order.expectedDeliveryDate
																	? `Expected: ${new Date(
																			order.expectedDeliveryDate
																	  ).toLocaleDateString()}`
																	: "3-5 business days"}
															</span>
														</div>
													</div>
													<div className="text-right">
														<p className="text-sm text-gray-600">
															Total Amount
														</p>
														<p className="text-xl font-bold text-primary">
															₹{calculateOrderTotal(order).toFixed(2)}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="pt-6">
										<div className="text-center py-8">
											<Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
											<h3 className="text-lg font-medium text-gray-900 mb-2">
												{searchTerm || statusFilter !== "all"
													? "No orders found"
													: "No orders yet"}
											</h3>
											<p className="text-gray-600 mb-4">
												{searchTerm || statusFilter !== "all"
													? "Try adjusting your search or filter criteria"
													: "Start shopping to see your orders here"}
											</p>
											{!searchTerm && statusFilter === "all" && (
												<Link href="/products">
													<Button>Start Shopping</Button>
												</Link>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</>
					) : (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<Package className="w-8 h-8 text-yellow-600" />
									</div>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Account Pending Approval
									</h3>
									<p className="text-gray-600 mb-4">
										Your account is under review. You'll be able to place orders
										once approved.
									</p>
									<Badge
										variant="secondary"
										className="bg-yellow-100 text-yellow-800">
										Pending Approval
									</Badge>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</AuthGuard>
	);
}
