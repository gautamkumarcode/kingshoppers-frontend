"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { Edit, Eye, Package, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Brand {
	_id: string;
	name: string;
	slug?: string;
	description?: string;
	logo?: string;
	logoPublicId?: string;
	isActive?: boolean;
	categories?: string[];
	productCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

export default function BrandsListPage() {
	const [brands, setBrands] = useState<Brand[]>([]);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState("");
	const [sortBy, setSortBy] = useState("name");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);
	const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
	const [editForm, setEditForm] = useState({
		name: "",
		description: "",
		isActive: true,
	});
	const [editFile, setEditFile] = useState<File | null>(null);
	const [editPreview, setEditPreview] = useState<string | null>(null);
	const [editSubmitting, setEditSubmitting] = useState(false);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const res = await api.get("/brands");
				const data = res.data?.data || res.data || [];
				setBrands(data);
			} catch (err) {
				console.error("Failed to load brands", err);
			} finally {
				setLoading(false);
			}
		};
		load();

		// Subscribe to BroadcastChannel for optimistic updates
		try {
			const bc = new BroadcastChannel("brands");
			bc.onmessage = (ev) => {
				const msg = ev.data;
				if (msg?.type === "created" && msg.brand) {
					setBrands((prev) => [msg.brand, ...prev]);
				}
				if (msg?.type === "updated" && msg.brand) {
					setBrands((prev) =>
						prev.map((b) => (b._id === msg.brand._id ? msg.brand : b))
					);
				}
				if (msg?.type === "deleted" && msg.id) {
					setBrands((prev) => prev.filter((b) => b._id !== msg.id));
				}
			};
			return () => bc.close();
		} catch (e) {
			// BroadcastChannel not available in some environments
		}
	}, []);

	// Derived filtered/sorted/paginated list
	const filtered = brands.filter((b) =>
		b.name.toLowerCase().includes(query.toLowerCase())
	);
	const sorted = filtered.sort((a, b) => {
		if (sortBy === "name") return a.name.localeCompare(b.name);
		if (sortBy === "-name") return b.name.localeCompare(a.name);
		if (sortBy === "createdAt")
			return (
				new Date(a.createdAt || 0).getTime() -
				new Date(b.createdAt || 0).getTime()
			);
		if (sortBy === "-createdAt")
			return (
				new Date(b.createdAt || 0).getTime() -
				new Date(a.createdAt || 0).getTime()
			);
		return a.name.localeCompare(b.name);
	});
	const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
	const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

	const handleEdit = (brand: Brand) => {
		setEditingBrand(brand);
		setEditForm({
			name: brand.name,
			description: brand.description || "",
			isActive: brand.isActive !== false,
		});
		setEditFile(null);
		setEditPreview(brand.logo || null);
	};

	const handleSaveEdit = async () => {
		if (!editingBrand) return;
		setEditSubmitting(true);
		try {
			// Use multipart form if a file is attached, otherwise send JSON
			let res;
			if (editFile) {
				const formData = new FormData();
				formData.append("name", editForm.name);
				formData.append("description", editForm.description);
				formData.append("isActive", String(editForm.isActive));
				formData.append("logo", editFile);
				res = await api.put(`/brands/update/${editingBrand._id}`, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				res = await api.put(`/brands/update/${editingBrand._id}`, editForm);
			}

			const updated = res.data?.data || res.data;
			setBrands((prev) =>
				prev.map((item) => (item._id === updated._id ? updated : item))
			);

			// Broadcast update
			try {
				const bc = new BroadcastChannel("brands");
				bc.postMessage({ type: "updated", brand: updated });
				bc.close();
			} catch (e) {}

			setEditingBrand(null);
			setEditFile(null);
			setEditPreview(null);
		} catch (err) {
			console.error(err);
			alert("Failed to update brand");
		} finally {
			setEditSubmitting(false);
		}
	};

	const handleDelete = async (brand: Brand) => {
		if (!confirm(`Delete "${brand.name}"? This action cannot be undone.`))
			return;

		// Optimistic remove
		setBrands((prev) => prev.filter((x) => x._id !== brand._id));

		try {
			await api.delete(`/brands/delete/${brand._id}`);
			try {
				const bc = new BroadcastChannel("brands");
				bc.postMessage({ type: "deleted", id: brand._id });
				bc.close();
			} catch (e) {}
		} catch (err) {
			console.error("Failed to delete brand", err);
			alert("Failed to delete brand");
			// Revert on failure
			setBrands((prev) => [brand, ...prev]);
		}
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="shrink-0 bg-white border-b shadow-sm -m-6 mb-6 p-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
							Brands
						</h1>
						<p className="text-gray-600 mt-1">Manage your product brands</p>
					</div>
					<Link href="/admin/brands/add">
						<Button className="w-full sm:w-auto">
							<Plus className="w-4 h-4 mr-2" />
							Add Brand
						</Button>
					</Link>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-7xl mx-auto pb-6 space-y-6">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Total Brands
										</p>
										<p className="text-2xl font-bold">{brands.length}</p>
									</div>
									<Package className="h-8 w-8 text-blue-600" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Active Brands
										</p>
										<p className="text-2xl font-bold">{brands.length}</p>
									</div>
									<Eye className="h-8 w-8 text-green-600" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											With Logos
										</p>
										<p className="text-2xl font-bold">
											{brands.filter((b) => b.logo).length}
										</p>
									</div>
									<Package className="h-8 w-8 text-purple-600" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filters and Search */}
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1 relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
									<Input
										placeholder="Search brands..."
										value={query}
										onChange={(e) => {
											setQuery(e.target.value);
											setPage(1);
										}}
										className="pl-10"
									/>
								</div>
								<div className="flex gap-2">
									<Select value={sortBy} onValueChange={setSortBy}>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="name">Name A-Z</SelectItem>
											<SelectItem value="-name">Name Z-A</SelectItem>
											<SelectItem value="-createdAt">Newest First</SelectItem>
											<SelectItem value="createdAt">Oldest First</SelectItem>
										</SelectContent>
									</Select>
									<Select
										value={pageSize.toString()}
										onValueChange={(value) => {
											setPageSize(Number(value));
											setPage(1);
										}}>
										<SelectTrigger className="w-20">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="6">6</SelectItem>
											<SelectItem value="12">12</SelectItem>
											<SelectItem value="24">24</SelectItem>
											<SelectItem value="48">48</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Brands Grid */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>All Brands ({filtered.length})</span>
								{loading && <LoadingSpinner size="sm" />}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex justify-center py-12">
									<LoadingSpinner size="lg" />
								</div>
							) : paged.length === 0 ? (
								<div className="text-center py-12">
									<Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<p className="text-lg font-medium text-gray-900 mb-2">
										No brands found
									</p>
									<p className="text-gray-600 mb-4">
										{query
											? "Try adjusting your search terms"
											: "Get started by creating your first brand"}
									</p>
									{!query && (
										<Link href="/admin/brands/add">
											<Button>
												<Plus className="w-4 h-4 mr-2" />
												Add Your First Brand
											</Button>
										</Link>
									)}
								</div>
							) : (
								<>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
										{paged.map((brand) => (
											<div
												key={brand._id}
												className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
												{/* Brand Logo/Image */}
												<div className="aspect-square mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
													{brand.logo ? (
														<img
															src={brand.logo}
															alt={brand.name}
															className="w-full h-full object-contain"
														/>
													) : (
														<div className="text-gray-400 text-center">
															<Package className="h-12 w-12 mx-auto mb-2" />
															<span className="text-sm">No Logo</span>
														</div>
													)}
												</div>

												{/* Brand Info */}
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<h3 className="font-semibold text-lg text-gray-900 truncate">
															{brand.name}
														</h3>
														{brand.isActive === false && (
															<span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
																Inactive
															</span>
														)}
													</div>
													{brand.slug && (
														<p className="text-sm text-gray-500 truncate">
															/{brand.slug}
														</p>
													)}
													{brand.description && (
														<p className="text-sm text-gray-600 line-clamp-2">
															{brand.description}
														</p>
													)}
												</div>

												{/* Actions */}
												<div className="flex gap-2 mt-4">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleEdit(brand)}
														className="flex-1">
														<Edit className="w-4 h-4 mr-1" />
														Edit
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() => handleDelete(brand)}>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</div>
										))}
									</div>

									{/* Pagination */}
									{totalPages > 1 && (
										<div className="flex items-center justify-between mt-6 pt-4 border-t">
											<p className="text-sm text-gray-600">
												Showing {(page - 1) * pageSize + 1} to{" "}
												{Math.min(page * pageSize, filtered.length)} of{" "}
												{filtered.length} brands
											</p>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => setPage((p) => Math.max(1, p - 1))}
													disabled={page === 1}>
													Previous
												</Button>
												<span className="flex items-center px-3 text-sm">
													Page {page} of {totalPages}
												</span>
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														setPage((p) => Math.min(totalPages, p + 1))
													}
													disabled={page === totalPages}>
													Next
												</Button>
											</div>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Edit Modal */}
			{editingBrand && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<Card className="w-full mx-auto max-w-lg">
						<CardHeader>
							<CardTitle>Edit Brand</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 overflow-y-auto">
							<div>
								<Label className="block mb-2">Brand Name</Label>
								<Input
									value={editForm.name}
									onChange={(e) =>
										setEditForm((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="Brand name"
									disabled={editSubmitting}
								/>
							</div>
							<div>
								<Label className="block mb-2">Description</Label>
								<Input
									value={editForm.description}
									onChange={(e) =>
										setEditForm((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder="Brand description"
									disabled={editSubmitting}
								/>
							</div>

							<div>
								<Label className="block mb-2">Logo</Label>
								<div className="flex flex-col items-center gap-4">
									<div className="w-40 h-40 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border">
										{editPreview ? (
											<img
												src={editPreview}
												alt="preview"
												className="w-full h-full object-contain"
											/>
										) : (
											<div className="text-gray-400 text-sm">No Logo</div>
										)}
									</div>
									<div>
										<input
											type="file"
											accept="image/*"
											onChange={(e) => {
												const f = e.target.files?.[0] || null;
												setEditFile(f);
												if (f) {
													setEditPreview(URL.createObjectURL(f));
												} else {
													setEditPreview(editingBrand?.logo || null);
												}
											}}
											disabled={editSubmitting}
										/>
										{editFile && (
											<div className="mt-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														setEditFile(null);
														setEditPreview(editingBrand?.logo || null);
													}}
													disabled={editSubmitting}>
													Remove Selected
												</Button>
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={editForm.isActive}
									onChange={(e) =>
										setEditForm((prev) => ({
											...prev,
											isActive: e.target.checked,
										}))
									}
									className="rounded"
									disabled={editSubmitting}
								/>
								<Label>Active Brand</Label>
							</div>
							<div className="flex gap-2 pt-4">
								<Button
									onClick={handleSaveEdit}
									className="flex-1"
									disabled={editSubmitting}>
									{editSubmitting ? (
										<>
											<LoadingSpinner size="sm" className="mr-2" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
								<Button
									variant="outline"
									onClick={() => setEditingBrand(null)}
									disabled={editSubmitting}>
									Cancel
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
