import { AppInitializer } from "@/components/auth/AppInitializer";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "King shoppers",
	description: "Your one-step towards new shopping style",
	generator: "Aradhya tech",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`font-sans antialiased`}>
				<AuthProvider>
					<AppInitializer>
						<Navbar />
						{children}
						<Toaster />
						<Analytics />
					</AppInitializer>
				</AuthProvider>
			</body>
		</html>
	);
}
