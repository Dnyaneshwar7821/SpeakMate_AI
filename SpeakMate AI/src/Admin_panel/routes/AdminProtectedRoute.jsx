import { Navigate } from "react-router-dom";
import ROUTES from "@constants/routes";
import { getAdminRoleConfig } from "../constants/adminRoles";
import { getAdminSession, isAdminAuthenticated } from "../services/adminSession";

export function AdminProtectedRoute({ children, allowedRoles, requiredRole, unauthorizedRoute }) {
  const acceptedRoles = allowedRoles ?? requiredRole;
  const session = getAdminSession();

  if (!session) {
    const loginRoute = requiredRole ? getAdminRoleConfig(requiredRole).loginRoute : ROUTES.ADMIN_LOGIN;
    return <Navigate to={loginRoute} replace />;
  }

  if (acceptedRoles && !isAdminAuthenticated(acceptedRoles)) {
    const fallbackRoute = unauthorizedRoute ?? getAdminRoleConfig(session.role).dashboardRoute;
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
}

export default AdminProtectedRoute;
