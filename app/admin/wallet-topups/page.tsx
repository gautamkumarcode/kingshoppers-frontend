"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { Check, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TopupRequest {
	_id: string;
	user: {
		_id: string;
		shopName: string;
		ownerName: string;
		phone: string;
		email: string;
	};
	amount: number;
	paymentMethod: string;
	referenceId: string;
	bankingName: string;
	notes: string;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
	processedAt?: string;
	processedBy?: {
		firstName: string;
		lastName: string;
	};
	rejectionReason?: string;
	transactionId?: string;
}

export default function WalletTopupsPage() {
	const [requests, setRequests] = useState<TopupRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("pending");
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(
		null
	);
	const [rejectionReason, setRejectionReason] = useState("");
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		fetchRequests();
	}, [activeTab]);

	const fetchRequests = async () => {
		setLoading(true);
		try {
			const response = await api.get("/admin/wallet-topups", {
				params: { status: activeTab === "all" ? undefined : activeTab },
			});
			setRequests(response.data.data || []);
		} catch (error) {
			console.error("Failed to fetch topup requests:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (requestId: string) => {
		if (!confirm("Are you sure you want to approve this topup request?"))
			return;

		setProcessing(true);
		try {
			await api.put(`/admin/wallet-topups/${requestId}/approve`);
			alert("Topup request approved successfully!");
			fetchRequests();
		} catch (error: any) {
			alert(error.response?.data?.message || "Failed to approve request");
		} finally {
			setProcessing(false);
		}
	};

	const handleReject = async () => {
		if (!selectedRequest) return;
		if (!rejectionReason.trim()) {
			alert("Please provide a rejection reason");
			return;
		}

		setProcessing(true);
		try {
			await api.put(`/admin/wallet-topups/${selectedRequest._id}/reject`, {
				rejectionReason: rejectionReason.trim(),
			});
			alert("Topup request rejected");
			setShowRejectDialog(false);
			setRejectionReason("");
			setSelectedRequest(null);
			fetchRequests();
		} catch (error: any) {
			alert(error.response?.data?.message || "Failed to reject request");
		} finally {
			setProcessing(false);
		}
	};

	const openRejectDialog = (request: TopupRequest) => {
		setSelectedRequest(request);
		setShowRejectDialog(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
						<Clock className="w-3 h-3 mr-1" />
						Pending
					</Badge>
				);
			case "approved":
				return (
					<Badge variant="default" className="bg-green-600">
						<Check className="w-3 h-3 mr-1" />
						Approved
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="destructive">
						<X className="w-3 h-3 mr-1" />
						Rejected
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900">
						Wallet Topup Requests
					</h1>
					<p className="text-gray-600 mt-2">
						Review and approve customer wallet topup requests
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="mb-6">
						<TabsTrigger value="pending">Pending</TabsTrigger>
						<TabsTrigger value="approved">Approved</TabsTrigger>
						<TabsTrigger value="rejected">Rejected</TabsTrigger>
						<TabsTrigger value="all">All</TabsTrigger>
					</TabsList>

					<TabsContent value={activeTab}>
						{loading ? (
							<Card>
								<CardContent className="py-12 text-center">
									<p className="text-gray-600">Loading...</p>
								</CardContent>
							</Card>
						) : requests.length === 0 ? (
							<Card>
								<CardContent className="py-12 text-center">
									<p className="text-gray-600">No requests found</p>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-4">
								{requests.map((request) => (
									<Card key={request._id}>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{request.user.shopName || "N/A"}
													</CardTitle>
													<p className="text-sm text-gray-600">
														{request.user.ownerName} • {request.user.phone}
													</p>
												</div>
												{getStatusBadge(request.status)}
											</div>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-gray-600">Amount</p>
													<p className="text-xl font-bold text-green-600">
														₹{request.amount.toLocaleString()}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">
														Payment Method
													</p>
													<p className="font-medium">
														{request.paymentMethod.toUpperCase()}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">Reference ID</p>
													<p className="font-medium font-mono text-sm">
														{request.referenceId}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">Banking Name</p>
													<p className="font-medium">{request.bankingName}</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">
														Requested Date
													</p>
													<p className="font-medium">
														{new Date(request.createdAt).toLocaleString()}
													</p>
												</div>
												{request.notes && (
													<div className="md:col-span-2">
														<p className="text-sm text-gray-600">Notes</p>
														<p className="text-sm">{request.notes}</p>
													</div>
												)}
												{request.status === "rejected" &&
													request.rejectionReason && (
														<div className="md:col-span-2">
															<p className="text-sm text-gray-600">
																Rejection Reason
															</p>
															<p className="text-sm text-red-600">
																{request.rejectionReason}
															</p>
														</div>
													)}
												{request.status === "approved" &&
													request.transactionId && (
														<div className="md:col-span-2">
															<p className="text-sm text-gray-600">
																Transaction ID
															</p>
															<p className="text-sm font-mono">
																{request.transactionId}
															</p>
														</div>
													)}
												{request.processedBy && (
													<div className="md:col-span-2">
														<p className="text-sm text-gray-600">
															Processed By
														</p>
														<p className="text-sm">
															{request.processedBy.firstName}{" "}
															{request.processedBy.lastName} on{" "}
															{request.processedAt &&
																new Date(request.processedAt).toLocaleString()}
														</p>
													</div>
												)}
											</div>

											{request.status === "pending" && (
												<div className="flex gap-3 mt-4">
													<Button
														onClick={() => handleApprove(request._id)}
														disabled={processing}
														className="flex-1 bg-green-600 hover:bg-green-700">
														<Check className="w-4 h-4 mr-2" />
														Approve
													</Button>
													<Button
														onClick={() => openRejectDialog(request)}
														disabled={processing}
														variant="destructive"
														className="flex-1">
														<X className="w-4 h-4 mr-2" />
														Reject
													</Button>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>

			{/* Reject Dialog */}
			<Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Topup Request</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this request
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div>
							<Label htmlFor="rejectionReason">Rejection Reason</Label>
							<Input
								id="rejectionReason"
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								placeholder="e.g., Payment not received, Invalid reference ID"
								className="mt-2"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowRejectDialog(false);
								setRejectionReason("");
								setSelectedRequest(null);
							}}
							disabled={processing}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleReject}
							disabled={processing || !rejectionReason.trim()}>
							Reject Request
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
