import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";
import { SpeakMateLoader } from "../components/common/SpeakMateLoader";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user, onboardingCompleted, loading } = useAuth();
  const location = useLocation();

  const hasToken = Boolean(localStorage.getItem("speakmate_token"));

  if (loading) {
    return <SpeakMateLoader fullScreen message="Verifying session..." subMessage="Setting up your personalized learning environment" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Strictly check onboarding completion for the current authenticated user
  const isCompleted = Boolean(user && user.onboardingCompleted);

  if (!isCompleted && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if (isCompleted && location.pathname === ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

export default ProtectedRoute;
