"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
	Building2,
	MapPin,
	Package,
	Plus,
	Search,
	Truck,
	Users,
} from "lucide-react";
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
	isActive: boolean;
	isOperational: boolean;
	deliveryRadius: number;
	contactInfo?: {
		phone?: string;
		email?: string;
		managerName?: string;
	};
	geoLocation: {
		coordinates: [number, number]; // [longitude, latitude]
	};
	createdAt: string;
}

interface HubFormData {
	name: string;
	address: {
		street: string;
		city: string;
		state: string;
		pincode: string;
	};
	geoLocation: {
		coordinates: [number, number]; // [longitude, latitude]
	};
	servicePincodes: string;
	deliveryRadius: number;
	contactInfo: {
		phone?: string;
		email?: string;
		managerName?: string;
	};
}

export default function HubsPage() {
	const [hubs, setHubs] = useState<Hub[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [formData, setFormData] = useState<HubFormData>({
		name: "",
		address: {
			street: "",
			city: "",
			state: "",
			pincode: "",
		},
		geoLocation: {
			coordinates: [0, 0],
		},
		servicePincodes: "",
		deliveryRadius: 50,
		contactInfo: {
			phone: "",
			email: "",
			managerName: "",
		},
	});
	const [creating, setCreating] = useState(false);
	const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
	const [hubStatistics, setHubStatistics] = useState<any>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [loadingStats, setLoadingStats] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editFormData, setEditFormData] = useState<HubFormData | null>(null);
	const [updating, setUpdating] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		fetchHubs();
	}, []);

	const fetchHubs = async () => {
		try {
			const response = await api.get("/hubs");
			setHubs(response.data.hubs || []);
		} catch (error) {
			console.error("Error fetching hubs:", error);
			toast({
				title: "Error",
				description: "Failed to fetch hubs",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCreateHub = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreating(true);

		try {
			// Convert servicePincodes string to array
			const servicePincodesArray = formData.servicePincodes
				.split(",")
				.map((p) => p.trim())
				.filter((p) => p.length > 0);

			const hubData = {
				...formData,
				servicePincodes: servicePincodesArray,
			};

			await api.post("/hubs", hubData);

			toast({
				title: "Success",
				description: "Hub created successfully",
			});

			setIsCreateDialogOpen(false);
			resetForm();
			fetchHubs();
		} catch (error: any) {
			console.error("Error creating hub:", error);
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to create hub",
				variant: "destructive",
			});
		} finally {
			setCreating(false);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			address: {
				street: "",
				city: "",
				state: "",
				pincode: "",
			},
			geoLocation: {
				coordinates: [0, 0],
			},
			servicePincodes: "",
			deliveryRadius: 50,
			contactInfo: {
				phone: "",
				email: "",
				managerName: "",
			},
		});
	};

	const handleViewHub = async (hub: Hub) => {
		setSelectedHub(hub);
		setIsViewDialogOpen(true);
		setLoadingStats(true);

		try {
			// Fetch hub details with statistics
			const response = await api.get(`/hubs/${hub._id}`);
			setHubStatistics(response.data.statistics);
		} catch (error) {
			console.error("Error fetching hub statistics:", error);
			toast({
				title: "Warning",
				description: "Could not load hub statistics",
				variant: "destructive",
			});
		} finally {
			setLoadingStats(false);
		}
	};

	const handleEditHub = (hub: Hub) => {
		setSelectedHub(hub);
		setEditFormData({
			name: hub.name,
			address: hub.address,
			geoLocation: hub.geoLocation,
			servicePincodes: hub.servicePincodes.join(", "),
			deliveryRadius: hub.deliveryRadius,
			contactInfo: hub?.contactInfo || {
				phone: "",
				email: "",
				managerName: "",
			},
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdateHub = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedHub || !editFormData) return;

		setUpdating(true);
		try {
			const servicePincodesArray = editFormData.servicePincodes
				.split(",")
				.map((p) => p.trim())
				.filter((p) => p.length > 0);

			const hubData = {
				...editFormData,
				servicePincodes: servicePincodesArray,
			};

			await api.put(`/hubs/${selectedHub._id}`, hubData);

			toast({
				title: "Success",
				description: "Hub updated successfully",
			});

			setIsEditDialogOpen(false);
			setSelectedHub(null);
			setEditFormData(null);
			fetchHubs();
		} catch (error: any) {
			console.error("Error updating hub:", error);
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to update hub",
				variant: "destructive",
			});
		} finally {
			setUpdating(false);
		}
	};

	const filteredHubs = hubs.filter(
		(hub) =>
			hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			hub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			hub.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
			hub.address.pincode.includes(searchTerm)
	);

	const totalCustomers = hubs.reduce((sum, hub) => sum + hub.totalCustomers, 0);
	const activeHubs = hubs.filter(
		(hub) => hub.isActive && hub.isOperational
	).length;

	return (
		<div className=" mx-auto  space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Hub Management</h1>
					<p className="text-gray-600 mt-1">
						Manage distribution hubs and their service areas
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add New Hub
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Create New Hub</DialogTitle>
							<DialogDescription>
								Add a new distribution hub to serve customers in specific areas.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreateHub} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="name">Hub Name</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="e.g., Mumbai Central Hub"
										required
									/>
								</div>
								<div>
									<Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
									<Input
										id="deliveryRadius"
										type="number"
										value={formData.deliveryRadius}
										onChange={(e) =>
											setFormData({
												...formData,
												deliveryRadius: parseInt(e.target.value) || 50,
											})
										}
										placeholder="50"
									/>
								</div>
							</div>

							<div className="space-y-3">
								<Label>Address</Label>
								<div className="grid grid-cols-2 gap-3">
									<Input
										placeholder="Street Address"
										value={formData.address.street}
										onChange={(e) =>
											setFormData({
												...formData,
												address: {
													...formData.address,
													street: e.target.value,
												},
											})
										}
										required
									/>
									<Input
										placeholder="City"
										value={formData.address.city}
										onChange={(e) =>
											setFormData({
												...formData,
												address: { ...formData.address, city: e.target.value },
											})
										}
										required
									/>
									<Input
										placeholder="State"
										value={formData.address.state}
										onChange={(e) =>
											setFormData({
												...formData,
												address: { ...formData.address, state: e.target.value },
											})
										}
										required
									/>
									<Input
										placeholder="Pincode"
										value={formData.address.pincode}
										onChange={(e) =>
											setFormData({
												...formData,
												address: {
													...formData.address,
													pincode: e.target.value,
												},
											})
										}
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="latitude">Latitude</Label>
									<Input
										id="latitude"
										type="number"
										step="any"
										value={formData.geoLocation.coordinates[1]}
										onChange={(e) =>
											setFormData({
												...formData,
												geoLocation: {
													coordinates: [
														formData.geoLocation.coordinates[0],
														parseFloat(e.target.value) || 0,
													],
												},
											})
										}
										placeholder="19.0760"
										required
									/>
								</div>
								<div>
									<Label htmlFor="longitude">Longitude</Label>
									<Input
										id="longitude"
										type="number"
										step="any"
										value={formData.geoLocation.coordinates[0]}
										onChange={(e) =>
											setFormData({
												...formData,
												geoLocation: {
													coordinates: [
														parseFloat(e.target.value) || 0,
														formData.geoLocation.coordinates[1],
													],
												},
											})
										}
										placeholder="72.8777"
										required
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="servicePincodes">Service Pincodes</Label>
								<Input
									id="servicePincodes"
									value={formData.servicePincodes}
									onChange={(e) =>
										setFormData({
											...formData,
											servicePincodes: e.target.value,
										})
									}
									placeholder="400001, 400002, 400003"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Comma-separated list of pincodes this hub serves
								</p>
							</div>

							<div className="space-y-3">
								<Label>Contact Information</Label>
								<div className="grid grid-cols-2 gap-3">
									<Input
										placeholder="Manager Name"
										value={formData.contactInfo.managerName}
										onChange={(e) =>
											setFormData({
												...formData,
												contactInfo: {
													...formData.contactInfo,
													managerName: e.target.value,
												},
											})
										}
									/>
									<Input
										placeholder="Phone Number"
										value={formData.contactInfo.phone}
										onChange={(e) =>
											setFormData({
												...formData,
												contactInfo: {
													...formData.contactInfo,
													phone: e.target.value,
												},
											})
										}
									/>
									<Input
										placeholder="Email"
										type="email"
										value={formData.contactInfo.email}
										onChange={(e) =>
											setFormData({
												...formData,
												contactInfo: {
													...formData.contactInfo,
													email: e.target.value,
												},
											})
										}
										className="col-span-2"
									/>
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								<Button type="submit" disabled={creating} className="flex-1">
									{creating ? "Creating..." : "Create Hub"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsCreateDialogOpen(false)}>
									Cancel
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Hubs</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{hubs.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Hubs</CardTitle>
						<Truck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeHubs}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Customers
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalCustomers}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avg. Customers/Hub
						</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{hubs.length > 0 ? Math.round(totalCustomers / hubs.length) : 0}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<Card>
				<CardHeader>
					<CardTitle>Hubs</CardTitle>
					<CardDescription>
						Manage your distribution hubs and their service areas
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-2 mb-4">
						<Search className="h-4 w-4 text-gray-400" />
						<Input
							placeholder="Search hubs by name, code, city, or pincode..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="max-w-sm"
						/>
					</div>

					{loading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
							<p className="text-gray-600 mt-2">Loading hubs...</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Hub Details</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Service Area</TableHead>
									<TableHead>Customers</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredHubs.map((hub) => (
									<TableRow key={hub._id}>
										<TableCell>
											<div>
												<div className="font-medium">{hub.name}</div>
												<div className="text-sm text-gray-500">
													Code: {hub.code}
												</div>
												{hub.contactInfo?.managerName && (
													<div className="text-xs text-gray-400">
														Manager: {hub.contactInfo.managerName}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-start gap-1">
												<MapPin className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
												<div className="text-sm">
													<div>
														{hub.address.city}, {hub.address.state}
													</div>
													<div className="text-gray-500">
														{hub.address.pincode}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<div>{hub.deliveryRadius}km radius</div>
												<div className="text-gray-500">
													{hub.servicePincodes.length} pincodes
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="text-center">
												<div className="font-medium">{hub.totalCustomers}</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														hub.isActive
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}>
													{hub.isActive ? "Active" : "Inactive"}
												</span>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														hub.isOperational
															? "bg-blue-100 text-blue-800"
															: "bg-yellow-100 text-yellow-800"
													}`}>
													{hub.isOperational ? "Operational" : "Maintenance"}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleViewHub(hub)}>
													View
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEditHub(hub)}>
													Edit
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}

					{!loading && filteredHubs.length === 0 && (
						<div className="text-center py-8">
							<Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-600">
								{searchTerm
									? "No hubs found matching your search"
									: "No hubs created yet"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* View Hub Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Hub Details</DialogTitle>
						<DialogDescription>
							View detailed information about this hub
						</DialogDescription>
					</DialogHeader>

					{selectedHub && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-600">Hub Name</p>
									<p className="font-medium">{selectedHub.name}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Hub Code</p>
									<p className="font-medium">{selectedHub.code}</p>
								</div>
							</div>

							<div>
								<p className="text-sm text-gray-600">Address</p>
								<p className="font-medium">
									{selectedHub.address.street}, {selectedHub.address.city},{" "}
									{selectedHub.address.state} - {selectedHub.address.pincode}
								</p>
							</div>

							{/* Statistics Cards */}
							{loadingStats ? (
								<div className="text-center py-4">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
									<p className="text-sm text-gray-600 mt-2">
										Loading statistics...
									</p>
								</div>
							) : (
								hubStatistics && (
									<>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
											<div className="text-center">
												<p className="text-2xl font-bold text-blue-600">
													{hubStatistics.totalProducts || 0}
												</p>
												<p className="text-xs text-gray-600">Total Products</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-green-600">
													{hubStatistics.activeProducts || 0}
												</p>
												<p className="text-xs text-gray-600">Active Products</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-yellow-600">
													{hubStatistics.lowStockItems || 0}
												</p>
												<p className="text-xs text-gray-600">Low Stock</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-red-600">
													{hubStatistics.outOfStockItems || 0}
												</p>
												<p className="text-xs text-gray-600">Out of Stock</p>
											</div>
										</div>
										<div className="p-4 bg-blue-50 rounded-lg">
											<p className="text-sm text-gray-600">Total Stock Value</p>
											<p className="text-2xl font-bold text-blue-600">
												₹{hubStatistics.totalStockValue?.toLocaleString() || 0}
											</p>
										</div>
									</>
								)
							)}

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-600">Delivery Radius</p>
									<p className="font-medium">{selectedHub.deliveryRadius} km</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Total Customers</p>
									<p className="font-medium">{selectedHub.totalCustomers}</p>
								</div>
							</div>

							<div>
								<p className="text-sm text-gray-600">Service Pincodes</p>
								<div className="flex flex-wrap gap-2 mt-2">
									{selectedHub.servicePincodes.length > 0 ? (
										selectedHub.servicePincodes.map((pincode, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-gray-100 rounded text-sm">
												{pincode}
											</span>
										))
									) : (
										<span className="text-sm text-gray-500">None</span>
									)}
								</div>
							</div>

							{selectedHub.contactInfo && (
								<div>
									<p className="text-sm text-gray-600 mb-2">
										Contact Information
									</p>
									<div className="grid grid-cols-2 gap-4">
										{selectedHub.contactInfo.managerName && (
											<div>
												<p className="text-xs text-gray-500">Manager</p>
												<p className="text-sm">
													{selectedHub.contactInfo.managerName}
												</p>
											</div>
										)}
										{selectedHub.contactInfo.phone && (
											<div>
												<p className="text-xs text-gray-500">Phone</p>
												<p className="text-sm">
													{selectedHub.contactInfo.phone}
												</p>
											</div>
										)}
										{selectedHub.contactInfo.email && (
											<div className="col-span-2">
												<p className="text-xs text-gray-500">Email</p>
												<p className="text-sm">
													{selectedHub.contactInfo.email}
												</p>
											</div>
										)}
									</div>
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-600">Status</p>
									<p className="font-medium">
										{selectedHub.isActive ? "Active" : "Inactive"}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Operational</p>
									<p className="font-medium">
										{selectedHub.isOperational ? "Yes" : "No"}
									</p>
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setIsViewDialogOpen(false)}>
							Close
						</Button>
						<Button
							onClick={() => {
								if (selectedHub) {
									setIsViewDialogOpen(false);
									handleEditHub(selectedHub);
								}
							}}>
							Edit Hub
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Hub Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Hub</DialogTitle>
						<DialogDescription>
							Update hub information and settings
						</DialogDescription>
					</DialogHeader>

					{editFormData && (
						<form onSubmit={handleUpdateHub} className="space-y-4">
							<div>
								<Label htmlFor="edit-name">Hub Name</Label>
								<Input
									id="edit-name"
									value={editFormData.name}
									onChange={(e) =>
										setEditFormData({ ...editFormData, name: e.target.value })
									}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="edit-deliveryRadius">
										Delivery Radius (km)
									</Label>
									<Input
										id="edit-deliveryRadius"
										type="number"
										value={editFormData.deliveryRadius}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												deliveryRadius: parseInt(e.target.value) || 50,
											})
										}
									/>
								</div>
							</div>

							<div className="space-y-3">
								<Label>Address</Label>
								<div className="grid grid-cols-2 gap-3">
									<Input
										placeholder="Street Address"
										value={editFormData.address.street}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												address: {
													...editFormData.address,
													street: e.target.value,
												},
											})
										}
										required
									/>
									<Input
										placeholder="City"
										value={editFormData.address.city}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												address: {
													...editFormData.address,
													city: e.target.value,
												},
											})
										}
										required
									/>
									<Input
										placeholder="State"
										value={editFormData.address.state}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												address: {
													...editFormData.address,
													state: e.target.value,
												},
											})
										}
										required
									/>
									<Input
										placeholder="Pincode"
										value={editFormData.address.pincode}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												address: {
													...editFormData.address,
													pincode: e.target.value,
												},
											})
										}
										required
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="edit-servicePincodes">Service Pincodes</Label>
								<Input
									id="edit-servicePincodes"
									value={editFormData.servicePincodes}
									onChange={(e) =>
										setEditFormData({
											...editFormData,
											servicePincodes: e.target.value,
										})
									}
									placeholder="400001, 400002, 400003"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Comma-separated list of pincodes
								</p>
							</div>

							<div className="space-y-3">
								<Label>Contact Information</Label>
								<div className="grid grid-cols-2 gap-3">
									<Input
										placeholder="Manager Name"
										value={editFormData.contactInfo.managerName}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												contactInfo: {
													...editFormData.contactInfo,
													managerName: e.target.value,
												},
											})
										}
									/>
									<Input
										placeholder="Phone Number"
										value={editFormData.contactInfo.phone}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												contactInfo: {
													...editFormData.contactInfo,
													phone: e.target.value,
												},
											})
										}
									/>
									<Input
										placeholder="Email"
										type="email"
										value={editFormData.contactInfo.email}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												contactInfo: {
													...editFormData.contactInfo,
													email: e.target.value,
												},
											})
										}
										className="col-span-2"
									/>
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								<Button type="submit" disabled={updating} className="flex-1">
									{updating ? "Updating..." : "Update Hub"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsEditDialogOpen(false);
										setEditFormData(null);
										setSelectedHub(null);
									}}
									disabled={updating}>
									Cancel
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
