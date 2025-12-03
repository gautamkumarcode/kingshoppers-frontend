"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function CategorySearch() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") || "");

	useEffect(() => {
		setQuery(searchParams.get("q") || "");
	}, [searchParams]);

	const handleSearch = (value: string) => {
		setQuery(value);
		if (value.trim()) {
			router.push(`/categories?q=${encodeURIComponent(value.trim())}`);
		} else {
			router.push("/categories");
		}
	};

	const clearSearch = () => {
		setQuery("");
		router.push("/categories");
	};

	return (
		<div className="relative">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
				<input
					type="text"
					value={query}
					onChange={(e) => handleSearch(e.target.value)}
					placeholder="Search categories..."
					className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
				{query && (
					<button
						onClick={clearSearch}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
}
