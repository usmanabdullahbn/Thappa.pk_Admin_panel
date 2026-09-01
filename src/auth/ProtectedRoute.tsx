import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, Role } from "./AuthContext";

export function ProtectedRoute({ children, allow }: { children: ReactNode; allow: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
