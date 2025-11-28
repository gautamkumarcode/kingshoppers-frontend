"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Input } from "./input";

interface LocationPickerProps {
	latitude: number | null;
	longitude: number | null;
	onLocationSelect: (lat: number, lng: number) => void;
}

export function LocationPicker({
	latitude,
	longitude,
	onLocationSelect,
}: LocationPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [map, setMap] = useState<any>(null);
	const [marker, setMarker] = useState<any>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searching, setSearching] = useState(false);
	const [baseLayers, setBaseLayers] = useState<any>(null);
	const [currentLayer, setCurrentLayer] = useState<"street" | "satellite">(
		"street"
	);
	const [gettingLocation, setGettingLocation] = useState(false);

	useEffect(() => {
		if (!isOpen || typeof window === "undefined") return;

		// Dynamically import Leaflet only on client side
		import("leaflet").then((L) => {
			// Fix for default marker icon
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
				iconUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
				shadowUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
			});

			// Initialize map
			const mapInstance = L.map("map").setView(
				[latitude || 20.5937, longitude || 78.9629],
				latitude ? 15 : 5
			);

			// Street map layer (OpenStreetMap)
			const streetLayer = L.tileLayer(
				"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
				{
					attribution: "© OpenStreetMap contributors",
					maxZoom: 19,
				}
			);

			// Satellite layer (Esri World Imagery)
			const satelliteLayer = L.tileLayer(
				"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
				{
					attribution: "© Esri",
					maxZoom: 19,
				}
			);

			// Add default layer
			streetLayer.addTo(mapInstance);

			// Store layers for switching
			setBaseLayers({ street: streetLayer, satellite: satelliteLayer });

			// Add marker if coordinates exist
			let markerInstance;
			if (latitude && longitude) {
				markerInstance = L.marker([latitude, longitude], {
					draggable: true,
				}).addTo(mapInstance);

				markerInstance.on("dragend", function (e: any) {
					const position = e.target.getLatLng();
					onLocationSelect(position.lat, position.lng);
				});
			}

			// Click to add/move marker
			mapInstance.on("click", function (e: any) {
				const { lat, lng } = e.latlng;
				if (markerInstance) {
					markerInstance.setLatLng([lat, lng]);
				} else {
					markerInstance = L.marker([lat, lng], {
						draggable: true,
					}).addTo(mapInstance);

					markerInstance.on("dragend", function (e: any) {
						const position = e.target.getLatLng();
						onLocationSelect(position.lat, position.lng);
					});
				}
				onLocationSelect(lat, lng);
			});

			setMap(mapInstance);
			setMarker(markerInstance);
		});

		return () => {
			if (map) {
				map.remove();
			}
		};
	}, [isOpen]);

	// Toggle between street and satellite view
	const toggleMapLayer = () => {
		if (!map || !baseLayers) return;

		if (currentLayer === "street") {
			map.removeLayer(baseLayers.street);
			baseLayers.satellite.addTo(map);
			setCurrentLayer("satellite");
		} else {
			map.removeLayer(baseLayers.satellite);
			baseLayers.street.addTo(map);
			setCurrentLayer("street");
		}
	};

	// Get current location
	const handleGetCurrentLocation = () => {
		if (!map) return;

		setGettingLocation(true);

		if (!navigator.geolocation) {
			alert("Geolocation is not supported by your browser");
			setGettingLocation(false);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				// Move map to current location
				map.setView([lat, lng], 17);

				// Add/move marker
				import("leaflet").then((L) => {
					if (marker) {
						marker.setLatLng([lat, lng]);
					} else {
						const newMarker = L.marker([lat, lng], {
							draggable: true,
						}).addTo(map);

						newMarker.on("dragend", function (e: any) {
							const position = e.target.getLatLng();
							onLocationSelect(position.lat, position.lng);
						});

						setMarker(newMarker);
					}
				});

				onLocationSelect(lat, lng);
				setGettingLocation(false);
			},
			(error) => {
				setGettingLocation(false);
				switch (error.code) {
					case error.PERMISSION_DENIED:
						alert("Location permission denied. Please enable location access.");
						break;
					case error.POSITION_UNAVAILABLE:
						alert("Location information unavailable.");
						break;
					case error.TIMEOUT:
						alert("Location request timed out.");
						break;
					default:
						alert("An unknown error occurred.");
				}
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			}
		);
	};

	// Search location using Nominatim
	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchQuery.trim() || !map) return;

		setSearching(true);
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					searchQuery
				)}&limit=1`,
				{
					headers: {
						"User-Agent": "KingShoppers-LocationPicker",
					},
				}
			);

			const data = await response.json();
			if (data && data.length > 0) {
				const { lat, lon } = data[0];
				const latitude = parseFloat(lat);
				const longitude = parseFloat(lon);

				// Move map to searched location
				map.setView([latitude, longitude], 15);

				// Add/move marker
				import("leaflet").then((L) => {
					if (marker) {
						marker.setLatLng([latitude, longitude]);
					} else {
						const newMarker = L.marker([latitude, longitude], {
							draggable: true,
						}).addTo(map);

						newMarker.on("dragend", function (e: any) {
							const position = e.target.getLatLng();
							onLocationSelect(position.lat, position.lng);
						});

						setMarker(newMarker);
					}
				});

				onLocationSelect(latitude, longitude);
			} else {
				alert("Location not found. Try a different search term.");
			}
		} catch (error) {
			console.error("Search error:", error);
			alert("Failed to search location. Please try again.");
		} finally {
			setSearching(false);
		}
	};

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setIsOpen(true)}>
				🗺️ Pick on Map
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
					<DialogHeader>
						<DialogTitle className="text-lg sm:text-xl">
							Select Your Shop Location
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-3 sm:space-y-4">
						{/* Search Bar and Current Location */}
						<div className="flex flex-col sm:flex-row gap-2">
							<form
								onSubmit={handleSearch}
								className="flex gap-2 flex-1 w-full">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										type="text"
										placeholder="Search location..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 text-sm"
									/>
								</div>
								<Button
									type="submit"
									disabled={searching}
									size="sm"
									className="shrink-0">
									{searching ? (
										<span className="hidden sm:inline">Searching...</span>
									) : (
										<>
											<span className="hidden sm:inline">Search</span>
											<span className="sm:hidden">🔍</span>
										</>
									)}
								</Button>
							</form>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleGetCurrentLocation}
								disabled={gettingLocation}
								title="Get my current location"
								className="shrink-0 w-full sm:w-auto">
								{gettingLocation ? (
									<>📍 Getting...</>
								) : (
									<>
										<span className="sm:hidden">📍 My Location</span>
										<span className="hidden sm:inline">📍</span>
									</>
								)}
							</Button>
						</div>

						{/* Map Layer Toggle */}
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
							<p className="text-xs sm:text-sm text-gray-600">
								Tap on map or drag marker to select location
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={toggleMapLayer}
								className="w-full sm:w-auto shrink-0">
								{currentLayer === "street" ? "🛰️ Satellite" : "🗺️ Street"}
							</Button>
						</div>

						<link
							rel="stylesheet"
							href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
						/>
						<div
							id="map"
							className="w-full rounded-lg"
							style={{
								height: "300px",
								minHeight: "250px",
							}}
						/>

						<Button
							onClick={() => setIsOpen(false)}
							className="w-full"
							size="lg">
							✓ Confirm Location
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
