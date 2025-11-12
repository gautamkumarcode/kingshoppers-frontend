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
	Percent,
	Phone,
	Plus,
	Search,
	Trash2,
	User,
	UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SalesExecutive {
	_id: string;
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	assignedArea?: string;
	incentivePercentage?: number;
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
	assignedArea: string;
	incentivePercentage: number;
}

export default function SalesExecutivesPage() {
	const { toast } = useToast();
	const [salesExecutives, setSalesExecutives] = useState<SalesExecutive[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editingExecutive, setEditingExecutive] =
		useState<SalesExecutive | null>(null);
	const [deletingExecutive, setDeletingExecutive] =
		useState<SalesExecutive | null>(null);
	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		password: "",
		assignedArea: "",
		incentivePercentage: 0,
	});
	const [errors, setErrors] = useState<Partial<FormData>>({});

	useEffect(() => {
		fetchSalesExecutives();
	}, []);

	const fetchSalesExecutives = async () => {
		try {
			setLoading(true);
			const response = await api.get("/admin/sales-executives");
			setSalesExecutives(response.data.data || []);
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to fetch sales executives",
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
		if (!editingExecutive && !formData.password) {
			newErrors.password = "Password is required";
		} else if (!editingExecutive && formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}
		if (formData.incentivePercentage < 0 || formData.incentivePercentage > 100)
			setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			if (editingExecutive) {
				// Update existing sales executive
				const updateData: any = {
					firstName: formData.firstName,
					lastName: formData.lastName,
					phone: formData.phone,
					email: formData.email,
					assignedArea: formData.assignedArea,
					incentivePercentage: formData.incentivePercentage,
				};

				// Only include password if it's provided during edit
				if (formData.password) {
					updateData.password = formData.password;
				}

				await api.put(
					`/admin/sales-executives/${editingExecutive._id}`,
					updateData
				);
				toast({
					title: "Success",
					description: "Sales executive updated successfully",
				});
			} else {
				// Create new sales executive
				await api.post("/admin/sales-executives", formData);
				toast({
					title: "Success",
					description: "Sales executive created successfully",
				});
			}

			setIsDialogOpen(false);
			resetForm();
			fetchSalesExecutives();
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to save sales executive",
				variant: "destructive",
			});
		}
	};

	const handleDelete = async () => {
		if (!deletingExecutive) return;

		try {
			await api.delete(`/admin/sales-executives/${deletingExecutive._id}`);
			toast({
				title: "Success",
				description: "Sales executive deleted successfully",
			});
			setIsDeleteDialogOpen(false);
			setDeletingExecutive(null);
			fetchSalesExecutives();
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to delete sales executive",
				variant: "destructive",
			});
		}
	};

	const openEditDialog = (executive: SalesExecutive) => {
		setEditingExecutive(executive);
		setFormData({
			firstName: executive.firstName,
			lastName: executive.lastName,
			phone: executive.phone,
			email: executive.email,
			password: "", // Don't populate password for security
			assignedArea: executive.assignedArea || "",
			incentivePercentage: executive.incentivePercentage || 0,
		});
		setIsDialogOpen(true);
	};

	const openCreateDialog = () => {
		resetForm();
		setIsDialogOpen(true);
	};

	const openDeleteDialog = (executive: SalesExecutive) => {
		setDeletingExecutive(executive);
		setIsDeleteDialogOpen(true);
	};

	const resetForm = () => {
		setFormData({
			firstName: "",
			lastName: "",
			phone: "",
			email: "",
			password: "",
			assignedArea: "",
			incentivePercentage: 0,
		});
		setErrors({});
		setEditingExecutive(null);
	};

	const handleInputChange = (field: keyof FormData, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const filteredExecutives = salesExecutives.filter(
		(executive) =>
			executive.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			executive.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			executive.phone.includes(searchQuery) ||
			executive.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			executive.assignedArea?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<UserCog className="w-8 h-8" />
						Sales Executives
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage sales executives and their assigned areas
					</p>
				</div>
				<Button onClick={openCreateDialog} size="lg">
					<Plus className="w-4 h-4 mr-2" />
					Add Sales Executive
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

			{/* Sales Executives Table */}
			<Card>
				<CardHeader>
					<CardTitle>Sales Executives ({filteredExecutives.length})</CardTitle>
					<CardDescription>
						List of all sales executives in the system
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center items-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : filteredExecutives.length === 0 ? (
						<div className="text-center py-8">
							<UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								{searchQuery
									? "No sales executives found"
									: "No sales executives yet"}
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Assigned Area</TableHead>
										<TableHead>Incentive %</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredExecutives.map((executive) => (
										<TableRow key={executive._id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
														<User className="w-4 h-4 text-primary" />
													</div>
													<div>
														{executive.firstName} {executive.lastName}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center gap-1 text-sm">
														<Phone className="w-3 h-3 text-muted-foreground" />
														{executive.phone}
													</div>
													<div className="flex items-center gap-1 text-sm text-muted-foreground">
														<Mail className="w-3 h-3" />
														{executive.email}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<MapPin className="w-4 h-4 text-muted-foreground" />
													{executive.assignedArea || "Not assigned"}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Percent className="w-4 h-4 text-muted-foreground" />
													{executive.incentivePercentage || 0}%
												</div>
											</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														executive.isActive
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}>
													{executive.isActive ? "Active" : "Inactive"}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => openEditDialog(executive)}>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => openDeleteDialog(executive)}>
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
							{editingExecutive
								? "Edit Sales Executive"
								: "Add Sales Executive"}
						</DialogTitle>
						<DialogDescription>
							{editingExecutive
								? "Update sales executive information"
								: "Create a new sales executive account"}
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
									{!editingExecutive && <span className="text-red-500">*</span>}
								</Label>
								<Input
									id="password"
									type="password"
									value={formData.password}
									onChange={(e) =>
										handleInputChange("password", e.target.value)
									}
									placeholder={
										editingExecutive
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
								<Label htmlFor="incentivePercentage">
									Incentive Percentage
								</Label>
								<Input
									id="incentivePercentage"
									type="number"
									min="0"
									max="100"
									step="0.1"
									value={formData.incentivePercentage}
									onChange={(e) =>
										handleInputChange(
											"incentivePercentage",
											parseFloat(e.target.value) || 0
										)
									}
									placeholder="0"
								/>
								{errors.incentivePercentage && (
									<p className="text-sm text-red-500 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.incentivePercentage}
									</p>
								)}
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="assignedArea">Assigned Area</Label>
								<Input
									id="assignedArea"
									value={formData.assignedArea}
									onChange={(e) =>
										handleInputChange("assignedArea", e.target.value)
									}
									placeholder="e.g., North Delhi, South Mumbai"
								/>
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
								{editingExecutive ? "Update" : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Sales Executive</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete{" "}
							<strong>
								{deletingExecutive?.firstName} {deletingExecutive?.lastName}
							</strong>
							? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsDeleteDialogOpen(false);
								setDeletingExecutive(null);
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
