import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useMyBusiness() {
  return useQuery({
    queryKey: ["business", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get("/business/me");
      return data as { business: any; branches: any[] };
    },
  });
}

export function useCustomers(page = 1, search = "") {
  return useQuery({
    queryKey: ["business", "customers", page, search],
    queryFn: async () => {
      const { data } = await apiClient.get(`/business/customers?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      return data as { data: any[]; page: number; totalPages: number; totalCount: number };
    },
  });
}

export function useCustomerDetail(customerId?: string) {
  return useQuery({
    queryKey: ["business", "customer", customerId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/business/customers/${customerId}`);
      return data as { card: any; transactions: any[]; redemptions: any[] };
    },
    enabled: !!customerId,
  });
}

export function useGenerateQr() {
  return useMutation({
    mutationFn: async (payload: { branchId: string; amountPaid?: number }) => {
      const { data } = await apiClient.post("/business/qr/generate", payload);
      return data as { qrToken: string; qrImageBase64: string; expiresAt: string; nonce: string };
    },
  });
}

export function useVerifyRedemption() {
  return useMutation({
    mutationFn: async (payload: { redemptionCode: string }) => {
      const { data } = await apiClient.post("/business/redemptions/verify", payload);
      return data as { redemption: any };
    },
  });
}

export function useManualAdjust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { customerId: string; branchId: string; direction: "ADD" | "REMOVE"; reason?: string }) => {
      const { data } = await apiClient.post("/business/stamps/manual-adjust", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business", "customers"] }),
  });
}

export function useAddBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; address?: string; lat?: number; lng?: number }) => {
      const { data } = await apiClient.post("/business/branches", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business", "me"] }),
  });
}

export function useUpdateLoyaltyRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { loyaltyRule?: any; qrMode?: string; name?: string }) => {
      const { data } = await apiClient.patch("/business/me", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business", "me"] }),
  });
}

export function useBusinessAnalytics() {
  return useQuery({
    queryKey: ["business", "analytics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/business/analytics");
      return data as { stampsLast30d: number; redemptionsLast30d: number; totalCustomers: number };
    },
  });
}
