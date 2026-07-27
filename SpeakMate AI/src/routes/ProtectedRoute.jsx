import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user, onboardingCompleted } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Redirect brand new users to onboarding if not yet completed
  const isCompleted = Boolean(onboardingCompleted || (user && user.onboardingCompleted));
  if (!isCompleted && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return children;
}

export default ProtectedRoute;
