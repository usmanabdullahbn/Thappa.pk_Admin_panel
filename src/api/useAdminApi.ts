import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useBusinesses(page = 1) {
  return useQuery({
    queryKey: ["admin", "businesses", page],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/businesses?page=${page}&limit=20`);
      return data as { data: any[]; page: number; totalPages: number; totalCount: number };
    },
  });
}

export function useBusinessDetail(id?: string) {
  return useQuery({
    queryKey: ["admin", "business", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/businesses/${id}`);
      return data as { business: any; branches: any[]; stampVolume: number };
    },
    enabled: !!id,
  });
}

export function usePlatformOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/analytics/overview");
      return data as { activeBusinesses: number; totalBusinesses: number; totalStamps: number; totalCustomers: number };
    },
  });
}

export interface CreateBusinessPayload {
  businessName: string;
  category?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  branchName?: string;
  branchAddress?: string;
  lat?: number;
  lng?: number;
}

export function useCreateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBusinessPayload) => {
      const { data } = await apiClient.post("/admin/businesses", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useUpdateBusinessStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/admin/businesses/${id}/status`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}
