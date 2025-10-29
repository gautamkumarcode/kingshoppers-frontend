import axios from "axios"

const api = axios.create({
  baseURL: "",
  timeout: 30000,
  withCredentials: true, // important: send cookies for httpOnly sessions
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Response interceptor to handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try {
        if (typeof window !== "undefined") window.location.href = "/auth/login"
      } catch (e) {}
    }
    return Promise.reject(error)
  }
)

export default api

export const logoutRequest = async () => {
  try {
    await api.post("/api/auth/logout")
  } catch (e) {
    // ignore
  }
}
