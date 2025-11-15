"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Eye, MapPin, Package, Phone, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AgentOrdersPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	// Determine agent type
	const userTypeField = user?.userType || user?.userTypes;
	const isSalesAgent = userTypeField === "sales_executive";
	const isDeliveryAgent = userTypeField === "delivery";

	const handleCallCustomer = (phoneNumber: string) => {
		if (!phoneNumber) {
			alert("Phone number not available");
			return;
		}
		window.location.href = `tel:${phoneNumber}`;
	};

	useEffect(() => {
		fetchOrders();
	}, [isSalesAgent, isDeliveryAgent]);

	const fetchOrders = async () => {
		try {
			let endpoint = "";
			if (isSalesAgent) {
				endpoint = "/sales/orders"; // Sales executive orders
			} else if (isDeliveryAgent) {
				endpoint = "/orders/delivery/assigned"; // Delivery agent orders
			}

			if (endpoint) {
				const response = await api.get(endpoint);
				const data = response.data.orders || response.data;
				setOrders(data);
			}
		} catch (error) {
			console.error("Failed to fetch orders:", error);
		} finally {
			setLoading(false);
		}
	};

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

	const pageTitle = isSalesAgent ? "My Orders" : "Assigned Orders";
	const emptyMessage = isSalesAgent
		? "No orders yet"
		: "No orders assigned yet";

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold">{pageTitle}</h2>
				{isSalesAgent && (
					<div className="flex gap-2">
						<Button variant="outline" size="sm">
							<Package className="w-4 h-4 mr-2" />
							All Orders
						</Button>
					</div>
				)}
			</div>

			{loading ? (
				<Card>
					<CardContent className="p-12 text-center">
						<p className="text-muted-foreground">Loading orders...</p>
					</CardContent>
				</Card>
			) : orders.length === 0 ? (
				<Card>
					<CardContent className="p-12 text-center">
						<p className="text-muted-foreground">{emptyMessage}</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{orders.map((order) => (
						<Card key={order._id}>
							<CardContent className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
									<div>
										<p className="text-sm text-muted-foreground">
											Order Number
										</p>
										<p className="font-semibold">{order.orderNumber}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Customer</p>
										<p className="font-semibold">
											{order.user?.firstName ||
												order.user?.name ||
												order.user?.shopName}
										</p>
										<p className="text-xs text-muted-foreground">
											{order.user?.phone}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total</p>
										<p className="font-semibold text-primary">
											₹{order.grandTotal || order.total}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Status</p>
										<span
											className={`text-xs px-2 py-1 rounded capitalize inline-block ${getStatusColor(
												order.orderStatus
											)}`}>
											{order.orderStatus}
										</span>
									</div>
								</div>

								{/* Delivery Address - Show for delivery agents */}
								{isDeliveryAgent && order.deliveryAddress && (
									<div className="mb-4 pb-4 border-t border-border pt-4">
										<div className="flex items-start gap-2">
											<MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
											<div>
												<p className="text-sm font-semibold">
													{order.deliveryAddress?.street}
												</p>
												<p className="text-sm text-muted-foreground">
													{order.deliveryAddress?.city},{" "}
													{order.deliveryAddress?.state}{" "}
													{order.deliveryAddress?.pincode}
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Sales Info - Show for sales agents */}
								{isSalesAgent && (
									<div className="mb-4 pb-4 border-t border-border pt-4">
										<div className="flex items-center gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">Items: </span>
												<span className="font-semibold">
													{order.items?.length || 0}
												</span>
											</div>
											<div>
												<span className="text-muted-foreground">Payment: </span>
												<span className="font-semibold capitalize">
													{order.paymentMethod}
												</span>
											</div>
											<div>
												<span className="text-muted-foreground">
													Payment Status:{" "}
												</span>
												<span
													className={`font-semibold capitalize ${
														order.paymentStatus === "completed"
															? "text-green-600"
															: "text-yellow-600"
													}`}>
													{order.paymentStatus}
												</span>
											</div>
										</div>
									</div>
								)}

								{/* Actions */}
								<div className="flex gap-2 flex-wrap">
									<Link
										href={
											isSalesAgent
												? `/agent/orders/${order._id}`
												: `/agent/orders/${order._id}`
										}>
										<Button size="sm" variant="outline">
											<Eye className="w-4 h-4 mr-2" />
											View Details
										</Button>
									</Link>
									{isDeliveryAgent && (
										<>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleCallCustomer(order.user?.phone)}>
												<Phone className="w-4 h-4 mr-2" />
												Call Customer
											</Button>
											{order.user?.alternatePhone && (
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleCallCustomer(order.user?.alternatePhone)
													}>
													<Phone className="w-4 h-4 mr-2" />
													Call Alternate
												</Button>
											)}
										</>
									)}
									{isSalesAgent && (
										<Button size="sm" variant="outline">
											<TrendingUp className="w-4 h-4 mr-2" />
											Track
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
