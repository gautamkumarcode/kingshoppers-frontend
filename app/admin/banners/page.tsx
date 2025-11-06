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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import {
	Calendar,
	Edit,
	Eye,
	EyeOff,
	Loader2,
	Plus,
	Search,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Banner {
	_id: string;
	title: string;
	description?: string;
	image: string;
	imagePublicId?: string;
	link?: string;
	bannerType: string;
	displayOrder: number;
	isActive: boolean;
	startDate?: string;
	endDate?: string;
	clickCount: number;
	createdAt: string;
}

export default function AdminBannersPage() {
	const [banners, setBanners] = useState<Banner[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
	const [showDialog, setShowDialog] = useState(false);
	const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
	const [saving, setSaving] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		image: "",
		imagePublicId: "",
		link: "",
		bannerType: "deal",
		displayOrder: 0,
		isActive: true,
		startDate: "",
		endDate: "",
	});

	useEffect(() => {
		fetchBanners();
	}, []);

	useEffect(() => {
		const filtered = banners.filter(
			(banner) =>
				banner.title.toLowerCase().includes(search.toLowerCase()) ||
				banner.bannerType.toLowerCase().includes(search.toLowerCase())
		);
		setFilteredBanners(filtered);
	}, [search, banners]);

	const fetchBanners = async () => {
		try {
			const response = await api.get("/banners/admin/all");
			setBanners(response.data.data || []);
		} catch (error) {
			console.error("Error fetching banners:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (banner?: Banner) => {
		if (banner) {
			setEditingBanner(banner);
			setFormData({
				title: banner.title,
				description: banner.description || "",
				image: banner.image,
				imagePublicId: banner.imagePublicId || "",
				link: banner.link || "",
				bannerType: banner.bannerType,
				displayOrder: banner.displayOrder,
				isActive: banner.isActive,
				startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
				endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
			});
		} else {
			setEditingBanner(null);
			setFormData({
				title: "",
				description: "",
				image: "",
				imagePublicId: "",
				link: "",
				bannerType: "deal",
				displayOrder: 0,
				isActive: true,
				startDate: "",
				endDate: "",
			});
		}
		setShowDialog(true);
	};

	const handleImageUpload = async (file: File) => {
		if (!file) return;
		const fd = new FormData();
		fd.append("images", file);
		try {
			setUploadingImage(true);
			const res = await api.post("/upload/images", fd, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			const uploaded = res.data?.files?.[0]?.url;
			const publicId = res.data?.files?.[0]?.publicId;
			if (uploaded) {
				setFormData((prev) => ({
					...prev,
					image: uploaded,
					imagePublicId: publicId || "",
				}));
			}
		} catch (err) {
			console.error("Image upload failed:", err);
			alert("Image upload failed. Please try again.");
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (uploadingImage)
			return alert("Please wait for the image upload to finish");
		if (!formData.title || !formData.image) {
			return alert("Title and Image are required");
		}

		setSaving(true);
		try {
			if (editingBanner) {
				await api.put(`/banners/${editingBanner._id}`, formData);
			} else {
				await api.post("/banners", formData);
			}
			await fetchBanners();
			setShowDialog(false);
		} catch (error) {
			console.error("Save failed:", error);
			alert("Failed to save banner");
		} finally {
			setSaving(false);
		}
	};

	const handleToggleStatus = async (id: string, currentStatus: boolean) => {
		try {
			await api.put(`/banners/${id}`, { isActive: !currentStatus });
			fetchBanners();
		} catch (error) {
			console.error("Error updating banner status:", error);
		}
	};

	const handleDelete = async (id: string, title: string) => {
		if (
			confirm(
				`Are you sure you want to delete "${title}"? This action cannot be undone.`
			)
		) {
			try {
				await api.delete(`/banners/${id}`);
				fetchBanners();
			} catch (error) {
				console.error("Error deleting banner:", error);
			}
		}
	};

	if (loading) {
		return <div className="p-6">Loading banners...</div>;
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold">Banner Management</h1>
					<p className="text-muted-foreground">
						Manage promotional banners and deals
					</p>
				</div>
				<Button onClick={() => handleOpenDialog()}>
					<Plus className="w-4 h-4 mr-2" />
					Add Banner
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Total Banners</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{banners.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Active Banners
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{banners.filter((b) => b.isActive).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Inactive Banners
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{banners.filter((b) => !b.isActive).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{banners.reduce((sum, b) => sum + b.clickCount, 0)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="p-4">
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search banners..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Edit/Create Dialog */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingBanner ? "Edit Banner" : "Create Banner"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSave} className="space-y-4 mt-4">
						<div>
							<Label>Title *</Label>
							<Input
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Banner title"
								required
							/>
						</div>

						<div>
							<Label>Description</Label>
							<Textarea
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Banner description"
								rows={3}
							/>
						</div>

						<div>
							<Label>Banner Image *</Label>
							<div className="flex items-center gap-4 mt-2">
								{formData.image ? (
									<div className="relative">
										<img
											src={formData.image}
											alt="Banner preview"
											className="w-full max-w-md h-32 rounded-md object-cover border"
										/>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											className="absolute top-2 right-2"
											onClick={() =>
												setFormData({
													...formData,
													image: "",
													imagePublicId: "",
												})
											}>
											<X className="w-4 h-4" />
										</Button>
									</div>
								) : (
									<div className="border-2 border-dashed rounded-md p-8 text-center w-full">
										<Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
										<input
											type="file"
											accept="image/*"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) handleImageUpload(file);
											}}
											className="hidden"
											id="banner-upload"
										/>
										<label
											htmlFor="banner-upload"
											className="cursor-pointer text-sm text-blue-600 hover:underline">
											Click to upload banner image
										</label>
									</div>
								)}
							</div>
							{uploadingImage && (
								<p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" /> Uploading...
								</p>
							)}
						</div>

						<div>
							<Label>Link (Optional)</Label>
							<Input
								value={formData.link}
								onChange={(e) =>
									setFormData({ ...formData, link: e.target.value })
								}
								placeholder="/products/123 or https://example.com"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>Banner Type</Label>
								<Select
									value={formData.bannerType}
									onValueChange={(value) =>
										setFormData({ ...formData, bannerType: value })
									}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="hero">Hero</SelectItem>
										<SelectItem value="deal">Deal</SelectItem>
										<SelectItem value="promotional">Promotional</SelectItem>
										<SelectItem value="category">Category</SelectItem>
										<SelectItem value="brand">Brand</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>Display Order</Label>
								<Input
									type="number"
									value={formData.displayOrder}
									onChange={(e) =>
										setFormData({
											...formData,
											displayOrder: parseInt(e.target.value) || 0,
										})
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>Start Date (Optional)</Label>
								<Input
									type="date"
									value={formData.startDate}
									onChange={(e) =>
										setFormData({ ...formData, startDate: e.target.value })
									}
								/>
							</div>

							<div>
								<Label>End Date (Optional)</Label>
								<Input
									type="date"
									value={formData.endDate}
									onChange={(e) =>
										setFormData({ ...formData, endDate: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								checked={formData.isActive}
								onChange={(e) =>
									setFormData({ ...formData, isActive: e.target.checked })
								}
								id="active-checkbox"
							/>
							<Label htmlFor="active-checkbox">Active</Label>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								variant="outline"
								type="button"
								onClick={() => setShowDialog(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={saving || uploadingImage}>
								{saving ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Saving...
									</>
								) : (
									"Save Banner"
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Banners Table */}
			<Card>
				<CardHeader>
					<CardTitle>Banners ({filteredBanners.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Banner</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Order</TableHead>
									<TableHead>Clicks</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredBanners.map((banner) => (
									<TableRow key={banner._id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<img
													src={banner.image}
													alt={banner.title}
													className="w-20 h-12 rounded object-cover"
												/>
												<div>
													<div className="font-medium">{banner.title}</div>
													{banner.description && (
														<div className="text-sm text-muted-foreground line-clamp-1">
															{banner.description}
														</div>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">{banner.bannerType}</Badge>
										</TableCell>
										<TableCell>{banner.displayOrder}</TableCell>
										<TableCell>
											<Badge variant="secondary">{banner.clickCount}</Badge>
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleToggleStatus(banner._id, banner.isActive)
												}
												className={
													banner.isActive ? "text-green-600" : "text-red-600"
												}>
												{banner.isActive ? (
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
												{new Date(banner.createdAt).toLocaleDateString()}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end space-x-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleOpenDialog(banner)}>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(banner._id, banner.title)}
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

					{filteredBanners.length === 0 && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								{search
									? "No banners found matching your search."
									: "No banners found."}
							</p>
							{!search && (
								<Button className="mt-4" onClick={() => handleOpenDialog()}>
									<Plus className="w-4 h-4 mr-2" />
									Add Your First Banner
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
