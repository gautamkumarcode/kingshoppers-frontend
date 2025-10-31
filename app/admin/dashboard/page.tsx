"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalProducts: 0,
		totalOrders: 0,
		totalRevenue: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const response = await api.get("/admin/dashboard");
			setStats(response.data);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		} finally {
			setLoading(false);
		}
	};

	const statCards = [
		{
			title: "Total Users",
			value: stats.totalUsers,
			icon: Users,
			color: "bg-blue-500/10 text-blue-600",
		},
		{
			title: "Total Products",
			value: stats.totalProducts,
			icon: Package,
			color: "bg-green-500/10 text-green-600",
		},
		{
			title: "Total Orders",
			value: stats.totalOrders,
			icon: ShoppingCart,
			color: "bg-purple-500/10 text-purple-600",
		},
		{
			title: "Total Revenue",
			value: `₹${stats.totalRevenue}`,
			icon: TrendingUp,
			color: "bg-orange-500/10 text-orange-600",
		},
	];

	return (
		<div className="space-y-6 w-full">
			<h1 className="text-3xl font-bold">Dashboard</h1>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat, index) => (
					<Card key={index}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">{stat.title}</p>
									<p className="text-3xl font-bold mt-2">{stat.value}</p>
								</div>
								<div className={`p-3 rounded-lg ${stat.color}`}>
									<stat.icon className="w-6 h-6" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<p className="text-sm text-muted-foreground">
						Use the sidebar to manage users, products, orders, and system
						settings.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
