"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
	CheckCircle,
	Download,
	Eye,
	FileText,
	Image,
	Upload,
	X,
} from "lucide-react";
import { useState } from "react";

interface DocumentFile {
	url: string;
	publicId: string;
	uploadedAt: string;
}

interface DocumentCardProps {
	title: string;
	documentFile: DocumentFile | null;
	type: "pdf" | "image";
	onUpload: (fileData: any) => void;
	onRemove: () => void;
	required?: boolean;
}

function DocumentCard({
	title,
	documentFile,
	type,
	onUpload,
	onRemove,
	required = false,
}: DocumentCardProps) {
	const handleView = () => {
		if (documentFile?.url) {
			window.open(documentFile.url, "_blank");
		}
	};

	const handleDownload = () => {
		if (documentFile?.url) {
			const link = window.document.createElement("a");
			link.href = documentFile.url;
			link.download = `${title.replace(/\s+/g, "_")}.${
				type === "pdf" ? "pdf" : "jpg"
			}`;
			window.document.body.appendChild(link);
			link.click();
			window.document.body.removeChild(link);
		}
	};

	const getIcon = () => {
		if (type === "pdf") {
			return <FileText className="w-8 h-8 text-red-500" />;
		}
		return <Image className="w-8 h-8 text-blue-500" />;
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center justify-between">
					<span className="flex items-center gap-2">
						{getIcon()}
						{title}
						{required && <span className="text-red-500 text-sm">*</span>}
					</span>
					{documentFile && (
						<Badge variant="secondary" className="text-xs">
							<CheckCircle className="w-3 h-3 mr-1" />
							Uploaded
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{documentFile ? (
					<div className="space-y-4">
						{/* Document Preview */}
						<div className="border rounded-lg p-4 bg-gray-50">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									{getIcon()}
									<div>
										<p className="font-medium">Document Uploaded</p>
										<p className="text-sm text-gray-600">
											Uploaded on{" "}
											{new Date(documentFile.uploadedAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={handleView}>
										<Eye className="w-4 h-4 mr-1" />
										View
									</Button>
									<Button variant="outline" size="sm" onClick={handleDownload}>
										<Download className="w-4 h-4 mr-1" />
										Download
									</Button>
								</div>
							</div>
						</div>

						{/* Replace Document */}
						<div className="border-t pt-4">
							<p className="text-sm text-gray-600 mb-3">
								Need to update this document? Upload a new one to replace it.
							</p>
							<FileUpload
								label={`Replace ${title}`}
								accept={type === "pdf" ? ".pdf" : ".jpg,.jpeg,.png"}
								fileType={title.toLowerCase().replace(/\s+/g, "") as any}
								onFileUploaded={onUpload}
								maxSize={type === "pdf" ? 5 : 3}
							/>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
							<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No {title} Uploaded
							</h3>
							<p className="text-gray-600 mb-4">
								{required
									? "This document is required for account verification."
									: "Upload this document to complete your profile."}
							</p>
						</div>

						<FileUpload
							label={`Upload ${title}`}
							accept={type === "pdf" ? ".pdf" : ".jpg,.jpeg,.png"}
							fileType={title.toLowerCase().replace(/\s+/g, "") as any}
							onFileUploaded={onUpload}
							maxSize={type === "pdf" ? 5 : 3}
							required={required}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default function DocumentsTab() {
	const { user, refreshUser } = useAuth();
	const [updating, setUpdating] = useState(false);

	const handleDocumentUpload = async (documentType: string, fileData: any) => {
		setUpdating(true);
		try {
			// Update user profile with new document
			await api.put("/profile/documents", {
				[documentType]: {
					url: fileData.url,
					publicId: fileData.publicId,
					uploadedAt: new Date().toISOString(),
				},
			});

			// Refresh user data
			await refreshUser();
		} catch (error) {
			console.error("Error updating document:", error);
		} finally {
			setUpdating(false);
		}
	};

	const handleDocumentRemove = async (documentType: string) => {
		setUpdating(true);
		try {
			await api.delete(`/profile/documents/${documentType}`);
			await refreshUser();
		} catch (error) {
			console.error("Error removing document:", error);
		} finally {
			setUpdating(false);
		}
	};

	if (!user) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600">Please log in to view your documents.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Documents Status */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" />
						Document Verification Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center">
							<div
								className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
									user.aadhaarPhoto ? "bg-green-100" : "bg-gray-100"
								}`}>
								{user.aadhaarPhoto ? (
									<CheckCircle className="w-6 h-6 text-green-600" />
								) : (
									<X className="w-6 h-6 text-gray-400" />
								)}
							</div>
							<p className="font-medium">Aadhaar Card</p>
							<p className="text-sm text-gray-600">
								{user.aadhaarPhoto ? "Uploaded" : "Required"}
							</p>
						</div>

						<div className="text-center">
							<div
								className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
									user.panCardPhoto ? "bg-green-100" : "bg-gray-100"
								}`}>
								{user.panCardPhoto ? (
									<CheckCircle className="w-6 h-6 text-green-600" />
								) : (
									<X className="w-6 h-6 text-gray-400" />
								)}
							</div>
							<p className="font-medium">PAN Card</p>
							<p className="text-sm text-gray-600">
								{user.panCardPhoto ? "Uploaded" : "Required"}
							</p>
						</div>

						<div className="text-center">
							<div
								className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
									user.gstDocument ? "bg-green-100" : "bg-gray-100"
								}`}>
								{user.gstDocument ? (
									<CheckCircle className="w-6 h-6 text-green-600" />
								) : (
									<X className="w-6 h-6 text-gray-400" />
								)}
							</div>
							<p className="font-medium">GST Certificate</p>
							<p className="text-sm text-gray-600">
								{user.gstDocument ? "Uploaded" : "Optional"}
							</p>
						</div>
					</div>

					{(!user.aadhaarPhoto || !user.panCardPhoto) && (
						<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<p className="text-yellow-800 text-sm">
								<strong>Action Required:</strong> Please upload all required
								documents to complete your account verification.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Document Upload Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<DocumentCard
					title="Aadhaar Card Photo"
					documentFile={user.aadhaarPhoto || null}
					type="image"
					onUpload={(fileData) =>
						handleDocumentUpload("aadhaarPhoto", fileData)
					}
					onRemove={() => handleDocumentRemove("aadhaarPhoto")}
					required={true}
				/>

				<DocumentCard
					title="PAN Card Photo"
					documentFile={user.panCardPhoto || null}
					type="image"
					onUpload={(fileData) =>
						handleDocumentUpload("panCardPhoto", fileData)
					}
					onRemove={() => handleDocumentRemove("panCardPhoto")}
					required={true}
				/>
			</div>

			<DocumentCard
				title="GST Certificate"
				documentFile={user.gstDocument || null}
				type="pdf"
				onUpload={(fileData) => handleDocumentUpload("gstDocument", fileData)}
				onRemove={() => handleDocumentRemove("gstDocument")}
				required={false}
			/>

			{/* Help Section */}
			<Card>
				<CardHeader>
					<CardTitle>Document Guidelines</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4 text-sm">
						<div>
							<h4 className="font-medium mb-2">Aadhaar Card Photo:</h4>
							<ul className="list-disc list-inside text-gray-600 space-y-1">
								<li>Clear, readable photo of your Aadhaar card</li>
								<li>All details should be visible</li>
								<li>Accepted formats: JPG, PNG (max 3MB)</li>
							</ul>
						</div>

						<div>
							<h4 className="font-medium mb-2">PAN Card Photo:</h4>
							<ul className="list-disc list-inside text-gray-600 space-y-1">
								<li>Clear, readable photo of your PAN card</li>
								<li>All details should be visible</li>
								<li>Accepted formats: JPG, PNG (max 3MB)</li>
							</ul>
						</div>

						<div>
							<h4 className="font-medium mb-2">GST Certificate (Optional):</h4>
							<ul className="list-disc list-inside text-gray-600 space-y-1">
								<li>Valid GST registration certificate</li>
								<li>Required for GST billing and higher credit limits</li>
								<li>Accepted format: PDF (max 5MB)</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
