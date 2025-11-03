"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Package,
	ShoppingCart,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalProducts: 0,
		totalOrders: 0,
		totalRevenue: 0,
	});
	const [orderStats, setOrderStats] = useState({
		totalOrders: 0,
		pendingOrders: 0,
		completedOrders: 0,
		totalRevenue: 0,
		recentOrders: [],
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const response = await api.get("/admin/dashboard");
			setStats(response.data.data);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchOrderStats = async () => {
		try {
			const response = await api.get("/admin/orders/stats");
			setOrderStats(response.data);
		} catch (error) {
			console.error("Failed to fetch order stats:", error);
		}
	};

	const statCards = [
		{
			title: "Total Users",
			value: stats.totalUsers,
			icon: Users,
			color: "bg-blue-500/10 text-blue-600",
			link: "/admin/users",
		},
		{
			title: "Total Products",
			value: stats.totalProducts,
			icon: Package,
			color: "bg-green-500/10 text-green-600",
			link: "/admin/products",
		},
		{
			title: "Total Orders",
			value: orderStats.totalOrders,
			icon: ShoppingCart,
			color: "bg-purple-500/10 text-purple-600",
			link: "/admin/orders",
		},
		{
			title: "Total Revenue",
			value: `₹${orderStats.totalRevenue.toLocaleString()}`,
			icon: TrendingUp,
			color: "bg-orange-500/10 text-orange-600",
			link: "/admin/orders",
		},
	];

	const orderStatCards = [
		{
			title: "Pending Orders",
			value: orderStats.pendingOrders,
			icon: Clock,
			color: "bg-yellow-500/10 text-yellow-600",
			link: "/admin/orders?status=pending",
		},
		{
			title: "Completed Orders",
			value: orderStats.completedOrders,
			icon: CheckCircle,
			color: "bg-green-500/10 text-green-600",
			link: "/admin/orders?status=delivered",
		},
	];

	return (
		<div className="space-y-6 w-full">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<div className="flex gap-2">
					<Link href="/admin/orders">
						<Button>Manage Orders</Button>
					</Link>
				</div>
			</div>

			{/* Main Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat, index) => (
					<Link key={index} href={stat.link}>
						<Card className="hover:shadow-md transition-shadow cursor-pointer">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">
											{stat.title}
										</p>
										<p className="text-3xl font-bold mt-2">{stat.value}</p>
									</div>
									<div className={`p-3 rounded-lg ${stat.color}`}>
										<stat.icon className="w-6 h-6" />
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			{/* Order Management Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Order Stats */}
				<div className="lg:col-span-1 space-y-4">
					<h2 className="text-xl font-semibold">Order Management</h2>
					{orderStatCards.map((stat, index) => (
						<Link key={index} href={stat.link}>
							<Card className="hover:shadow-md transition-shadow cursor-pointer">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">
												{stat.title}
											</p>
											<p className="text-2xl font-bold mt-1">{stat.value}</p>
										</div>
										<div className={`p-2 rounded-lg ${stat.color}`}>
											<stat.icon className="w-5 h-5" />
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>

				{/* Recent Orders */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Recent Orders</CardTitle>
							<Link href="/admin/orders">
								<Button variant="outline" size="sm">
									View All
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							{orderStats.recentOrders && orderStats.recentOrders.length > 0 ? (
								<div className="space-y-3">
									{orderStats.recentOrders
										.slice(0, 5)
										.map((order: any, index: number) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 border rounded-lg">
												<div>
													<p className="font-medium">
														Order #{order.orderNumber}
													</p>
													<p className="text-sm text-gray-600">
														{order.user?.shopName} • {order.items?.length} items
													</p>
												</div>
												<div className="text-right">
													<p className="font-semibold">₹{order.grandTotal}</p>
													<p className="text-xs text-gray-500 capitalize">
														{order.orderStatus}
													</p>
												</div>
											</div>
										))}
								</div>
							) : (
								<div className="text-center py-8">
									<ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
									<p className="text-gray-600">No recent orders</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Link href="/admin/orders">
							<Button variant="outline" className="w-full justify-start">
								<ShoppingCart className="w-4 h-4 mr-2" />
								Manage Orders
							</Button>
						</Link>
						<Link href="/admin/products">
							<Button variant="outline" className="w-full justify-start">
								<Package className="w-4 h-4 mr-2" />
								Manage Products
							</Button>
						</Link>
						<Link href="/admin/users">
							<Button variant="outline" className="w-full justify-start">
								<Users className="w-4 h-4 mr-2" />
								Manage Users
							</Button>
						</Link>
						<Link href="/admin/orders?status=pending">
							<Button variant="outline" className="w-full justify-start">
								<AlertCircle className="w-4 h-4 mr-2" />
								Pending Orders
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
