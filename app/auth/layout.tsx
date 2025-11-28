import type React from "react";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className=" bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4 min-h-screen">
			<div className="w-full">{children}</div>
		</div>
	);
}
