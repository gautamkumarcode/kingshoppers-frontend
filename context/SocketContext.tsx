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
				transports: ["websocket", "polling"],
				reconnection: true,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				reconnectionAttempts: 5,
				timeout: 20000,
			}
		);

		socketInstance.on("connect", () => {
			setIsConnected(true);
		});

		socketInstance.on("disconnect", () => {
			setIsConnected(false);
		});

		socketInstance.on("connect_error", () => {
			setIsConnected(false);
		});

		socketInstance.on("reconnect", () => {
			setIsConnected(true);
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
