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
	CheckCircle,
	Clock,
	DollarSign,
	Download,
	Edit,
	Eye,
	Filter,
	MapPin,
	Package,
	Phone,
	Search,
	Truck,
	User,
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
	user: {
		_id: string;
		shopName: string;
		ownerName: string;
		phone: string;
	};
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
		area: string;
		city: string;
		state: string;
		pincode: string;
		landmark: string;
	};
	total: number;
	createdAt: string;
	expectedDeliveryDate?: string;
	statusHistory: Array<{
		status: string;
		timestamp: string;
		notes: string;
	}>;
}

interface OrderStats {
	totalOrders: number;
	pendingOrders: number;
	completedOrders: number;
	totalRevenue: number;
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [stats, setStats] = useState<OrderStats>({
		totalOrders: 0,
		pendingOrders: 0,
		completedOrders: 0,
		totalRevenue: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [updateData, setUpdateData] = useState({
		status: "",
		notes: "",
	});

	useEffect(() => {
		fetchOrders();
		fetchStats();
	}, []);

	const fetchOrders = async () => {
		try {
			const response = await api.get("/admin/orders");
			setOrders(response.data);
		} catch (error) {
			console.error("Failed to fetch orders:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async () => {
		try {
			const response = await api.get("/admin/orders/stats");
			setStats(response.data);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		}
	};

	const handleStatusUpdate = async () => {
		if (!selectedOrder) return;

		try {
			await api.put(`/orders/${selectedOrder._id}/status`, {
				status: updateData.status,
				notes: updateData.notes,
			});

			// Refresh orders
			fetchOrders();
			fetchStats();
			setShowUpdateModal(false);
			setSelectedOrder(null);
			setUpdateData({ status: "", notes: "" });
		} catch (error) {
			console.error("Failed to update order status:", error);
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

	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.user.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.user.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.items.some((item) =>
				item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
			);

		const matchesStatus =
			statusFilter === "all" || order.orderStatus === statusFilter;

		return matchesSearch && matchesStatus;
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
							<p>Loading orders...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 ">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Order Management
						</h1>
						<p className="text-gray-600">
							Manage and track all customer orders
						</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline">
							<Download className="w-4 h-4 mr-2" />
							Export Orders
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Total Orders
									</p>
									<p className="text-2xl font-bold">{stats.totalOrders}</p>
								</div>
								<Package className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Pending Orders
									</p>
									<p className="text-2xl font-bold">{stats.pendingOrders}</p>
								</div>
								<Clock className="w-8 h-8 text-yellow-600" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">Completed</p>
									<p className="text-2xl font-bold">{stats.completedOrders}</p>
								</div>
								<CheckCircle className="w-8 h-8 text-green-600" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Total Revenue
									</p>
									<p className="text-2xl font-bold">
										₹{stats.totalRevenue.toLocaleString()}
									</p>
								</div>
								<DollarSign className="w-8 h-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Search and Filter */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search by order number, customer name, or product..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
							<div className="flex items-center gap-2">
								<Filter className="w-4 h-4 text-gray-500" />
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Orders</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="confirmed">Confirmed</SelectItem>
										<SelectItem value="processing">Processing</SelectItem>
										<SelectItem value="shipped">Shipped</SelectItem>
										<SelectItem value="delivered">Delivered</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Orders Table */}
				<Card>
					<CardHeader>
						<CardTitle>Orders ({filteredOrders.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{filteredOrders.length > 0 ? (
							<div className="space-y-4">
								{filteredOrders.map((order) => (
									<div
										key={order._id}
										className="border rounded-lg p-4 hover:shadow-md transition-shadow">
										{/* Order Header */}
										<div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
											<div className="flex items-center gap-4 mb-2 lg:mb-0">
												<div>
													<h3 className="font-semibold text-lg">
														Order #{order.orderNumber}
													</h3>
													<p className="text-sm text-gray-600">
														{new Date(order.createdAt).toLocaleDateString()} •{" "}
														{new Date(order.createdAt).toLocaleTimeString()}
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
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedOrder(order);
														setUpdateData({
															status: order.orderStatus,
															notes: "",
														});
														setShowUpdateModal(true);
													}}>
													<Edit className="w-4 h-4 mr-2" />
													Update Status
												</Button>
												<Link href={`/admin/orders/${order._id}`}>
													<Button variant="outline" size="sm">
														<Eye className="w-4 h-4 mr-2" />
														View Details
													</Button>
												</Link>
											</div>
										</div>

										<Separator className="mb-4" />

										{/* Customer Info */}
										{order.user && (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
												<h4 className="font-medium text-sm text-gray-600 mb-1">
													Customer
												</h4>
												<div className="flex items-center gap-2">
													<User className="w-4 h-4 text-gray-400" />
													<div>
														<p className="font-medium">
															{order.user?.shopName}
														</p>
														<p className="text-sm text-gray-600">
															{order.user?.ownerName}
														</p>
													</div>
												</div>
												<div>
													<h4 className="font-medium text-sm text-gray-600 mb-1">
														Contact
													</h4>
													<div className="flex items-center gap-2">
														<Phone className="w-4 h-4 text-gray-400" />
														<p className="text-sm">{order.user.phone}</p>
													</div>
												</div>
											</div>
										)}

										<div>
											<h4 className="font-medium text-sm text-gray-600 mb-1">
												Delivery Address
											</h4>
											<div className="flex items-start gap-2">
												<MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
												<div className="text-sm">
													<p>{order.deliveryAddress.street}</p>
													<p className="text-gray-600">
														{order.deliveryAddress.city},{" "}
														{order.deliveryAddress.state}{" "}
														{order.deliveryAddress.pincode}
													</p>
												</div>
											</div>
										</div>

										<Separator className="mb-4" />

										{/* Order Items */}
										<div className="mb-4">
											<h4 className="font-medium text-sm text-gray-600 mb-2">
												Items ({order.items.length})
											</h4>
											<div className="space-y-2">
												{order.items.slice(0, 2).map((item, index) => (
													<div
														key={index}
														className="flex items-center justify-between text-sm">
														<div className="flex items-center gap-2">
															<Package className="w-4 h-4 text-gray-400" />
															<span>
																{item.product.name} - {item.variantName}
															</span>
														</div>
														<div className="text-right">
															<span>
																Qty: {item.quantity} × ₹{item.unitPrice} = ₹
																{item.total}
															</span>
															<div className="text-right flex gap-2 justify-center items-center">
																<p className="text-sm text-gray-600">
																	Total Amount
																</p>
																<p className="text-lg font-bold text-primary">
																	₹{item.total}
																</p>
															</div>
														</div>
													</div>
												))}
												{order.items.length > 2 && (
													<p className="text-sm text-gray-600 pl-6">
														+{order.items.length - 2} more items
													</p>
												)}
											</div>
										</div>

										{/* Order Footer */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
											<div className="flex items-center gap-4 mb-2 sm:mb-0">
												<div className="text-sm text-gray-600">
													Payment:{" "}
													<span className="capitalize font-medium">
														{order.paymentMethod}
													</span>
												</div>
												<div className="text-sm text-gray-600">
													Status:{" "}
													<span className="capitalize font-medium">
														{order.paymentStatus || "Pending"}
													</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No orders found
								</h3>
								<p className="text-gray-600">
									{searchTerm || statusFilter !== "all"
										? "Try adjusting your search or filter criteria"
										: "No orders have been placed yet"}
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Update Status Modal */}
				{showUpdateModal && selectedOrder && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="w-full max-w-md">
							<CardHeader>
								<CardTitle>Update Order Status</CardTitle>
								<p className="text-sm text-gray-600">
									Order #{selectedOrder.orderNumber}
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="status">Order Status</Label>
									<Select
										value={updateData.status}
										onValueChange={(value) =>
											setUpdateData((prev) => ({ ...prev, status: value }))
										}>
										<SelectTrigger>
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
									<Label htmlFor="notes">Notes (Optional)</Label>
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
									/>
								</div>
								<div className="flex gap-2">
									<Button onClick={handleStatusUpdate} className="flex-1">
										Update Status
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowUpdateModal(false);
											setSelectedOrder(null);
											setUpdateData({ status: "", notes: "" });
										}}>
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
}
