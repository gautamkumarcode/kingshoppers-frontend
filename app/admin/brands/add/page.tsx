"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Check, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const brandSchema = z.object({
	name: z
		.string()
		.min(1, "Brand name is required")
		.max(100, "Brand name too long"),
	slug: z.string().optional(),
	description: z.string().max(500, "Description too long").optional(),
	logo: z.string().optional(),
	logoPublicId: z.string().optional(),
	isActive: z.boolean(),
	categories: z.array(z.string()),
});

type FormValues = z.infer<typeof brandSchema>;

interface Category {
	_id: string;
	name: string;
}

export default function AddBrandPage() {
	const router = useRouter();
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		control,
		formState: { errors, isValid },
	} = useForm<FormValues>({
		resolver: zodResolver(brandSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			logo: "",
			logoPublicId: "",
			isActive: true,
			categories: [],
		},
	});

	const watchedName = watch("name");
	const watchedLogo = watch("logo");

	// Load categories
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const res = await api.get("/categories");
				const data = res.data?.data || res.data || [];
				setCategories(data);
			} catch (err) {
				console.error("Failed to load categories", err);
			}
		};
		loadCategories();
	}, []);

	// Auto-generate slug from name
	useEffect(() => {
		if (watchedName) {
			const slug = watchedName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
			setValue("slug", slug);
		}
	}, [watchedName, setValue]);

	const onSubmit = async (data: FormValues) => {
		setSubmitting(true);
		try {
			const res = await api.post("/brands/create", data);
			const created = res.data?.data || res.data;

			router.push("/admin/brands");
			// Broadcast optimistic update to list page(s)
			try {
				const bc = new BroadcastChannel("brands");
				bc.postMessage({ type: "created", brand: created });
				bc.close();
			} catch (e) {
				// ignore
			}

			// Show success state
			setSuccess(true);

			// Reset form after a delay
			setTimeout(() => {
				reset();
				setValue("logo", "");
				setValue("logoPublicId", "");
				setValue("categories", []);
				setSuccess(false);
			}, 2000);
		} catch (err: any) {
			console.error("Failed to create brand", err);
			alert(
				err?.response?.data?.message || err?.message || "Failed to create brand"
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			alert("File too large (max 5MB)");
			return;
		}

		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		try {
			setUploading(true);
			const formData = new FormData();
			formData.append("images", file);
			const res = await api.post("/upload/images", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			const uploaded = res.data?.files || [];
			if (uploaded.length > 0) {
				setValue("logo", uploaded[0].url);
				setValue("logoPublicId", uploaded[0].publicId || "");
			} else {
				alert("Upload failed");
			}
		} catch (err) {
			console.error("Image upload failed", err);
			alert("Image upload failed");
		} finally {
			setUploading(false);
		}
	};

	const removeLogo = () => {
		setValue("logo", "");
		setValue("logoPublicId", "");
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="shrink-0 bg-white border-b shadow-sm -m-6 mb-6 p-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-4">
						<Link href="/admin/brands">
							<Button variant="outline" size="sm">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Brands
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
								Add New Brand
							</h1>
							<p className="text-gray-600 mt-1">
								Create a new brand for your products
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-4xl mx-auto pb-6">
					<form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									Basic Information
									{success && <Check className="w-5 h-5 text-green-600" />}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<Label htmlFor="name" className="block mb-2">
												Brand Name *
											</Label>
											<Input
												id="name"
												{...register("name")}
												placeholder="Enter brand name"
												className={errors.name ? "border-red-500" : ""}
											/>
											{errors.name && (
												<p className="text-sm text-red-500 mt-1 flex items-center gap-1">
													<AlertCircle className="w-4 h-4" />
													{errors.name.message}
												</p>
											)}
										</div>

										<div>
											<Label htmlFor="description" className="block mb-2">
												Description
											</Label>
											<Textarea
												id="description"
												{...register("description")}
												placeholder="Brief description of the brand (optional)"
												rows={4}
												className="resize-none"
											/>
											{errors.description && (
												<p className="text-sm text-red-500 mt-1 flex items-center gap-1">
													<AlertCircle className="w-4 h-4" />
													{errors.description.message}
												</p>
											)}
											<p className="text-xs text-gray-500 mt-1">
												{watch("description")?.length || 0}/500 characters
											</p>
										</div>

										<div>
											<Label className="block mb-2">Categories</Label>
											<Controller
												control={control}
												name="categories"
												render={({ field }) => (
													<Select
														onValueChange={(value) => {
															const currentCategories = field.value || [];
															if (!currentCategories.includes(value)) {
																field.onChange([...currentCategories, value]);
															}
														}}>
														<SelectTrigger>
															<SelectValue placeholder="Select categories" />
														</SelectTrigger>
														<SelectContent>
															{categories.map((category) => (
																<SelectItem
																	key={category._id}
																	value={category._id}>
																	{category.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											/>
											{watch("categories")?.length > 0 && (
												<div className="flex flex-wrap gap-2 mt-2">
													{watch("categories")?.map((categoryId) => {
														const category = categories.find(
															(c) => c._id === categoryId
														);
														return category ? (
															<span
																key={categoryId}
																className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
																{category.name}
																<button
																	type="button"
																	onClick={() => {
																		const currentCategories =
																			watch("categories") || [];
																		setValue(
																			"categories",
																			currentCategories.filter(
																				(id) => id !== categoryId
																			)
																		);
																	}}
																	className="hover:text-blue-600">
																	<X className="w-3 h-3" />
																</button>
															</span>
														) : null;
													})}
												</div>
											)}
										</div>

										<div className="flex items-center space-x-2">
											<Controller
												control={control}
												name="isActive"
												render={({ field }) => (
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												)}
											/>
											<Label>Active Brand</Label>
											<p className="text-xs text-gray-500">
												Inactive brands won't be shown in product listings
											</p>
										</div>
									</div>

									{/* Logo Upload */}
									<div>
										<Label className="block mb-2">Brand Logo</Label>
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
											{!watchedLogo ? (
												<>
													<input
														type="file"
														accept="image/*"
														className="hidden"
														id="brand-image-upload"
														onChange={handleImageChange}
														disabled={uploading}
													/>
													<label
														htmlFor="brand-image-upload"
														className={`cursor-pointer ${
															uploading ? "pointer-events-none" : ""
														}`}>
														{uploading ? (
															<div className="flex flex-col items-center">
																<LoadingSpinner size="lg" />
																<p className="mt-2 text-sm text-gray-600">
																	Uploading...
																</p>
															</div>
														) : (
															<>
																<Upload className="mx-auto h-12 w-12 text-gray-400" />
																<p className="mt-2 text-sm text-gray-600">
																	Click to upload brand logo
																</p>
																<p className="text-xs text-gray-500">
																	PNG, JPG up to 5MB
																</p>
															</>
														)}
													</label>
												</>
											) : (
												<div className="space-y-4">
													<div className="relative inline-block">
														<img
															src={watchedLogo}
															alt="Brand logo preview"
															className="h-32 w-auto mx-auto object-contain rounded-lg border"
														/>
													</div>
													<div className="flex gap-2 justify-center">
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() =>
																document
																	.getElementById("brand-image-upload")
																	?.click()
															}>
															Change Logo
														</Button>
														<Button
															type="button"
															variant="destructive"
															size="sm"
															onClick={removeLogo}>
															<X className="w-4 h-4 mr-1" />
															Remove
														</Button>
													</div>
													<input
														type="file"
														accept="image/*"
														className="hidden"
														id="brand-image-upload"
														onChange={handleImageChange}
														disabled={uploading}
													/>
												</div>
											)}
										</div>
										<p className="text-xs text-gray-500 mt-2">
											A good logo helps customers recognize your brand. Square
											images work best.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Preview */}
						{(watchedName || watchedLogo) && (
							<Card>
								<CardHeader>
									<CardTitle>Preview</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="bg-gray-50 rounded-lg p-6">
										<div className="flex items-center gap-4">
											{watchedLogo ? (
												<img
													src={watchedLogo}
													alt="Brand preview"
													className="h-16 w-16 object-contain rounded-lg border bg-white"
												/>
											) : (
												<div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
													<span className="text-xs text-gray-500">No Logo</span>
												</div>
											)}
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h3 className="font-semibold text-lg">
														{watchedName || "Brand Name"}
													</h3>
													{!watch("isActive") && (
														<span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
															Inactive
														</span>
													)}
												</div>
												{watch("slug") && (
													<p className="text-sm text-gray-500">
														/{watch("slug")}
													</p>
												)}
												{watch("description") && (
													<p className="text-sm text-gray-600 mt-1">
														{watch("description")}
													</p>
												)}

												{watch("categories")?.length > 0 && (
													<div className="flex flex-wrap gap-1 mt-2">
														{watch("categories")?.map((categoryId) => {
															const category = categories.find(
																(c) => c._id === categoryId
															);
															return category ? (
																<span
																	key={categoryId}
																	className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
																	{category.name}
																</span>
															) : null;
														})}
													</div>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Submit */}
						<div className="flex justify-end gap-4">
							<Link href="/admin/brands">
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</Link>
							<Button
								type="submit"
								disabled={!isValid || submitting || uploading}
								className="min-w-[140px]">
								{submitting ? (
									<>
										<LoadingSpinner size="sm" className="mr-2" />
										Creating...
									</>
								) : success ? (
									<>
										<Check className="w-4 h-4 mr-2" />
										Created!
									</>
								) : (
									"Create Brand"
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
