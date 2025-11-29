"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Check, Tag, X } from "lucide-react";
import { useState } from "react";

interface CouponInputProps {
	orderValue: number;
	orderType: string;
	items: any[];
	onCouponApplied: (coupon: any, discountAmount: number) => void;
	onCouponRemoved: () => void;
	appliedCoupon?: any;
}

export function CouponInput({
	orderValue,
	orderType,
	items,
	onCouponApplied,
	onCouponRemoved,
	appliedCoupon,
}: CouponInputProps) {
	const [couponCode, setCouponCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleApplyCoupon = async () => {
		if (!couponCode.trim()) {
			setError("Please enter a coupon code");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await api.post("/coupons/validate", {
				code: couponCode.toUpperCase(),
				orderValue,
				orderType,
				items: items.map((item) => ({
					product: item.productId,
					category: item.category,
				})),
			});

			if (response.data.success) {
				onCouponApplied(response.data.coupon, response.data.discountAmount);
				setCouponCode("");
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Invalid or expired coupon code");
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveCoupon = () => {
		onCouponRemoved();
		setCouponCode("");
		setError("");
	};

	if (appliedCoupon) {
		return (
			<div className="border rounded-lg p-4 bg-green-50 border-green-200">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-3">
						<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
							<Check className="w-5 h-5 text-green-600" />
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<span className="font-mono font-bold text-green-700">
									{appliedCoupon.code}
								</span>
								<span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-700">
									Applied
								</span>
							</div>
							<p className="text-sm text-green-600 mt-1">
								{appliedCoupon.description}
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRemoveCoupon}
						className="text-green-700 hover:text-green-800 hover:bg-green-100">
						<X className="w-4 h-4" />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="border rounded-lg p-4">
			<div className="flex items-center gap-2 mb-3">
				<Tag className="w-5 h-5 text-gray-600" />
				<h3 className="font-semibold">Have a coupon code?</h3>
			</div>

			<div className="flex gap-2">
				<Input
					placeholder="Enter coupon code"
					value={couponCode}
					onChange={(e) => {
						setCouponCode(e.target.value.toUpperCase());
						setError("");
					}}
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							handleApplyCoupon();
						}
					}}
					disabled={loading}
					className="uppercase font-mono"
				/>
				<Button onClick={handleApplyCoupon} disabled={loading || !couponCode}>
					{loading ? "Applying..." : "Apply"}
				</Button>
			</div>

			{error && (
				<p className="text-sm text-red-600 mt-2 flex items-center gap-1">
					<X className="w-4 h-4" />
					{error}
				</p>
			)}

			<p className="text-xs text-gray-500 mt-2">
				Enter your coupon code to get instant discount
			</p>
		</div>
	);
}
