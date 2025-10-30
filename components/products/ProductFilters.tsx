"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";

interface ProductFiltersProps {
	search: string;
	setSearch: (value: string) => void;
	selectedCategory: string;
	setSelectedCategory: (value: string) => void;
	selectedBrand: string;
	setSelectedBrand: (value: string) => void;
	sortBy: string;
	setSortBy: (value: string) => void;
	categories: any[];
	brands: any[];
	onClearFilters: () => void;
	onPageChange: (page: number) => void;
}

export default function ProductFilters({
	search,
	setSearch,
	selectedCategory,
	setSelectedCategory,
	selectedBrand,
	setSelectedBrand,
	sortBy,
	setSortBy,
	categories,
	brands,
	onClearFilters,
	onPageChange,
}: ProductFiltersProps) {
	const hasActiveFilters =
		search ||
		(selectedCategory && selectedCategory !== "all") ||
		(selectedBrand && selectedBrand !== "all") ||
		sortBy !== "name";

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4" />
						Filters & Search
					</div>
					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onClearFilters}
							className="text-muted-foreground hover:text-foreground">
							<X className="w-4 h-4 mr-1" />
							Clear All
						</Button>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search products, SKU, brand..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							onPageChange(1);
						}}
						className="pl-10"
					/>
				</div>

				{/* Filter Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<Label>Category</Label>
						<Select
							value={selectedCategory}
							onValueChange={(value) => {
								setSelectedCategory(value);
								onPageChange(1);
							}}>
							<SelectTrigger>
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category._id} value={category._id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Brand</Label>
						<Select
							value={selectedBrand}
							onValueChange={(value) => {
								setSelectedBrand(value);
								onPageChange(1);
							}}>
							<SelectTrigger>
								<SelectValue placeholder="All Brands" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Brands</SelectItem>
								{brands.map((brand) => (
									<SelectItem key={brand._id} value={brand._id}>
										{brand.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Sort By</Label>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name">Name A-Z</SelectItem>
								<SelectItem value="-name">Name Z-A</SelectItem>
								<SelectItem value="price">Price Low to High</SelectItem>
								<SelectItem value="-price">Price High to Low</SelectItem>
								<SelectItem value="-totalSold">Best Selling</SelectItem>
								<SelectItem value="-createdAt">Newest First</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
