"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema
const tierPricingSchema = z.object({
	tier: z.enum(["bronze", "silver", "gold", "platinum"]),
	price: z.number().min(0),
	minimumQuantity: z.number().min(1),
});

const variantSchema = z.object({
	variantName: z.string().min(1, "Variant name is required"),
	variantSku: z.string().min(1, "Variant SKU is required"),
	packSize: z.number().min(1, "Pack size must be at least 1"),
	packType: z.enum([
		"piece",
		"pack",
		"box",
		"carton",
		"case",
		"dozen",
		"kg",
		"liter",
	]),
	mrp: z.number().min(0, "MRP must be positive"),
	wholesalePrice: z.number().min(0, "Wholesale price must be positive"),
	costPrice: z.number().min(0, "Cost price must be positive"),
	discountPercentage: z.number().min(0).max(100),
	stock: z.number().min(0),
	lowStockAlert: z.number().min(0),
	weight: z.number().min(0).optional(),
	dimensions: z
		.object({
			length: z.number().min(0).optional(),
			width: z.number().min(0).optional(),
			height: z.number().min(0).optional(),
		})
		.optional(),
	tierPricing: z.array(tierPricingSchema).optional(),
	isActive: z.boolean(),
	isInStock: z.boolean(),
});

const specificationSchema = z.object({
	name: z.string().min(1),
	value: z.string().min(1),
});

const productSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	slug: z.string().optional(),
	description: z.string().optional(),
	shortDescription: z.string().optional(),
	category: z.string().min(1, "Category is required"),
	brand: z.string().min(1, "Brand is required"),
	sku: z.string().min(1, "SKU is required"),
	barcode: z.string().optional(),
	hsnCode: z.string().optional(),
	images: z.array(z.string()).optional(),
	thumbnail: z.string().optional(),
	variants: z.array(variantSchema).min(1, "At least one variant is required"),
	specifications: z.array(specificationSchema).optional(),
	moq: z.number().min(1),
	isActive: z.boolean(),
	isFeatured: z.boolean(),
	gstPercentage: z.number().min(0).max(100),
	keywords: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof productSchema>;

interface Category {
	_id: string;
	name: string;
}

interface Brand {
	_id: string;
	name: string;
}

export default function CreateProductPage() {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [brands, setBrands] = useState<Brand[]>([]);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<FormValues>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			shortDescription: "",
			category: "",
			brand: "",
			sku: "",
			barcode: "",
			images: [],
			thumbnail: "",
			variants: [
				{
					variantName: "Default",
					variantSku: "",
					packSize: 1,
					packType: "piece",
					mrp: 0,
					wholesalePrice: 0,
					costPrice: 0,
					discountPercentage: 0,
					stock: 0,
					lowStockAlert: 10,
					tierPricing: [],
					isActive: true,
					isInStock: true,
				},
			],
			specifications: [],
			moq: 1,
			isActive: true,
			isFeatured: false,
			gstPercentage: 18,
			keywords: [],
		},
	});

	const {
		fields: variantFields,
		append: appendVariant,
		remove: removeVariant,
	} = useFieldArray({
		control,
		name: "variants",
	});

	const {
		fields: specFields,
		append: appendSpec,
		remove: removeSpec,
	} = useFieldArray({
		control,
		name: "specifications",
	});

	// Load categories and brands
	useEffect(() => {
		const loadData = async () => {
			try {
				const [categoriesRes, brandsRes] = await Promise.all([
					api.get("/categories"),
					api.get("/brands"),
				]);

				console.log(categoriesRes, brandsRes);
				setCategories(categoriesRes.data || []);
				setBrands(brandsRes.data.data || []);
			} catch (error) {
				console.error("Failed to load categories/brands:", error);
			}
		};
		loadData();
	}, []);

	// Auto-generate slug from name
	const watchedName = watch("name");
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
			await api.post("/products", {
				...data,
				images: uploadedImages,
				thumbnail: uploadedImages[0] || "",
			});
			router.push("/admin/products");
		} catch (err: any) {
			console.error("Failed to create product", err);
			const msg =
				err?.response?.data?.message ||
				err?.message ||
				"Failed to create product";
			alert(msg);
		} finally {
			setSubmitting(false);
		}
	};

	const handleImageUpload = (url: string) => {
		setUploadedImages((prev) => [...prev, url]);
		setValue("images", [...uploadedImages, url]);
		if (uploadedImages.length === 0) {
			setValue("thumbnail", url);
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
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
						Create Product
					</h1>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => router.back()}>
							Cancel
						</Button>
						<Button
							type="submit"
							form="product-form"
							disabled={submitting}
							className="min-w-[120px]">
							{submitting ? "Creating..." : "Create Product"}
						</Button>
					</div>
				</div>
			</div>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-5xl mx-auto pb-6">
					<form
						id="product-form"
						onSubmit={handleSubmit(onSubmit as any)}
						className="space-y-6">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle>Basic Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="sm:col-span-2">
										<Label htmlFor="name">Product Name *</Label>
										<Input
											id="name"
											{...register("name")}
											placeholder="Enter product name"
										/>
										{errors.name && (
											<p className="text-sm text-red-500 mt-1">
												{errors.name.message}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="sku">SKU *</Label>
										<Input
											id="sku"
											{...register("sku")}
											placeholder="Enter SKU"
										/>
										{errors.sku && (
											<p className="text-sm text-red-500 mt-1">
												{errors.sku.message}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="slug">Slug</Label>
										<Input
											id="slug"
											{...register("slug")}
											placeholder="auto-generated-from-name"
											disabled
											className="bg-gray-50"
										/>
									</div>

									<div>
										<Label htmlFor="barcode">Barcode</Label>
										<Input
											id="barcode"
											{...register("barcode")}
											placeholder="Enter barcode"
										/>
									</div>

									<div>
										<Label htmlFor="category">Category *</Label>
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

									<div>
										<Label htmlFor="brand">Brand *</Label>
										<Controller
											control={control}
											name="brand"
											render={({ field }) => (
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<SelectTrigger>
														<SelectValue placeholder="Select brand" />
													</SelectTrigger>
													<SelectContent>
														{brands.map((brand) => (
															<SelectItem key={brand._id} value={brand._id}>
																{brand.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
										/>
										{errors.brand && (
											<p className="text-sm text-red-500 mt-1">
												{errors.brand.message}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="gstPercentage">GST Percentage</Label>
										<Input
											id="gstPercentage"
											type="number"
											{...register("gstPercentage", { valueAsNumber: true })}
											placeholder="18"
										/>
									</div>

									<div>
										<Label htmlFor="moq">Minimum Order Quantity</Label>
										<Input
											id="moq"
											type="number"
											{...register("moq", { valueAsNumber: true })}
											placeholder="1"
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										{...register("description")}
										placeholder="Detailed product description"
										rows={4}
										className="resize-none"
									/>
								</div>

								<div className="flex flex-wrap gap-6">
									<div className="flex items-center space-x-2">
										<Controller
											control={control}
											name="isFeatured"
											render={({ field }) => (
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											)}
										/>
										<Label>Featured</Label>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Images */}
						<Card>
							<CardHeader>
								<CardTitle>Product Images</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Upload Product Images</Label>
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
											<input
												type="file"
												accept="image/*"
												multiple
												onChange={async (e) => {
													const files = Array.from(e.target.files || []);
													for (const file of files) {
														if (file.size > 5 * 1024 * 1024) {
															alert(
																`File ${file.name} is too large. Max size is 5MB.`
															);
															continue;
														}

														try {
															const formData = new FormData();
															formData.append("file", file);
															const response = await api.post(
																"/upload/documents",
																formData,
																{
																	headers: {
																		"Content-Type": "multipart/form-data",
																	},
																}
															);
															handleImageUpload(response.data.url);
														} catch (error) {
															console.error("Upload failed:", error);
															alert("Upload failed. Please try again.");
														}
													}
												}}
												className="hidden"
												id="image-upload"
											/>
											<label htmlFor="image-upload" className="cursor-pointer">
												<Upload className="mx-auto h-12 w-12 text-gray-400" />
												<p className="mt-2 text-sm text-gray-600">
													Click to upload images or drag and drop
												</p>
												<p className="text-xs text-gray-500">
													PNG, JPG, GIF up to 5MB each
												</p>
											</label>
										</div>
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
														<span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
															Thumbnail
														</span>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
						{/* Variants */}
						<Card>
							<CardHeader>
								<CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<span>Product Variants</span>
									<Button
										type="button"
										size="sm"
										onClick={() =>
											appendVariant({
												variantName: "",
												variantSku: "",
												packSize: 1,
												packType: "piece",
												mrp: 0,
												wholesalePrice: 0,
												costPrice: 0,
												discountPercentage: 0,
												stock: 0,
												lowStockAlert: 10,
												tierPricing: [],
												isActive: true,
												isInStock: true,
											})
										}>
										<Plus className="w-4 h-4 mr-2" /> Add Variant
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{variantFields.map((field, index) => (
										<div
											key={field.id}
											className="p-4 border rounded-lg space-y-4 bg-gray-50/30">
											<div className="flex items-center justify-between">
												<h4 className="font-semibold text-lg">
													Variant {index + 1}
												</h4>
												{variantFields.length > 1 && (
													<Button
														type="button"
														variant="destructive"
														size="sm"
														onClick={() => removeVariant(index)}>
														<Trash2 className="w-4 h-4" />
													</Button>
												)}
											</div>

											{/* Basic Variant Info */}
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
												<div>
													<Label>Variant Name *</Label>
													<Input
														{...register(
															`variants.${index}.variantName` as const
														)}
														placeholder="e.g., Single Pack, 12 Pack"
													/>
													{errors.variants?.[index]?.variantName && (
														<p className="text-sm text-red-500 mt-1">
															{errors.variants[index]?.variantName?.message}
														</p>
													)}
												</div>

												<div>
													<Label>Variant SKU *</Label>
													<Input
														{...register(
															`variants.${index}.variantSku` as const
														)}
														placeholder="Unique variant SKU"
													/>
													{errors.variants?.[index]?.variantSku && (
														<p className="text-sm text-red-500 mt-1">
															{errors.variants[index]?.variantSku?.message}
														</p>
													)}
												</div>

												<div>
													<Label>Pack Type *</Label>
													<Controller
														control={control}
														name={`variants.${index}.packType` as const}
														render={({ field }) => (
															<Select
																onValueChange={field.onChange}
																value={field.value}>
																<SelectTrigger>
																	<SelectValue placeholder="Select pack type" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="piece">Piece</SelectItem>
																	<SelectItem value="pack">Pack</SelectItem>
																	<SelectItem value="box">Box</SelectItem>
																	<SelectItem value="carton">Carton</SelectItem>
																	<SelectItem value="case">Case</SelectItem>
																	<SelectItem value="dozen">Dozen</SelectItem>
																	<SelectItem value="kg">Kg</SelectItem>
																	<SelectItem value="liter">Liter</SelectItem>
																</SelectContent>
															</Select>
														)}
													/>
												</div>
											</div>

											{/* Pricing */}
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
												<div>
													<Label>Pack Size *</Label>
													<Input
														type="number"
														{...register(
															`variants.${index}.packSize` as const,
															{
																valueAsNumber: true,
															}
														)}
														placeholder="1"
													/>
												</div>

												<div>
													<Label>MRP *</Label>
													<Input
														type="number"
														step="0.01"
														{...register(`variants.${index}.mrp` as const, {
															valueAsNumber: true,
														})}
														placeholder="0.00"
													/>
												</div>

												<div>
													<Label>Wholesale Price *</Label>
													<Input
														type="number"
														step="0.01"
														{...register(
															`variants.${index}.wholesalePrice` as const,
															{ valueAsNumber: true }
														)}
														placeholder="0.00"
													/>
												</div>

												<div>
													<Label>Cost Price *</Label>
													<Input
														type="number"
														step="0.01"
														{...register(
															`variants.${index}.costPrice` as const,
															{
																valueAsNumber: true,
															}
														)}
														placeholder="0.00"
													/>
												</div>
											</div>

											{/* Stock & Discount */}
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
												<div>
													<Label>Discount %</Label>
													<Input
														type="number"
														{...register(
															`variants.${index}.discountPercentage` as const,
															{ valueAsNumber: true }
														)}
														placeholder="0"
														max="100"
													/>
												</div>

												<div>
													<Label>Stock</Label>
													<Input
														type="number"
														{...register(`variants.${index}.stock` as const, {
															valueAsNumber: true,
														})}
														placeholder="0"
													/>
												</div>

												<div>
													<Label>Low Stock Alert</Label>
													<Input
														type="number"
														{...register(
															`variants.${index}.lowStockAlert` as const,
															{ valueAsNumber: true }
														)}
														placeholder="10"
													/>
												</div>

												<div>
													<Label>Weight (grams)</Label>
													<Input
														type="number"
														{...register(`variants.${index}.weight` as const, {
															valueAsNumber: true,
														})}
														placeholder="0"
													/>
												</div>
											</div>

											{/* Dimensions */}
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
												<div>
													<Label>Length (cm)</Label>
													<Input
														type="number"
														{...register(
															`variants.${index}.dimensions.length` as const,
															{ valueAsNumber: true }
														)}
														placeholder="0"
													/>
												</div>

												<div>
													<Label>Width (cm)</Label>
													<Input
														type="number"
														{...register(
															`variants.${index}.dimensions.width` as const,
															{ valueAsNumber: true }
														)}
														placeholder="0"
													/>
												</div>

												<div>
													<Label>Height (cm)</Label>
													<Input
														type="number"
														{...register(
															`variants.${index}.dimensions.height` as const,
															{ valueAsNumber: true }
														)}
														placeholder="0"
													/>
												</div>
											</div>

											{/* Status */}
											<div className="flex flex-wrap gap-6">
												<div className="flex items-center space-x-2">
													<Controller
														control={control}
														name={`variants.${index}.isActive` as const}
														render={({ field }) => (
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														)}
													/>
													<Label>Active</Label>
												</div>

												<div className="flex items-center space-x-2">
													<Controller
														control={control}
														name={`variants.${index}.isInStock` as const}
														render={({ field }) => (
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														)}
													/>
													<Label>In Stock</Label>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Specifications */}
						<Card>
							<CardHeader>
								<CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<span>Specifications</span>
									<Button
										type="button"
										size="sm"
										onClick={() => appendSpec({ name: "", value: "" })}>
										<Plus className="w-4 h-4 mr-2" /> Add Specification
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{specFields.length === 0 ? (
									<p className="text-muted-foreground text-center py-8">
										No specifications added yet. Click "Add Specification" to
										get started.
									</p>
								) : (
									<div className="space-y-4">
										{specFields.map((field, index) => (
											<div
												key={field.id}
												className="flex flex-col sm:flex-row gap-4 items-end">
												<div className="flex-1">
													<Label>Name</Label>
													<Input
														{...register(
															`specifications.${index}.name` as const
														)}
														placeholder="e.g., Material, Color, Size"
													/>
												</div>
												<div className="flex-1">
													<Label>Value</Label>
													<Input
														{...register(
															`specifications.${index}.value` as const
														)}
														placeholder="e.g., Cotton, Red, Large"
													/>
												</div>
												<Button
													type="button"
													variant="destructive"
													size="sm"
													onClick={() => removeSpec(index)}
													className="shrink-0">
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</form>
				</div>
			</div>

			{/* Mobile Submit Button */}
			<div className="shrink-0 bg-white border-t p-4 sm:hidden -m-6 mt-6">
				<Button
					type="submit"
					form="product-form"
					disabled={submitting}
					className="w-full">
					{submitting ? "Creating..." : "Create Product"}
				</Button>
			</div>
		</div>
	);
}
