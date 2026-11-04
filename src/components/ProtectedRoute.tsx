import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/database";

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: Role[] }) => {
  const { profile, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile.role))
    return <Navigate to="/" replace />;

  return <Outlet />;
};
