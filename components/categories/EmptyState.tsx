import Link from "next/link";

interface EmptyStateProps {
	icon?: string;
	title: string;
	description: string;
	actionLabel?: string;
	actionHref?: string;
}

export function EmptyState({
	icon = "📦",
	title,
	description,
	actionLabel,
	actionHref,
}: EmptyStateProps) {
	return (
		<div className="bg-white rounded-lg shadow-sm p-12 text-center">
			<div className="text-6xl mb-4">{icon}</div>
			<h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
			<p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
				{description}
			</p>
			{actionLabel && actionHref && (
				<Link
					href={actionHref}
					className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
					{actionLabel}
				</Link>
			)}
		</div>
	);
}
