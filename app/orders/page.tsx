"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
	const { user } = useAuth();

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
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
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="w-5 h-5" />
									Recent Orders
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										No orders yet
									</h3>
									<p className="text-gray-600 mb-4">
										Start shopping to see your orders here
									</p>
									<Link href="/products">
										<Button>Start Shopping</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
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
