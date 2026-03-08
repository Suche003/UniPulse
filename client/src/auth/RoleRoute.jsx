import { Navigate, Outlet } from "react-router-dom";
import { getRole, isLoggedIn } from "./auth";

export default function RoleRoute({ allow = [] }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const role = getRole();
  if (!allow.includes(role)) {
    // redirect to safe home or role home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}