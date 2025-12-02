"use client";

import { useSocket } from "@/context/SocketContext";
import {
	GoogleMap,
	InfoWindow,
	Marker,
	useJsApiLoader,
} from "@react-google-maps/api";
import axios from "axios";
import { useEffect, useState } from "react";

interface AgentLocation {
	agentId: string;
	firstName: string;
	lastName: string;
	phone: string;
	userType?: string;
	location: {
		latitude: number;
		longitude: number;
		accuracy?: number;
		lastUpdated: string;
		isOnline: boolean;
	};
}

const mapContainerStyle = {
	width: "100%",
	height: "600px",
};

const defaultCenter = {
	lat: 28.6139,
	lng: 77.209,
};

export default function AgentTracking() {
	const [agents, setAgents] = useState<AgentLocation[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
	const [activeMarker, setActiveMarker] = useState<string | null>(null);
	const { socket, isConnected } = useSocket();

	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
	});

	// Fetch initial agent locations
	useEffect(() => {
		const fetchAgents = async () => {
			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/api/location/agents`,
					{ withCredentials: true }
				);

				if (response.data.success) {
					const agentData = response.data.agents.map((agent: any) => ({
						agentId: agent._id,
						firstName: agent.firstName || "Unknown",
						lastName: agent.lastName || "",
						phone: agent.phone,
						userType: agent.userType || "delivery",
						location: agent.currentLocation || {
							latitude: 0,
							longitude: 0,
							lastUpdated: new Date().toISOString(),
							isOnline: false,
						},
					}));
					setAgents(agentData);
					console.log("Fetched agents:", agentData);
				}
			} catch (error) {
				console.error("Error fetching agents:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAgents();
	}, []);

	// Listen for real-time location updates
	useEffect(() => {
		if (!socket || !isConnected) return;

		socket.on("agent:location", (data: AgentLocation) => {
			setAgents((prev) => {
				const index = prev.findIndex((a) => a.agentId === data.agentId);
				if (index >= 0) {
					const updated = [...prev];
					updated[index] = data;
					return updated;
				}
				return [...prev, data];
			});
		});

		socket.on("agent:offline", ({ agentId }: { agentId: string }) => {
			setAgents((prev) =>
				prev.map((agent) =>
					agent.agentId === agentId
						? {
								...agent,
								location: { ...agent.location, isOnline: false },
						  }
						: agent
				)
			);
		});

		return () => {
			socket.off("agent:location");
			socket.off("agent:offline");
		};
	}, [socket, isConnected]);

	const onlineAgents = agents.filter((a) => a.location?.isOnline);
	const offlineAgents = agents.filter((a) => !a.location?.isOnline);

	// Calculate center of map based on agents
	const center =
		onlineAgents.length > 0 && onlineAgents[0].location
			? {
					lat: onlineAgents[0].location.latitude,
					lng: onlineAgents[0].location.longitude,
			  }
			: defaultCenter;

	if (loading || !isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	return (
		<div className=" mx-auto">
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Agent Location Tracking</h1>
				<div className="flex flex-wrap gap-4 text-sm">
					<div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						<span className="font-medium">Online: {onlineAgents.length}</span>
					</div>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
						<div className="w-3 h-3 bg-gray-400 rounded-full"></div>
						<span className="font-medium">Offline: {offlineAgents.length}</span>
					</div>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
						<div className="w-3 h-3 bg-purple-500 rounded-full"></div>
						<span className="font-medium">
							Sales Executives:{" "}
							{agents.filter((a) => a.userType === "sales_executive").length}
						</span>
					</div>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
						<span className="font-medium">
							Delivery Agents:{" "}
							{agents.filter((a) => a.userType === "delivery").length}
						</span>
					</div>
					<div
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
							isConnected
								? "bg-blue-50 border-blue-200"
								: "bg-red-50 border-red-200"
						}`}>
						<div
							className={`w-3 h-3 rounded-full ${
								isConnected ? "bg-blue-500 animate-pulse" : "bg-red-500"
							}`}></div>
						<span className="font-medium">
							{isConnected ? "Real-time Connected" : "Disconnected"}
						</span>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				{/* Agent List */}
				<div className="lg:col-span-1 bg-white rounded-lg shadow p-4 max-h-[600px] overflow-y-auto">
					<h2 className="text-xl font-semibold mb-4">All Agents</h2>

					{onlineAgents.length > 0 && (
						<div className="mb-4">
							<h3 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								Online ({onlineAgents.length})
							</h3>
							{onlineAgents.map((agent) => (
								<div
									key={agent.agentId}
									className={`p-3 mb-2 rounded cursor-pointer transition ${
										selectedAgent === agent.agentId
											? "bg-blue-100 border-2 border-blue-500"
											: "bg-gray-50 hover:bg-gray-100"
									}`}
									onClick={() => setSelectedAgent(agent.agentId)}>
									<div className="flex items-center justify-between mb-1">
										<div className="font-medium">
											{agent.firstName} {agent.lastName}
										</div>
										<span
											className={`text-xs px-2 py-0.5 rounded-full ${
												agent.userType === "sales_executive"
													? "bg-purple-100 text-purple-700"
													: "bg-blue-100 text-blue-700"
											}`}>
											{agent.userType === "sales_executive"
												? "Sales"
												: "Delivery"}
										</span>
									</div>
									<div className="text-sm text-gray-600">{agent.phone}</div>
									{agent.location && (
										<>
											<div className="text-xs text-gray-500 mt-1">
												Updated:{" "}
												{new Date(
													agent.location.lastUpdated
												).toLocaleTimeString()}
											</div>
											{agent.location.accuracy && (
												<div className="text-xs text-blue-600">
													±{Math.round(agent.location.accuracy)}m
												</div>
											)}
										</>
									)}
								</div>
							))}
						</div>
					)}

					{offlineAgents.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
								<div className="w-2 h-2 bg-gray-400 rounded-full"></div>
								Offline ({offlineAgents.length})
							</h3>
							{offlineAgents.map((agent) => (
								<div
									key={agent.agentId}
									className="p-3 mb-2 rounded bg-gray-50 opacity-60">
									<div className="font-medium">
										{agent.firstName} {agent.lastName}
									</div>
									<div className="text-sm text-gray-600">{agent.phone}</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Map */}
				<div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
					<GoogleMap
						mapContainerStyle={mapContainerStyle}
						center={center}
						zoom={13}
						options={{
							zoomControl: true,
							streetViewControl: false,
							mapTypeControl: true,
							fullscreenControl: true,
						}}>
						{onlineAgents.map((agent) => {
							if (!agent.location || !agent.location.latitude) return null;

							return (
								<Marker
									key={agent.agentId}
									position={{
										lat: agent.location.latitude,
										lng: agent.location.longitude,
									}}
									onClick={() => setActiveMarker(agent.agentId)}
									icon={{
										url:
											agent.userType === "sales_executive"
												? "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
												: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
									}}>
									{activeMarker === agent.agentId && (
										<InfoWindow onCloseClick={() => setActiveMarker(null)}>
											<div className="p-2">
												<div className="flex items-center justify-between gap-2 mb-1">
													<div className="font-semibold">
														{agent.firstName} {agent.lastName}
													</div>
													<span
														className={`text-xs px-2 py-0.5 rounded-full ${
															agent.userType === "sales_executive"
																? "bg-purple-100 text-purple-700"
																: "bg-blue-100 text-blue-700"
														}`}>
														{agent.userType === "sales_executive"
															? "Sales Executive"
															: "Delivery Agent"}
													</span>
												</div>
												<div className="text-sm">{agent.phone}</div>
												<div className="text-xs text-gray-500 mt-1">
													Last updated:{" "}
													{new Date(
														agent.location.lastUpdated
													).toLocaleString()}
												</div>
												{agent.location.accuracy && (
													<div className="text-xs text-blue-600 mt-1">
														Accuracy: ±{Math.round(agent.location.accuracy)}m
													</div>
												)}
											</div>
										</InfoWindow>
									)}
								</Marker>
							);
						})}
					</GoogleMap>
				</div>
			</div>
		</div>
	);
}
