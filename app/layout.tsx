import { AppInitializer } from "@/components/auth/AppInitializer";
import { Navbar } from "@/components/navbar";
import BottomNav from "@/components/navbar/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
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
	applicationName: "King shoppers",
	authors: [{ name: "Aradhya tech", url: "https://aradhyatech.com" }],
	creator: "Aradhya tech",
	keywords: [
		"ecommerce",
		"shopping",
		"online shopping",
		"deals",
		"discounts",
		"fashion",
		"electronics",
		"home decor",
		"King shoppers",
	],
	icons: "@/public/logo.png",
};
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head></head>
			<body className={`font-sans antialiased`}>
				<AuthProvider>
					<CartProvider>
						<AppInitializer>
							<Navbar />
							{children}
							<BottomNav />
							<Toaster />
							<Analytics />
						</AppInitializer>
					</CartProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
