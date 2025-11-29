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
	deliveryPersonnel?: {
		_id: string;
		firstName: string;
		lastName: string;
		phone: string;
		deliveryArea?: string;
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
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [deliveryAgents, setDeliveryAgents] = useState<any[]>([]);
	const [selectedAgent, setSelectedAgent] = useState("");
	const [updateData, setUpdateData] = useState({
		status: "",
		notes: "",
	});

	useEffect(() => {
		fetchOrders();
		fetchStats();
		fetchDeliveryAgents();
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

	const fetchDeliveryAgents = async () => {
		try {
			const response = await api.get("/admin/delivery-agents");
			setDeliveryAgents(response.data.data || []);
		} catch (error) {
			console.error("Failed to fetch delivery agents:", error);
		}
	};

	const handleAssignDeliveryAgent = async () => {
		if (!selectedOrder || !selectedAgent) return;

		try {
			await api.put(`/admin/orders/${selectedOrder._id}/assign-delivery`, {
				deliveryAgentId: selectedAgent,
			});

			// Refresh orders
			fetchOrders();
			setShowAssignModal(false);
			setSelectedOrder(null);
			setSelectedAgent("");
		} catch (error) {
			console.error("Failed to assign delivery agent:", error);
		}
	};

	const handleStatusUpdate = async () => {
		if (!selectedOrder) return;

		try {
			await api.put(`/admin/orders/${selectedOrder._id}/status`, {
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
		<div className="min-h-screen bg-gray-50">
			<div className="mx-auto space-y-4">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
							Order Management
						</h1>
						<p className="text-sm sm:text-base text-gray-600">
							Manage and track all customer orders
						</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" className="sm:size-default">
							<Download className="w-4 h-4 mr-2" />
							<span className="hidden sm:inline">Export Orders</span>
							<span className="sm:hidden">Export</span>
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardContent className="">
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
								<Filter className="w-4 h-4 text-gray-500 shrink-0" />
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full sm:w-48">
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
				<Card className="p-2">
					<CardHeader>
						<CardTitle>Orders ({filteredOrders.length})</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{filteredOrders.length > 0 ? (
							<div className="space-y-4">
								{filteredOrders.map((order) => (
									<div
										key={order._id}
										className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
										{/* Order Header with colored accent */}
										<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													<div className="bg-white p-2 rounded-lg shadow-sm">
														<Package className="w-5 h-5 text-blue-600" />
													</div>
													<div>
														<h3 className="font-bold text-lg text-gray-900">
															#{order.orderNumber}
														</h3>
														<p className="text-xs text-gray-600 flex items-center gap-1">
															<Clock className="w-3 h-3" />
															{new Date(
																order.createdAt
															).toLocaleDateString()} •{" "}
															{new Date(order.createdAt).toLocaleTimeString()}
														</p>
													</div>
												</div>
												<Badge
													className={`${getStatusColor(
														order.orderStatus
													)} flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold`}>
													{getStatusIcon(order.orderStatus)}
													<span className="capitalize">
														{order.orderStatus.replace(/_/g, " ")}
													</span>
												</Badge>
											</div>
										</div>

										{/* Order Content */}
										<div className="p-4 space-y-4">
											{/* Customer & Delivery Info Grid */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{/* Customer Info */}
												{order.user && (
													<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
														<div className="flex items-start gap-3">
															<div className="bg-blue-100 p-2 rounded-lg">
																<User className="w-4 h-4 text-blue-600" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
																	Customer
																</p>
																<p className="font-semibold text-gray-900 truncate">
																	{order.user.shopName}
																</p>
																<p className="text-sm text-gray-600">
																	{order.user.ownerName}
																</p>
																<div className="flex items-center gap-1 mt-1">
																	<Phone className="w-3 h-3 text-gray-400" />
																	<p className="text-sm text-gray-600">
																		{order.user.phone}
																	</p>
																</div>
															</div>
														</div>
													</div>
												)}

												{/* Delivery Info */}
												<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
													<div className="flex items-start gap-3">
														<div className="bg-green-100 p-2 rounded-lg">
															<MapPin className="w-4 h-4 text-green-600" />
														</div>
														<div className="flex-1 min-w-0">
															<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
																Delivery Address
															</p>
															<p className="text-sm text-gray-900 line-clamp-2">
																{order.deliveryAddress.street}
															</p>
															<p className="text-sm text-gray-600">
																{order.deliveryAddress.city},{" "}
																{order.deliveryAddress.state}{" "}
																{order.deliveryAddress.pincode}
															</p>
														</div>
													</div>
												</div>
											</div>

											{/* Delivery Agent (if assigned) */}
											{order.deliveryPersonnel && (
												<div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
													<div className="flex items-center gap-3">
														<div className="bg-amber-100 p-2 rounded-lg">
															<Truck className="w-4 h-4 text-amber-600" />
														</div>
														<div className="flex-1">
															<p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-0.5">
																Delivery Agent
															</p>
															<p className="font-semibold text-gray-900">
																{order.deliveryPersonnel.firstName}{" "}
																{order.deliveryPersonnel.lastName}
															</p>
															<p className="text-sm text-gray-600">
																{order.deliveryPersonnel.phone}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Order Items Summary */}
											<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
												<div className="flex items-center justify-between mb-2">
													<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
														Order Items ({order.items.length})
													</p>
													<p className="text-lg font-bold text-gray-900">
														₹{order.total?.toLocaleString()}
													</p>
												</div>
												<div className="space-y-1.5">
													{order.items.slice(0, 2).map((item, index) => (
														<div
															key={index}
															className="flex items-center justify-between text-sm bg-white rounded px-2 py-1.5">
															<span className="text-gray-700 flex-1 truncate">
																{item.product.name} - {item.variantName}
															</span>
															<span className="text-gray-600 text-xs ml-2 shrink-0">
																{item.quantity} × ₹{item.unitPrice}
															</span>
														</div>
													))}
													{order.items.length > 2 && (
														<p className="text-xs text-gray-500 pl-2 pt-1">
															+{order.items.length - 2} more items
														</p>
													)}
												</div>
											</div>

											{/* Payment Info */}
											<div className="flex flex-wrap gap-2">
												<div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
													<DollarSign className="w-4 h-4 text-gray-400" />
													<div>
														<p className="text-xs text-gray-500">Payment</p>
														<p className="text-sm font-semibold text-gray-900 capitalize">
															{order.paymentMethod}
														</p>
													</div>
												</div>
												<div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
													<CheckCircle className="w-4 h-4 text-gray-400" />
													<div>
														<p className="text-xs text-gray-500">Status</p>
														<p className="text-sm font-semibold text-gray-900 capitalize">
															{order.paymentStatus || "Pending"}
														</p>
													</div>
												</div>
											</div>
										</div>

										{/* Action Buttons Footer */}
										<div className="bg-gray-50 border-t border-gray-200 p-3 flex flex-wrap gap-2">
											<Button
												variant="outline"
												size="sm"
												className="flex-1 sm:flex-none bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
												onClick={() => {
													setSelectedOrder(order);
													setShowAssignModal(true);
												}}>
												<Truck className="w-4 h-4 mr-2" />
												Assign Delivery
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1 sm:flex-none bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
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
											<Link
												href={`/admin/orders/${order._id}`}
												className="flex-1 sm:flex-none">
												<Button
													variant="default"
													size="sm"
													className="w-full bg-blue-600 hover:bg-blue-700">
													<Eye className="w-4 h-4 mr-2" />
													View Details
												</Button>
											</Link>
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

				{/* Assign Delivery Agent Modal */}
				{showAssignModal && selectedOrder && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="w-full max-w-md">
							<CardHeader>
								<CardTitle>Assign Delivery Agent</CardTitle>
								<p className="text-sm text-gray-600">
									Order #{selectedOrder.orderNumber}
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="agent">Select Delivery Agent</Label>
									<Select
										value={selectedAgent}
										onValueChange={setSelectedAgent}>
										<SelectTrigger>
											<SelectValue placeholder="Choose a delivery agent" />
										</SelectTrigger>
										<SelectContent>
											{deliveryAgents.map((agent) => (
												<SelectItem key={agent._id} value={agent._id}>
													{agent.firstName} {agent.lastName} -{" "}
													{agent.deliveryArea || "No area"}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={handleAssignDeliveryAgent}
										className="flex-1"
										disabled={!selectedAgent}>
										<Truck className="w-4 h-4 mr-2" />
										Assign Agent
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowAssignModal(false);
											setSelectedOrder(null);
											setSelectedAgent("");
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
