import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
				<div className="text-6xl mb-4">📦</div>
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Category Not Found
				</h1>
				<p className="text-sm text-gray-600 mb-6">
					The category you're looking for doesn't exist or has been removed.
				</p>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Link
						href="/categories"
						className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
						Browse Categories
					</Link>
					<Link
						href="/"
						className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
