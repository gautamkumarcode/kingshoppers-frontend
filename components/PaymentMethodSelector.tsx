"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Download, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";

interface PaymentMethodSelectorProps {
	amount: number;
	businessSettings?: {
		businessName?: string;
		bankDetails?: {
			upiId?: string;
			accountNumber?: string;
			ifscCode?: string;
			bankName?: string;
			accountHolderName?: string;
		};
	};
	onPaymentConfirm?: (referenceId: string, bankingName: string) => void;
	showModal?: boolean;
	onClose?: () => void;
}

export default function PaymentMethodSelector({
	amount,
	businessSettings,
	onPaymentConfirm,
	showModal = false,
	onClose,
}: PaymentMethodSelectorProps) {
	const [showQR, setShowQR] = useState(false);
	const [paymentReferenceId, setPaymentReferenceId] = useState("");
	const [bankingName, setBankingName] = useState("");
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const qrRef = useRef<HTMLDivElement>(null);

	const vpa = businessSettings?.bankDetails?.upiId || "business@upi";
	const name = businessSettings?.businessName || "King Shoppers";
	const tn = "Order Payment";

	const params = new URLSearchParams({
		pa: vpa,
		pn: name,
		am: String(amount),
		cu: "INR",
		tn: tn,
	});

	const upiUrl = "upi://pay?" + params.toString();

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
			link.download = `payment-qr-${amount}.png`;
			link.href = url;
			link.click();
		}
	};

	const handleConfirm = () => {
		if (!paymentReferenceId.trim()) {
			alert("Please enter the payment reference ID");
			return;
		}
		if (!bankingName.trim()) {
			alert("Please enter the account holder name");
			return;
		}
		if (onPaymentConfirm) {
			onPaymentConfirm(paymentReferenceId, bankingName);
		}
	};

	const content = (
		<div className="space-y-4">
			{!showQR ? (
				<>
					<div>
						<Label className="text-lg font-semibold">
							Payment Amount: ₹{amount.toLocaleString()}
						</Label>
						<p className="text-sm text-gray-600 mt-1">
							Choose your payment method below
						</p>
					</div>

					{businessSettings?.bankDetails && (
						<div className="bg-gray-50 p-4 rounded-lg space-y-3">
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
										<p className="text-xs text-gray-600">Account Number:</p>
										<div className="flex items-center gap-2">
											<p className="text-sm font-mono flex-1">
												{businessSettings.bankDetails.accountNumber}
											</p>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													copyToClipboard(
														businessSettings.bankDetails?.accountNumber || "",
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
														businessSettings.bankDetails?.ifscCode || "",
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
					)}

					<Button onClick={() => setShowQR(true)} className="w-full" size="lg">
						Generate Payment QR Code
					</Button>
				</>
			) : (
				<>
					<div className="text-center space-y-4">
						<div
							ref={qrRef}
							className="bg-white p-4 rounded-lg inline-block border">
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
								Amount: ₹{amount.toLocaleString()}
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
							onClick={handleConfirm}
							className="w-full bg-green-600 hover:bg-green-700"
							disabled={
								loading || !paymentReferenceId.trim() || !bankingName.trim()
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
		</div>
	);

	if (showModal) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Payment Method</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent>{content}</CardContent>
				</Card>
			</div>
		);
	}

	return <div>{content}</div>;
}
