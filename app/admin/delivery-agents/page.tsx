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
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
	AlertCircle,
	Edit,
	Mail,
	MapPin,
	Phone,
	Plus,
	Search,
	Trash2,
	Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DeliveryAgent {
	_id: string;
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	deliveryArea?: string;
	deliveryZones?: string[];
	isActive: boolean;
	userType: string;
	createdAt: string;
}

interface FormData {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	password: string;
	deliveryArea: string;
	deliveryZones: string;
}

export default function DeliveryAgentsPage() {
	const { toast } = useToast();
	const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);
	const [deletingAgent, setDeletingAgent] = useState<DeliveryAgent | null>(
		null
	);
	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		password: "",
		deliveryArea: "",
		deliveryZones: "",
	});
	const [errors, setErrors] = useState<Partial<FormData>>({});

	useEffect(() => {
		fetchDeliveryAgents();
	}, []);

	const fetchDeliveryAgents = async () => {
		try {
			setLoading(true);
			const response = await api.get("/admin/delivery-agents");
			setDeliveryAgents(response.data.data || []);
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to fetch delivery agents",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<FormData> = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = "First name is required";
		}
		if (!formData.lastName.trim()) {
			newErrors.lastName = "Last name is required";
		}
		if (!formData.phone.trim()) {
			newErrors.phone = "Phone number is required";
		} else if (!/^\d{10}$/.test(formData.phone)) {
			newErrors.phone = "Phone number must be 10 digits";
		}
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Invalid email format";
		}
		if (!editingAgent && !formData.password) {
			newErrors.password = "Password is required";
		} else if (!editingAgent && formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			const deliveryZonesArray = formData.deliveryZones
				.split(",")
				.map((zone) => zone.trim())
				.filter((zone) => zone);

			if (editingAgent) {
				// Update existing delivery agent
				const updateData: any = {
					firstName: formData.firstName,
					lastName: formData.lastName,
					phone: formData.phone,
					email: formData.email,
					deliveryArea: formData.deliveryArea,
					deliveryZones: deliveryZonesArray,
				};

				// Only include password if it's provided during edit
				if (formData.password) {
					updateData.password = formData.password;
				}

				await api.put(`/admin/delivery-agents/${editingAgent._id}`, updateData);
				toast({
					title: "Success",
					description: "Delivery agent updated successfully",
				});
			} else {
				// Create new delivery agent
				await api.post("/admin/delivery-agents", {
					...formData,
					deliveryZones: deliveryZonesArray,
				});
				toast({
					title: "Success",
					description: "Delivery agent created successfully",
				});
			}

			setIsDialogOpen(false);
			resetForm();
			fetchDeliveryAgents();
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to save delivery agent",
				variant: "destructive",
			});
		}
	};

	const handleDelete = async () => {
		if (!deletingAgent) return;

		try {
			await api.delete(`/admin/delivery-agents/${deletingAgent._id}`);
			toast({
				title: "Success",
				description: "Delivery agent deleted successfully",
			});
			setIsDeleteDialogOpen(false);
			setDeletingAgent(null);
			fetchDeliveryAgents();
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to delete delivery agent",
				variant: "destructive",
			});
		}
	};

	const openEditDialog = (agent: DeliveryAgent) => {
		setEditingAgent(agent);
		setFormData({
			firstName: agent.firstName,
			lastName: agent.lastName,
			phone: agent.phone,
			email: agent.email,
			password: "", // Don't populate password for security
			deliveryArea: agent.deliveryArea || "",
			deliveryZones: agent.deliveryZones?.join(", ") || "",
		});
		setIsDialogOpen(true);
	};

	const openCreateDialog = () => {
		resetForm();
		setIsDialogOpen(true);
	};

	const openDeleteDialog = (agent: DeliveryAgent) => {
		setDeletingAgent(agent);
		setIsDeleteDialogOpen(true);
	};

	const resetForm = () => {
		setFormData({
			firstName: "",
			lastName: "",
			phone: "",
			email: "",
			password: "",
			deliveryArea: "",
			deliveryZones: "",
		});
		setErrors({});
		setEditingAgent(null);
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const filteredAgents = deliveryAgents.filter(
		(agent) =>
			agent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			agent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			agent.phone.includes(searchQuery) ||
			agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			agent.deliveryArea?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Truck className="w-8 h-8" />
						Delivery Agents
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage delivery agents and their assigned areas
					</p>
				</div>
				<Button onClick={openCreateDialog} size="lg">
					<Plus className="w-4 h-4 mr-2" />
					Add Delivery Agent
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Search</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="relative">
						<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
						<Input
							placeholder="Search by name, phone, email, or area..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Delivery Agents Table */}
			<Card>
				<CardHeader>
					<CardTitle>Delivery Agents ({filteredAgents.length})</CardTitle>
					<CardDescription>
						List of all delivery agents in the system
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center items-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : filteredAgents.length === 0 ? (
						<div className="text-center py-8">
							<Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								{searchQuery
									? "No delivery agents found"
									: "No delivery agents yet"}
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Delivery Area</TableHead>
										<TableHead>Zones</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredAgents.map((agent) => (
										<TableRow key={agent._id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
														<Truck className="w-4 h-4 text-primary" />
													</div>
													<div>
														{agent.firstName} {agent.lastName}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center gap-1 text-sm">
														<Phone className="w-3 h-3 text-muted-foreground" />
														{agent.phone}
													</div>
													<div className="flex items-center gap-1 text-sm text-muted-foreground">
														<Mail className="w-3 h-3" />
														{agent.email}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<MapPin className="w-4 h-4 text-muted-foreground" />
													{agent.deliveryArea || "Not assigned"}
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm text-muted-foreground">
													{agent.deliveryZones && agent.deliveryZones.length > 0
														? `${agent.deliveryZones.length} zones`
														: "None"}
												</div>
											</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														agent.isActive
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}>
													{agent.isActive ? "Active" : "Inactive"}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => openEditDialog(agent)}>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => openDeleteDialog(agent)}>
														<Trash2 className="w-4 h-4 text-red-500" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingAgent ? "Edit Delivery Agent" : "Add Delivery Agent"}
						</DialogTitle>
						<DialogDescription>
							{editingAgent
								? "Update delivery agent information"
								: "Create a new delivery agent account"}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">
									First Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) =>
										handleInputChange("firstName", e.target.value)
									}
									placeholder="Enter first name"
								/>
								{errors.firstName && (
									<p className="text-sm text-red-500 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.firstName}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="lastName">
									Last Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) =>
										handleInputChange("lastName", e.target.value)
									}
									placeholder="Enter last name"
								/>
								{errors.lastName && (
									<p className="text-sm text-red-500 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.lastName}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">
									Phone Number <span className="text-red-500">*</span>
								</Label>
								<Input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(e) => handleInputChange("phone", e.target.value)}
									placeholder="10 digit phone number"
								/>
								{errors.phone && (
									<p className="text-sm text-red-500 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.phone}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">
									Email <span className="text-red-500">*</span>
								</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									placeholder="email@example.com"
								/>
								{errors.email && (
									<p className="text-sm text-red-500 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.email}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">
									Password{" "}
									{!editingAgent && <span className="text-red-500">*</span>}
								</Label>
								<Input
									id="password"
									type="password"
									value={formData.password}
									onChange={(e) =>
										handleInputChange("password", e.target.value)
									}
									placeholder={
										editingAgent
											? "Leave blank to keep current"
											: "Min. 6 characters"
									}
								/>
								{errors.password && (
									<p className="text-sm text-red-500 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.password}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="deliveryArea">Delivery Area</Label>
								<Input
									id="deliveryArea"
									value={formData.deliveryArea}
									onChange={(e) =>
										handleInputChange("deliveryArea", e.target.value)
									}
									placeholder="e.g., North Delhi, South Mumbai"
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="deliveryZones">Delivery Zones</Label>
								<Input
									id="deliveryZones"
									value={formData.deliveryZones}
									onChange={(e) =>
										handleInputChange("deliveryZones", e.target.value)
									}
									placeholder="e.g., Zone A, Zone B, Zone C (comma separated)"
								/>
								<p className="text-xs text-muted-foreground">
									Enter zones separated by commas
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsDialogOpen(false);
									resetForm();
								}}>
								Cancel
							</Button>
							<Button type="submit">
								{editingAgent ? "Update" : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Delivery Agent</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete{" "}
							<strong>
								{deletingAgent?.firstName} {deletingAgent?.lastName}
							</strong>
							? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsDeleteDialogOpen(false);
								setDeletingAgent(null);
							}}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
