import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface LoginResponse {
  user: {
    id: string;
    role: "ADMIN" | "BUSINESS" | "CUSTOMER";
    name: string;
    email?: string;
    businessId?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await apiClient.post<LoginResponse>("/auth/admin-login", payload);
      return data;
    },
  });
}

export function useBusinessLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await apiClient.post<LoginResponse>("/auth/business-login", payload);
      return data;
    },
  });
}
