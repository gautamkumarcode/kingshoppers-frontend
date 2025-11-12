"use client"

import type React from "react";

import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Plus, Search, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomersPage() {
	const { toast } = useToast();
	const [customers, setCustomers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showForm, setShowForm] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		phone: "",
		firstName: "",
		lastName: "",
		companyName: "",
		gstNumber: "",
	});

	useEffect(() => {
		fetchCustomers();
	}, []);

	const fetchCustomers = async () => {
		try {
			const response = await api.get("/sales/customers");

			setCustomers(response.data.customers || []);
		} catch (error) {
			console.error("❌ Failed to fetch customers:", error);
			toast({
				title: "Error",
				description: "Failed to fetch customers",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleRegisterCustomer = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// send the form data directly as the request body (axios expects the data as the 2nd arg)
			const response = await api.post("/sales/customers", formData);

			// axios throws for non-2xx by default, but check status just in case
			if (response.status < 200 || response.status >= 300) {
				const message = response.data?.message || "Failed to register customer";
				toast({
					title: "Error",
					description: message,
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Success",
				description: "Customer registered successfully",
			});

			setFormData({
				phone: "",
				firstName: "",
				lastName: "",
				companyName: "",
				gstNumber: "",
			});
			setShowForm(false);
			fetchCustomers();
		} catch (error: any) {
			const message =
				error?.response?.data?.message || "Failed to register customer";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.firstName?.toLowerCase().includes(search.toLowerCase()) ||
			customer.phone?.includes(search) ||
			customer.companyName?.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<AuthGuard requiredRole="sales_executive">
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Customers</h1>
					<Button onClick={() => setShowForm(!showForm)}>
						<Plus className="w-4 h-4 mr-2" />
						Register Customer
					</Button>
				</div>

				{/* Registration Form */}
				{showForm && (
					<Card>
						<CardHeader>
							<CardTitle>Register New Customer</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleRegisterCustomer} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">First Name</Label>
										<Input
											id="firstName"
											name="firstName"
											value={formData.firstName}
											onChange={handleInputChange}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName">Last Name</Label>
										<Input
											id="lastName"
											name="lastName"
											value={formData.lastName}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										name="phone"
										type="tel"
										value={formData.phone}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="companyName">Company Name</Label>
										<Input
											id="companyName"
											name="companyName"
											value={formData.companyName}
											onChange={handleInputChange}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="gstNumber">GST Number</Label>
										<Input
											id="gstNumber"
											name="gstNumber"
											value={formData.gstNumber}
											onChange={handleInputChange}
										/>
									</div>
								</div>

								<div className="flex gap-2">
									<Button type="submit">Register Customer</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowForm(false)}
										className="bg-transparent">
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
					<Input
						placeholder="Search by name, phone, or company..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Customers List */}
				<Card>
					<CardHeader>
						<CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<p className="text-muted-foreground">Loading customers...</p>
						) : filteredCustomers.length === 0 ? (
							<p className="text-muted-foreground">No customers found</p>
						) : (
							<div className="space-y-4">
								{filteredCustomers.map((customer) => (
									<div
										key={customer._id}
										className="flex items-center justify-between p-4 border border-border rounded-lg">
										<div className="flex items-center gap-4">
											<div className="p-2 bg-accent rounded-lg">
												<User className="w-5 h-5" />
											</div>
											<div>
												<p className="font-semibold">
													{customer.firstName} {customer.lastName}
												</p>
												<p className="text-sm text-muted-foreground">
													{customer.phone}
												</p>
												{customer.companyName && (
													<p className="text-sm text-muted-foreground">
														{customer.companyName}
													</p>
												)}
											</div>
										</div>
										<Button variant="outline" size="sm">
											View Orders
										</Button>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthGuard>
	);
}
