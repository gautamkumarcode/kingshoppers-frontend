import { AppInitializer } from "@/components/auth/AppInitializer";
import Footer from "@/components/Footer/Footer";
import { Navbar } from "@/components/navbar";
import BottomNav from "@/components/navbar/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SocketProvider } from "@/context/SocketContext";
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
			<head>
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/logo3.png" />
			</head>
			<body className={`font-sans antialiased`}>
				<AuthProvider>
					<SocketProvider>
						<CartProvider>
							<AppInitializer>
								<div className="flex flex-col min-h-screen">
									<Navbar />
									<main className="flex-1">{children}</main>
									<Footer />
									<BottomNav />
								</div>
								<Toaster />
								<Analytics />
							</AppInitializer>
						</CartProvider>
					</SocketProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
