"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Loader2, Star, Upload, X } from "lucide-react";
import { useState } from "react";

interface ReviewFormProps {
	productId: string;
	productName: string;
	orderId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function ReviewForm({
	productId,
	productName,
	orderId,
	onSuccess,
	onCancel,
}: ReviewFormProps) {
	const { toast } = useToast();
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [title, setTitle] = useState("");
	const [comment, setComment] = useState("");
	const [images, setImages] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (images.length + files.length > 5) {
			toast({
				title: "Too many images",
				description: "You can upload maximum 5 images",
				variant: "destructive",
			});
			return;
		}

		setImages([...images, ...files]);

		// Create previews
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreviews((prev) => [...prev, reader.result as string]);
			};
			reader.readAsDataURL(file);
		});
	};

	const removeImage = (index: number) => {
		setImages(images.filter((_, i) => i !== index));
		setImagePreviews(imagePreviews.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (rating === 0) {
			toast({
				title: "Rating required",
				description: "Please select a rating",
				variant: "destructive",
			});
			return;
		}

		if (!comment.trim()) {
			toast({
				title: "Review required",
				description: "Please write your review",
				variant: "destructive",
			});
			return;
		}

		try {
			setLoading(true);

			const formData = new FormData();
			formData.append("productId", productId);
			formData.append("rating", rating.toString());
			formData.append("title", title);
			formData.append("comment", comment);
			if (orderId) formData.append("orderId", orderId);

			images.forEach((image) => {
				formData.append("images", image);
			});

			await api.post("/reviews", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			toast({
				title: "Success!",
				description: "Your review has been submitted",
			});

			if (onSuccess) onSuccess();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to submit review",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-2">Write a Review</h3>
				<p className="text-sm text-gray-600">for {productName}</p>
			</div>

			{/* Rating */}
			<div>
				<Label className="mb-2 block">Your Rating *</Label>
				<div className="flex gap-2">
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							type="button"
							onClick={() => setRating(star)}
							onMouseEnter={() => setHoverRating(star)}
							onMouseLeave={() => setHoverRating(0)}
							className="focus:outline-none">
							<Star
								className={`h-8 w-8 transition-colors ${
									star <= (hoverRating || rating)
										? "fill-yellow-400 text-yellow-400"
										: "text-gray-300"
								}`}
							/>
						</button>
					))}
					{rating > 0 && (
						<span className="ml-2 text-sm text-gray-600 self-center">
							{rating} {rating === 1 ? "star" : "stars"}
						</span>
					)}
				</div>
			</div>

			{/* Title */}
			<div>
				<Label htmlFor="title">Review Title (Optional)</Label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Summarize your experience"
					maxLength={100}
				/>
			</div>

			{/* Comment */}
			<div>
				<Label htmlFor="comment">Your Review *</Label>
				<Textarea
					id="comment"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder="Share your experience with this product..."
					rows={5}
					maxLength={1000}
					required
				/>
				<p className="text-xs text-gray-500 mt-1">
					{comment.length}/1000 characters
				</p>
			</div>

			{/* Images */}
			<div>
				<Label>Add Photos (Optional)</Label>
				<p className="text-xs text-gray-500 mb-2">
					Upload up to 5 images (JPG, PNG)
				</p>

				{imagePreviews.length > 0 && (
					<div className="grid grid-cols-5 gap-2 mb-3">
						{imagePreviews.map((preview, index) => (
							<div key={index} className="relative">
								<img
									src={preview}
									alt={`Preview ${index + 1}`}
									className="w-full h-20 object-cover rounded"
								/>
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
					</div>
				)}

				{images.length < 5 && (
					<label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400">
						<div className="flex flex-col items-center">
							<Upload className="h-6 w-6 text-gray-400" />
							<span className="text-xs text-gray-500 mt-1">Upload Images</span>
						</div>
						<input
							type="file"
							accept="image/*"
							multiple
							onChange={handleImageSelect}
							className="hidden"
						/>
					</label>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-3">
				<Button type="submit" disabled={loading} className="flex-1">
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						"Submit Review"
					)}
				</Button>
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				)}
			</div>
		</form>
	);
}
