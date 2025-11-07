"use client";

import api from "@/lib/api";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";

interface HomepageSection {
	_id: string;
	name: string;
	title: string;
	description?: string;
	image: string;
	link: string;
	displayOrder: number;
	sectionType: string;
}

export default function HomepageSectionsList() {
	const [sections, setSections] = useState<HomepageSection[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchSections();
	}, []);

	const fetchSections = async () => {
		try {
			const response = await api.get("/homepage-sections");
			setSections(response.data.data);
		} catch (error) {
			console.error("Error fetching sections:", error);
		} finally {
			setLoading(false);
		}
	};

	const trackClick = async (sectionId: string) => {
		try {
			await api.post(`/homepage-sections/${sectionId}/click`);
		} catch (error) {
			console.error("Error tracking click:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-4 md:py-8 mb-20 md:mb-0">
			{/* Desktop Grid View */}
			<div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
				{sections.map((section) => (
					<Link
						key={section._id}
						href={section.link}
						onClick={() => trackClick(section._id)}
						className="group">
						<Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105 p-0">
							<div className="relative h-48 lg:h-64 w-full">
								<Image
									src={section.image}
									alt={section.name}
									fill
									className="object-cover transition-transform group-hover:scale-110"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 text-white">
									<h3 className="text-xl lg:text-2xl font-bold line-clamp-2">
										{section.title}
									</h3>
									{section.description && (
										<p className="mt-1 text-xs lg:text-sm text-gray-200 line-clamp-2">
											{section.description}
										</p>
									)}
									<div className="mt-2 flex items-center text-xs lg:text-sm font-medium">
										<span>Shop Now</span>
										<ArrowRight className="ml-2 h-3 w-3 lg:h-4 lg:w-4 transition-transform group-hover:translate-x-1" />
									</div>
								</div>
							</div>
						</Card>
					</Link>
				))}
			</div>

			{/* Mobile Grid View */}
			<div className="md:hidden grid grid-cols-2 gap-3">
				{sections.map((section) => (
					<Link
						key={section._id}
						href={section.link}
						onClick={() => trackClick(section._id)}
						className="group">
						<Card className="overflow-hidden transition-all active:scale-95 p-0">
							<div className="relative h-40 sm:h-48 w-full">
								<Image
									src={section.image}
									alt={section.name}
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 text-white">
									<h3 className="text-sm sm:text-base font-bold line-clamp-2">
										{section.title}
									</h3>
									{section.description && (
										<p className="mt-0.5 text-[10px] sm:text-xs text-gray-200 line-clamp-1">
											{section.description}
										</p>
									)}
									<div className="mt-1.5 flex items-center text-[10px] sm:text-xs font-medium">
										<span>Shop Now</span>
										<ArrowRight className="ml-1 h-3 w-3 transition-transform group-active:translate-x-1" />
									</div>
								</div>
							</div>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
