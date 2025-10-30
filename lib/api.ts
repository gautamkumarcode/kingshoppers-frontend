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
	} catch (e) {
		// ignore
	}
};
