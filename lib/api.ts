import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Request interceptor to add token to headers
api.interceptors.request.use(
	(config) => {
		// Get token from localStorage
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("auth_token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle 401 globally
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error?.response?.status;
		const url = error?.config?.url;

		// Don't redirect on 401 for /me endpoint (expected when not logged in)
		if (status === 401 && !url?.includes("/auth/me")) {
			try {
				if (typeof window !== "undefined") {
					// Clear token on 401
					localStorage.removeItem("auth_token");
					
					// Only redirect if we're not already on auth pages
					const currentPath = window.location.pathname;
					if (!currentPath.startsWith("/auth/")) {
						window.location.href = "/auth/login";
					}
				}
			} catch (e) {
				// ignore
			}
		}
		return Promise.reject(error);
	}
);

export default api;

export const logoutRequest = async () => {
	try {
		await api.post("/auth/logout");
		// Clear token from localStorage
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
		}
	} catch (e) {
		// Clear token even if request fails
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
		}
	}
};
