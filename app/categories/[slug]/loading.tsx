export default function Loading() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				<div className="space-y-6">
					{/* Breadcrumb Skeleton */}
					<div className="flex items-center space-x-2">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="flex items-center space-x-2">
								<div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
								{i < 4 && <span className="text-gray-400">›</span>}
							</div>
						))}
					</div>

					{/* Category Header Skeleton */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="h-9 bg-gray-200 rounded w-64 animate-pulse mb-3" />
								<div className="h-5 bg-gray-100 rounded w-full max-w-3xl animate-pulse mb-4" />
								<div className="flex items-center gap-4">
									<div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
									<div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
								</div>
							</div>
							<div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
						</div>
					</div>

					{/* Subcategories Skeleton */}
					<div>
						<div className="h-7 bg-gray-200 rounded w-40 animate-pulse mb-4" />
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="bg-white rounded-lg shadow-sm p-3">
									<div className="w-full h-28 bg-gray-200 rounded animate-pulse mb-3" />
									<div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-2" />
									<div className="h-3 bg-gray-100 rounded w-16 animate-pulse mx-auto" />
								</div>
							))}
						</div>
					</div>

					{/* Products Skeleton */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
							<div className="h-5 bg-gray-100 rounded w-32 animate-pulse" />
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
								<div key={i} className="bg-white rounded-lg shadow-sm p-4">
									<div className="aspect-square bg-gray-200 rounded animate-pulse mb-3" />
									<div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-2" />
									<div className="h-3 bg-gray-100 rounded w-20 animate-pulse mb-3" />
									<div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
