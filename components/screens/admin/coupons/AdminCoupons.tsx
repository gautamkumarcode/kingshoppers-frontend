"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Edit, Plus, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminCoupons() {
	const [coupons, setCoupons] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	useEffect(() => {
		fetchCoupons();
	}, []);

	const fetchCoupons = async () => {
		setLoading(true);
		try {
			const response = await api.get("/coupons");
			setCoupons(response.data.coupons || []);
			setLastUpdated(new Date());
		} catch (error) {
			console.error("Failed to fetch coupons:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleStatus = async (id: string) => {
		try {
			await api.patch(`/coupons/${id}/toggle`);
			fetchCoupons();
		} catch (error) {
			console.error("Failed to toggle coupon status:", error);
			alert("Failed to update coupon status");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this coupon?")) return;

		try {
			await api.delete(`/coupons/${id}`);
			fetchCoupons();
		} catch (error) {
			console.error("Failed to delete coupon:", error);
			alert("Failed to delete coupon");
		}
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const isExpired = (validUntil: string) => {
		return new Date(validUntil) < new Date();
	};

	if (loading) {
		return <div className="text-center py-12">Loading coupons...</div>;
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Coupon Management</h1>
					<p className="text-sm text-gray-500 mt-1">
						Manage promotional coupons and track usage
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={fetchCoupons}
						disabled={loading}
						className="w-full sm:w-auto">
						{loading ? "Refreshing..." : "Refresh"}
					</Button>
					<Link href="/admin/coupons/add" className="w-full sm:w-auto">
						<Button className="w-full sm:w-auto">
							<Plus className="w-4 h-4 mr-2" />
							Create Coupon
						</Button>
					</Link>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg sm:text-xl">All Coupons</CardTitle>
						{lastUpdated && (
							<p className="text-xs text-gray-500">
								Last updated: {lastUpdated.toLocaleTimeString()}
							</p>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{coupons.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							No coupons found. Create your first coupon!
						</div>
					) : (
						<>
							{/* Desktop Table View */}
							<div className="hidden lg:block overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Code</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>Discount</TableHead>
											<TableHead>Valid Period</TableHead>
											<TableHead>Usage</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{coupons.map((coupon) => (
											<TableRow key={coupon._id}>
												<TableCell className="font-mono font-bold">
													{coupon.code}
												</TableCell>
												<TableCell className="max-w-xs truncate">
													{coupon.description}
												</TableCell>
												<TableCell>
													{coupon.discountType === "percentage" ? (
														<span className="text-green-600 font-semibold">
															{coupon.discountValue}%
															{coupon.maxDiscount && (
																<span className="text-xs text-gray-500">
																	{" "}
																	(max ₹{coupon.maxDiscount})
																</span>
															)}
														</span>
													) : (
														<span className="text-green-600 font-semibold">
															₹{coupon.discountValue}
														</span>
													)}
												</TableCell>
												<TableCell>
													<div className="text-sm">
														<div>{formatDate(coupon.validFrom)}</div>
														<div className="text-gray-500">
															to {formatDate(coupon.validUntil)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{coupon.usedCount}
														{coupon.usageLimit && ` / ${coupon.usageLimit}`}
													</div>
												</TableCell>
												<TableCell>
													{isExpired(coupon.validUntil) ? (
														<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
															Expired
														</span>
													) : coupon.isActive ? (
														<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
															Active
														</span>
													) : (
														<span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
															Inactive
														</span>
													)}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleToggleStatus(coupon._id)}
															disabled={isExpired(coupon.validUntil)}
															title="Toggle Status">
															<Power className="w-4 h-4" />
														</Button>
														<Link href={`/admin/coupons/edit/${coupon._id}`}>
															<Button variant="outline" size="sm" title="Edit">
																<Edit className="w-4 h-4" />
															</Button>
														</Link>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleDelete(coupon._id)}
															title="Delete">
															<Trash2 className="w-4 h-4 text-red-600" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Mobile Card View */}
							<div className="lg:hidden space-y-4">
								{coupons.map((coupon) => (
									<Card key={coupon._id} className="overflow-hidden">
										<CardContent className="p-4">
											<div className="space-y-3">
												{/* Header */}
												<div className="flex justify-between items-start">
													<div>
														<div className="font-mono font-bold text-lg">
															{coupon.code}
														</div>
														<div className="text-sm text-gray-600 mt-1">
															{coupon.description}
														</div>
													</div>
													<div>
														{isExpired(coupon.validUntil) ? (
															<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
																Expired
															</span>
														) : coupon.isActive ? (
															<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
																Active
															</span>
														) : (
															<span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
																Inactive
															</span>
														)}
													</div>
												</div>

												{/* Details */}
												<div className="grid grid-cols-2 gap-3 text-sm">
													<div>
														<div className="text-gray-500">Discount</div>
														<div className="font-semibold text-green-600">
															{coupon.discountType === "percentage"
																? `${coupon.discountValue}%`
																: `₹${coupon.discountValue}`}
														</div>
													</div>
													<div>
														<div className="text-gray-500">Usage</div>
														<div className="font-semibold">
															{coupon.usedCount}
															{coupon.usageLimit && ` / ${coupon.usageLimit}`}
														</div>
													</div>
													<div className="col-span-2">
														<div className="text-gray-500">Valid Period</div>
														<div className="text-xs">
															{formatDate(coupon.validFrom)} to{" "}
															{formatDate(coupon.validUntil)}
														</div>
													</div>
												</div>

												{/* Actions */}
												<div className="flex gap-2 pt-2 border-t">
													<Button
														variant="outline"
														size="sm"
														className="flex-1"
														onClick={() => handleToggleStatus(coupon._id)}
														disabled={isExpired(coupon.validUntil)}>
														<Power className="w-4 h-4 mr-2" />
														Toggle
													</Button>
													<Link
														href={`/admin/coupons/edit/${coupon._id}`}
														className="flex-1">
														<Button
															variant="outline"
															size="sm"
															className="w-full">
															<Edit className="w-4 h-4 mr-2" />
															Edit
														</Button>
													</Link>
													<Button
														variant="outline"
														size="sm"
														className="flex-1"
														onClick={() => handleDelete(coupon._id)}>
														<Trash2 className="w-4 h-4 mr-2 text-red-600" />
														Delete
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
