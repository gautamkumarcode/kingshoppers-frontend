"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { CheckCircle, Clock, Package, TrendingUp, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AgentDashboard() {
	const { user } = useAuth();
	const [stats, setStats] = useState({
		todayDeliveries: 0,
		pendingDeliveries: 0,
		completedToday: 0,
		totalEarnings: 0,
		cashCollectedToday: 0,
	});
	const [recentOrders, setRecentOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const ordersResponse = await api.get("/orders/delivery/assigned");
			const orders = ordersResponse.data.orders || ordersResponse.data;

			// Calculate stats
			const today = new Date().toDateString();
			const todayOrders = orders.filter(
				(o: any) => new Date(o.createdAt).toDateString() === today
			);
			const pending = orders.filter(
				(o: any) =>
					o.orderStatus !== "delivered" && o.orderStatus !== "cancelled"
			);
			const completedToday = todayOrders.filter(
				(o: any) => o.orderStatus === "delivered"
			);
			const allCompleted = orders.filter(
				(o: any) => o.orderStatus === "delivered"
			);

			// Calculate cash collected today (COD orders where cash was actually collected today)
			const cashCollectedToday = orders
				.filter((o: any) => {
					if (!o.cashCollectedAt) return false;
					const collectedDate = new Date(o.cashCollectedAt).toDateString();
					return collectedDate === today && o.paymentMethod === "cod";
				})
				.reduce(
					(sum: number, o: any) => sum + (o.grandTotal || o.total || 0),
					0
				);

			setStats({
				todayDeliveries: todayOrders.length,
				pendingDeliveries: pending.length,
				completedToday: allCompleted.length,
				totalEarnings: allCompleted.reduce(
					(sum: number, o: any) => sum + (o.grandTotal || o.total || 0),
					0
				),
				cashCollectedToday,
			});

			setRecentOrders(orders.slice(0, 5));
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "delivered":
				return "text-green-600 bg-green-50";
			case "out_for_delivery":
				return "text-blue-600 bg-blue-50";
			case "shipped":
				return "text-purple-600 bg-purple-50";
			case "cancelled":
				return "text-red-600 bg-red-50";
			default:
				return "text-gray-600 bg-gray-50";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg -mx-4 sm:mx-0 sm:rounded-lg">
				<h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
					Welcome back,{" "}
					{user?.firstName || user?.ownerName || user?.shopName || "Agent"}! 👋
				</h1>
				<p className="text-blue-100 text-sm md:text-base">
					Here's your delivery overview for today
				</p>
			</div>

			<div className="space-y-6">
				{/* Stats Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
					<Card>
						<CardContent className="p-4">
							<Package className="w-8 h-8 text-blue-600 mb-3" />
							<p className="text-2xl font-bold text-gray-900">
								{stats.todayDeliveries}
							</p>
							<p className="text-sm text-gray-600">Today's Orders</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<Clock className="w-8 h-8 text-orange-600 mb-3" />
							<p className="text-2xl font-bold text-gray-900">
								{stats.pendingDeliveries}
							</p>
							<p className="text-sm text-gray-600">Pending</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<CheckCircle className="w-8 h-8 text-green-600 mb-3" />
							<p className="text-2xl font-bold text-gray-900">
								{stats.completedToday}
							</p>
							<p className="text-sm text-gray-600">Completed</p>
						</CardContent>
					</Card>

					<Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
						<CardContent className="p-4">
							<div className="flex items-center gap-2 mb-3">
								<div className="bg-green-600 p-1.5 rounded-lg">
									<svg
										className="w-5 h-5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								</div>
							</div>
							<p className="text-xl font-bold text-green-900">
								₹{stats.cashCollectedToday.toLocaleString()}
							</p>
							<p className="text-sm text-green-700 font-medium">
								Cash Collected Today
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
							<p className="text-xl font-bold text-gray-900">
								₹{stats.totalEarnings.toLocaleString()}
							</p>
							<p className="text-sm text-gray-600">Total Value</p>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-3">
							<Link href="/agent/orders" className="block">
								<Button className="w-full h-auto py-4 flex flex-col gap-2">
									<Package className="w-6 h-6" />
									<span className="text-sm">My Orders</span>
								</Button>
							</Link>
							<Link href="/agent/orders" className="block">
								<Button
									variant="outline"
									className="w-full h-auto py-4 flex flex-col gap-2">
									<Truck className="w-6 h-6" />
									<span className="text-sm">Start Delivery</span>
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* Recent Orders */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Recent Orders</CardTitle>
							<Link href="/agent/orders">
								<Button variant="ghost" size="sm">
									View All
								</Button>
							</Link>
						</div>
					</CardHeader>
					<CardContent>
						{loading ? (
							<p className="text-center py-8 text-gray-500">Loading...</p>
						) : recentOrders.length === 0 ? (
							<div className="text-center py-8">
								<Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
								<p className="text-gray-600">No orders assigned yet</p>
							</div>
						) : (
							<div className="space-y-3">
								{recentOrders.map((order) => (
									<Link
										key={order._id}
										href={`/agent/orders/${order._id}`}
										className="block">
										<div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-sm truncate">
														Order #{order.orderNumber}
													</p>
													<p className="text-xs text-gray-600 truncate">
														{order.user?.name || order.user?.shopName}
													</p>
												</div>
												<span
													className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${getStatusColor(
														order.orderStatus
													)}`}>
													{order.orderStatus.replace(/_/g, " ")}
												</span>
											</div>
											<div className="flex items-center justify-between text-sm text-gray-600">
												<span className="font-medium">
													₹{order.grandTotal?.toLocaleString()}
												</span>
												<span className="text-xs">
													{new Date(order.createdAt).toLocaleDateString()}
												</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
