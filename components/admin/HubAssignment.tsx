"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { MapPin, Truck } from "lucide-react";
import { useEffect, useState } from "react";

interface Hub {
	_id: string;
	name: string;
	code: string;
	address: {
		street: string;
		city: string;
		state: string;
		pincode: string;
	};
	servicePincodes: string[];
	totalCustomers: number;
	isOperational: boolean;
}

interface Customer {
	_id: string;
	shopName: string;
	ownerName: string;
	shopAddress?: {
		street?: string;
		city?: string;
		state?: string;
		pincode?: string;
	};
}

interface HubAssignmentProps {
	isOpen: boolean;
	onClose: () => void;
	customer: Customer | null;
	onSuccess: () => void;
}

export default function HubAssignment({
	isOpen,
	onClose,
	customer,
	onSuccess,
}: HubAssignmentProps) {
	const [nearbyHubs, setNearbyHubs] = useState<Hub[]>([]);
	const [allHubs, setAllHubs] = useState<Hub[]>([]);
	const [recommendedHub, setRecommendedHub] = useState<Hub | null>(null);
	const [selectedHubId, setSelectedHubId] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [approving, setApproving] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		if (isOpen && customer) {
			fetchHubData();
		}
	}, [isOpen, customer]);

	const fetchHubData = async () => {
		if (!customer) return;

		console.log("Fetching hub data for customer:", customer._id);
		setLoading(true);
		try {
			// Fetch nearby hubs for this customer
			console.log("Fetching nearby hubs...");
			const nearbyResponse = await api.get(
				`/admin/users/${customer._id}/nearby-hubs`
			);
			console.log("Nearby hubs response:", nearbyResponse.data);

			// Fetch all hubs for manual selection
			console.log("Fetching all hubs...");
			const allHubsResponse = await api.get("/admin/hubs");
			console.log("All hubs response:", allHubsResponse.data);

			setNearbyHubs(nearbyResponse.data.nearbyHubs || []);
			setRecommendedHub(nearbyResponse.data.recommendedHub);
			setAllHubs(allHubsResponse.data.hubs || []);

			// Auto-select recommended hub if available
			if (nearbyResponse.data.recommendedHub) {
				console.log(
					"Auto-selecting recommended hub:",
					nearbyResponse.data.recommendedHub._id
				);
				setSelectedHubId(nearbyResponse.data.recommendedHub._id);
			}
		} catch (error: any) {
			console.error("Error fetching hub data:", error);
			console.error("Error details:", error.response?.data);
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to fetch hub information",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleApproveWithHub = async () => {
		if (!customer || !selectedHubId) {
			toast({
				title: "Error",
				description: "Please select a hub",
				variant: "destructive",
			});
			return;
		}

		console.log("Approving customer with hub:", {
			customerId: customer._id,
			hubId: selectedHubId,
		});
		setApproving(true);
		try {
			const response = await api.put(
				`/admin/users/${customer._id}/approve-with-hub`,
				{
					hubId: selectedHubId,
				}
			);
			console.log("Approval response:", response.data);

			toast({
				title: "Success",
				description: "Customer approved and hub assigned successfully",
			});

			onSuccess();
			onClose();
		} catch (error: any) {
			console.error("Error approving customer with hub:", error);
			console.error("Error details:", error.response?.data);
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to approve customer",
				variant: "destructive",
			});
		} finally {
			setApproving(false);
		}
	};

	const handleApproveWithoutHub = async () => {
		if (!customer) return;

		setApproving(true);
		try {
			await api.put(`/admin/users/${customer._id}/approve`);

			toast({
				title: "Success",
				description: "Customer approved successfully (no hub assigned)",
			});

			onSuccess();
			onClose();
		} catch (error: any) {
			console.error("Error approving customer:", error);
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to approve customer",
				variant: "destructive",
			});
		} finally {
			setApproving(false);
		}
	};

	const getHubDisplayName = (hub: Hub) => {
		return `${hub.name} (${hub.code}) - ${hub.address.city}, ${hub.address.state}`;
	};

	const getHubDistance = (hub: Hub) => {
		if (hub.servicePincodes.includes(customer?.shopAddress?.pincode || "")) {
			return "Serves your pincode";
		}
		return "Manual assignment";
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Truck className="h-5 w-5" />
						Assign Hub to Customer
					</DialogTitle>
					<DialogDescription>
						Approve customer and assign them to a hub for product delivery and
						stock management.
					</DialogDescription>
				</DialogHeader>

				{customer && (
					<div className="space-y-6">
						{/* Customer Info */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-medium text-gray-900 mb-2">
								Customer Details
							</h3>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Shop Name:</span>
									<p className="font-medium">{customer.shopName}</p>
								</div>
								<div>
									<span className="text-gray-600">Owner:</span>
									<p className="font-medium">{customer.ownerName}</p>
								</div>
								{customer.shopAddress && (
									<div className="col-span-2">
										<span className="text-gray-600">Address:</span>
										<p className="font-medium">
											{customer.shopAddress.street &&
												`${customer.shopAddress.street}, `}
											{customer.shopAddress.city &&
												`${customer.shopAddress.city}, `}
											{customer.shopAddress.state &&
												`${customer.shopAddress.state} `}
											{customer.shopAddress.pincode &&
												`- ${customer.shopAddress.pincode}`}
										</p>
									</div>
								)}
							</div>
						</div>

						{loading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								<p className="text-gray-600 mt-2">Finding nearby hubs...</p>
							</div>
						) : (
							<div className="space-y-4">
								{/* Recommended Hub */}
								{recommendedHub && (
									<div className="bg-green-50 border border-green-200 p-4 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<MapPin className="h-4 w-4 text-green-600" />
											<span className="font-medium text-green-800">
												Recommended Hub
											</span>
										</div>
										<p className="text-sm text-green-700">
											{getHubDisplayName(recommendedHub)}
										</p>
										<p className="text-xs text-green-600 mt-1">
											{getHubDistance(recommendedHub)} •{" "}
											{recommendedHub.totalCustomers} customers
										</p>
									</div>
								)}

								{/* Hub Selection */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Select Hub
									</label>
									<Select
										value={selectedHubId}
										onValueChange={setSelectedHubId}>
										<SelectTrigger>
											<SelectValue placeholder="Choose a hub for this customer" />
										</SelectTrigger>
										<SelectContent>
											{/* Nearby Hubs */}
											{nearbyHubs.length > 0 && (
												<>
													<div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
														Nearby Hubs
													</div>
													{nearbyHubs.map((hub) => (
														<SelectItem key={hub._id} value={hub._id}>
															<div className="flex flex-col">
																<span>{getHubDisplayName(hub)}</span>
																<span className="text-xs text-gray-500">
																	{getHubDistance(hub)} • {hub.totalCustomers}{" "}
																	customers
																</span>
															</div>
														</SelectItem>
													))}
												</>
											)}

											{/* All Other Hubs */}
											{allHubs.length > nearbyHubs.length && (
												<>
													<div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
														All Hubs
													</div>
													{allHubs
														.filter(
															(hub) =>
																!nearbyHubs.some(
																	(nearby) => nearby._id === hub._id
																)
														)
														.map((hub) => (
															<SelectItem key={hub._id} value={hub._id}>
																<div className="flex flex-col">
																	<span>{getHubDisplayName(hub)}</span>
																	<span className="text-xs text-gray-500">
																		{hub.totalCustomers} customers • Manual
																		assignment
																	</span>
																</div>
															</SelectItem>
														))}
												</>
											)}
										</SelectContent>
									</Select>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 pt-4">
									<Button
										onClick={handleApproveWithHub}
										disabled={!selectedHubId || approving}
										className="flex-1">
										{approving ? "Approving..." : "Approve with Hub"}
									</Button>
									<Button
										variant="outline"
										onClick={handleApproveWithoutHub}
										disabled={approving}>
										Approve without Hub
									</Button>
									<Button
										variant="ghost"
										onClick={onClose}
										disabled={approving}>
										Cancel
									</Button>
								</div>

								{/* Warning */}
								{!selectedHubId && allHubs.length > 0 && (
									<p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
										⚠️ If no hub is assigned, the customer won't be able to see
										products or place orders until a hub is manually assigned
										later.
									</p>
								)}

								{/* No hubs available */}
								{allHubs.length === 0 && !loading && (
									<p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
										❌ No hubs are available. Please create hubs first before
										assigning customers.
									</p>
								)}
							</div>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
