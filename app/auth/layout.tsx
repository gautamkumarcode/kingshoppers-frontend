import type React from "react";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-linear-to-br from-primary/10 to-accent/10 min-h-screen py-4 sm:py-8">
			<div className="container mx-auto px-4 max-w-5xl">{children}</div>
		</div>
	);
}
