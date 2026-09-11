import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import ROUTES from "@constants/routes";
import { getAdminRoleConfig } from "../constants/adminRoles";
import { getAdminSession, isAdminAuthenticated } from "../services/adminSession";
import { useAuth } from "../context/AuthContext";

export function AdminProtectedRoute({ children, allowedRoles, requiredRole, unauthorizedRoute }) {
  const acceptedRoles = allowedRoles ?? requiredRole;
  const session = getAdminSession();
  const { syncUser } = useAuth();

  useEffect(() => {
    syncUser();
  }, [session?.role]);

  if (!session) {
    const roleForLogin = Array.isArray(acceptedRoles) ? acceptedRoles[0] : acceptedRoles;
    const loginRoute = roleForLogin && getAdminRoleConfig(roleForLogin) 
      ? getAdminRoleConfig(roleForLogin).loginRoute 
      : ROUTES.ADMIN_LOGIN;
    return <Navigate to={loginRoute} replace />;
  }

  if (acceptedRoles && !isAdminAuthenticated(acceptedRoles)) {
    const fallbackRoute = unauthorizedRoute ?? getAdminRoleConfig(session.role).dashboardRoute;
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
}

export default AdminProtectedRoute;
