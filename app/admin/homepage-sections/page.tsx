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
	Edit,
	Eye,
	Loader2,
	MousePointerClick,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HomepageSection {
	_id: string;
	name: string;
	title: string;
	description?: string;
	image: string;
	imagePublicId?: string;
	link: string;
	displayOrder: number;
	isActive: boolean;
	sectionType: string;
	clickCount: number;
	createdAt: string;
	updatedAt: string;
}

export default function AdminHomepageSections() {
	const [sections, setSections] = useState<HomepageSection[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingSection, setEditingSection] = useState<HomepageSection | null>(
		null
	);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState("");
	const [uploading, setUploading] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		title: "",
		description: "",
		image: "",
		imagePublicId: "",
		link: "",
		displayOrder: 0,
		isActive: true,
		sectionType: "custom",
	});

	useEffect(() => {
		fetchSections();
	}, []);

	const fetchSections = async () => {
		try {
			setLoading(true);
			const response = await api.get("/homepage-sections/admin/all");
			setSections(response.data.data);
		} catch (error) {
			console.error("Error fetching sections:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);

			// Show preview immediately
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);

			// Upload image automatically
			const imageFormData = new FormData();
			imageFormData.append("images", file);

			try {
				setUploading(true);
				const response = await api.post("/upload/images", imageFormData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});

				console.log("Upload response:", response.data); // Debug log

				if (
					response.data &&
					response.data.files &&
					response.data.files.length > 0
				) {
					const uploadedUrl = response.data.files[0].url;
					// Update form data with uploaded image URL
					setFormData({ ...formData, image: uploadedUrl });
					console.log("Image uploaded successfully:", uploadedUrl);
				} else {
					throw new Error("No image URL returned from upload");
				}
			} catch (error) {
				console.error("Error uploading image:", error);
				alert("Failed to upload image. Please try again.");
				// Reset image selection on error
				setImageFile(null);
				setImagePreview("");
			} finally {
				setUploading(false);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// Validate that we have an image URL
			if (!formData.image) {
				alert("Please select an image");
				return;
			}

			const submitData = {
				...formData,
			};

			if (editingSection) {
				await api.put(`/homepage-sections/${editingSection._id}`, submitData);
			} else {
				await api.post("/homepage-sections", submitData);
			}

			setDialogOpen(false);
			resetForm();
			fetchSections();
			alert(
				editingSection
					? "Section updated successfully!"
					: "Section created successfully!"
			);
		} catch (error) {
			console.error("Error saving section:", error);
			alert("Failed to save section. Please try again.");
		}
	};

	const handleEdit = (section: HomepageSection) => {
		setEditingSection(section);
		setFormData({
			name: section.name,
			title: section.title,
			description: section.description || "",
			image: section.image,
			imagePublicId: section.imagePublicId || "",
			link: section.link,
			displayOrder: section.displayOrder,
			isActive: section.isActive,
			sectionType: section.sectionType,
		});
		setImagePreview(section.image);
		setDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this section?")) {
			try {
				await api.delete(`/homepage-sections/${id}`);
				fetchSections();
			} catch (error) {
				console.error("Error deleting section:", error);
			}
		}
	};

	const toggleActive = async (section: HomepageSection) => {
		try {
			await api.put(`/homepage-sections/${section._id}`, {
				isActive: !section.isActive,
			});
			fetchSections();
		} catch (error) {
			console.error("Error toggling active status:", error);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			title: "",
			description: "",
			image: "",
			imagePublicId: "",
			link: "",
			displayOrder: 0,
			isActive: true,
			sectionType: "custom",
		});
		setEditingSection(null);
		setImageFile(null);
		setImagePreview("");
	};

	const filteredSections = sections.filter((section) => {
		const matchesSearch =
			section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			section.title.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesType =
			filterType === "all" || section.sectionType === filterType;
		return matchesSearch && matchesType;
	});

	const stats = {
		total: sections.length,
		active: sections.filter((s) => s.isActive).length,
		inactive: sections.filter((s) => !s.isActive).length,
		totalClicks: sections.reduce((acc, s) => acc + s.clickCount, 0),
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Homepage Sections</h1>
					<p className="text-muted-foreground">
						Manage your homepage category cards
					</p>
				</div>
				<Button onClick={() => setDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Section
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Sections
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active</CardTitle>
						<Eye className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.active}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Inactive</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.inactive}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
						<MousePointerClick className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalClicks}</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search sections..."
								className="pl-8"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Select value={filterType} onValueChange={setFilterType}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Filter by type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="brands">Brands</SelectItem>
								<SelectItem value="category">Category</SelectItem>
								<SelectItem value="high-margin">High Margin</SelectItem>
								<SelectItem value="regional-brands">Regional Brands</SelectItem>
								<SelectItem value="custom">Custom</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Sections Table */}
			<Card>
				<CardContent className="pt-6">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Image</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Order</TableHead>
								<TableHead>Clicks</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredSections.map((section) => (
								<TableRow key={section._id}>
									<TableCell>
										<div className="relative h-16 w-24 overflow-hidden rounded-md">
											<Image
												src={section.image}
												alt={section.name}
												fill
												className="object-cover"
											/>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<div className="font-medium">{section.name}</div>
											<div className="text-sm text-muted-foreground">
												{section.title}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{section.sectionType.replace("-", " ")}
										</Badge>
									</TableCell>
									<TableCell>{section.displayOrder}</TableCell>
									<TableCell>{section.clickCount}</TableCell>
									<TableCell>
										<Button
											variant={section.isActive ? "default" : "secondary"}
											size="sm"
											onClick={() => toggleActive(section)}>
											{section.isActive ? "Active" : "Inactive"}
										</Button>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEdit(section)}>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(section._id)}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Add/Edit Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingSection ? "Edit Section" : "Add New Section"}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="sectionType">Section Type *</Label>
								<Select
									value={formData.sectionType}
									onValueChange={(value) =>
										setFormData({ ...formData, sectionType: value })
									}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="brands">Brands</SelectItem>
										<SelectItem value="category">Category</SelectItem>
										<SelectItem value="high-margin">
											High Margin Store
										</SelectItem>
										<SelectItem value="regional-brands">
											Regional Brands Store
										</SelectItem>
										<SelectItem value="custom">Custom</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="link">Link *</Label>
							<Input
								id="link"
								value={formData.link}
								onChange={(e) =>
									setFormData({ ...formData, link: e.target.value })
								}
								placeholder="/categories/brands"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="displayOrder">Display Order</Label>
							<Input
								id="displayOrder"
								type="number"
								value={formData.displayOrder}
								onChange={(e) =>
									setFormData({
										...formData,
										displayOrder: parseInt(e.target.value),
									})
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="image">Image *</Label>
							<div className="flex items-center gap-4">
								<Input
									id="image"
									type="file"
									accept="image/*"
									onChange={handleImageSelect}
									disabled={uploading}
								/>
								{uploading && (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Loader2 className="h-4 w-4 animate-spin" />
										Uploading...
									</div>
								)}
								{imagePreview && !uploading && (
									<div className="relative h-20 w-20 overflow-hidden rounded-md border">
										<Image
											src={imagePreview}
											alt="Preview"
											fill
											className="object-cover"
										/>
									</div>
								)}
							</div>
							{formData.image && (
								<p className="text-xs text-green-600">
									✓ Image uploaded successfully
								</p>
							)}
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="isActive"
								checked={formData.isActive}
								onChange={(e) =>
									setFormData({ ...formData, isActive: e.target.checked })
								}
								className="h-4 w-4"
							/>
							<Label htmlFor="isActive">Active</Label>
						</div>

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setDialogOpen(false);
									resetForm();
								}}
								disabled={uploading}>
								Cancel
							</Button>
							<Button type="submit" disabled={uploading || !formData.image}>
								{uploading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Uploading Image...
									</>
								) : (
									<>{editingSection ? "Update Section" : "Create Section"}</>
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
