export default function Loading() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				<div className="space-y-6">
					{/* Header Skeleton */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
							<div className="flex-1">
								<div className="h-9 bg-gray-200 rounded w-64 animate-pulse mb-3" />
								<div className="h-5 bg-gray-100 rounded w-96 animate-pulse mb-2" />
								<div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
							</div>
							<div className="w-full md:w-80">
								<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
							</div>
						</div>
					</div>

					{/* Category Sections Skeleton */}
					{[1, 2, 3].map((i) => (
						<div key={i} className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-4 flex-1">
									<div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
									<div className="flex-1">
										<div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2" />
										<div className="h-4 bg-gray-100 rounded w-96 animate-pulse mb-2" />
										<div className="h-4 bg-gray-100 rounded w-64 animate-pulse" />
									</div>
								</div>
								<div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
							</div>

							<div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-100">
								{[1, 2, 3, 4, 5, 6].map((j) => (
									<div
										key={j}
										className="h-8 w-24 bg-gray-100 rounded-full animate-pulse"
									/>
								))}
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
								{[1, 2, 3, 4, 5, 6].map((j) => (
									<div key={j} className="bg-gray-50 rounded-lg p-3">
										<div className="w-full h-24 bg-gray-200 rounded-lg animate-pulse mb-3" />
										<div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-2" />
										<div className="h-3 bg-gray-100 rounded w-16 animate-pulse mx-auto" />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
