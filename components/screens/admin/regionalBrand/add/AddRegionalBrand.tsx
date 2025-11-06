"use client";

import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INDIAN_REGIONS = [
	"North India",
	"South India",
	"East India",
	"West India",
	"Central India",
	"Northeast India",
	"Punjab",
	"Gujarat",
	"Maharashtra",
	"Tamil Nadu",
	"Karnataka",
	"Kerala",
	"West Bengal",
	"Rajasthan",
	"Uttar Pradesh",
	"Bihar",
	"Odisha",
	"Assam",
	"Haryana",
	"Madhya Pradesh",
];

function AddRegionalBrandPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		region: "",
		logo: "",
		logoPublicId: "",
		establishedYear: "",
		website: "",
		email: "",
		phone: "",
	});
	const [uploadingLogo, setUploadingLogo] = useState(false);
	const [specialties, setSpecialties] = useState<string[]>([]);
	const [newSpecialty, setNewSpecialty] = useState("");

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const addSpecialty = () => {
		if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
			setSpecialties((prev) => [...prev, newSpecialty.trim()]);
			setNewSpecialty("");
		}
	};

	const removeSpecialty = (specialty: string) => {
		setSpecialties((prev) => prev.filter((s) => s !== specialty));
	};

	const generateSlug = (name: string) => {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const slug = generateSlug(formData.name);

			const payload = {
				name: formData.name,
				slug,
				description: formData.description,
				region: formData.region,
				logo: formData.logo || undefined,
				logoPublicId: formData.logoPublicId || undefined,
				establishedYear: formData.establishedYear
					? parseInt(formData.establishedYear)
					: undefined,
				specialties,
				contactInfo: {
					website: formData.website || undefined,
					email: formData.email || undefined,
					phone: formData.phone || undefined,
				},
			};

			const response = await api.post("/regional-brands", payload);

			if (response.status === 201) {
				router.push("/admin/regional-brands");
			} else {
				const error = await response.data;
				alert(error.message || "Failed to create regional brand");
			}
		} catch (error) {
			console.error("Error creating regional brand:", error);
			alert("Failed to create regional brand");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-4">
				<Link href="/admin/regional-brands">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Regional Brands
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold">Add Regional Brand</h1>
					<p className="text-muted-foreground">
						Create a new regional brand entry
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Brand Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="Enter brand name"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="region">Region *</Label>
								<Select
									value={formData.region}
									onValueChange={(value) => handleInputChange("region", value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select region" />
									</SelectTrigger>
									<SelectContent>
										{INDIAN_REGIONS.map((region) => (
											<SelectItem key={region} value={region}>
												{region}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									handleInputChange("description", e.target.value)
								}
								placeholder="Describe the regional brand..."
								rows={3}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="logo">Logo</Label>
								<div className="flex items-start gap-3">
									{formData.logo ? (
										<img
											src={formData.logo}
											alt="Logo preview"
											className="w-20 h-20 object-cover rounded-md border"
										/>
									) : (
										<div className="w-20 h-20 rounded-md border bg-muted" />
									)}

									<div className="flex-1">
										<Input
											id="logo"
											value={formData.logo}
											onChange={(e) =>
												handleInputChange("logo", e.target.value)
											}
											placeholder="https://example.com/logo.jpg"
										/>

										<div className="flex items-center gap-2 mt-2">
											<label className="cursor-pointer">
												<input
													type="file"
													accept="image/*"
													onChange={async (e) => {
														const file = e.target.files?.[0];
														if (!file) return;
														const fd = new FormData();
														fd.append("images", file);
														try {
															setUploadingLogo(true);
															const res = await api.post("/upload/images", fd, {
																headers: {
																	"Content-Type": "multipart/form-data",
																},
															});
															const uploaded = res.data?.files?.[0]?.url;
															const publicId =
																res.data?.files?.[0]?.publicId ||
																res.data?.files?.[0]?.publicId;
															if (uploaded) {
																setFormData((prev) => ({
																	...prev,
																	logo: uploaded,
																	logoPublicId: publicId || "",
																}));
															}
														} catch (err) {
															console.error("Logo upload failed:", err);
															alert("Logo upload failed. Please try again.");
														} finally {
															setUploadingLogo(false);
														}
													}}
													className="hidden"
												/>
												<span className="px-3 py-2 border rounded-md text-sm">
													Upload Logo
												</span>
											</label>
											{formData.logo && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setFormData((prev) => ({ ...prev, logo: "" }))
													}>
													Remove
												</Button>
											)}
											{uploadingLogo && (
												<span className="text-sm ml-2">Uploading...</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				{/* Specialties */}
				<Card>
					<CardHeader>
						<CardTitle>Specialties</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex space-x-2">
							<Input
								value={newSpecialty}
								onChange={(e) => setNewSpecialty(e.target.value)}
								placeholder="Add a specialty (e.g., Sweets, Namkeen)"
								onKeyPress={(e) =>
									e.key === "Enter" && (e.preventDefault(), addSpecialty())
								}
							/>
							<Button type="button" onClick={addSpecialty} variant="outline">
								<Plus className="w-4 h-4" />
							</Button>
						</div>

						{specialties.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{specialties.map((specialty) => (
									<Badge
										key={specialty}
										variant="secondary"
										className="flex items-center gap-1">
										{specialty}
										<X
											className="w-3 h-3 cursor-pointer"
											onClick={() => removeSpecialty(specialty)}
										/>
									</Badge>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Contact Information */}

				{/* Submit Button */}
				<div className="flex justify-end space-x-4">
					<Link href="/admin/regional-brands">
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</Link>
					<Button type="submit" disabled={loading}>
						{loading ? "Creating..." : "Create Regional Brand"}
					</Button>
				</div>
			</form>
		</div>
	);
}

export default AddRegionalBrandPage;
