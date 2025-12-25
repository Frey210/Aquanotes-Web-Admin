import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { AppLayout } from "@/routes/AppLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { PondsPage } from "@/features/ponds/PondsPage";
import { DevicesPage } from "@/features/devices/DevicesPage";
import { ReadingsPage } from "@/features/readings/ReadingsPage";
import { AlertsPage } from "@/features/alerts/AlertsPage";
import { UsersPage } from "@/features/users/UsersPage";
import { SettingsPage } from "@/features/users/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ponds" element={<PondsPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="readings" element={<ReadingsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route element={<RoleRoute allowed={["admin"]} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
