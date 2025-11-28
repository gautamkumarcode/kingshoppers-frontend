"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { MapPin, Navigation, Package, Phone } from "lucide-react";
import { useEffect, useState } from "react";

export default function DeliveriesPage() {
	const [deliveries, setDeliveries] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDeliveries();
	}, []);

	const fetchDeliveries = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.get("/orders/delivery/assigned");

			const data = response.data;
			setDeliveries(data);
		} catch (error) {
			console.error("Failed to fetch deliveries:", error);
			setError("Failed to load deliveries. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			pending: "bg-yellow-500/10 text-yellow-600",
			picked: "bg-blue-500/10 text-blue-600",
			in_transit: "bg-purple-500/10 text-purple-600",
			delivered: "bg-green-500/10 text-green-600",
		};
		return colors[status] || "bg-gray-500/10 text-gray-600";
	};

	const handleCallCustomer = (phoneNumber: string) => {
		if (!phoneNumber) {
			alert("Phone number not available");
			return;
		}
		// Use tel: protocol to initiate phone call
		window.location.href = `tel:${phoneNumber}`;
	};

	const handleNavigate = (address: any) => {
		if (!address) {
			alert("Address not available");
			return;
		}
		// Create address string for Google Maps
		const addressString = `${address.street || ""}, ${address.city || ""}, ${
			address.state || ""
		} ${address.pincode || ""}`.trim();
		// Open Google Maps with the address
		const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
			addressString
		)}`;
		window.open(mapsUrl, "_blank");
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-muted-foreground">Loading deliveries...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<h1 className="text-3xl font-bold">Deliveries</h1>
				<Card>
					<CardContent className="p-12 text-center">
						<p className="text-destructive mb-4">{error}</p>
						<Button onClick={fetchDeliveries}>Retry</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Deliveries</h1>
				<Button>
					<Navigation className="w-4 h-4 mr-2" />
					View Route Map
				</Button>
			</div>

			{deliveries.length === 0 ? (
				<Card>
					<CardContent className="p-12 text-center">
						<Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground">No deliveries assigned yet</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{deliveries.map((delivery) => (
						<Card key={delivery._id}>
							<CardContent className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
									<div>
										<p className="text-sm text-muted-foreground">
											Order Number
										</p>
										<p className="font-semibold">{delivery.orderNumber}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Customer</p>
										<p className="font-semibold">
											{delivery.user?.ownerName || delivery.user?.shopName}
										</p>
										<p className="text-xs text-muted-foreground">
											{delivery.user?.phone}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Amount</p>
										<p className="font-semibold text-primary">
											₹{delivery.grandTotal?.toFixed(2)}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Status</p>
										<span
											className={`text-xs px-2 py-1 rounded capitalize inline-block ${getStatusColor(
												delivery.orderStatus
											)}`}>
											{delivery.orderStatus?.replace("_", " ")}
										</span>
									</div>
								</div>

								{/* Delivery Address */}
								<div className="mb-4 pb-4 border-t border-border pt-4">
									<div className="flex items-start gap-2">
										<MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
										<div>
											<p className="text-sm font-semibold">
												{delivery.deliveryAddress?.street}
											</p>
											<p className="text-sm text-muted-foreground">
												{delivery.deliveryAddress?.city},{" "}
												{delivery.deliveryAddress?.state}{" "}
												{delivery.deliveryAddress?.pincode}
											</p>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-2 flex-wrap">
									<Button
										size="sm"
										variant="default"
										onClick={() =>
											(window.location.href = `/agent/orders/${delivery._id}`)
										}>
										<Package className="w-4 h-4 mr-2" />
										Start Delivery
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleCallCustomer(delivery.user?.phone)}>
										<Phone className="w-4 h-4 mr-2" />
										Call Customer
									</Button>
									{delivery.user?.alternatePhone && (
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												handleCallCustomer(delivery.user?.alternatePhone)
											}>
											<Phone className="w-4 h-4 mr-2" />
											Call Alternate
										</Button>
									)}
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleNavigate(delivery.deliveryAddress)}>
										<Navigation className="w-4 h-4 mr-2" />
										Navigate
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
