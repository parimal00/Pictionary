import { Navigate, Outlet } from "react-router-dom";
import type { User } from "../types/user";

interface ProtectedRouteProps {
  user: User | null;
}

export function ProtectedRoute({ user }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}