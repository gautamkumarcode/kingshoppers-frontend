"use client";

import { useSocket } from "@/context/SocketContext";
import { MapPin, Wifi, WifiOff } from "lucide-react";

export default function LocationStatus() {
	const { isConnected } = useSocket();

	return (
		<div className="flex items-center gap-2 text-sm">
			<div className="flex items-center gap-1">
				{isConnected ? (
					<>
						<Wifi className="w-4 h-4 text-green-500" />
						<span className="text-green-600">Connected</span>
					</>
				) : (
					<>
						<WifiOff className="w-4 h-4 text-red-500" />
						<span className="text-red-600">Disconnected</span>
					</>
				)}
			</div>
			<div className="flex items-center gap-1">
				<MapPin className="w-4 h-4 text-blue-500" />
				<span className="text-gray-600">Location Sharing</span>
			</div>
		</div>
	);
}
