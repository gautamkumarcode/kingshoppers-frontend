"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { CheckCircle, Loader2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Review {
	_id: string;
	rating: number;
	title?: string;
	comment: string;
	images?: string[];
	isVerifiedPurchase: boolean;
	helpfulCount: number;
	notHelpfulCount: number;
	user: {
		firstName?: string;
		lastName?: string;
		shopName?: string;
	};
	createdAt: string;
}

interface ReviewsListProps {
	productId: string;
}

export function ReviewsList({ productId }: ReviewsListProps) {
	const { toast } = useToast();
	const [reviews, setReviews] = useState<Review[]>([]);
	const [summary, setSummary] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [filterRating, setFilterRating] = useState<number | null>(null);
	const [sortBy, setSortBy] = useState("createdAt");

	useEffect(() => {
		fetchReviews();
	}, [productId, page, filterRating, sortBy]);

	const fetchReviews = async () => {
		try {
			setLoading(true);
			const params: any = { page, limit: 10, sortBy };
			if (filterRating) params.rating = filterRating;

			const response = await api.get(`/reviews/product/${productId}`, {
				params,
			});

			setReviews(response.data.data.reviews);
			setSummary(response.data.data.summary);
			setTotalPages(response.data.data.pagination.pages);
		} catch (error) {
			console.error("Error fetching reviews:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleVote = async (
		reviewId: string,
		vote: "helpful" | "not_helpful"
	) => {
		try {
			await api.post(`/reviews/${reviewId}/vote`, { vote });
			toast({
				title: "Thank you!",
				description: "Your feedback has been recorded",
			});
			fetchReviews();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to vote",
				variant: "destructive",
			});
		}
	};

	const renderStars = (rating: number, size = "h-4 w-4") => {
		return (
			<div className="flex gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`${size} ${
							star <= rating
								? "fill-yellow-400 text-yellow-400"
								: "text-gray-300"
						}`}
					/>
				))}
			</div>
		);
	};

	if (loading && page === 1) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary */}
			{summary && (
				<Card className="p-6">
					<div className="grid md:grid-cols-2 gap-6">
						<div className="text-center md:text-left">
							<div className="text-4xl font-bold mb-2">
								{summary.averageRating.toFixed(1)}
							</div>
							{renderStars(Math.round(summary.averageRating), "h-6 w-6")}
							<p className="text-sm text-gray-600 mt-2">
								Based on {summary.totalReviews} reviews
							</p>
						</div>

						<div className="space-y-2">
							{[5, 4, 3, 2, 1].map((star) => (
								<div key={star} className="flex items-center gap-2">
									<button
										onClick={() =>
											setFilterRating(filterRating === star ? null : star)
										}
										className="flex items-center gap-1 text-sm hover:text-blue-600">
										{star} <Star className="h-3 w-3" />
									</button>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className="bg-yellow-400 h-2 rounded-full"
											style={{
												width: `${
													summary.totalReviews > 0
														? (summary.ratingDistribution[star] /
																summary.totalReviews) *
														  100
														: 0
												}%`,
											}}
										/>
									</div>
									<span className="text-sm text-gray-600 w-8">
										{summary.ratingDistribution[star]}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Filters */}
					<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
						<Button
							variant={sortBy === "createdAt" ? "default" : "outline"}
							size="sm"
							onClick={() => setSortBy("createdAt")}>
							Most Recent
						</Button>
						<Button
							variant={sortBy === "helpful" ? "default" : "outline"}
							size="sm"
							onClick={() => setSortBy("helpful")}>
							Most Helpful
						</Button>
						<Button
							variant={sortBy === "rating" ? "default" : "outline"}
							size="sm"
							onClick={() => setSortBy("rating")}>
							Highest Rating
						</Button>
						{filterRating && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setFilterRating(null)}>
								Clear Filter
							</Button>
						)}
					</div>
				</Card>
			)}

			{/* Reviews */}
			{reviews.length === 0 ? (
				<Card className="p-12 text-center">
					<p className="text-gray-600">
						No reviews yet. Be the first to review!
					</p>
				</Card>
			) : (
				<div className="space-y-4">
					{reviews.map((review) => (
						<Card key={review._id} className="p-6">
							<div className="flex items-start justify-between mb-3">
								<div>
									<div className="flex items-center gap-2 mb-1">
										{renderStars(review.rating)}
										{review.isVerifiedPurchase && (
											<span className="flex items-center gap-1 text-xs text-green-600">
												<CheckCircle className="h-3 w-3" />
												Verified Purchase
											</span>
										)}
									</div>
									{review.title && (
										<h4 className="font-semibold">{review.title}</h4>
									)}
								</div>
								<span className="text-sm text-gray-500">
									{new Date(review.createdAt).toLocaleDateString()}
								</span>
							</div>

							<p className="text-sm text-gray-700 mb-3">{review.comment}</p>

							{review.images && review.images.length > 0 && (
								<div className="flex gap-2 mb-3">
									{review.images.map((image, index) => (
										<img
											key={index}
											src={image}
											alt={`Review ${index + 1}`}
											className="w-20 h-20 object-cover rounded cursor-pointer"
											onClick={() => window.open(image, "_blank")}
										/>
									))}
								</div>
							)}

							<div className="flex items-center justify-between pt-3 border-t">
								<p className="text-sm text-gray-600">
									By{" "}
									{review.user.firstName && review.user.lastName
										? `${review.user.firstName} ${review.user.lastName}`
										: review.user.shopName || "Anonymous"}
								</p>

								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-500">Helpful?</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleVote(review._id, "helpful")}
										className="h-8">
										<ThumbsUp className="h-4 w-4 mr-1" />
										{review.helpfulCount}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleVote(review._id, "not_helpful")}
										className="h-8">
										<ThumbsDown className="h-4 w-4 mr-1" />
										{review.notHelpfulCount}
									</Button>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-center gap-2">
					<Button
						variant="outline"
						disabled={page === 1}
						onClick={() => setPage(page - 1)}>
						Previous
					</Button>
					<span className="flex items-center px-4">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="outline"
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
