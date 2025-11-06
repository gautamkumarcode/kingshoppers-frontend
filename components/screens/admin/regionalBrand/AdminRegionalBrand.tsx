"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
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
import api from "@/lib/api";
import {
	Calendar,
	Edit,
	Eye,
	EyeOff,
	Loader2,
	MapPin,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RegionalBrand {
	_id: string;
	name: string;
	slug: string;
	description: string;
	region: string;
	logo?: string;
	logoPublicId?: string;
	isActive: boolean;
	establishedYear?: number;
	specialties: string[];
	productCount?: number;
	createdAt: string;
	updatedAt: string;
}

function AdminRegionalBrandPage() {
	const [regionalBrands, setRegionalBrands] = useState<RegionalBrand[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filteredBrands, setFilteredBrands] = useState<RegionalBrand[]>([]);
	const [editingBrand, setEditingBrand] = useState<RegionalBrand | null>(null);
	const [saving, setSaving] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);

	useEffect(() => {
		fetchRegionalBrands();
	}, []);

	useEffect(() => {
		const filtered = regionalBrands.filter(
			(brand) =>
				brand.name.toLowerCase().includes(search.toLowerCase()) ||
				brand.region.toLowerCase().includes(search.toLowerCase()) ||
				brand.description.toLowerCase().includes(search.toLowerCase())
		);
		setFilteredBrands(filtered);
	}, [search, regionalBrands]);

	const fetchRegionalBrands = async () => {
		try {
			const response = await api.get("/regional-brands/admin");
			const data = await response.data;
			setRegionalBrands(data.regionalBrands || []);
		} catch (error) {
			console.error("Error fetching regional brands:", error);
		} finally {
			setLoading(false);
		}
	};

	// ✅ Save edited regional brand
	const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingBrand) return;
		if (uploadingImage)
			return alert("Please wait for the image upload to finish");
		setSaving(true);
		try {
			const payload: Partial<RegionalBrand> = {
				name: editingBrand.name,
				description: editingBrand.description,
				region: editingBrand.region,
				logo: editingBrand.logo,
				isActive: editingBrand.isActive,
				establishedYear: editingBrand.establishedYear,
			};

			await api.patch(`/regional-brands/${editingBrand._id}`, payload);
			await fetchRegionalBrands();
			setEditingBrand(null);
		} catch (error) {
			console.error("Update failed:", error);
			alert("Failed to update regional brand");
		} finally {
			setSaving(false);
		}
	};

	// Image upload for edit modal
	const handleEditImageUpload = async (file?: File) => {
		if (!file || !editingBrand) return;
		const fd = new FormData();
		fd.append("images", file);
		try {
			setUploadingImage(true);
			const res = await api.post("/upload/images", fd, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			const uploaded = res.data?.files?.[0]?.url;
			const publicId =
				res.data?.files?.[0]?.publicId || res.data?.files?.[0]?.publicId;
			if (uploaded) {
				setEditingBrand({
					...editingBrand,
					logo: uploaded,
					logoPublicId: publicId,
				});
			}
		} catch (err) {
			console.error("Image upload failed:", err);
			alert("Image upload failed. Please try again.");
		} finally {
			setUploadingImage(false);
		}
	};

	const handleToggleStatus = async (id: string, currentStatus: boolean) => {
		try {
			const response = await api.patch(`/regional-brands/${id}`, {
				isActive: !currentStatus,
			});

			if (response.status === 200) {
				fetchRegionalBrands();
			}
		} catch (error) {
			console.error("Error updating regional brand status:", error);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (
			confirm(
				`Are you sure you want to delete "${name}"? This action cannot be undone.`
			)
		) {
			try {
				const response = await api.delete(`/regional-brands/${id}`);

				if (response.status === 200) {
					fetchRegionalBrands();
				}
			} catch (error) {
				console.error("Error deleting regional brand:", error);
			}
		}
	};

	if (loading) {
		return <div className="p-6">Loading regional brands...</div>;
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold">
						Regional Brand Management
					</h1>
					<p className="text-muted-foreground">
						Manage regional brands and their information
					</p>
				</div>
				<Link href="/admin/regional-brands/add">
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Add Regional Brand
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Total Brands</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{regionalBrands.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Active Brands</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{regionalBrands.filter((b) => b.isActive).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Inactive Brands
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{regionalBrands.filter((b) => !b.isActive).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Regions Covered
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{new Set(regionalBrands.map((b) => b.region)).size}
						</div>
					</CardContent>
				</Card>
			</div>
			{/* Search and Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center space-x-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search regional brands..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog
				open={!!editingBrand}
				onOpenChange={(open) => {
					if (!open) setEditingBrand(null);
				}}>
				<DialogContent className="max-w-lg w-full">
					<DialogHeader>
						<DialogTitle>Edit Regional Brand</DialogTitle>
					</DialogHeader>
					{editingBrand && (
						<form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
							<div>
								<Label>Name</Label>
								<Input
									value={editingBrand.name || ""}
									onChange={(e) =>
										setEditingBrand({ ...editingBrand, name: e.target.value })
									}
								/>
							</div>

							<div>
								<Label>Description</Label>
								<textarea
									className="w-full rounded-md border p-2"
									value={editingBrand.description || ""}
									onChange={(e) =>
										setEditingBrand({
											...editingBrand,
											description: e.target.value,
										})
									}
								/>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={editingBrand.isActive || false}
									onChange={(e) =>
										setEditingBrand({
											...editingBrand,
											isActive: e.target.checked,
										})
									}
								/>
								<span>Active</span>
							</div>

							<div>
								<Label>Logo</Label>
								<div className="flex items-center gap-4 mt-2">
									{editingBrand.logo ? (
										<img
											src={editingBrand.logo}
											alt="Logo"
											className="w-20 h-20 rounded-md object-cover border"
										/>
									) : (
										<span className="text-sm text-muted-foreground">
											No image
										</span>
									)}

									<div className="flex flex-col">
										<input
											type="file"
											accept="image/*"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (!file) return;
												handleEditImageUpload(file);
											}}
										/>
										{uploadingImage && (
											<span className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
												<Loader2 className="w-4 h-4 animate-spin" />{" "}
												Uploading...
											</span>
										)}
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<Button
									variant="outline"
									type="button"
									onClick={() => setEditingBrand(null)}>
									Cancel
								</Button>
								<Button type="submit" disabled={saving || uploadingImage}>
									{saving ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin mr-2" />
											Saving...
										</>
									) : uploadingImage ? (
										"Uploading..."
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>

			{/* Regional Brands Table */}
			<Card>
				<CardHeader>
					<CardTitle>Regional Brands ({filteredBrands.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Mobile list: cards for small screens */}
					<div className="space-y-4 md:hidden">
						{filteredBrands.map((brand) => (
							<Card key={brand._id}>
								<CardContent>
									<div className="flex items-start justify-between">
										<div className="flex items-center space-x-3">
											{brand.logo && (
												<img
													src={brand.logo}
													alt={brand.name}
													className="w-12 h-12 rounded-lg object-cover"
												/>
											)}
											<div>
												<div className="font-medium text-sm">{brand.name}</div>
												<div className="text-xs text-muted-foreground">
													{brand.region}
												</div>
												{brand.establishedYear && (
													<div className="text-xs text-muted-foreground">
														Est. {brand.establishedYear}
													</div>
												)}
											</div>
										</div>

										<div className="text-right">
											<Badge variant="secondary" className="text-xs">
												{brand.productCount || 0} products
											</Badge>
											<div className="text-xs text-muted-foreground mt-1">
												{new Date(brand.createdAt).toLocaleDateString()}
											</div>
										</div>
									</div>

									<div className="flex items-center justify-between mt-3">
										<div className="flex flex-wrap gap-1">
											{brand.specialties.slice(0, 3).map((s, i) => (
												<Badge key={i} variant="outline" className="text-xs">
													{s}
												</Badge>
											))}
											{brand.specialties.length > 3 && (
												<Badge variant="outline" className="text-xs">
													+{brand.specialties.length - 3}
												</Badge>
											)}
										</div>

										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setEditingBrand(brand)}>
												<Edit className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(brand._id, brand.name)}
												className="text-red-600 hover:text-red-700">
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Desktop table: hidden on small screens */}
					<div className="hidden md:block overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Brand</TableHead>
									<TableHead>Region</TableHead>
									<TableHead>Specialties</TableHead>
									<TableHead>Products</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredBrands.map((brand) => (
									<TableRow key={brand._id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												{brand.logo && (
													<img
														src={brand.logo}
														alt={brand.name}
														className="w-10 h-10 rounded-lg object-cover"
													/>
												)}
												<div>
													<div className="font-medium">{brand.name}</div>
													<div className="text-sm text-muted-foreground">
														{brand.slug}
													</div>
													{brand.establishedYear && (
														<div className="text-xs text-muted-foreground">
															Est. {brand.establishedYear}
														</div>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												<MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
												{brand.region}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1">
												{brand.specialties
													.slice(0, 2)
													.map((specialty, index) => (
														<Badge
															key={index}
															variant="outline"
															className="text-xs">
															{specialty}
														</Badge>
													))}
												{brand.specialties.length > 2 && (
													<Badge variant="outline" className="text-xs">
														+{brand.specialties.length - 2}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary">
												{brand.productCount || 0} products
											</Badge>
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleToggleStatus(brand._id, brand.isActive)
												}
												className={
													brand.isActive ? "text-green-600" : "text-red-600"
												}>
												{brand.isActive ? (
													<>
														<Eye className="w-4 h-4 mr-1" />
														Active
													</>
												) : (
													<>
														<EyeOff className="w-4 h-4 mr-1" />
														Inactive
													</>
												)}
											</Button>
										</TableCell>
										<TableCell>
											<div className="flex items-center text-sm text-muted-foreground">
												<Calendar className="w-4 h-4 mr-1" />
												{new Date(brand.createdAt).toLocaleDateString()}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end space-x-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setEditingBrand(brand)}>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(brand._id, brand.name)}
													className="text-red-600 hover:text-red-700">
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{filteredBrands.length === 0 && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								{search
									? "No regional brands found matching your search."
									: "No regional brands found."}
							</p>
							{!search && (
								<Link href="/admin/regional-brands/add">
									<Button className="mt-4">
										<Plus className="w-4 h-4 mr-2" />
										Add Your First Regional Brand
									</Button>
								</Link>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default AdminRegionalBrandPage;
