import api, { logoutRequest as apiLogout } from "@/lib/api"

// Wrapper that mimics fetch Response for existing code expecting response.ok and response.json()
export const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const method = (options.method || "GET").toUpperCase()
    const axiosConfig: any = {
      url,
      method,
      headers: options.headers || {},
      withCredentials: true,
    }

    if (options.body) {
      try {
        axiosConfig.data = JSON.parse(options.body as string)
      } catch (e) {
        axiosConfig.data = options.body
      }
    }

    const res = await api.request(axiosConfig)

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () => res.data,
    }
  } catch (err: any) {
    const res = err?.response
    return {
      ok: false,
      status: res?.status || 500,
      json: async () => res?.data || { message: err.message || "Unknown error" },
    }
  }
}

export const logoutRequest = apiLogout
