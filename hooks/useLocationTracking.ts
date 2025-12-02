"use client";

import { useSocket } from "@/context/SocketContext";
import { useEffect, useRef } from "react";

interface LocationTrackingOptions {
	enabled?: boolean;
	interval?: number; // in milliseconds
	highAccuracy?: boolean;
	useGoogleGeolocation?: boolean; // Use Google Geolocation API for better accuracy
}

export const useLocationTracking = (options: LocationTrackingOptions = {}) => {
	const {
		enabled = true,
		interval = 10000, // 10 seconds default
		highAccuracy = true,
		useGoogleGeolocation = true,
	} = options;

	const { socket, isConnected } = useSocket();
	const watchIdRef = useRef<number | null>(null);
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!enabled || !socket || !isConnected) {
			return;
		}

		if (!navigator.geolocation) {
			console.error("Geolocation is not supported by this browser");
			return;
		}

		const getLocationWithGoogle = async (): Promise<{
			latitude: number;
			longitude: number;
			accuracy: number;
		} | null> => {
			try {
				const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
				if (!apiKey) {
					console.warn(
						"Google Maps API key not found, falling back to browser geolocation"
					);
					return null;
				}

				// Get WiFi and cell tower data if available
				const response = await fetch(
					`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							considerIp: true,
						}),
					}
				);

				if (!response.ok) {
					console.warn(
						"Google Geolocation API failed, falling back to browser geolocation"
					);
					return null;
				}

				const data = await response.json();
				return {
					latitude: data.location.lat,
					longitude: data.location.lng,
					accuracy: data.accuracy,
				};
			} catch (error) {
				console.error("Error using Google Geolocation API:", error);
				return null;
			}
		};

		const sendLocation = async (position?: GeolocationPosition) => {
			let latitude: number;
			let longitude: number;
			let accuracy: number;

			// Try Google Geolocation API first if enabled
			if (useGoogleGeolocation) {
				const googleLocation = await getLocationWithGoogle();
				if (googleLocation) {
					latitude = googleLocation.latitude;
					longitude = googleLocation.longitude;
					accuracy = googleLocation.accuracy;
					console.log("Using Google Geolocation API:", {
						latitude,
						longitude,
						accuracy,
					});
				} else if (position) {
					// Fallback to browser geolocation
					latitude = position.coords.latitude;
					longitude = position.coords.longitude;
					accuracy = position.coords.accuracy;
					console.log("Using browser geolocation:", {
						latitude,
						longitude,
						accuracy,
					});
				} else {
					console.error("No location data available");
					return;
				}
			} else if (position) {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				accuracy = position.coords.accuracy;
				console.log("Using browser geolocation:", {
					latitude,
					longitude,
					accuracy,
				});
			} else {
				console.error("No location data available");
				return;
			}

			socket.emit("location:update", {
				latitude,
				longitude,
				accuracy,
				timestamp: new Date().toISOString(),
			});

			console.log("Location sent:", { latitude, longitude, accuracy });
		};

		const handleError = (error: GeolocationPositionError) => {
			console.error("Geolocation error:", error.message);
			// Try Google API as fallback even on error
			if (useGoogleGeolocation) {
				sendLocation();
			}
		};

		const updateLocation = () => {
			if (useGoogleGeolocation) {
				// Use Google API directly
				sendLocation();
			} else {
				// Use browser geolocation
				navigator.geolocation.getCurrentPosition(sendLocation, handleError, {
					enableHighAccuracy: highAccuracy,
					timeout: 10000,
					maximumAge: 0,
				});
			}
		};

		// Get initial location
		updateLocation();

		// Set up periodic location updates
		intervalIdRef.current = setInterval(updateLocation, interval);

		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
			}
			if (intervalIdRef.current) {
				clearInterval(intervalIdRef.current);
			}
		};
	}, [
		enabled,
		socket,
		isConnected,
		interval,
		highAccuracy,
		useGoogleGeolocation,
	]);
};
