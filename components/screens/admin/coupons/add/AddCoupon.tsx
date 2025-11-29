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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddCoupon() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		code: "",
		description: "",
		discountType: "percentage",
		discountValue: "",
		maxDiscount: "",
		minOrderValue: "",
		usageLimit: "",
		perUserLimit: "1",
		validFrom: "",
		validUntil: "",
		applicableFor: "all",
		isActive: true,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Prepare data
			const payload = {
				...formData,
				code: formData.code.toUpperCase(),
				discountValue: parseFloat(formData.discountValue),
				maxDiscount: formData.maxDiscount
					? parseFloat(formData.maxDiscount)
					: null,
				minOrderValue: formData.minOrderValue
					? parseFloat(formData.minOrderValue)
					: 0,
				usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
				perUserLimit: parseInt(formData.perUserLimit),
			};

			await api.post("/coupons", payload);
			alert("Coupon created successfully!");
			router.push("/admin/coupons");
		} catch (error: any) {
			console.error("Failed to create coupon:", error);
			alert(
				error.response?.data?.message || "Failed to create coupon. Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="space-y-4 sm:space-y-6 max-w-4xl">
			<div className="flex items-center gap-2 sm:gap-4">
				<Link href="/admin/coupons">
					<Button variant="outline" size="sm">
						<ArrowLeft className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">Back</span>
					</Button>
				</Link>
				<h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
					Create New Coupon
				</h1>
			</div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle className="text-lg sm:text-xl">Coupon Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 sm:space-y-6">
						{/* Basic Info */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="code">
									Coupon Code <span className="text-red-500">*</span>
								</Label>
								<Input
									id="code"
									placeholder="SAVE20"
									value={formData.code}
									onChange={(e) =>
										handleChange("code", e.target.value.toUpperCase())
									}
									required
									className="font-mono uppercase"
								/>
								<p className="text-xs text-gray-500">
									Use uppercase letters and numbers only
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="applicableFor">Applicable For</Label>
								<Select
									value={formData.applicableFor}
									onValueChange={(value) =>
										handleChange("applicableFor", value)
									}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Customers</SelectItem>
										<SelectItem value="b2c">B2C Only</SelectItem>
										<SelectItem value="b2b">B2B Only</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">
								Description <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="description"
								placeholder="Get 20% off on all products"
								value={formData.description}
								onChange={(e) => handleChange("description", e.target.value)}
								required
								rows={3}
							/>
						</div>

						{/* Discount Settings */}
						<div className="border-t pt-6">
							<h3 className="text-lg font-semibold mb-4">Discount Settings</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="discountType">Discount Type</Label>
									<Select
										value={formData.discountType}
										onValueChange={(value) =>
											handleChange("discountType", value)
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="percentage">Percentage (%)</SelectItem>
											<SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="discountValue">
										Discount Value <span className="text-red-500">*</span>
									</Label>
									<Input
										id="discountValue"
										type="number"
										placeholder={
											formData.discountType === "percentage" ? "20" : "100"
										}
										value={formData.discountValue}
										onChange={(e) =>
											handleChange("discountValue", e.target.value)
										}
										required
										min="0"
										step="0.01"
									/>
								</div>

								{formData.discountType === "percentage" && (
									<div className="space-y-2">
										<Label htmlFor="maxDiscount">
											Maximum Discount (₹) (Optional)
										</Label>
										<Input
											id="maxDiscount"
											type="number"
											placeholder="500"
											value={formData.maxDiscount}
											onChange={(e) =>
												handleChange("maxDiscount", e.target.value)
											}
											min="0"
										/>
										<p className="text-xs text-gray-500">
											Cap the maximum discount amount
										</p>
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
									<Input
										id="minOrderValue"
										type="number"
										placeholder="500"
										value={formData.minOrderValue}
										onChange={(e) =>
											handleChange("minOrderValue", e.target.value)
										}
										min="0"
									/>
								</div>
							</div>
						</div>

						{/* Usage Limits */}
						<div className="border-t pt-6">
							<h3 className="text-lg font-semibold mb-4">Usage Limits</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="usageLimit">
										Total Usage Limit (Optional)
									</Label>
									<Input
										id="usageLimit"
										type="number"
										placeholder="100"
										value={formData.usageLimit}
										onChange={(e) => handleChange("usageLimit", e.target.value)}
										min="1"
									/>
									<p className="text-xs text-gray-500">
										Leave empty for unlimited
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="perUserLimit">
										Per User Limit <span className="text-red-500">*</span>
									</Label>
									<Input
										id="perUserLimit"
										type="number"
										placeholder="1"
										value={formData.perUserLimit}
										onChange={(e) =>
											handleChange("perUserLimit", e.target.value)
										}
										required
										min="1"
									/>
								</div>
							</div>
						</div>

						{/* Validity Period */}
						<div className="border-t pt-6">
							<h3 className="text-lg font-semibold mb-4">Validity Period</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="validFrom">
										Valid From <span className="text-red-500">*</span>
									</Label>
									<Input
										id="validFrom"
										type="datetime-local"
										value={formData.validFrom}
										onChange={(e) => handleChange("validFrom", e.target.value)}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="validUntil">
										Valid Until <span className="text-red-500">*</span>
									</Label>
									<Input
										id="validUntil"
										type="datetime-local"
										value={formData.validUntil}
										onChange={(e) => handleChange("validUntil", e.target.value)}
										required
									/>
								</div>
							</div>
						</div>

						{/* Submit */}
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
							<Button
								type="submit"
								disabled={loading}
								className="flex-1 w-full">
								{loading ? "Creating..." : "Create Coupon"}
							</Button>
							<Link href="/admin/coupons" className="flex-1">
								<Button type="button" variant="outline" className="w-full">
									Cancel
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}
