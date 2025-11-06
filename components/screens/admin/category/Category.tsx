"use client";

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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { CategoryResponseType } from "@/types/admin-types/category-types";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductsPage() {
	const [categories, setCategories] = useState<CategoryResponseType[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [editingCategory, setEditingCategory] =
		useState<CategoryResponseType | null>(null);
	const [saving, setSaving] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const router = useRouter();

	// ✅ Load categories
	const fetchCategories = async () => {
		try {
			const response = await api.get("/categories");
			const data = response;
			setCategories(data.data.data || []);
		} catch (error) {
			console.error("Failed to fetch categories:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	// ✅ Delete category
	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this category?")) return;
		try {
			await api.delete(`/categories/${id}`);
			setCategories((prev) => prev.filter((cat) => cat._id !== id));
		} catch (error) {
			console.error("Failed to delete category:", error);
			alert("Failed to delete category");
		}
	};

	// ✅ Save edited category
	const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingCategory) return;
		// Prevent saving while image is uploading
		if (uploadingImage)
			return alert("Please wait for the image upload to finish");
		setSaving(true);
		try {
			const payload: Partial<typeof editingCategory> = {
				name: editingCategory.name,
				description: editingCategory.description,
				isActive: editingCategory.isActive,
				image: editingCategory.image,
			};

			await api.put(`/categories/${editingCategory._id}`, payload);
			await fetchCategories();
			setEditingCategory(null);
		} catch (error) {
			console.error("Update failed:", error);
			alert("Failed to update category");
		} finally {
			setSaving(false);
		}
	};

	// ✅ Filter categories
	const filteredCategories = categories.filter((cat) =>
		cat.name?.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Categories</h1>
				<Button onClick={() => router.push("/admin/category/add")}>
					<Plus className="w-4 h-4 mr-2" />
					Add Category
				</Button>
			</div>
			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
				<Input
					placeholder="Search by category name..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Categories ({filteredCategories.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-muted-foreground">Loading categories...</p>
					) : filteredCategories.length === 0 ? (
						<p className="text-muted-foreground">No categories found</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="border-b border-border">
									<tr>
										<th className="text-left py-3 px-4">Name</th>
										<th className="text-left py-3 px-4">Image</th>
										<th className="text-left py-3 px-4">Description</th>
										<th className="text-left py-3 px-4">Status</th>
										<th className="textleft py-3 px-4 text-center">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredCategories.map((cat) => (
										<tr
											key={cat._id}
											className="border-b border-border hover:bg-accent/50">
											<td className="py-3 px-4 font-medium">{cat.name}</td>
											<td className="py-3 px-4">
												{cat.image ? (
													<img
														src={cat.image}
														alt={cat.name}
														className="w-16 h-16 object-cover rounded-md border"
													/>
												) : (
													"-"
												)}
											</td>
											<td className="py-3 px-4">{cat.description || "-"}</td>
											<td className="py-3 px-4">
												<span
													className={`text-xs px-2 py-1 rounded ${
														cat.isActive
															? "bg-green-100 text-green-600"
															: "bg-red-100 text-red-600"
													}`}>
													{cat.isActive ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="py-3 px-4 flex gap-2 justify-center">
												{/* Edit Button */}
												<Button
													size="sm"
													variant="outline"
													onClick={() => setEditingCategory(cat)}>
													<Edit className="w-4 h-4" />
												</Button>

												{/* Delete Button */}
												<Button
													size="sm"
													variant="outline"
													className="text-destructive hover:bg-destructive/10"
													onClick={() => handleDelete(cat._id)}>
													<Trash2 className="w-4 h-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* ✅ Edit Modal */}
			<Dialog
				open={!!editingCategory}
				onOpenChange={(open) => {
					if (!open) setEditingCategory(null);
				}}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Edit Category</DialogTitle>
					</DialogHeader>

					{editingCategory && (
						<form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
							<div>
								<Label>Name</Label>
								<Input
									value={editingCategory.name || ""}
									onChange={(e) =>
										setEditingCategory({
											...editingCategory,
											name: e.target.value,
										})
									}
								/>
							</div>

							<div>
								<Label>Description</Label>
								<Textarea
									value={editingCategory.description || ""}
									onChange={(e) =>
										setEditingCategory({
											...editingCategory,
											description: e.target.value,
										})
									}
								/>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={editingCategory.isActive || false}
									onChange={(e) =>
										setEditingCategory({
											...editingCategory,
											isActive: e.target.checked,
										})
									}
								/>
								<span>Active</span>
							</div>

							{/* ✅ Image Upload Section - moved above actions for clarity */}
							<div>
								<Label>Image</Label>
								<div className="flex items-center gap-4 mt-2">
									{editingCategory.previewImage || editingCategory.image ? (
										<img
											src={
												editingCategory.previewImage || editingCategory.image
											}
											alt="Preview"
											className="w-20 h-20 rounded-md border object-cover"
										/>
									) : (
										<span className="text-sm text-muted-foreground">
											No image
										</span>
									)}

									<div className="flex flex-col">
										<Input
											type="file"
											accept="image/*"
											onChange={async (e) => {
												const file = e.target.files?.[0];
												if (!file) return;

												// 🟡 Upload to backend (like in your create page)
												const formData = new FormData();
												formData.append("images", file);

												try {
													setUploadingImage(true);
													const res = await api.post(
														"/upload/images",
														formData,
														{
															headers: {
																"Content-Type": "multipart/form-data",
															},
														}
													);
													const uploaded = res.data?.files?.[0]?.url;
													if (uploaded) {
														setEditingCategory({
															...editingCategory,
															image: uploaded,
															previewImage: uploaded,
														});
													}
												} catch (err) {
													console.error("Image upload failed:", err);
													alert("Image upload failed");
												} finally {
													setUploadingImage(false);
												}
											}}
										/>
										{uploadingImage && (
											<span className="text-sm text-muted-foreground mt-1">
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
									onClick={() => setEditingCategory(null)}>
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
		</div>
	);
}
