import axios from "axios";
import { clearSession, currentPortalRole, readSession, updateAccessToken } from "../auth/sessionStore";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/v1";

export const apiClient = axios.create({ baseURL: API_BASE_URL });

// Send the login for the portal this page belongs to (/admin or /business), so
// a business sign-in in another tab can't replace the admin's token.
apiClient.interceptors.request.use((config) => {
  const role = currentPortalRole();
  const token = role ? readSession(role)?.accessToken : undefined;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try one silent refresh using the stored refresh token before giving up.
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const role = currentPortalRole();
    if (error.response?.status === 401 && !original._retry && role) {
      original._retry = true;
      const refreshToken = readSession(role)?.refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          updateAccessToken(role, data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(original);
        } catch {
          clearSession(role);
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.error?.message || anyErr?.message || "Something went wrong";
}
