import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	typescript: {
		ignoreBuildErrors: true,
	},

	images: {
		unoptimized: true,
	},

	// 🔥 Fix Turbopack errors — tell Next.js we intentionally configure it
	turbopack: {},
};

export default withPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
})(nextConfig);
