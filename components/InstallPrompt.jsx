"use client";
import { useEffect, useState } from "react";

export const InstallPrompt = () => {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [show, setShow] = useState(true);

	useEffect(() => {
		const handler = (e) => {
			// Stop Chrome from showing its own popup
			e.preventDefault();
			setDeferredPrompt(e);
			setShow(true);
		};

		window.addEventListener("beforeinstallprompt", handler);

		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const installApp = async () => {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();
		const res = await deferredPrompt.userChoice;

		if (res.outcome === "accepted") {
			console.log("User installed app");
		}

		setDeferredPrompt(null);
		setShow(false);
	};

	if (!show) return null;

	return (
		<div
			style={{
				position: "fixed",
				bottom: "20px",
				left: "50%",
				transform: "translateX(-50%)",
				background: "#2563eb",
				color: "white",
				padding: "15px 25px",
				borderRadius: "10px",
				zIndex: 9999,
			}}>
			<p>Install Kingshoppers App</p>
			<button
				onClick={installApp}
				style={{
					marginTop: "10px",
					padding: "10px 15px",
					background: "white",
					color: "#2563eb",
					borderRadius: "5px",
				}}>
				Install Now
			</button>
		</div>
	);
};
