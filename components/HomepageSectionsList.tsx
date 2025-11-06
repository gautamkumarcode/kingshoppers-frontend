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
		<div className="container mx-auto px-4 py-8">
			<h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>

			{/* Desktop Grid View */}
			<div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{sections.map((section) => (
					<Link
						key={section._id}
						href={section.link}
						onClick={() => trackClick(section._id)}
						className="group">
						<Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105">
							<div className="relative h-64">
								<Image
									src={section.image}
									alt={section.name}
									fill
									className="object-cover transition-transform group-hover:scale-110"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-4 text-white">
									<h3 className="text-2xl font-bold">{section.title}</h3>
									{section.description && (
										<p className="mt-1 text-sm text-gray-200">
											{section.description}
										</p>
									)}
									<div className="mt-2 flex items-center text-sm font-medium">
										<span>Shop Now</span>
										<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
									</div>
								</div>
							</div>
						</Card>
					</Link>
				))}
			</div>

			{/* Mobile List View */}
			<div className="md:hidden space-y-4">
				{sections.map((section) => (
					<Link
						key={section._id}
						href={section.link}
						onClick={() => trackClick(section._id)}
						className="block">
						<Card className="overflow-hidden">
							<div className="flex items-center">
								<div className="relative h-32 w-32 shrink-0">
									<Image
										src={section.image}
										alt={section.name}
										fill
										className="object-cover"
									/>
								</div>
								<div className="flex-1 p-4">
									<h3 className="text-xl font-bold">{section.title}</h3>
									{section.description && (
										<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
											{section.description}
										</p>
									)}
									<div className="mt-2 flex items-center text-sm font-medium text-primary">
										<span>Shop Now</span>
										<ArrowRight className="ml-2 h-4 w-4" />
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
