"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Eye, MapPin, Package, Phone, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AgentOrdersPage() {
	const router = useRouter();
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	// Determine agent type
	const userTypeField = user?.userType || user?.userTypes;
	const isSalesAgent = userTypeField === "sales_executive";
	const isDeliveryAgent = userTypeField === "delivery";

	// Debug logging
	useEffect(() => {
		console.log("=== Agent Orders Page Debug ===");
		console.log("User:", user);
		console.log("User Type Field:", userTypeField);
		console.log("Is Sales Agent:", isSalesAgent);
		console.log("Is Delivery Agent:", isDeliveryAgent);
	}, [user, userTypeField, isSalesAgent, isDeliveryAgent]);

	const handleCallCustomer = (phoneNumber: string) => {
		if (!phoneNumber) {
			alert("Phone number not available");
			return;
		}
		window.location.href = `tel:${phoneNumber}`;
	};

	const handleNavigate = (order: any) => {
		if (!order?.deliveryAddress) {
			alert("Delivery address not available");
			return;
		}

		const addr = order.deliveryAddress;
		let mapsUrl;

		// Check if customer has stored coordinates in shopAddress
		if (
			order.user?.shopAddress?.location?.coordinates &&
			order.user.shopAddress.location.coordinates.length === 2
		) {
			// Use exact coordinates from customer's shop location
			const [lng, lat] = order.user.shopAddress.location.coordinates;
			mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
			console.log("=== Navigation with Coordinates ===");
			console.log("Using stored coordinates:", lat, lng);
		} else {
			// Fallback to address string
			const addressParts = [];
			if (addr.street) addressParts.push(addr.street);
			if (addr.city) addressParts.push(addr.city);
			if (addr.state) addressParts.push(addr.state);
			if (addr.pincode) addressParts.push(addr.pincode);

			const destination = addressParts.join(", ");
			mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
				destination
			)}`;
			console.log("=== Navigation with Address ===");
			console.log("Using address string:", destination);
		}

		console.log("Maps URL:", mapsUrl);
		window.open(mapsUrl, "_blank");
	};

	const handleStartDelivery = async (orderId: any) => {
		try {
			// Update status to out_for_delivery

			if (orderId.orderStatus !== "out_for_delivery") {
				await api.put(`/orders/${orderId._id}/status`, {
					status: "out_for_delivery",
					notes: "Delivery started by agent",
				});
			}
			// Navigate to order detail page
			router.push(`/agent/orders/${orderId._id}`);
		} catch (error: any) {
			console.error("Failed to update order status:", error);
			// Only show alert on error
			alert(
				error.response?.data?.message ||
					"Failed to start delivery. Please try again."
			);
		}
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
				let data = response.data.orders || response.data;

				// Sort orders for delivery agents - priority order
				if (isDeliveryAgent) {
					data = data.sort((a: any, b: any) => {
						const priorityOrder: Record<string, number> = {
							out_for_delivery: 1,
							shipped: 2,
							processing: 3,
							confirmed: 4,
							pending: 5,
							delivered: 6,
							cancelled: 7,
						};

						const aPriority = priorityOrder[a.orderStatus] || 99;
						const bPriority = priorityOrder[b.orderStatus] || 99;

						return aPriority - bPriority;
					});
				}

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

	const emptyMessage = isSalesAgent
		? "No orders yet"
		: "No orders assigned yet";

	return (
		<div className="min-h-screen pb-20">
			<div className=" mx-auto md:px-6 py-4 md:py-6 space-y-4">
				{loading ? (
					<Card>
						<CardContent className="p-8 md:p-12 text-center">
							<p className="text-muted-foreground">Loading orders...</p>
						</CardContent>
					</Card>
				) : orders.length === 0 ? (
					<Card>
						<CardContent className="p-8 md:p-12 text-center">
							<Package className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
							<p className="text-muted-foreground text-lg">{emptyMessage}</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3 md:space-y-4">
						{orders.map((order) => (
							<Card key={order._id} className="overflow-hidden">
								<CardContent className="p-4 md:p-6">
									{/* Mobile-First Layout */}
									<div className="flex items-start justify-between mb-3">
										<div className="flex-1">
											<p className="font-bold text-base md:text-lg mb-1">
												#{order.orderNumber}
											</p>
											<p className="text-sm font-medium text-gray-900">
												{order.user?.firstName ||
													order.user?.name ||
													order.user?.shopName}
											</p>
											<p className="text-xs text-gray-600">
												{order.user?.phone}
											</p>
										</div>
										<div className="text-right">
											<p className="text-lg md:text-xl font-bold text-blue-600">
												₹{(order.grandTotal || order.total)?.toLocaleString()}
											</p>
											<span
												className={`text-xs px-2 py-1 rounded-full capitalize inline-block mt-1 ${getStatusColor(
													order.orderStatus
												)}`}>
												{order.orderStatus.replace(/_/g, " ")}
											</span>
										</div>
									</div>

									{/* Delivery Address - Show for delivery agents */}
									{isDeliveryAgent && order.deliveryAddress && (
										<div className="mb-3 pb-3 border-t pt-3">
											<div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
												<MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-900 mb-1">
														{order.deliveryAddress?.street}
													</p>
													<p className="text-xs text-gray-600">
														{order.deliveryAddress?.city},{" "}
														{order.deliveryAddress?.state} -{" "}
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
													<span className="text-muted-foreground">
														Payment:{" "}
													</span>
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
										{isDeliveryAgent && order.orderStatus !== "delivered" ? (
											<>
												<Button
													size="sm"
													className="flex-1 md:flex-none"
													onClick={() => handleStartDelivery(order)}>
													<Package className="w-4 h-4 mr-2" />
													{order.orderStatus === "out_for_delivery"
														? "Continue Delivery"
														: "Start Delivery"}
												</Button>
												<Link
													href={`/agent/orders/${order._id}`}
													className="flex-1 md:flex-none">
													<Button
														size="sm"
														variant="outline"
														className="w-full md:w-auto">
														<Eye className="w-4 h-4 mr-2" />
														Details
													</Button>
												</Link>
											</>
										) : (
											<Link
												href={`/agent/orders/${order._id}`}
												className="flex-1 md:flex-none">
												<Button
													size="sm"
													variant="outline"
													className="w-full md:w-auto">
													<Eye className="w-4 h-4 mr-2" />
													View Details
												</Button>
											</Link>
										)}
										{isDeliveryAgent && order.orderStatus !== "delivered" && (
											<>
												<Button
													size="sm"
													variant="outline"
													className="flex-1 md:flex-none"
													onClick={() => handleCallCustomer(order.user?.phone)}>
													<Phone className="w-4 h-4 mr-2" />
													<span className="hidden md:inline">Call</span>
													<span className="md:hidden">Call</span>
												</Button>
												{order.user?.alternatePhone && (
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															handleCallCustomer(order.user?.alternatePhone)
														}>
														<Phone className="w-4 h-4" />
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
		</div>
	);
}
