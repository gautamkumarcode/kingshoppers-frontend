"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { MapPin, Navigation, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface GoogleLocationPickerProps {
	latitude: number | null;
	longitude: number | null;
	onLocationSelect: (lat: number, lng: number, address?: string) => void;
	apiKey?: string;
}

const mapContainerStyle = {
	width: "100%",
	height: "450px",
	borderRadius: "8px",
};

const defaultCenter = {
	lat: 20.5937,
	lng: 78.9629, // Center of India
};

export function GoogleLocationPicker({
	latitude,
	longitude,
	onLocationSelect,
	apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
}: GoogleLocationPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [mapCenter, setMapCenter] = useState(defaultCenter);
	const [markerPosition, setMarkerPosition] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searching, setSearching] = useState(false);
	const [gettingLocation, setGettingLocation] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState<string>("");

	useEffect(() => {
		if (latitude && longitude) {
			setMapCenter({ lat: latitude, lng: longitude });
			setMarkerPosition({ lat: latitude, lng: longitude });
		}
	}, [latitude, longitude]);

	const reverseGeocode = async (lat: number, lng: number) => {
		try {
			const geocoder = new google.maps.Geocoder();
			geocoder.geocode({ location: { lat, lng } }, (results, status) => {
				if (status === "OK" && results && results[0]) {
					setSelectedAddress(results[0].formatted_address);
				}
			});
		} catch (error) {
			console.error("Reverse geocoding error:", error);
		}
	};

	const handleMapClick = (e: google.maps.MapMouseEvent) => {
		if (e.latLng) {
			const lat = e.latLng.lat();
			const lng = e.latLng.lng();
			setMarkerPosition({ lat, lng });
			reverseGeocode(lat, lng);
		}
	};

	const handleGetCurrentLocation = () => {
		setGettingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					const accuracy = position.coords.accuracy;

					setMapCenter({ lat, lng });
					setMarkerPosition({ lat, lng });
					reverseGeocode(lat, lng);
					setGettingLocation(false);

					// Show accuracy info
					if (accuracy > 50) {
						alert(
							`Location detected with accuracy of ±${Math.round(accuracy)}m. ` +
								`For better accuracy, ensure GPS is enabled and you're outdoors.`
						);
					}
				},
				(error) => {
					console.error("Error getting location:", error);
					setGettingLocation(false);
					alert(
						"Unable to get your location. Please select manually on the map."
					);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				}
			);
		} else {
			setGettingLocation(false);
			alert("Geolocation is not supported by your browser");
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;

		setSearching(true);
		try {
			const geocoder = new google.maps.Geocoder();
			geocoder.geocode(
				{
					address: searchQuery,
					componentRestrictions: { country: "IN" }, // Restrict to India for better results
				},
				(results, status) => {
					if (status === "OK" && results && results[0]) {
						const location = results[0].geometry.location;
						const lat = location.lat();
						const lng = location.lng();
						setMapCenter({ lat, lng });
						setMarkerPosition({ lat, lng });
						setSelectedAddress(results[0].formatted_address);
					} else {
						alert("Location not found. Please try a different search term.");
					}
					setSearching(false);
				}
			);
		} catch (error) {
			console.error("Search error:", error);
			setSearching(false);
		}
	};

	const handleConfirm = () => {
		if (markerPosition) {
			onLocationSelect(markerPosition.lat, markerPosition.lng, selectedAddress);
			setIsOpen(false);
		}
	};

	if (!apiKey) {
		return (
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled
				className="text-xs">
				<MapPin className="w-4 h-4 mr-2" />
				Google Maps API Key Required
			</Button>
		);
	}

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setIsOpen(true)}
				className="text-xs sm:text-sm">
				<MapPin className="w-4 h-4 mr-2" />
				{latitude && longitude ? "Update Location" : "Pick Location"}
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
					<div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
						<DialogHeader>
							<DialogTitle className="text-xl flex items-center gap-2">
								<MapPin className="w-5 h-5 text-primary" />
								Select Shop Location
							</DialogTitle>
							<p className="text-sm text-muted-foreground mt-1">
								Choose the exact location of your shop for accurate delivery
							</p>
						</DialogHeader>
					</div>

					<div className="space-y-4 px-6 py-4">
						{/* Search and Location Controls */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div className="md:col-span-2">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
									<Input
										placeholder="Search: Shop name, street, landmark..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyPress={(e) => e.key === "Enter" && handleSearch()}
										className="pl-9 h-11"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<Button
									onClick={handleSearch}
									disabled={searching || !searchQuery.trim()}
									className="h-11">
									{searching ? "..." : "Search"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleGetCurrentLocation}
									disabled={gettingLocation}
									className="h-11">
									<Navigation className="w-4 h-4 mr-2" />
									{gettingLocation ? "..." : "GPS"}
								</Button>
							</div>
						</div>

						{/* Map */}
						<div className="relative border-2 border-primary/20 rounded-xl overflow-hidden shadow-lg">
							<LoadScript googleMapsApiKey={apiKey}>
								<GoogleMap
									mapContainerStyle={mapContainerStyle}
									center={mapCenter}
									zoom={17}
									onClick={handleMapClick}
									options={{
										streetViewControl: false,
										mapTypeControl: true,
										mapTypeControlOptions: {
											position: 1, // TOP_RIGHT
											style: 1, // DROPDOWN_MENU
										},
										fullscreenControl: false,
										zoomControl: true,
										zoomControlOptions: {
											position: 7, // RIGHT_CENTER
										},
										mapTypeId: "hybrid",
										gestureHandling: "greedy",
										clickableIcons: false,
									}}>
									{markerPosition && (
										<Marker
											position={markerPosition}
											draggable={true}
											onDragEnd={(e) => {
												if (e.latLng) {
													const lat = e.latLng.lat();
													const lng = e.latLng.lng();
													setMarkerPosition({ lat, lng });
													reverseGeocode(lat, lng);
												}
											}}
										/>
									)}
								</GoogleMap>
							</LoadScript>

							{/* Map Overlay Instructions */}
							{!markerPosition && (
								<div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
									<p className="text-sm font-medium text-center">
										👆 Click on the map to place a marker
									</p>
								</div>
							)}
						</div>

						{/* Address & Coordinates Display */}
						{markerPosition && (
							<div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg space-y-2">
								<div className="flex items-start gap-2">
									<MapPin className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-green-900">
											Selected Location
										</p>
										{selectedAddress ? (
											<p className="text-sm text-green-800 mt-1">
												{selectedAddress}
											</p>
										) : (
											<p className="text-xs text-green-700 mt-1">
												Loading address...
											</p>
										)}
										<p className="text-xs text-green-600 mt-2 font-mono">
											{markerPosition.lat.toFixed(6)},{" "}
											{markerPosition.lng.toFixed(6)}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Instructions */}
						<p className="text-xs text-muted-foreground">
							💡 Click on the map to place a marker, or drag the marker to
							adjust the location.
						</p>

						{/* Help Tips */}
						<div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
							<p className="text-xs font-semibold text-blue-900 mb-2">
								💡 Tips for accurate location:
							</p>
							<ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
								<li>
									Click "GPS" button for automatic location (most accurate)
								</li>
								<li>Search your shop name or nearby landmark</li>
								<li>Click on map or drag the red marker to adjust</li>
								<li>Use satellite view and zoom in for precision</li>
							</ul>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2 sticky bottom-0 bg-background pb-2">
							<Button
								onClick={handleConfirm}
								disabled={!markerPosition}
								className="flex-1 h-12 text-base font-semibold"
								size="lg">
								<MapPin className="w-4 h-4 mr-2" />
								Confirm Location
							</Button>
							<Button
								variant="outline"
								onClick={() => setIsOpen(false)}
								className="px-8 h-12">
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
