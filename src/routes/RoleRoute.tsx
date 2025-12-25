import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

interface RoleRouteProps {
  allowed: Array<"admin" | "operator" | "viewer">;
}

export function RoleRoute({ allowed }: RoleRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
