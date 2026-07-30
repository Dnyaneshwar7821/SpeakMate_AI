import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user, onboardingCompleted, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-extrabold text-[var(--text-secondary)]">Restoring Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Redirect brand new users to onboarding only if NOT completed
  const storedOnboardingCompleted = localStorage.getItem("speakmate_onboarding_completed") === "true";
  const storedGrade = localStorage.getItem("speakmate_school_grade");
  const storedAgeGroup = localStorage.getItem("speakmate_age_group");
  const isUserCompleted = Boolean(
    user && (user.onboardingCompleted || user.schoolGrade || user.englishLevel || user.ageGroup || user.learningGoal)
  );

  const isCompleted = Boolean(
    onboardingCompleted || isUserCompleted || storedOnboardingCompleted || storedGrade || storedAgeGroup
  );

  if (!isCompleted && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if (isCompleted && location.pathname === ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

export default ProtectedRoute;
