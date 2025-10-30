"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { CreditCard, DollarSign, History, Plus } from "lucide-react";

export default function WalletPage() {
	const { user } = useAuth();

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
							<p className="text-gray-600">Manage your wallet and credit</p>
						</div>
						<Button>
							<Plus className="w-4 h-4 mr-2" />
							Add Money
						</Button>
					</div>

					{/* Wallet Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
									₹{user?.walletBalance?.toLocaleString() || "0"}
								</div>
								<p className="text-xs text-muted-foreground">
									Available for orders
								</p>
							</CardContent>
						</Card>

						{/* Credit Limit */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Credit Limit
								</CardTitle>
								<CreditCard className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									₹{user?.creditLimit?.toLocaleString() || "0"}
								</div>
								<p className="text-xs text-muted-foreground">
									Total credit available
								</p>
							</CardContent>
						</Card>

						{/* Available Credit */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Available Credit
								</CardTitle>
								<CreditCard className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">
									₹{user?.availableCredit?.toLocaleString() || "0"}
								</div>
								<p className="text-xs text-muted-foreground">Ready to use</p>
							</CardContent>
						</Card>
					</div>

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
							<CardTitle className="flex items-center gap-2">
								<History className="w-5 h-5" />
								Transaction History
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8">
								<History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No transactions yet
								</h3>
								<p className="text-gray-600">
									Your wallet transactions will appear here
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AuthGuard>
	);
}
