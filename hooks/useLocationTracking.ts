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
		interval = 5000, // 5 seconds default
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
					return null;
				}

				const data = await response.json();
				return {
					latitude: data.location.lat,
					longitude: data.location.lng,
					accuracy: data.accuracy,
				};
			} catch (error) {
				return null;
			}
		};

		const sendLocation = async (position?: GeolocationPosition) => {
			let latitude: number;
			let longitude: number;
			let accuracy: number;
			let source: string;

			// Always prefer browser GPS for accuracy
			if (position) {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				accuracy = position.coords.accuracy;
				source = "GPS";
			} else if (useGoogleGeolocation) {
				// Only use Google API if GPS is not available
				const googleLocation = await getLocationWithGoogle();
				if (googleLocation) {
					latitude = googleLocation.latitude;
					longitude = googleLocation.longitude;
					accuracy = googleLocation.accuracy;
					source = "Google IP";
				} else {
					return;
				}
			} else {
				return;
			}

			socket.emit("location:update", {
				latitude,
				longitude,
				accuracy,
				source,
				timestamp: new Date().toISOString(),
			});
		};

		const handleError = (error: GeolocationPositionError) => {
			// Try Google API as fallback even on error
			if (useGoogleGeolocation) {
				sendLocation();
			}
		};

		const updateLocation = () => {
			// Always try browser GPS first for best accuracy
			navigator.geolocation.getCurrentPosition(sendLocation, handleError, {
				enableHighAccuracy: highAccuracy,
				timeout: 10000,
				maximumAge: 0,
			});
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
