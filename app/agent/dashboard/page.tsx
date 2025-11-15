"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { apiCall } from "@/lib/auth";
import {
	Award,
	CheckCircle,
	Package,
	ShoppingCart,
	TrendingUp,
	Truck,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AgentDashboard() {
	const { user } = useAuth();
	const userTypeField = user?.userType || user?.userTypes;
	const isSalesAgent = userTypeField === "sales_executive";
	const isDeliveryAgent = userTypeField === "delivery";

	const [stats, setStats] = useState({
		totalOrders: 0,
		totalRevenue: 0,
		totalCustomers: 0,
		incentivePercentage: 0,
		// Delivery agent stats
		totalDeliveries: 0,
		completedDeliveries: 0,
		pendingDeliveries: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, [isSalesAgent]);

	const fetchStats = async () => {
		try {
			const endpoint = isSalesAgent ? "/sales/dashboard" : "/delivery/stats";
			const response = await apiCall(endpoint);
			const data = await response.json();
			setStats(data);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		} finally {
			setLoading(false);
		}
	};

	// Sales Executive Stats
	const salesStatCards = [
		{
			title: "Total Customers",
			value: stats.totalCustomers || 0,
			icon: Users,
			color: "bg-blue-500/10 text-blue-600",
		},
		{
			title: "Total Orders",
			value: stats.totalOrders || 0,
			icon: ShoppingCart,
			color: "bg-green-500/10 text-green-600",
		},
		{
			title: "Total Revenue",
			value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
			icon: TrendingUp,
			color: "bg-purple-500/10 text-purple-600",
		},
		{
			title: "Incentive Rate",
			value: `${stats.incentivePercentage || 0}%`,
			icon: Award,
			color: "bg-orange-500/10 text-orange-600",
		},
	];

	// Delivery Agent Stats
	const deliveryStatCards = [
		{
			title: "Total Deliveries",
			value: stats.totalDeliveries || 0,
			icon: Package,
			color: "bg-blue-500/10 text-blue-600",
		},
		{
			title: "Completed",
			value: stats.completedDeliveries || 0,
			icon: CheckCircle,
			color: "bg-green-500/10 text-green-600",
		},
		{
			title: "Pending",
			value: stats.pendingDeliveries || 0,
			icon: Truck,
			color: "bg-orange-500/10 text-orange-600",
		},
	];

	const statCards = isSalesAgent ? salesStatCards : deliveryStatCards;

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Dashboard</h1>

			{/* Stats Cards */}
			<div
				className={`grid grid-cols-1 md:grid-cols-2 ${
					isSalesAgent ? "lg:grid-cols-4" : "lg:grid-cols-3"
				} gap-6`}>
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

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<p className="text-sm text-muted-foreground">
						{isSalesAgent
							? "Use the sidebar to manage customers, place orders, and track your performance."
							: "Use the sidebar to view assigned orders and manage your deliveries."}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
