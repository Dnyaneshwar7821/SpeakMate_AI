import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";

export default function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}