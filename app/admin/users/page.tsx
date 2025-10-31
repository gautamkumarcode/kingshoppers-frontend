"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { apiCall } from "@/lib/auth";
import { UserListResponse } from "@/types/admin-types/user";
import { CheckCircle, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersPage() {
	const { toast } = useToast();
	const [users, setUsers] = useState<UserListResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const response = await api.get("/admin/users");
			console.log(response.data);
			setUsers(response.data.data);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleApproveUser = async (userId: string) => {
		try {
			const response = await apiCall(`/admin/users/${userId}/approve`, {
				method: "PUT",
			});

			if (!response.ok) {
				throw new Error("Failed to approve user");
			}

			toast({
				title: "Success",
				description: "User approved successfully",
			});

			fetchUsers();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to approve user",
				variant: "destructive",
			});
		}
	};

	const filteredUsers = users.filter(
		(user) =>
			user.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
			user.phone?.includes(search) ||
			user.email?.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Users Management</h1>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
				<Input
					placeholder="Search by name, phone, or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Users ({filteredUsers.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-muted-foreground">Loading users...</p>
					) : filteredUsers.length === 0 ? (
						<p className="text-muted-foreground">No users found</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="border-b border-border">
									<tr>
										<th className="text-left py-3 px-4">Name</th>
										<th className="text-left py-3 px-4">Phone</th>
										<th className="text-left py-3 px-4">Type</th>
										<th className="text-left py-3 px-4">Shop name</th>
										<th className="text-left py-3 px-4">Status</th>
										<th className="text-left py-3 px-4">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredUsers.map((user) => (
										<tr
											key={user._id}
											className="border-b border-border hover:bg-accent/50">
											<td className="py-3 px-4">
												<div>
													<p className="font-semibold">{user.ownerName}</p>
													<p className="text-xs text-muted-foreground">
														{user.email}
													</p>
												</div>
											</td>
											<td className="py-3 px-4">{user.phone}</td>
											<td className="py-3 px-4">
												<span className="capitalize text-xs bg-accent px-2 py-1 rounded">
													{user.userTypes}
												</span>
											</td>
											<td className="py-3 px-4">{user.shopName || "-"}</td>
											<td className="py-3 px-4">
												{user.isApproved ? (
													<div className="flex items-center gap-1 text-green-600">
														<CheckCircle className="w-4 h-4" />
														<span>Approved</span>
													</div>
												) : (
													<div className="flex items-center gap-1 text-yellow-600">
														<XCircle className="w-4 h-4" />
														<span>Pending</span>
													</div>
												)}
											</td>
											<td className="py-3 px-4">
												{!user.isApproved && user.userTypes === "customer" && (
													<Button
														size="sm"
														onClick={() => handleApproveUser(user._id)}>
														Approve
													</Button>
												)}
												{user.userTypes === "customer" && (
													<Button size="sm">Block</Button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
