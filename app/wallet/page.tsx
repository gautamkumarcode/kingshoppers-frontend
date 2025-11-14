"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
	Check,
	Copy,
	DollarSign,
	Download,
	History,
	Plus,
	RefreshCw,
	X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

interface Transaction {
	transactionId: string;
	type: "credit" | "debit";
	category: string;
	amount: number;
	description: string;
	timestamp: string;
	status: string;
	balanceBefore?: number;
	balanceAfter?: number;
}

interface TopupRequest {
	_id: string;
	amount: number;
	paymentMethod: string;
	referenceId: string;
	bankingName?: string;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
	rejectionReason?: string;
	transactionId?: string;
}

interface BusinessSettings {
	bankDetails?: {
		upiId?: string;
		accountNumber?: string;
		ifscCode?: string;
		bankName?: string;
		accountHolderName?: string;
	};
	businessName?: string;
}

export default function WalletPage() {
	const { user, refreshUser } = useAuth();
	const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
	const [amount, setAmount] = useState("");
	const [paymentReferenceId, setPaymentReferenceId] = useState("");
	const [bankingName, setBankingName] = useState("");
	const [showQR, setShowQR] = useState(false);
	const [upiUrl, setUpiUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const qrRef = useRef<HTMLDivElement>(null);

	// Get wallet balance and business settings from user context (fetched server-side)
	const walletBalance = user?.walletBalance || 0;
	const businessSettings = user?.businessSettings || {};

	useEffect(() => {
		fetchTransactions();
		fetchTopupRequests();

		// Auto-refresh transactions every 30 seconds when page is visible
		const interval = setInterval(() => {
			if (document.visibilityState === "visible") {
				fetchTransactions();
			}
		}, 30000);

		return () => clearInterval(interval);
	}, []);

	const fetchTransactions = async () => {
		try {
			const response = await api.get("/wallet/transactions");
			setTransactions(response.data.transactions || []);
		} catch (error) {
			// Failed to fetch transactions
		}
	};

	const fetchTopupRequests = async () => {
		try {
			const response = await api.get("/wallet/topup-requests");
			setTopupRequests(response.data.requests || []);
		} catch (error) {
			// Failed to fetch topup requests
		}
	};

	const generateQRCode = () => {
		const amt = parseFloat(amount);
		if (!amt || amt < 1) {
			alert("Enter a valid amount (minimum ₹1)");
			return;
		}

		const vpa = businessSettings.bankDetails?.upiId || "business@upi";
		const name = businessSettings.businessName || "King Shoppers";
		const tn = "Wallet Top-up";

		const params = new URLSearchParams({
			pa: vpa,
			pn: name,
			am: String(amt),
			cu: "INR",
			tn: tn,
		});

		const url = "upi://pay?" + params.toString();
		setUpiUrl(url);
		setShowQR(true);
	};

	const handlePaymentConfirmation = async () => {
		if (!paymentReferenceId.trim()) {
			alert("Please enter the UPI Transaction ID / Reference Number");
			return;
		}

		if (!bankingName.trim()) {
			alert("Please enter the name used for payment (Account holder name)");
			return;
		}

		setLoading(true);
		try {
			const response = await api.post("/wallet/add-money", {
				amount: parseFloat(amount),
				paymentMethod: "upi",
				referenceId: paymentReferenceId.trim(),
				bankingName: bankingName.trim(),
				notes: `Wallet top-up via UPI - Ref: ${paymentReferenceId}`,
			});

			// Refresh topup requests and transactions
			await Promise.all([fetchTopupRequests(), fetchTransactions()]);

			alert(
				response.data.message ||
					"Top-up request submitted! Waiting for admin approval."
			);
			setShowAddMoneyModal(false);
			setShowQR(false);
			setAmount("");
			setPaymentReferenceId("");
			setBankingName("");
		} catch (error: any) {
			alert(error.response?.data?.message || "Failed to add money");
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 2000);
		} catch (error) {
			alert("Failed to copy");
		}
	};

	const downloadQRCode = () => {
		const canvas = qrRef.current?.querySelector("canvas");
		if (canvas) {
			const url = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.download = `wallet-topup-qr-${amount}.png`;
			link.href = url;
			link.click();
		}
	};

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
							<p className="text-gray-600">Manage your wallet balance</p>
						</div>
						<Button onClick={() => setShowAddMoneyModal(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Add Money
						</Button>
					</div>
					{/* Wallet Cards */}
					<div className="grid grid-cols-1 gap-6">
						{/* Wallet Balance */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Wallet Balance
								</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									₹{walletBalance?.toLocaleString() || "0"}
								</div>
								<p className="text-xs text-muted-foreground">
									Available for orders
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Pending Topup Requests */}
					{topupRequests.filter((req) => req.status === "pending").length >
						0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
									Pending Approval
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{topupRequests
										.filter((req) => req.status === "pending")
										.map((req) => (
											<div
												key={req._id}
												className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
												<div className="flex-1">
													<p className="font-medium text-sm">
														₹{req.amount.toLocaleString()} - Waiting for
														approval
													</p>
													<p className="text-xs text-gray-600 mt-1">
														Payment Ref: {req.referenceId}
													</p>
													<p className="text-xs text-gray-500">
														{new Date(req.createdAt).toLocaleString()}
													</p>
												</div>
												<Badge variant="secondary" className="bg-yellow-100">
													Pending
												</Badge>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Recent Topup Requests */}
					{topupRequests.filter(
						(req) => req.status === "approved" || req.status === "rejected"
					).length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Recent Topup Requests</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{topupRequests
										.filter(
											(req) =>
												req.status === "approved" || req.status === "rejected"
										)
										.slice(0, 5)
										.map((req) => (
											<div
												key={req._id}
												className={`flex items-center justify-between p-3 border rounded-lg ${
													req.status === "approved"
														? "border-green-200 bg-green-50"
														: "border-red-200 bg-red-50"
												}`}>
												<div className="flex-1">
													<p className="font-medium text-sm">
														₹{req.amount.toLocaleString()}
													</p>
													<p className="text-xs text-gray-600 mt-1">
														Payment Ref: {req.referenceId}
													</p>
													{req.status === "rejected" && req.rejectionReason && (
														<p className="text-xs text-red-600 mt-1">
															Reason: {req.rejectionReason}
														</p>
													)}
													<p className="text-xs text-gray-500">
														{new Date(req.createdAt).toLocaleString()}
													</p>
												</div>
												<Badge
													variant={
														req.status === "approved"
															? "default"
															: "destructive"
													}
													className={
														req.status === "approved"
															? "bg-green-600"
															: "bg-red-600"
													}>
													{req.status === "approved" ? "Approved" : "Rejected"}
												</Badge>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Payment Terms */}
					{user?.paymentTerms && (
						<Card>
							<CardHeader>
								<CardTitle>Payment Terms</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Current Terms</p>
										<p className="text-sm text-gray-600">
											{user.paymentTerms === "immediate"
												? "Immediate Payment"
												: `${user.paymentTerms.replace("net", "Net ")} Days`}
										</p>
									</div>
									<Badge variant="secondary">
										{user.customerTier?.toUpperCase() || "BRONZE"} Tier
									</Badge>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Transaction History */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<History className="w-5 h-5" />
									Transaction History
									{transactions.length > 0 && (
										<Badge variant="secondary" className="ml-2">
											{transactions.length}
										</Badge>
									)}
								</CardTitle>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										fetchTransactions();
										fetchTopupRequests();
									}}
									className="gap-2">
									<RefreshCw className="w-4 h-4" />
									Refresh
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{transactions.length === 0 ? (
								<div className="text-center py-8">
									<History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										No transactions yet
									</h3>
									<p className="text-gray-600">
										Your wallet transactions will appear here
									</p>
								</div>
							) : (
								<div className="space-y-3 max-h-[600px] overflow-y-auto">
									{transactions.map((txn) => (
										<div
											key={txn.transactionId}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<p className="font-medium text-sm">
														{txn.description}
													</p>
													<Badge
														variant={
															txn.type === "credit" ? "default" : "secondary"
														}
														className="text-xs">
														{txn.type}
													</Badge>
												</div>
												<p className="text-xs text-gray-500 mt-1">
													{new Date(txn.timestamp).toLocaleString()}
												</p>
												<p className="text-xs text-gray-400">
													ID: {txn.transactionId}
												</p>
											</div>
											<div className="text-right">
												<p
													className={`font-bold ${
														txn.type === "credit"
															? "text-green-600"
															: "text-red-600"
													}`}>
													{txn.type === "credit" ? "+" : "-"}₹
													{txn.amount.toLocaleString()}
												</p>
												{txn.balanceAfter !== undefined && (
													<p className="text-xs text-gray-500">
														Balance: ₹{txn.balanceAfter.toLocaleString()}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Add Money Modal */}
			{showAddMoneyModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<Card className="w-full max-w-md">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Add Money to Wallet</CardTitle>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setShowAddMoneyModal(false);
									setShowQR(false);
									setAmount("");
									setPaymentReferenceId("");
								}}>
								<X className="w-4 h-4" />
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							{!showQR ? (
								<>
									<div>
										<Label htmlFor="amount">Enter Amount</Label>
										<Input
											id="amount"
											type="number"
											placeholder="Enter amount"
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
											min="1"
											className="mt-1"
										/>
										<p className="text-xs text-gray-500 mt-1">
											Minimum amount: ₹1
										</p>
									</div>
									{businessSettings.bankDetails && (
										<div className="bg-gray-50 p-3 rounded-lg space-y-2">
											<h3 className="font-medium text-sm">Payment Details</h3>
											{businessSettings.bankDetails.upiId && (
												<div>
													<p className="text-xs text-gray-600">UPI ID:</p>
													<div className="flex items-center gap-2">
														<p className="text-sm font-mono flex-1">
															{businessSettings.bankDetails.upiId}
														</p>
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																copyToClipboard(
																	businessSettings.bankDetails?.upiId || "",
																	"upiId"
																)
															}
															className="h-8 px-2">
															{copiedField === "upiId" ? (
																<Check className="w-4 h-4 text-green-600" />
															) : (
																<Copy className="w-4 h-4" />
															)}
														</Button>
													</div>
												</div>
											)}
											{businessSettings.bankDetails.accountNumber && (
												<>
													<div>
														<p className="text-xs text-gray-600">
															Account Number:
														</p>
														<div className="flex items-center gap-2">
															<p className="text-sm font-mono flex-1">
																{businessSettings.bankDetails.accountNumber}
															</p>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	copyToClipboard(
																		businessSettings.bankDetails
																			?.accountNumber || "",
																		"accountNumber"
																	)
																}
																className="h-8 px-2">
																{copiedField === "accountNumber" ? (
																	<Check className="w-4 h-4 text-green-600" />
																) : (
																	<Copy className="w-4 h-4" />
																)}
															</Button>
														</div>
													</div>
													<div>
														<p className="text-xs text-gray-600">IFSC Code:</p>
														<div className="flex items-center gap-2">
															<p className="text-sm font-mono flex-1">
																{businessSettings.bankDetails.ifscCode}
															</p>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	copyToClipboard(
																		businessSettings.bankDetails?.ifscCode ||
																			"",
																		"ifscCode"
																	)
																}
																className="h-8 px-2">
																{copiedField === "ifscCode" ? (
																	<Check className="w-4 h-4 text-green-600" />
																) : (
																	<Copy className="w-4 h-4" />
																)}
															</Button>
														</div>
													</div>
													<div>
														<p className="text-xs text-gray-600">Bank Name:</p>
														<p className="text-sm">
															{businessSettings.bankDetails.bankName}
														</p>
													</div>
												</>
											)}
										</div>
									)}{" "}
									<Button
										onClick={generateQRCode}
										className="w-full"
										disabled={!amount || parseFloat(amount) < 1}>
										Generate QR Code
									</Button>
								</>
							) : (
								<>
									<div className="text-center space-y-4">
										<div
											ref={qrRef}
											className="bg-white p-4 rounded-lg inline-block">
											<QRCodeCanvas value={upiUrl} size={256} />
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={downloadQRCode}
											className="gap-2">
											<Download className="w-4 h-4" />
											Download QR Code
										</Button>
										<div>
											<p className="font-medium text-lg">
												Amount: ₹{parseFloat(amount).toLocaleString()}
											</p>
											<p className="text-sm text-gray-600 mt-2">
												Scan this QR code with any UPI app
											</p>
											<p className="text-xs text-gray-500 mt-1">
												(Google Pay, PhonePe, Paytm, etc.)
											</p>
										</div>
									</div>

									<div className="space-y-3">
										<div>
											<Label htmlFor="paymentRef">
												UPI Transaction ID / Reference Number
											</Label>
											<Input
												id="paymentRef"
												type="text"
												placeholder="Enter UPI Reference/UTR Number"
												value={paymentReferenceId}
												onChange={(e) => setPaymentReferenceId(e.target.value)}
												className="mt-1"
											/>
											<p className="text-xs text-gray-500 mt-1">
												Enter the transaction ID from your payment app
											</p>
										</div>

										<div>
											<Label htmlFor="bankingName">
												Account Holder Name / Sender Name
											</Label>
											<Input
												id="bankingName"
												type="text"
												placeholder="Enter name used for payment"
												value={bankingName}
												onChange={(e) => setBankingName(e.target.value)}
												className="mt-1"
											/>
											<p className="text-xs text-gray-500 mt-1">
												Enter the name from which payment was made
											</p>
										</div>

										<Button
											onClick={handlePaymentConfirmation}
											className="w-full bg-green-600 hover:bg-green-700"
											disabled={
												loading ||
												!paymentReferenceId.trim() ||
												!bankingName.trim()
											}>
											{loading ? "Processing..." : "Confirm Payment"}
										</Button>
										<Button
											onClick={() => {
												setShowQR(false);
												setPaymentReferenceId("");
												setBankingName("");
											}}
											variant="outline"
											className="w-full">
											Back
										</Button>
									</div>

									<p className="text-xs text-gray-500 text-center">
										Complete the payment and enter the transaction ID above
									</p>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</AuthGuard>
	);
}
