"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, Clock, Phone, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingApprovalPage() {
	const { user, logout, refreshUser } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// If user is already approved, redirect to products
		if (user?.isApproved) {
			router.push("/products");
		}
	}, [user, router]);

	const handleRefreshStatus = async () => {
		await refreshUser();
	};

	if (!user) {
		return null; // Will redirect via auth context
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
						<Clock className="w-8 h-8 text-yellow-600" />
					</div>
					<CardTitle className="text-xl">Account Under Review</CardTitle>
					<CardDescription>
						Your registration is being reviewed by our team
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* User Info */}
					<div className="space-y-3">
						<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
							<Store className="w-5 h-5 text-gray-600" />
							<div>
								<p className="font-medium">{user.shopName}</p>
								<p className="text-sm text-gray-600">{user.ownerName}</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
							<Phone className="w-5 h-5 text-gray-600" />
							<p className="font-medium">{user.phone}</p>
						</div>
					</div>

					{/* Status Steps */}
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<CheckCircle className="w-5 h-5 text-green-600" />
							<span className="text-sm">Registration submitted</span>
						</div>
						<div className="flex items-center gap-3">
							<Clock className="w-5 h-5 text-yellow-600" />
							<span className="text-sm">Document verification in progress</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
							<span className="text-sm text-gray-500">
								Account approval pending
							</span>
						</div>
					</div>

					{/* Info Box */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="font-medium text-blue-900 mb-2">
							What happens next?
						</h4>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• Our team will verify your shop details</li>
							<li>• You'll receive a call for confirmation</li>
							<li>• Approval typically takes 24-48 hours</li>
							<li>• You'll be notified once approved</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="space-y-3">
						<Button
							onClick={handleRefreshStatus}
							variant="outline"
							className="w-full">
							Check Status
						</Button>
						<Button onClick={logout} variant="ghost" className="w-full">
							Logout
						</Button>
					</div>

					{/* Contact Info */}
					<div className="text-center text-sm text-gray-600">
						Need help? Call us at{" "}
						<a
							href="tel:+919876543210"
							className="text-blue-600 hover:underline">
							+91 98765 43210
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
