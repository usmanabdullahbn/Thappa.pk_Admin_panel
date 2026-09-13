import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, PortalRole } from "./AuthContext";

export function ProtectedRoute({ children, allow }: { children: ReactNode; allow: PortalRole[] }) {
  const { sessions, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>;
  }

  if (!allow.some((role) => sessions[role])) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
