"use client";

import api from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Banner {
	_id: string;
	title: string;
	description?: string;
	image: string;
	link?: string;
	bannerType: string;
	displayOrder: number;
	isActive: boolean;
}

interface BannerSliderProps {
	bannerType?: string;
	autoPlay?: boolean;
	autoPlayInterval?: number;
	showControls?: boolean;
	showDots?: boolean;
	className?: string;
}

export default function BannerSlider({
	bannerType = "deal",
	autoPlay = true,
	autoPlayInterval = 5000,
	showControls = true,
	showDots = true,
	className = "",
}: BannerSliderProps) {
	const [banners, setBanners] = useState<Banner[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		fetchBanners();
	}, [bannerType]);

	useEffect(() => {
		if (!autoPlay || isHovered || banners.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % banners.length);
		}, autoPlayInterval);

		return () => clearInterval(interval);
	}, [autoPlay, autoPlayInterval, banners.length, isHovered]);

	const fetchBanners = async () => {
		try {
			const response = await api.get(`/banners?bannerType=${bannerType}`);
			setBanners(response.data.data || []);
		} catch (error) {
			console.error("Error fetching banners:", error);
		} finally {
			setLoading(false);
		}
	};

	const handlePrevious = () => {
		setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev + 1) % banners.length);
	};

	const handleDotClick = (index: number) => {
		setCurrentIndex(index);
	};

	const trackClick = async (bannerId: string) => {
		try {
			await api.post(`/banners/${bannerId}/click`);
		} catch (error) {
			console.error("Error tracking banner click:", error);
		}
	};

	if (loading) {
		return (
			<div className={`relative w-full bg-gray-200 animate-pulse ${className}`}>
				<div className="aspect-video md:aspect-21/9"></div>
			</div>
		);
	}

	if (banners.length === 0) {
		return null;
	}

	const currentBanner = banners[currentIndex];

	return (
		<div
			className={`relative w-full overflow-hidden rounded-lg ${className}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			{/* Banner Container */}
			<div className="relative">
				{currentBanner.link ? (
					<Link
						href={currentBanner.link}
						onClick={() => trackClick(currentBanner._id)}
						className="block">
						<div className="relative aspect-video md:aspect-21/9 w-full">
							<img
								src={currentBanner.image}
								alt={currentBanner.title}
								className="w-full h-full object-cover"
							/>
							{/* Overlay with title and description */}
							{(currentBanner.title || currentBanner.description) && (
								<div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4 md:p-6">
									{currentBanner.title && (
										<h3 className="text-white text-xl md:text-3xl font-bold mb-1 md:mb-2">
											{currentBanner.title}
										</h3>
									)}
									{currentBanner.description && (
										<p className="text-white/90 text-sm md:text-base line-clamp-2">
											{currentBanner.description}
										</p>
									)}
								</div>
							)}
						</div>
					</Link>
				) : (
					<div className="relative aspect-video md:aspect-21/9 w-full">
						<img
							src={currentBanner.image}
							alt={currentBanner.title}
							className="w-full h-full object-cover"
						/>
						{/* Overlay with title and description */}
						{(currentBanner.title || currentBanner.description) && (
							<div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4 md:p-6">
								{currentBanner.title && (
									<h3 className="text-white text-xl md:text-3xl font-bold mb-1 md:mb-2">
										{currentBanner.title}
									</h3>
								)}
								{currentBanner.description && (
									<p className="text-white/90 text-sm md:text-base line-clamp-2">
										{currentBanner.description}
									</p>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Previous Button */}
			{showControls && banners.length > 1 && (
				<>
					<button
						onClick={handlePrevious}
						className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 md:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
						aria-label="Previous banner">
						<ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
					</button>

					{/* Next Button */}
					<button
						onClick={handleNext}
						className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 md:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
						aria-label="Next banner">
						<ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
					</button>
				</>
			)}

			{/* Dots Navigation */}
			{showDots && banners.length > 1 && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
					{banners.map((_, index) => (
						<button
							key={index}
							onClick={() => handleDotClick(index)}
							className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
								index === currentIndex
									? "bg-white w-6 md:w-8"
									: "bg-white/50 hover:bg-white/75"
							}`}
							aria-label={`Go to banner ${index + 1}`}
						/>
					))}
				</div>
			)}

			{/* Banner Counter */}
			<div className="absolute top-4 right-4 bg-black/50 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded-full">
				{currentIndex + 1} / {banners.length}
			</div>
		</div>
	);
}
