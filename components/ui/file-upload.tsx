"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { CheckCircle, FileText, Image, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploadProps {
	label: string;
	accept: string;
	fileType:
		| "gstDocument"
		| "aadhaarPhoto"
		| "aadhaarPhotoBack"
		| "panCardPhoto";
	onFileUploaded: (fileData: any) => void;
	maxSize?: number; // in MB
	required?: boolean;
}

export function FileUpload({
	label,
	accept,
	fileType,
	onFileUploaded,
	maxSize = 5,
	required = false,
}: FileUploadProps) {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [uploaded, setUploaded] = useState(false);
	const [error, setError] = useState("");
	const [preview, setPreview] = useState<string | null>(null);

	const handleFileSelect = useCallback(
		(selectedFile: File) => {
			setError("");

			// Validate file size
			if (selectedFile.size > maxSize * 1024 * 1024) {
				setError(`File size must be less than ${maxSize}MB`);
				return;
			}

			// Validate file type
			const allowedTypes = accept.split(",").map((type) => type.trim());
			const fileExtension =
				"." + selectedFile.name.split(".").pop()?.toLowerCase();

			if (
				!allowedTypes.includes(fileExtension) &&
				!allowedTypes.includes(selectedFile.type)
			) {
				setError("Invalid file type");
				return;
			}

			setFile(selectedFile);

			// Create preview for images
			if (selectedFile.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onload = (e) => setPreview(e.target?.result as string);
				reader.readAsDataURL(selectedFile);
			} else {
				setPreview(null);
			}
		},
		[accept, maxSize]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			const droppedFile = e.dataTransfer.files[0];
			if (droppedFile) {
				handleFileSelect(droppedFile);
			}
		},
		[handleFileSelect]
	);

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			handleFileSelect(selectedFile);
		}
	};

	const uploadFile = async () => {
		if (!file) return;

		setUploading(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append(fileType, file);

			const response = await api.post("/upload/documents", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			const uploadedFileData = response.data.files[fileType];
			setUploaded(true);
			onFileUploaded(uploadedFileData);
		} catch (error: any) {
			console.error("Upload error:", error);
			setError(error.response?.data?.message || "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	const removeFile = () => {
		setFile(null);
		setPreview(null);
		setUploaded(false);
		setError("");
	};

	const getFileIcon = () => {
		if (!file) return <Upload className="w-8 h-8 text-muted-foreground" />;

		if (file.type === "application/pdf") {
			return <FileText className="w-8 h-8 text-red-500" />;
		}

		if (file.type.startsWith("image/")) {
			return <Image className="w-8 h-8 text-blue-500" />;
		}

		return <FileText className="w-8 h-8 text-gray-500" />;
	};

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">
				{label} {required && <span className="text-red-500">*</span>}
			</Label>

			<Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
				<CardContent className="p-4">
					{!file ? (
						<div
							className="text-center cursor-pointer"
							onDrop={handleDrop}
							onDragOver={(e) => e.preventDefault()}
							onClick={() =>
								document.getElementById(`file-${fileType}`)?.click()
							}>
							<div className="flex flex-col items-center space-y-2">
								<Upload className="w-8 h-8 text-muted-foreground" />
								<div className="text-sm text-muted-foreground">
									<span className="font-medium text-primary">
										Click to upload
									</span>{" "}
									or drag and drop
								</div>
								<div className="text-xs text-muted-foreground">
									{accept.toUpperCase()} up to {maxSize}MB
								</div>
							</div>

							<input
								id={`file-${fileType}`}
								type="file"
								accept={accept}
								onChange={handleFileInput}
								className="hidden"
							/>
						</div>
					) : (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									{getFileIcon()}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{(file.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>

								<div className="flex items-center space-x-2">
									{uploaded && (
										<CheckCircle className="w-5 h-5 text-green-500" />
									)}
									<Button
										variant="ghost"
										size="sm"
										onClick={removeFile}
										disabled={uploading}>
										<X className="w-4 h-4" />
									</Button>
								</div>
							</div>

							{preview && (
								<div className="mt-2">
									<img
										src={preview}
										alt="Preview"
										className="max-w-full h-32 object-cover rounded border"
									/>
								</div>
							)}

							{!uploaded && (
								<Button
									onClick={uploadFile}
									disabled={uploading}
									className="w-full"
									size="sm">
									{uploading ? "Uploading..." : "Upload File"}
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{error && <p className="text-sm text-red-500">{error}</p>}
		</div>
	);
}
