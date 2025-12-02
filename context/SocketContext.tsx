"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const { user } = useAuth();

	useEffect(() => {
		// Get token from localStorage
		const token =
			typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

		if (!token || !user) {
			return;
		}

		const socketInstance = io(
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
			{
				auth: {
					token,
				},
				autoConnect: true,
			}
		);

		socketInstance.on("connect", () => {
			console.log("Socket connected");
			setIsConnected(true);
		});

		socketInstance.on("disconnect", () => {
			console.log("Socket disconnected");
			setIsConnected(false);
		});

		socketInstance.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
			setIsConnected(false);
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, [user]);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
};
