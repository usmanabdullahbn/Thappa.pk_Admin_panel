import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./features/LoginPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { BusinessLayout } from "./layouts/BusinessLayout";
import { BusinessesListPage } from "./features/admin/BusinessesListPage";
import { PlatformOverviewPage } from "./features/admin/PlatformOverviewPage";
import { DashboardHomePage } from "./features/business/DashboardHomePage";
import { GenerateQRPage } from "./features/business/GenerateQRPage";
import { CustomersPage } from "./features/business/CustomersPage";
import { RedeemCodeEntryPage } from "./features/business/RedeemCodeEntryPage";
import { LoyaltyRuleSettingsPage } from "./features/business/LoyaltyRuleSettingsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allow={["ADMIN"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="businesses" replace /> },
      { path: "businesses", element: <BusinessesListPage /> },
      { path: "overview", element: <PlatformOverviewPage /> },
    ],
  },
  {
    path: "/business",
    element: (
      <ProtectedRoute allow={["BUSINESS"]}>
        <BusinessLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardHomePage /> },
      { path: "generate-qr", element: <GenerateQRPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "redeem", element: <RedeemCodeEntryPage /> },
      { path: "settings", element: <LoyaltyRuleSettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
