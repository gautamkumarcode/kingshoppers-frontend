"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// ✅ Validation Schema
const productSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	description: z.string().optional(),
	category: z.string().optional(),
	images: z.array(z.string()).optional(),
	isFeatured: z.boolean().optional(), // only one can be selected
	thumbnail: z.string().optional(),
});

type FormValues = z.infer<typeof productSchema>;

interface Category {
	_id: string;
	name: string;
	category?: string;
	parentCategory?: string | null;
	uploadedImages?: string;
	loadingImages?: string;
	submitting?: Boolean;
}
export default function CreateProductPage() {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const [loadingImages, setLoadeImages] = useState(false);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<FormValues>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: "",
			description: "",
			category: "",
			isFeatured: false,
			images: [],
		},
	});

	// ✅ Load categories
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const res = await api.get("/categories");
				setCategories(res.data.data || []);
			} catch (error) {
				console.error("Failed to load categories:", error);
			}
		};
		loadCategories();
	}, []);

	// ✅ Submit form
	const onSubmit = async (data: FormValues) => {
		setSubmitting(true);
		try {
			await api.post("/categories/create", {
				...data,
				parentCategory: data.category,
				image: uploadedImages[0],
				thumbnail: uploadedImages[0] || "",

				isFeatured: data.isFeatured,
			});
			router.push("/admin/category");
		} catch (err: any) {
			console.error("Failed to create product", err);
			alert(err?.response?.data?.message || "Failed to create product");
		} finally {
			setSubmitting(false);
		}
	};

	// ✅ Image upload logic
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		for (const file of files) {
			if (file.size > 5 * 1024 * 1024) {
				alert(`File ${file.name} is too large. Max size 5MB.`);
				continue;
			}
			const formData = new FormData();
			formData.append("images", file);
			try {
				setLoadeImages(true);
				const res = await api.post("/upload/images", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				const uploaded = res.data?.files || [];
				if (uploaded.length > 0) {
					const url = uploaded[0].url;
					setUploadedImages((prev) => {
						const next = [...prev, url];
						setValue("images", next);
						if (prev.length === 0) setValue("thumbnail", url);
						return next;
					});
				}
			} catch (error) {
				console.error("Upload failed:", error);
				alert("Upload failed. Please try again.");
			} finally {
				setLoadeImages(false);
			}
		}
	};

	const removeImage = (index: number) => {
		const newImages = uploadedImages.filter((_, i) => i !== index);
		setUploadedImages(newImages);
		setValue("images", newImages);
		if (index === 0 && newImages.length > 0) {
			setValue("thumbnail", newImages[0]);
		}
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="shrink-0 bg-white border-b shadow-sm -m-6 mb-6 p-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ">
						Create Category
					</h1>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => router.back()}>
							Cancel
						</Button>
						<Button
							type="submit"
							form="product-form"
							disabled={submitting}
							className="min-w-[120px] bg-green-600">
							{submitting ? "Creating..." : "Create Category"}
						</Button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-5xl mx-auto pb-6">
					<form
						id="product-form"
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6">
						{/* Basic Info */}
						<Card>
							<CardHeader>
								<CardTitle>Basic Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="sm:col-span-2">
										<Label htmlFor="name">Category Name *</Label>
										<Input
											id="name"
											{...register("name")}
											placeholder="Enter category name"
										/>
										{errors.name && (
											<p className="text-sm text-red-500 mt-1">
												{errors.name.message}
											</p>
										)}
									</div>

									<div>
										<Label>Parent Category *</Label>
										<Controller
											control={control}
											name="category"
											render={({ field }) => (
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<SelectTrigger>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
													<SelectContent>
														{categories.map((cat) => (
															<SelectItem key={cat._id} value={cat._id}>
																{cat.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
										/>
										{errors.category && (
											<p className="text-sm text-red-500 mt-1">
												{errors.category.message}
											</p>
										)}
									</div>
								</div>

								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										{...register("description")}
										placeholder="category details"
										rows={4}
										className="resize-none"
									/>
								</div>

								<div className="flex items-center space-x-6">
									{/* isActive checkbox */}

									{/* isFeatured checkbox */}
									<Controller
										control={control}
										name="isFeatured"
										render={({ field }) => (
											<label className="flex items-center space-x-2">
												<input
													type="checkbox"
													checked={field.value}
													onChange={(e) => field.onChange(e.target.checked)}
												/>
												<span>isFeatured</span>
											</label>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* ✅ Image Upload Section */}
						<Card>
							<CardHeader>
								<CardTitle>Category Image</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors flex items-center justify-center min-h-[180px]">
									<input
										type="file"
										accept="image/*"
										onChange={handleImageUpload}
										disabled={uploadedImages.length > 0}
										className="hidden"
										id="image-upload"
									/>
									{loadingImages ? (
										<Loader className="animate-spin" />
									) : (
										<label htmlFor="image-upload" className="cursor-pointer ">
											<Upload className="mx-auto h-12 w-12 text-gray-400" />
											<p className="mt-2 text-sm text-gray-600">
												Click to upload image
											</p>
											<p className="text-xs text-gray-500">
												PNG, JPG up to 5MB
											</p>
										</label>
									)}
								</div>

								{uploadedImages.length > 0 && (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
										{uploadedImages.map((url, index) => (
											<div key={index} className="relative group">
												<img
													src={url}
													alt={`Product ${index + 1}`}
													className="w-full h-24 sm:h-32 object-cover rounded-lg border"
												/>
												<Button
													type="button"
													variant="destructive"
													size="sm"
													className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={() => removeImage(index)}>
													<X className="h-3 w-3" />
												</Button>
												{index === 0 && (
													<span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
														Thumbnail
													</span>
												)}
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</form>
				</div>
			</div>

			{/* Mobile Submit */}
			<div className="shrink-0 bg-white border-t p-4 sm:hidden -m-6 mt-6">
				<Button
					type="submit"
					form="product-form"
					disabled={submitting}
					className="w-full">
					{submitting ? "Creating..." : "Create Category"}
				</Button>
			</div>
		</div>
	);
}
